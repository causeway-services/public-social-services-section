import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { observeAuthorizedChannel } from "@red-cup-engineering/youtube-services-section";
import { NODE_ROOT, channelIdentity, contentId } from "./channel.mjs";
import { REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { publishPrivateDraft } from "./release.mjs";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_API_HOST = "www.googleapis.com";
const MAX_JSON_BYTES = 1_000_000;
const MAX_VIDEO_BYTES = 8_000_000_000;

function exactId(value) {
  if (!value || typeof value !== "object") return false;
  const { id, ...body } = value;
  return id === contentId(body);
}

function materialDigest(bytes) {
  return `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
}

function readExactFile(path, label, maximumBytes) {
  if (typeof path !== "string" || !path) throw new TypeError(`${label} path is required`);
  const exactPath = resolve(path);
  const stat = lstatSync(exactPath);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new TypeError(`${label} must be an exact regular file, not a symlink`);
  if (stat.size < 1 || stat.size > maximumBytes) throw new TypeError(`${label} has an inadmissible byte length`);
  return readFileSync(exactPath);
}

export function readExactJson(path, label) {
  const bytes = readExactFile(path, label, MAX_JSON_BYTES);
  try { return JSON.parse(bytes.toString("utf8")); }
  catch { throw new TypeError(`${label} is not valid JSON`); }
}

export function loadPilotInputs({ claimPath, inventoryPath, videoPath, metadataPath, thumbnailPath } = {}) {
  return {
    releaseClaim: readExactJson(claimPath, "release claim"),
    inventoryAdmission: readExactJson(inventoryPath, "inventory admission"),
    videoBytes: readExactFile(videoPath, "video", MAX_VIDEO_BYTES),
    metadata: readExactJson(metadataPath, "metadata"),
    ...(thumbnailPath ? { thumbnailBytes: readExactFile(thumbnailPath, "thumbnail", MAX_JSON_BYTES) } : {}),
  };
}

export function planPrivatePilot({ releaseClaim, inventoryAdmission, videoBytes, metadata, thumbnailBytes } = {}) {
  if (!exactId(releaseClaim) || releaseClaim.type !== "MathematicsDailyReleaseClaim") throw new TypeError("pilot requires one exact mathematics release claim");
  if (!exactId(inventoryAdmission) || inventoryAdmission.type !== "MathematicsCinematicInventoryAdmission") throw new TypeError("pilot requires one exact mathematics inventory admission");
  if (releaseClaim.inventoryAdmission !== inventoryAdmission.id) throw new TypeError("release claim does not name the supplied inventory admission");
  if (!(videoBytes instanceof Uint8Array) || materialDigest(videoBytes) !== inventoryAdmission.videoSha256) throw new TypeError("video bytes do not match admitted mathematics inventory");
  if (!metadata || typeof metadata.title !== "string" || !metadata.title.trim() || typeof metadata.description !== "string") throw new TypeError("pilot metadata requires a title and description");
  if (thumbnailBytes !== undefined && !(thumbnailBytes instanceof Uint8Array)) throw new TypeError("thumbnail must be materialized bytes");
  return {
    type: "MathematicsPrivatePilotPlan", channel: channelIdentity().youtubeChannelId,
    releaseClaim: releaseClaim.id, inventoryAdmission: inventoryAdmission.id,
    civilDay: releaseClaim.civilDay, videoSha256: materialDigest(videoBytes),
    thumbnailSha256: thumbnailBytes === undefined ? null : materialDigest(thumbnailBytes),
    effect: "none-dry-run", publishMode: "private-draft", publicSchedule: null,
  };
}

export async function refreshAccessToken({ clientId, clientSecret, refreshToken } = {}, { fetchImpl = fetch, requiredScopes = [] } = {}) {
  if (![clientId, clientSecret, refreshToken].every((value) => typeof value === "string" && value)) throw new TypeError("channel OAuth refresh requires complete credentials");
  const response = await fetchImpl(TOKEN_ENDPOINT, {
    method: "POST", redirect: "error", headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, refresh_token: refreshToken, grant_type: "refresh_token" }),
  });
  if (!response.ok) throw new Error(`OAuth refresh failed ${response.status}: ${(await response.text()).slice(0, 300)}`);
  const payload = await response.json();
  if (typeof payload.access_token !== "string" || !payload.access_token) throw new TypeError("OAuth refresh returned no access token");
  const grantedScopes = String(payload.scope ?? "").split(/\s+/u).filter(Boolean), granted = new Set(grantedScopes), missing = requiredScopes.filter((scope) => !granted.has(scope));
  if (missing.length) throw new TypeError(`OAuth refresh lacks required scope(s): ${missing.join(", ")}`);
  return { accessToken: payload.access_token, expiresIn: Number(payload.expires_in) || null, ...(payload.scope === undefined ? {} : { grantedScopes }) };
}

export function createAuthorizedFetch(accessToken, { fetchImpl = fetch } = {}) {
  if (typeof accessToken !== "string" || !accessToken) throw new TypeError("authorized capability requires an access token");
  return (url, init = {}) => {
    const target = new URL(url);
    if (target.protocol !== "https:" || target.hostname !== GOOGLE_API_HOST || target.username || target.password) throw new TypeError("authorized capability refuses a non-YouTube Google API carrier");
    const headers = new Headers(init.headers);
    if (headers.has("authorization")) throw new TypeError("caller may not supply authorization to the channel capability");
    headers.set("authorization", `Bearer ${accessToken}`);
    return fetchImpl(target.href, { ...init, headers });
  };
}

export async function executePrivatePilot(inputs, options = {}) {
  const plan = planPrivatePilot(inputs);
  if (options.executePrivate !== true) return plan;
  if (options.releaseClaimId !== inputs.releaseClaim.id) throw new TypeError("live private pilot requires the exact --release-claim-id");
  const activation = options.activation ?? readExactJson(join(NODE_ROOT, "content/config/activation.json"), "channel activation");
  if (!["granted-private-only", "granted"].includes(activation.youtubeWrites)) throw new TypeError("mathematics channel activation refuses private YouTube writes");
  const expectedChannelId = channelIdentity().youtubeChannelId;
  const token = await refreshAccessToken(options.credentials, { fetchImpl: options.fetchImpl });
  const authorizedFetch = createAuthorizedFetch(token.accessToken, { fetchImpl: options.fetchImpl });
  const observed = await observeAuthorizedChannel({ authorizedFetch });
  if (observed.id !== expectedChannelId) throw new TypeError(`authorized ${observed.id}, not mathematics channel ${expectedChannelId}`);
  return publishPrivateDraft(inputs, {
    activation, expectedChannelId, authorizedFetch, uploadFetch: options.uploadFetch,
    dataRoot: options.dataRoot, runtimeRoot: options.runtimeRoot, witnessJournalAgentUrl: options.witnessJournalAgentUrl,
    settlement: options.settlement, at: options.at,
  });
}

export function loadChannelEnvironment(start = NODE_ROOT) {
  const values = { ...process.env }; let cursor = start;
  for (let depth = 0; depth < 12; depth += 1) {
    const path = join(cursor, ".env");
    if (existsSync(path)) for (const line of readFileSync(path, "utf8").split("\n")) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/u);
      if (match && !(match[1] in values)) values[match[1]] = match[2].replace(/^(['"])(.*)\1$/u, "$2");
    }
    const parent = dirname(cursor); if (parent === cursor) break; cursor = parent;
  }
  return values;
}

export function parseCli(argv) {
  const values = { executePrivate: false };
  for (let index = 0; index < argv.length; index += 1) {
    const flag = argv[index];
    if (flag === "--execute-private") { values.executePrivate = true; continue; }
    if (!["--claim", "--inventory", "--video", "--metadata", "--thumbnail", "--release-claim-id", "--data-root", "--runtime-root"].includes(flag)) throw new TypeError(`unknown private-pilot argument ${flag}`);
    const value = argv[index += 1]; if (!value || value.startsWith("--")) throw new TypeError(`${flag} requires one value`);
    values[{ "--claim": "claimPath", "--inventory": "inventoryPath", "--video": "videoPath", "--metadata": "metadataPath", "--thumbnail": "thumbnailPath", "--release-claim-id": "releaseClaimId", "--data-root": "dataRoot", "--runtime-root": "runtimeRoot" }[flag]] = value;
  }
  for (const name of ["claimPath", "inventoryPath", "videoPath", "metadataPath"]) if (!values[name]) throw new TypeError(`private pilot requires ${name}`);
  if (values.executePrivate && (!values.releaseClaimId || !values.dataRoot || !values.runtimeRoot)) throw new TypeError("live private pilot requires --release-claim-id, --data-root, and --runtime-root");
  return values;
}

export async function main(argv = process.argv.slice(2)) {
  const cli = parseCli(argv), inputs = loadPilotInputs(cli);
  const options = { executePrivate: cli.executePrivate, releaseClaimId: cli.releaseClaimId, dataRoot: cli.dataRoot, runtimeRoot: cli.runtimeRoot };
  if (cli.executePrivate) {
    const env = loadChannelEnvironment();
    options.credentials = { clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] };
    options.witnessJournalAgentUrl = env.WITNESS_JOURNAL_RDF_AGENT;
  }
  const result = await executePrivatePilot(inputs, options);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
