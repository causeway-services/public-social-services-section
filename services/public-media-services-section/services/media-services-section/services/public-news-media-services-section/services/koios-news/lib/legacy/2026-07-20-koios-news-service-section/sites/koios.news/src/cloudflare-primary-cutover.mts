#!/usr/bin/env node

import { createHash } from "node:crypto";
import { closeSync, lstatSync, mkdtempSync, openSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { DEFAULT_DATA_DIR } from "./config.mjs";
import { appendKoiosAct, latestKoiosAct, recordDigest, type JsonObject } from "./management/ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "urn:ame:koios-news";
const LMT_ACTOR = "urn:ame:leader-movement-team";
const CONTRACT = "cloudflare-primary-cutover";
const API = "https://api.cloudflare.com/client/v4";

type Route = Readonly<{ id: string; pattern: string; script?: string }>;
type Artifact = Readonly<{ route: string; file: string; mediaType: string; digest: string }>;
type Manifest = Readonly<{
  profile: string;
  authority: string;
  canonicalOrigin: string;
  routeCount: number;
  livePublicationWitnessDigest: string;
  artifacts: readonly Artifact[];
}>;
type Bindings = Readonly<{
  accountId: string;
  zoneName: string;
  workerName: string;
  routePattern: string;
  artifactManifestDigest: string;
  livePublicationWitnessDigest: string;
  deliveryPolicyDigest: string;
}>;

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function sha256(value: Uint8Array | string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as JsonObject)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function string(value: unknown, label: string): string {
  if (typeof value !== "string" || value === "") throw new Error(`${label} must be a nonempty string`);
  return value;
}

function currentInstant(value: string): void {
  const instant = Date.parse(value);
  if (!Number.isFinite(instant) || Math.abs(Date.now() - instant) > 5 * 60_000) throw new Error("--now must be a current explicit UTC instant");
}

function credential(pathValue: string, name: string): string {
  const path = realpathSync(resolve(pathValue));
  const stat = lstatSync(path);
  if (!stat.isFile() || (stat.mode & 0o077) !== 0) throw new Error("credential environment file must be a regular file with mode 0600 or stricter");
  const matches = readFileSync(path, "utf8").split(/\r?\n/gu).flatMap((line) => {
    const trimmed = line.trim();
    if (trimmed === "" || trimmed.startsWith("#") || !trimmed.startsWith(`${name}=`)) return [];
    let value = trimmed.slice(name.length + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    return [value];
  });
  if (matches.length !== 1 || matches[0] === "") throw new Error(`credential environment file must contain exactly one ${name} assignment`);
  return matches[0]!;
}

function recordData(record: Readonly<JsonObject> | undefined, act: string): JsonObject {
  if (record?.["act"] !== act || !object(record["data"])) throw new Error(`missing ${act} evidence`);
  return record["data"];
}

function requireExactEvidence(bindings: Bindings): void {
  const preview = recordData(latestKoiosAct(DEFAULT_DATA_DIR, "deployments", "deployment.cloudflare-preview.parity-proved"), "deployment.cloudflare-preview.parity-proved");
  const mutable = recordData(latestKoiosAct(DEFAULT_DATA_DIR, "deployments", "deployment.mutable-routes.disposed"), "deployment.mutable-routes.disposed");
  const rollback = recordData(latestKoiosAct(DEFAULT_DATA_DIR, "deployments", "deployment.rollback-origin-rehearsed"), "deployment.rollback-origin-rehearsed");
  for (const evidence of [preview, mutable]) {
    if (evidence["artifactManifestDigest"] !== bindings.artifactManifestDigest
      || evidence["livePublicationWitnessDigest"] !== bindings.livePublicationWitnessDigest
      || evidence["deliveryPolicyDigest"] !== bindings.deliveryPolicyDigest) throw new Error("cutover evidence is not bound to the exact candidate");
  }
  if (preview["settled"] !== true || preview["previewNoindex"] !== true || preview["mismatches"] instanceof Array && preview["mismatches"].length !== 0) throw new Error("candidate preview parity is not settled");
  if (mutable["settled"] !== true || mutable["candidateOnly"] !== true || mutable["currentVpsMutated"] !== false) throw new Error("candidate mutable-route dispositions are not settled");
  if (rollback["ok"] !== true || rollback["livePublicationWitnessDigest"] !== bindings.livePublicationWitnessDigest) throw new Error("Cold Red Gate rollback origin is not currently rehearsed for this witness");
}

export function primaryRoute(routes: readonly Route[], pattern: string): Route | null {
  const matches = routes.filter((route) => route.pattern === pattern);
  if (matches.length > 1) throw new Error(`Cloudflare returned duplicate exact routes for ${pattern}`);
  return matches[0] ?? null;
}

export function probeRoutes(manifest: Manifest): readonly Artifact[] {
  const byRoute = new Map(manifest.artifacts.map((artifact) => [artifact.route, artifact]));
  const firstArticle = manifest.artifacts.find((artifact) => artifact.route.startsWith("/posts/") && artifact.route.split("/").length === 3);
  const wanted = ["/", "/feed.json", "/sitemap.xml", "/privacy", "/standards", "/corrections", firstArticle?.route].filter((value): value is string => value !== undefined);
  return Object.freeze(wanted.map((route) => {
    const artifact = byRoute.get(route);
    if (artifact === undefined) throw new Error(`candidate lacks required production probe route ${route}`);
    return artifact;
  }));
}

export function withoutCloudflareBrowserInsights(value: string): string {
  return value.replace(/<script defer src="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js\/[^"]+"[^>]*data-cf-beacon='[^']*' crossorigin="anonymous"><\/script>\n?/gu, "");
}

export function validatePrimaryGrant(grant: unknown, bindings: Bindings, now: string): Readonly<JsonObject> {
  void grant; void bindings; void now;
  throw new Error("the one-shot VPS-rollback cutover grant is retired under cloudflare-public-authority/v3; routine releases use cloudflare-primary-static-release/v1");
}

export function validateAuthorityTransferGrant(grant: unknown, bindings: Bindings, now: string): Readonly<JsonObject> {
  if (!object(grant) || grant["type"] !== "CloudflarePrimaryAuthorityTransferGrant" || grant["issuer"] !== LMT_ACTOR || grant["holder"] !== KOIOS_ACTOR || grant["action"] !== "cloudflare-primary-authority-transfer") throw new Error("authority transfer requires a directly issued LMT grant");
  if (!object(grant["bindings"]) || canonical(grant["bindings"]) !== canonical(bindings)) throw new Error("LMT authority-transfer grant does not bind the exact candidate and Cloudflare route");
  const expiry = Date.parse(string(grant["expiresAt"], "grant expiry"));
  const nowMs = Date.parse(now);
  if (!Number.isFinite(expiry) || expiry <= nowMs || expiry - nowMs > 60 * 60_000) throw new Error("LMT authority-transfer grant is expired or broader than one hour");
  const required = ["cloudflare-primary-worker-deploy-or-reuse", "cloudflare-worker-route-snapshot", "cloudflare-worker-route-bind", "public-propagation-observation", "koios-local-append-only-evidence"];
  if (!Array.isArray(grant["effects"]) || canonical([...grant["effects"]].sort()) !== canonical(required.sort())) throw new Error("LMT authority-transfer grant effects are not exact");
  const authority = grant["publicAuthority"];
  if (!object(authority) || authority["from"] !== "cold-red-gate-vps" || authority["to"] !== "cloudflare-worker:koios-news-primary" || authority["vpsPublicAuthorityRetired"] !== true) throw new Error("LMT grant does not retire Cold Red Gate public authority");
  if (!object(grant["authorization"]) || grant["authorization"]["maxBudgetUsd"] !== 0 || grant["authorization"]["persistence"] !== false || grant["authorization"]["delegation"] !== false) throw new Error("LMT authority-transfer grant is not zero-dollar, one-shot, and nondelegable");
  return Object.freeze(grant);
}

async function cloudflare<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
  const envelope: unknown = await response.json();
  if (!response.ok || !object(envelope) || envelope["success"] !== true) throw new Error(`Cloudflare API ${init.method ?? "GET"} ${path} refused (${response.status}): ${JSON.stringify(envelope)}`);
  return envelope["result"] as T;
}

async function inspectCloudflare(token: string, bindings: Bindings): Promise<Readonly<JsonObject>> {
  const verification = await cloudflare<JsonObject>(token, "/user/tokens/verify");
  const zones = await cloudflare<JsonObject[]>(token, `/zones?name=${encodeURIComponent(bindings.zoneName)}&account.id=${encodeURIComponent(bindings.accountId)}&status=active&match=all`);
  if (zones.length !== 1) throw new Error(`expected exactly one active ${bindings.zoneName} zone in the granted account`);
  const zoneId = string(zones[0]?.["id"], "Cloudflare zone id");
  const routes = await cloudflare<Route[]>(token, `/zones/${zoneId}/workers/routes`);
  const setting = async (name: string): Promise<unknown> => {
    try { return await cloudflare<JsonObject>(token, `/zones/${zoneId}/settings/${name}`); }
    catch (error) { return { unavailable: true, diagnostic: error instanceof Error ? error.message : String(error) }; }
  };
  const [emailObfuscation, minify, rocketLoader] = await Promise.all([setting("email_obfuscation"), setting("minify"), setting("rocket_loader")]);
  return Object.freeze({
    tokenStatus: verification["status"] ?? "active",
    zoneId,
    routeSnapshot: primaryRoute(routes, bindings.routePattern),
    exactRouteCount: routes.filter((route) => route.pattern === bindings.routePattern).length,
    dnsMutationAuthorized: false,
    dnsSnapshotRequired: false,
    htmlTransformationSettings: { emailObfuscation, minify, rocketLoader },
  });
}

function deployPrimary(token: string, artifactPath: string, bindings: Bindings): Readonly<JsonObject> {
  const exchange = mkdtempSync(join(tmpdir(), "koios-cloudflare-primary-"));
  const configPath = join(exchange, "wrangler.primary.json");
  const outputPath = join(exchange, "stdout.txt");
  const errorPath = join(exchange, "stderr.txt");
  writeFileSync(configPath, JSON.stringify({
    name: bindings.workerName,
    account_id: bindings.accountId,
    compatibility_date: "2026-07-18",
    workers_dev: false,
    preview_urls: false,
    assets: { directory: artifactPath, html_handling: "drop-trailing-slash", not_found_handling: "404-page" },
  }), { encoding: "utf8", mode: 0o600 });
  const out = openSync(outputPath, "w");
  const err = openSync(errorPath, "w");
  try {
    const executable = realpathSync(resolve("node_modules/.bin/wrangler"));
    const started = Date.now();
    const execution = spawnSync(executable, ["deploy", "--config", configPath, "--assets", artifactPath, "--outdir", join(exchange, "out"), "--name", bindings.workerName, "--message", `Koios primary ${bindings.artifactManifestDigest}`], {
      cwd: process.cwd(), stdio: ["ignore", out, err], timeout: 180_000,
      env: { PATH: process.env.PATH, CI: "true", NO_COLOR: "1", WRANGLER_SEND_METRICS: "false", CLOUDFLARE_API_TOKEN: token },
    });
    const stdout = readFileSync(outputPath);
    const stderr = readFileSync(errorPath);
    if (execution.status !== 0) throw new Error(`primary Worker deployment failed (status=${execution.status}, signal=${execution.signal ?? "none"}): ${stderr.toString("utf8")}`);
    return Object.freeze({ status: execution.status, wallTimeMilliseconds: Date.now() - started, stdoutDigest: sha256(stdout), stderrDigest: sha256(stderr), credentialRecorded: false, workersDev: false, previewUrls: false });
  } finally {
    closeSync(out); closeSync(err); rmSync(exchange, { recursive: true, force: true });
  }
}

async function bindRoute(token: string, zoneId: string, bindings: Bindings, prior: Route | null): Promise<Route> {
  if (prior?.script === bindings.workerName) return prior;
  const body = JSON.stringify({ pattern: bindings.routePattern, script: bindings.workerName });
  if (prior === null) return cloudflare<Route>(token, `/zones/${zoneId}/workers/routes`, { method: "POST", body });
  return cloudflare<Route>(token, `/zones/${zoneId}/workers/routes/${prior.id}`, { method: "PUT", body });
}

async function restoreRoute(token: string, zoneId: string, prior: Route | null, installed: Route): Promise<void> {
  if (prior === null) {
    await cloudflare<unknown>(token, `/zones/${zoneId}/workers/routes/${installed.id}`, { method: "DELETE" });
    return;
  }
  await cloudflare<Route>(token, `/zones/${zoneId}/workers/routes/${prior.id}`, { method: "PUT", body: JSON.stringify({ pattern: prior.pattern, script: prior.script ?? null }) });
}

async function productionProbes(origin: string, artifacts: readonly Artifact[]): Promise<readonly Readonly<JsonObject>[]> {
  const results = await Promise.all(artifacts.map(async (artifact): Promise<Readonly<JsonObject>> => {
    const url = new URL(artifact.route, origin);
    url.searchParams.set("__koios_cutover", artifact.digest.slice("sha256:".length, "sha256:".length + 16));
    const response = await fetch(url, { redirect: "manual", headers: { "User-Agent": "Koios-Primary-Cutover/1.0", Accept: artifact.mediaType, "Cache-Control": "no-cache" } });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = sha256(bytes);
    const noindex = response.headers.get("x-robots-tag")?.toLowerCase().includes("noindex") === true;
    const exact = digest === artifact.digest;
    const text = artifact.mediaType.startsWith("text/html") ? Buffer.from(bytes).toString("utf8") : "";
    const normalized = text === "" ? null : withoutCloudflareBrowserInsights(text);
    const cloudflareBrowserInsights = normalized !== null && normalized !== text;
    const normalizedDigest = normalized === null ? null : sha256(normalized);
    const providerEquivalent = exact || cloudflareBrowserInsights && normalizedDigest === artifact.digest;
    let diagnosticPath: string | null = null;
    if (!exact && text !== "") {
      diagnosticPath = join(tmpdir(), `koios-primary-probe-${artifact.route === "/" ? "root" : artifact.route.slice(1).replaceAll("/", "-")}.html`);
      writeFileSync(diagnosticPath, bytes, { mode: 0o600 });
    }
    return Object.freeze({
      route: artifact.route, status: response.status, mediaType: response.headers.get("content-type") ?? "", expectedDigest: artifact.digest, observedDigest: digest,
      observedBytes: bytes.length, noindex, exact, diagnosticPath,
      transformations: { cloudflareBrowserInsights, normalizedDigest, emailProtection: text.includes("/cdn-cgi/l/email-protection") || text.includes("data-cfemail"), rocketLoader: text.includes("data-cf-settings") || text.includes("rocket-loader") },
      providerEquivalent,
      ok: response.status === 200 && providerEquivalent && !noindex,
    });
  }));
  return Object.freeze(results);
}

async function settledProductionProbes(origin: string, artifacts: readonly Artifact[]): Promise<readonly Readonly<JsonObject>[]> {
  let last: readonly Readonly<JsonObject>[] = [];
  for (let attempt = 0; attempt < 15; attempt += 1) {
    last = await productionProbes(origin, artifacts);
    if (last.every((probe) => probe["ok"] === true)) return last;
    if (attempt < 14) await new Promise((resolvePromise) => setTimeout(resolvePromise, 2_000));
  }
  return last;
}

function candidate(artifactValue: string): Readonly<{ artifactPath: string; manifest: Manifest; bindingsBase: Pick<Bindings, "artifactManifestDigest" | "livePublicationWitnessDigest" | "deliveryPolicyDigest"> }> {
  const artifactPath = realpathSync(resolve(artifactValue));
  const manifestBytes = readFileSync(join(artifactPath, "manifest.json"));
  const parsed: unknown = JSON.parse(manifestBytes.toString("utf8"));
  if (!object(parsed) || parsed["profile"] !== "cutover-candidate" || parsed["authority"] !== "non-authoritative-cutover-candidate" || parsed["canonicalOrigin"] !== "https://koios.news" || !Array.isArray(parsed["artifacts"])) throw new Error("artifact is not the verified Koios cutover candidate");
  const manifest = parsed as Manifest;
  const headers = readFileSync(join(artifactPath, "_headers"));
  if (headers.toString("utf8").includes("X-Robots-Tag")) throw new Error("production candidate retains a preview noindex overlay");
  return Object.freeze({ artifactPath, manifest, bindingsBase: { artifactManifestDigest: sha256(manifestBytes), livePublicationWitnessDigest: manifest.livePublicationWitnessDigest, deliveryPolicyDigest: sha256(headers) } });
}

async function main(): Promise<void> {
  const mode = argument("--mode") ?? "inspect";
  if (!["inspect"].includes(mode)) throw new Error("Cloudflare primary cutover mutation is retired; this historical tool now permits --mode inspect only, and routine publication uses cloudflare-primary-static-release/v1");
  const now = string(argument("--now"), "--now");
  currentInstant(now);
  const artifact = candidate(argument("--artifact") ?? ".static/koios.news-candidate");
  const bindings: Bindings = Object.freeze({
    accountId: argument("--account-id") ?? "337e54ee6dc7d488933f473204a6d89e",
    zoneName: argument("--zone-name") ?? "koios.news",
    workerName: argument("--worker-name") ?? "koios-news-primary",
    routePattern: argument("--route-pattern") ?? "koios.news/*",
    ...artifact.bindingsBase,
  });
  // The old proof chain included a Cold Red Gate rollback-origin rehearsal.
  // Current authority law forbids that topology, so inspection must not
  // require or reactivate the displaced evidence.
  if (mode === "demand" || mode === "transfer-demand") {
    const transfer = mode === "transfer-demand";
    const demand = Object.freeze({
      "@context": CONTEXT,
      id: `urn:koios:cloudflare-primary-${transfer ? "authority-transfer" : "cutover"}-demand:${recordDigest({ bindings, now })}`,
      type: "Question", actor: KOIOS_ACTOR, target: LMT_ACTOR,
      object: transfer ? {
        type: "CloudflarePrimaryAuthorityTransferDemand", action: "cloudflare-primary-authority-transfer", bindings,
        effects: ["cloudflare-primary-worker-deploy-or-reuse", "cloudflare-worker-route-snapshot", "cloudflare-worker-route-bind", "public-propagation-observation", "koios-local-append-only-evidence"],
        maxBudgetUsd: 0, workersDev: false, previewUrls: false,
        publicAuthority: { from: "cold-red-gate-vps", to: "cloudflare-worker:koios-news-primary", vpsPublicAuthorityRetired: true },
        exclusions: ["dns-mutation", "credential-disclosure", "vps-mutation", "worker-deletion", "automatic-route-restore-to-vps"],
      } : {
        type: "CloudflarePrimaryCutoverDemand", action: CONTRACT, bindings,
        effects: ["cloudflare-primary-worker-deploy", "cloudflare-worker-route-snapshot", "cloudflare-worker-route-bind", "public-production-probes", "automatic-route-restore-on-failure", "koios-local-append-only-evidence"],
        maxBudgetUsd: 0, workersDev: false, previewUrls: false,
        rollback: { automaticOnProbeFailure: true, retainVpsOrigin: true },
        exclusions: ["dns-mutation", "credential-disclosure", "vps-mutation", "delete-or-retire-cold-red-gate", "delete-or-retire-rollback-origin"],
      },
    });
    appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "contract-events", instant: now, act: transfer ? "deployment.cloudflare-primary-authority-transfer.requested" : "deployment.cloudflare-primary-cutover.requested", subject: demand.id, data: { demand, credentialRecorded: false } });
    const output = argument("--demand-out");
    if (output !== undefined) writeFileSync(resolve(output), `${JSON.stringify(demand)}\n`, { encoding: "utf8", mode: 0o600 });
    process.stdout.write(`${JSON.stringify(demand)}\n`);
    return;
  }
  const token = credential(argument("--credential-env-file") ?? "/home/emsenn/info/.env", argument("--credential-env-name") ?? "API_KEY_CLOUDFLARE_WORKERS_EDIT");
  const inspection = await inspectCloudflare(token, bindings);
  if (mode === "inspect") {
    process.stdout.write(`${JSON.stringify({ kind: "koios.cloudflare-primary-inspection/v1", inspectedAt: now, bindings, ...inspection, credentialRecorded: false })}\n`);
    return;
  }
  const grantPath = argument("--resource-grant");
  if (grantPath === undefined) throw new Error("primary authority operation requires --resource-grant from the Leader Movement Team");
  const grantValue: unknown = JSON.parse(readFileSync(realpathSync(resolve(grantPath)), "utf8"));
  const authorityTransfer = mode === "transfer" || mode === "settle-transfer";
  const grant = authorityTransfer ? validateAuthorityTransferGrant(grantValue, bindings, now) : validatePrimaryGrant(grantValue, bindings, now);
  if (mode === "settle-transfer") {
    const installed = inspection["routeSnapshot"] as Route | null;
    if (installed?.script !== bindings.workerName || installed.pattern !== bindings.routePattern) throw new Error("Cloudflare primary route is not bound to the granted Worker");
    const probes = await settledProductionProbes(artifact.manifest.canonicalOrigin, probeRoutes(artifact.manifest));
    if (!probes.every((probe) => probe["ok"] === true)) throw new Error("bound Cloudflare primary route has not settled to the exact candidate");
    const record = appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-primary.authority-transferred", subject: artifact.manifest.canonicalOrigin, data: { bindings, grant: grant["id"], installedRoute: installed, probes, propagationSettled: true, observationError: null, publicAuthority: "cloudflare-worker:koios-news-primary", retiredPublicAuthority: "cold-red-gate-vps", routeLeftBound: true, vpsMutated: false, dnsMutated: false, credentialRecorded: false, settledAfterExternalMutation: true } });
    process.stdout.write(`${JSON.stringify(record)}\n`);
    return;
  }
  appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cutover.authorized", subject: string(grant["id"], "grant id"), data: { grant: grant["id"], grantDigest: recordDigest(grant), bindings, routeSnapshot: inspection["routeSnapshot"], dnsMutationAuthorized: false, credentialRecorded: false } });
  const deployment = deployPrimary(token, artifact.artifactPath, bindings);
  const zoneId = string(inspection["zoneId"], "zone id");
  const prior = inspection["routeSnapshot"] as Route | null;
  if (mode === "transfer") {
    const installed = await bindRoute(token, zoneId, bindings, prior);
    let probes: readonly Readonly<JsonObject>[] = [];
    let observationError: string | null = null;
    try { probes = await settledProductionProbes(artifact.manifest.canonicalOrigin, probeRoutes(artifact.manifest)); }
    catch (error) { observationError = error instanceof Error ? error.message : String(error); }
    const propagationSettled = probes.length > 0 && probes.every((probe) => probe["ok"] === true);
    const record = appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-primary.authority-transferred", subject: artifact.manifest.canonicalOrigin, data: { bindings, grant: grant["id"], deployment, priorRoute: prior, installedRoute: installed, probes, propagationSettled, observationError, publicAuthority: "cloudflare-worker:koios-news-primary", retiredPublicAuthority: "cold-red-gate-vps", routeLeftBound: true, vpsMutated: false, dnsMutated: false, credentialRecorded: false } });
    process.stdout.write(`${JSON.stringify(record)}\n`);
    return;
  }
  let installed: Route | undefined;
  try {
    installed = await bindRoute(token, zoneId, bindings, prior);
    const probes = await settledProductionProbes(artifact.manifest.canonicalOrigin, probeRoutes(artifact.manifest));
    if (!probes.every((probe) => probe["ok"] === true)) throw Object.assign(new Error("production route did not settle to the exact candidate"), { probes });
    const record = appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-primary.authority-transferred", subject: artifact.manifest.canonicalOrigin, data: { bindings, grant: grant["id"], deployment, priorRoute: prior, installedRoute: installed, probes, retainedOrigin: "cold-red-gate", vpsMutated: false, dnsMutated: false, credentialRecorded: false } });
    process.stdout.write(`${JSON.stringify(record)}\n`);
  } catch (error) {
    let rollbackError: string | null = null;
    if (installed !== undefined) {
      try { await restoreRoute(token, zoneId, prior, installed); }
      catch (restoreFailure) { rollbackError = restoreFailure instanceof Error ? restoreFailure.message : String(restoreFailure); }
    }
    const probes = object(error) && Array.isArray(error["probes"]) ? error["probes"] : [];
    appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: rollbackError === null ? "deployment.cloudflare-primary.rolled-back" : "deployment.cloudflare-primary.rollback-failed", subject: artifact.manifest.canonicalOrigin, data: { bindings, grant: grant["id"], priorRoute: prior, installedRoute: installed ?? null, probes, failure: error instanceof Error ? error.message : String(error), rollbackError, retainedOrigin: "cold-red-gate", credentialRecorded: false } });
    throw error;
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exitCode = 1;
});
