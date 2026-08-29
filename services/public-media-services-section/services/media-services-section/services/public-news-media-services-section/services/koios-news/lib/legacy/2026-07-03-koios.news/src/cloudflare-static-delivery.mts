#!/usr/bin/env node

import { createHash, randomUUID } from "node:crypto";
import { closeSync, lstatSync, mkdtempSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";

import { DEFAULT_DATA_DIR } from "./config.mjs";
import { appendKoiosAct, recordDigest } from "./management/ledger.mjs";
import { SITE_ACCOUNT } from "./management/settlement-account.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "urn:ame:koios.news";
const PROVIDER_ACTOR = "urn:ame:resource-brokerage-team";
const CONTRACT = "cloudflare-static-delivery/v2";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function rawNi(value: Uint8Array | string): string { return `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`; }

function artifactFiles(root: string): readonly Readonly<{ path: string; bytes: number; digest: string }>[] {
  const readings: Readonly<{ path: string; bytes: number; digest: string }>[] = [];
  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`Cloudflare artifact contains a symlink: ${path}`);
      if (entry.isDirectory()) { visit(path); continue; }
      if (!entry.isFile()) throw new Error(`Cloudflare artifact contains a non-file entry: ${path}`);
      const bytes = readFileSync(path);
      readings.push(Object.freeze({ path: relative(root, path).split(sep).join("/"), bytes: bytes.length, digest: rawNi(bytes) }));
    }
  }
  visit(root);
  return Object.freeze(readings);
}
function treeNi(files: readonly Readonly<{ path: string; bytes: number; digest: string }>[]): string {
  const rows = files.map((file) => `<urn:path:${encodeURIComponent(file.path)}> <urn:rmn:bytes> ${JSON.stringify(String(file.bytes))}; <urn:rmn:content> <${file.digest}> .`).join("\n");
  return rawNi(Buffer.from(`${rows}\n`, "utf8"));
}

function ecosystemRoot(start: string): string {
  let at = realpathSync(start);
  const relativeProvider = "lib/emsenn/services/561-group/services/board-of-directors/services/executive-office/services/change-services-section/services/resource-brokerage-team";
  while (true) {
    try {
      if (lstatSync(join(at, relativeProvider)).isDirectory()) return at;
    } catch { /* continue toward the ecosystem authority root */ }
    const parent = dirname(at);
    if (parent === at) throw new Error("could not locate the Resource Brokerage Team from the Koios settlement");
    at = parent;
  }
}

function providerRoot(): string {
  const supplied = argument("--provider-root");
  if (supplied !== undefined) return realpathSync(supplied);
  return join(ecosystemRoot(process.cwd()), "lib/emsenn/services/561-group/services/board-of-directors/services/executive-office/services/change-services-section/services/resource-brokerage-team");
}

function providerAccount(root: string): string {
  const files = readdirSync(join(root, "content", "evm", "accounts")).filter((name) => /^eip155-[1-9][0-9]*\.json$/u.test(name));
  if (files.length !== 1) throw new Error("Resource Brokerage Team must publish exactly one active settlement account binding");
  const binding = JSON.parse(readFileSync(join(root, "content", "evm", "accounts", files[0]!), "utf8")) as { account?: { caip10?: unknown } };
  if (typeof binding.account?.caip10 !== "string") throw new Error("Resource Brokerage Team account binding lacks CAIP-10");
  return binding.account.caip10;
}

function providerEnvironment(root: string, live: boolean, credential?: string): NodeJS.ProcessEnv {
  const admitted: NodeJS.ProcessEnv = {};
  for (const name of ["PATH", "NODE_PATH", "TMPDIR", "TEMP", "TMP", "LD_LIBRARY_PATH"]) if (process.env[name] !== undefined) admitted[name] = process.env[name];
  admitted.CI = "true";
  admitted.NO_COLOR = "1";
  admitted.WRANGLER_SEND_METRICS = "false";
  admitted.RESOURCE_BROKERAGE_PROVIDER_CAIP10 = providerAccount(root);
  if (live && credential !== undefined) admitted.CLOUDFLARE_API_TOKEN = credential;
  else if (live && process.env.CLOUDFLARE_API_TOKEN !== undefined) admitted.CLOUDFLARE_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
  return admitted;
}

function invokeProvider(root: string, operation: "solicit-service" | "invoke-service", activity: unknown, instant: string, live: boolean, credential?: string): Record<string, unknown> {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as { bin?: Record<string, string> };
  const endpoint = pkg.bin?.[operation];
  if (endpoint === undefined) throw new Error(`Resource Brokerage Team does not advertise ${operation}`);
  // Captured child-process pipes are not reliable in every admitted execution
  // substrate. Use a bounded ephemeral file exchange: Koios writes its own
  // outbox bytes, the provider reads them from fd 0 and writes its response to
  // fd 1, and each enterprise keeps only its own durable evidence.
  const exchange = mkdtempSync(join(tmpdir(), "koios-provider-exchange-"));
  const inputPath = join(exchange, "activity.json");
  const outputPath = join(exchange, "response.json");
  const errorPath = join(exchange, "stderr.txt");
  writeFileSync(inputPath, JSON.stringify(activity), "utf8");
  const inputFd = openSync(inputPath, "r");
  const outputFd = openSync(outputPath, "w");
  const errorFd = openSync(errorPath, "w");
  try {
    const execution = spawnSync(process.execPath, [resolve(root, endpoint), "--operation", operation, "--now", instant], {
      cwd: root,
      stdio: [inputFd, outputFd, errorFd],
      timeout: operation === "solicit-service" ? 120_000 : 180_000,
      env: providerEnvironment(root, live, credential),
    });
    const stdout = readFileSync(outputPath, "utf8");
    const stderr = readFileSync(errorPath, "utf8");
    let output: Record<string, unknown>;
    try { output = JSON.parse(stdout) as Record<string, unknown>; }
    catch { throw new Error(`Resource Brokerage Team returned no typed result (status=${execution.status}, signal=${execution.signal ?? "none"}, error=${execution.error?.message ?? "none"}): ${stderr || stdout}`); }
    if (execution.status !== 0 && output["type"] !== "Reject") throw new Error(`Resource Brokerage Team failed without a typed refusal: ${stderr || stdout}`);
    return output;
  } finally {
    closeSync(inputFd);
    closeSync(outputFd);
    closeSync(errorFd);
    rmSync(exchange, { recursive: true, force: true });
  }
}

function invocationCredential(): string | undefined {
  const supplied = argument("--credential-file");
  const envFile = argument("--credential-env-file");
  if (supplied !== undefined && envFile !== undefined) throw new Error("choose only one Cloudflare credential file carrier");
  if (supplied === undefined && envFile === undefined) return process.env.CLOUDFLARE_API_TOKEN;
  const path = realpathSync(resolve(supplied ?? envFile!));
  const stat = lstatSync(path);
  if (!stat.isFile()) throw new Error("Cloudflare credential carrier is not a regular file");
  if ((stat.mode & 0o077) !== 0) throw new Error("Cloudflare credential file must deny group and other access (mode 0600 or stricter)");
  let value: string;
  if (envFile !== undefined) {
    const name = argument("--credential-env-name") ?? "API_KEY_CLOUDFLARE_WORKERS_EDIT";
    if (!/^[A-Z][A-Z0-9_]*$/u.test(name)) throw new Error("Cloudflare credential environment name is invalid");
    const matches = readFileSync(path, "utf8").split(/\r?\n/gu).flatMap((line) => {
      const trimmed = line.trim();
      if (trimmed === "" || trimmed.startsWith("#")) return [];
      const prefix = `${name}=`;
      if (!trimmed.startsWith(prefix)) return [];
      let candidate = trimmed.slice(prefix.length).trim();
      if ((candidate.startsWith('"') && candidate.endsWith('"')) || (candidate.startsWith("'") && candidate.endsWith("'"))) candidate = candidate.slice(1, -1);
      return [candidate];
    });
    if (matches.length !== 1) throw new Error(`Cloudflare credential environment file must contain exactly one ${name} assignment`);
    value = matches[0]!;
  } else value = readFileSync(path, "utf8").trim();
  if (value === "") throw new Error("Cloudflare credential file is empty");
  return value;
}

const instant = argument("--now");
if (instant === undefined) throw new Error("Cloudflare delivery contract requires --now with an explicit UTC instant");
const executionMode = argument("--execution-mode") ?? "dry-run";
if (!(["dry-run", "live-preview"] as const).includes(executionMode as "dry-run" | "live-preview")) throw new Error("--execution-mode must be dry-run or live-preview");
if (process.argv.includes("--solicit-only") || argument("--resource-grant") !== undefined || argument("--demand-out") !== undefined) throw new Error("central grant workflow was removed; Koios must sign the provider-authored EVM effect cell directly");
const live = executionMode === "live-preview";
if (live) {
  const stated = Date.parse(instant);
  if (!Number.isFinite(stated) || Math.abs(Date.now() - stated) > 5 * 60_000) throw new Error("live preview --now must be a valid UTC instant within five minutes of the receiving clock");
}
const artifactPath = realpathSync(resolve(argument("--artifact") ?? ".static/koios.news"));
const configPath = realpathSync(resolve(argument("--config") ?? "wrangler.jsonc"));
const wranglerExecutable = realpathSync(resolve("node_modules/.bin/wrangler"));
const files = artifactFiles(artifactPath);
const manifestPath = join(artifactPath, "manifest.json");
const manifestBytes = readFileSync(manifestPath);
const manifest = JSON.parse(manifestBytes.toString("utf8")) as Readonly<{ profile?: unknown; livePublicationWitnessDigest?: unknown }>;
if (manifest.profile !== "shadow" && manifest.profile !== "cutover-candidate") throw new Error("Cloudflare delivery artifact manifest lacks a recognized publication profile");
if (typeof manifest.livePublicationWitnessDigest !== "string") throw new Error("Cloudflare delivery artifact manifest lacks its frozen live-publication-witness digest");
const deliveryPolicyPath = join(artifactPath, "_headers");
const deliveryPolicyDigest = rawNi(readFileSync(deliveryPolicyPath));
const hostname = argument("--hostname");
const expiresAt = argument("--expires-at");
if (hostname === undefined || expiresAt === undefined) throw new Error("Cloudflare delivery contract requires explicit --hostname and --expires-at bindings");
if (live) {
  const expiry = Date.parse(expiresAt);
  if (!Number.isFinite(expiry) || expiry <= Date.now() || expiry - Date.now() > 60 * 60_000) throw new Error("live preview expiry must be in the future and no more than one hour from the receiving clock");
}
const wranglerVersion = "4.112.0";
const cloudflare = live ? {
  accountId: argument("--account-id") ?? "",
  workerName: argument("--worker-name") ?? "",
} : undefined;
if (live && Object.values(cloudflare!).some((value) => value === "")) throw new Error("live preview requires --account-id and --worker-name");
const request = {
  type: "CloudflareStaticDeliveryRequest",
  executionMode,
  wrangler: { executable: wranglerExecutable, digest: rawNi(readFileSync(wranglerExecutable)), version: wranglerVersion },
  config: { path: configPath, digest: rawNi(readFileSync(configPath)) },
  artifact: {
    path: artifactPath,
    digest: treeNi(files),
    profile: manifest.profile,
    manifestDigest: rawNi(manifestBytes),
    livePublicationWitnessDigest: manifest.livePublicationWitnessDigest,
  },
  deliveryPolicy: { digest: deliveryPolicyDigest },
  hostname,
  expiresAt,
  timeoutMilliseconds: 120_000,
  caller: SITE_ACCOUNT.caip10,
  parentEffect: null,
  ...(cloudflare === undefined ? {} : { cloudflare }),
};
const source = {
  "@context": CONTEXT,
  id: `urn:uuid:${randomUUID()}`,
  type: "Create",
  actor: KOIOS_ACTOR,
  target: PROVIDER_ACTOR,
  object: { type: "Note", content: "Contract bounded Cloudflare static delivery through Resource Brokerage Team.", attachment: [request] },
};
const solicitation = {
  "@context": CONTEXT,
  id: `urn:uuid:${randomUUID()}`,
  type: "Offer",
  actor: KOIOS_ACTOR,
  target: PROVIDER_ACTOR,
  object: { type: "ServiceSolicitation", demand: `urn:uuid:${randomUUID()}`, sourceActivity: source },
};
const root = providerRoot();
const offer = invokeProvider(root, "solicit-service", solicitation, instant, false);
if (offer["type"] !== "Offer") throw new Error(`Resource Brokerage Team did not offer Cloudflare delivery: ${JSON.stringify(offer)}`);
const offerObject = offer["object"] as Record<string, unknown>;
const bindings = offerObject["bindings"] as Record<string, unknown>;
const invocationId = `urn:uuid:${randomUUID()}`;
const credential = live ? invocationCredential() : undefined;
if (live && credential === undefined) throw new Error("live preview requires CLOUDFLARE_API_TOKEN or --credential-file after Koios accepts the exact RMN effect");
const invocation = {
  "@context": CONTEXT,
  id: invocationId,
  type: "Accept",
  actor: KOIOS_ACTOR,
  target: PROVIDER_ACTOR,
  inReplyTo: offer["id"],
  object: {
    type: "ServiceContract",
    contract: CONTRACT,
    demand: solicitation.object.demand,
    offer,
    bindings,
  },
};
const outcome = invokeProvider(root, "invoke-service", invocation, instant, live, credential);
const accepted = outcome["type"] === "Accept";
const outcomeObject = outcome["object"] !== null && typeof outcome["object"] === "object" ? outcome["object"] as Record<string, unknown> : undefined;
const returnedEffect = outcomeObject?.["effect"];
if (accepted && (returnedEffect === null || typeof returnedEffect !== "object")) throw new Error("Resource Brokerage Team accepted delivery without the contracted RMN effect witness");
await appendKoiosAct({
  dataRoot: DEFAULT_DATA_DIR,
  ledger: "shadow-deliveries",
  instant,
  act: accepted ? (live ? "deployment.cloudflare-preview.delivered" : "deployment.provider-dry-run-settled") : "deployment.provider-contract.refused",
  subject: "resource-brokerage-team/cloudflare-static-delivery",
  data: {
    provider: PROVIDER_ACTOR,
    contract: CONTRACT,
    executionMode,
    offer: offer["id"],
    providerOutcomeDigest: recordDigest(outcome),
    artifactDigest: request.artifact.digest,
    artifactProfile: request.artifact.profile,
    artifactManifestDigest: request.artifact.manifestDigest,
    livePublicationWitnessDigest: request.artifact.livePublicationWitnessDigest,
    deliveryPolicyDigest: request.deliveryPolicy.digest,
    hostname: request.hostname,
    expiresAt: request.expiresAt,
    effectsIdentity: bindings["effectsIdentity"],
    outcome,
  },
});
process.stdout.write(`${JSON.stringify(outcome)}\n`);
if (!accepted) process.exitCode = 2;
