import { createHash, randomUUID } from "node:crypto";
import { closeSync, existsSync, lstatSync, mkdtempSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { appendKoiosAct, ledgerRootPath, recordDigest, type JsonObject, type KoiosLedger } from "./ledger.mjs";
import { SITE_ACCOUNT } from "./settlement-account.mjs";
import { appendLivePublicationWitness, captureLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "urn:ame:koios.news";
const PROVIDER_ACTOR = "urn:ame:resource-brokerage-team";
const CONTRACT = "cloudflare-primary-static-release/v3";
const TARGET = Object.freeze({
  accountId: "337e54ee6dc7d488933f473204a6d89e",
  zoneName: "koios.news",
  workerName: "koios-news-primary",
  routePattern: "koios.news/*",
  origin: "https://koios.news",
});

type JsonRecord = Record<string, unknown>;
export type PendingPrimaryRelease = Readonly<{ assignmentId: string; slug: string; candidate: Readonly<{ outputDir: string; manifestDigest: string }> }>;
export type PrimaryReleaseSettlement = Readonly<{ accepted: boolean; outcome: JsonRecord; manifestDigest: string; assignmentId: string; slug: string }>;
export type PrimaryReleaseWitnessSettlement = Readonly<{ witnessed: boolean; slug: string; witnessDigest?: string; reason?: string }>;

function rawNi(value: Uint8Array | string): string { return `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`; }
function object(value: unknown): value is JsonRecord { return value !== null && typeof value === "object" && !Array.isArray(value); }

function treeFiles(root: string): readonly Readonly<{ path: string; bytes: number; digest: string }>[] {
  const files: { path: string; bytes: number; digest: string }[] = [];
  function visit(directory: string): void {
    for (const entry of readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const path = join(directory, entry.name);
      if (entry.isSymbolicLink()) throw new Error(`release candidate contains a symlink: ${path}`);
      if (entry.isDirectory()) { visit(path); continue; }
      if (!entry.isFile()) throw new Error(`release candidate contains a non-file entry: ${path}`);
      const bytes = readFileSync(path);
      files.push(Object.freeze({ path: relative(root, path).split(sep).join("/"), bytes: bytes.length, digest: rawNi(bytes) }));
    }
  }
  visit(root);
  return Object.freeze(files);
}
function treeNi(files: readonly Readonly<{ path: string; bytes: number; digest: string }>[]): string {
  const rows = files.map((file) => `<urn:path:${encodeURIComponent(file.path)}> <urn:rmn:bytes> ${JSON.stringify(String(file.bytes))}; <urn:rmn:content> <${file.digest}> .`).join("\n");
  return rawNi(Buffer.from(`${rows}\n`, "utf8"));
}

function providerAccount(root: string): string {
  const files = readdirSync(join(root, "content", "evm", "accounts")).filter((name) => /^eip155-[1-9][0-9]*\.json$/u.test(name));
  if (files.length !== 1) throw new Error("Resource Brokerage Team must publish exactly one active settlement account binding");
  const binding = JSON.parse(readFileSync(join(root, "content", "evm", "accounts", files[0]!), "utf8")) as { account?: { caip10?: unknown } };
  if (typeof binding.account?.caip10 !== "string") throw new Error("Resource Brokerage Team account binding lacks CAIP-10");
  return binding.account.caip10;
}

function ecosystemProvider(start: string): string {
  const relativeProvider = "lib/emsenn/services/board-of-directors/services/executive-office/services/change-services-section/services/resource-brokerage-team";
  let at = realpathSync(start);
  while (true) {
    const candidate = join(at, relativeProvider);
    if (existsSync(join(candidate, "package.json"))) return candidate;
    const parent = dirname(at);
    if (parent === at) throw new Error("Koios could not discover the Resource Brokerage Team provider");
    at = parent;
  }
}

function providerRoot(): string {
  const supplied = process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT;
  if (supplied !== undefined) return realpathSync(resolve(supplied));
  const sibling = resolve(process.cwd(), "../resource-brokerage-team");
  if (existsSync(join(sibling, "package.json"))) return realpathSync(sibling);
  const installedSibling = resolve(dirname(fileURLToPath(import.meta.url)), "../../../resource-brokerage-team");
  if (existsSync(join(installedSibling, "package.json"))) return realpathSync(installedSibling);
  return ecosystemProvider(process.cwd());
}

function invokeProvider(root: string, operation: "solicit-primary-release" | "invoke-primary-release", activity: unknown, now: string): JsonRecord {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8") as string) as { bin?: Record<string, string> };
  const endpoint = pkg.bin?.[operation];
  if (endpoint === undefined) throw new Error(`Resource Brokerage Team does not advertise ${operation}`);
  const exchange = mkdtempSync(join(tmpdir(), "koios-primary-release-exchange-"));
  const inputPath = join(exchange, "activity.json"); const outputPath = join(exchange, "response.json"); const errorPath = join(exchange, "stderr.txt");
  writeFileSync(inputPath, JSON.stringify(activity), "utf8");
  const inputFd = openSync(inputPath, "r"); const outputFd = openSync(outputPath, "w"); const errorFd = openSync(errorPath, "w");
  try {
    const execution = spawnSync(process.execPath, [resolve(root, endpoint), "--operation", operation, "--now", now], {
      cwd: root,
      stdio: [inputFd, outputFd, errorFd],
      timeout: operation === "solicit-primary-release" ? 120_000 : 900_000,
      env: Object.fromEntries(Object.entries({ PATH: process.env.PATH, NODE_PATH: process.env.NODE_PATH, NO_COLOR: "1", CI: "true", RESOURCE_BROKERAGE_PROVIDER_CAIP10: providerAccount(root), RMN_CONFORMANCE_AGENT: process.env.RMN_CONFORMANCE_AGENT, RWIL_RDF_AGENT: process.env.RWIL_RDF_AGENT }).filter(([, value]) => value !== undefined)),
    });
    const stdout = readFileSync(outputPath, "utf8"); const stderr = readFileSync(errorPath, "utf8");
    let result: JsonRecord;
    try { result = JSON.parse(stdout) as JsonRecord; }
    catch { throw new Error(`Resource Brokerage Team returned no typed release result (status=${execution.status}, signal=${execution.signal ?? "none"}): ${stderr || stdout}`); }
    if (execution.status !== 0 && result["type"] !== "Reject") throw new Error(`Resource Brokerage Team failed without a typed refusal: ${stderr || stdout}`);
    return result;
  } finally { closeSync(inputFd); closeSync(outputFd); closeSync(errorFd); rmSync(exchange, { recursive: true, force: true }); }
}

function jsonl(root: string): readonly string[] {
  try { return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? jsonl(join(root, entry.name)) : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : [])); }
  catch { return Object.freeze([]); }
}

function acts(dataDir: string, ledger: KoiosLedger): readonly JsonRecord[] {
  return Object.freeze([...jsonl(ledgerRootPath(dataDir, ledger))].sort().flatMap((path): JsonRecord[] => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  }));
}

function manifestDigestFromRelease(record: JsonRecord): string | undefined {
  if (!object(record["data"])) return undefined;
  const data = record["data"];
  if (record["act"] === "deployment.cloudflare-primary.authority-transferred" && object(data["bindings"])) return typeof data["bindings"]["artifactManifestDigest"] === "string" ? data["bindings"]["artifactManifestDigest"] as string : undefined;
  if (record["act"] === "deployment.cloudflare-primary-static.released") return typeof data["artifactManifestDigest"] === "string" ? data["artifactManifestDigest"] as string : undefined;
  return undefined;
}

export function pendingPrimaryStaticRelease(dataDir: string, outputDir = ".static/koios.news-candidate"): PendingPrimaryRelease | undefined {
  const root = resolve(outputDir);
  const manifestPath = join(root, "manifest.json");
  if (!existsSync(manifestPath)) return undefined;
  const manifestDigest = rawNi(readFileSync(manifestPath));
  const released = new Set(acts(dataDir, "deployments").flatMap((record) => {
    const found = manifestDigestFromRelease(record);
    return found === undefined ? [] : [found];
  }));
  if (released.has(manifestDigest)) return undefined;
  const shadowActs = acts(dataDir, "shadow-deliveries");
  const retired = shadowActs.some((record) => record["act"] === "candidate.retired" && object(record["data"]) && record["data"]["manifestDigest"] === manifestDigest);
  if (retired) return undefined;
  const projection = shadowActs.filter((record) => record["act"] === "candidate.projected" && object(record["data"]) && record["data"]["manifestDigest"] === manifestDigest).at(-1);
  if (projection === undefined || !object(projection["data"]) || typeof projection["subject"] !== "string" || typeof projection["data"]["slug"] !== "string") return undefined;
  return Object.freeze({ assignmentId: projection["subject"], slug: projection["data"]["slug"] as string, candidate: Object.freeze({ outputDir: root, manifestDigest }) });
}

export async function witnessPrimaryStaticRelease(input: Readonly<{ slug: string; dataDir: string; observedAt?: string; attempts?: number }>): Promise<PrimaryReleaseWitnessSettlement> {
  const route = `/posts/${input.slug}`;
  const attempts = input.attempts ?? 6;
  let reason = "released article was not visible in the public feed";
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const observedAt = attempt === 0 && input.observedAt !== undefined ? input.observedAt : new Date().toISOString();
    try {
      const witness = await captureLivePublicationWitness({ observedAt });
      if (!witness.articleRoutes.includes(route)) reason = `${route} was absent from the public feed witness`;
      else {
        appendLivePublicationWitness(input.dataDir, witness);
        appendKoiosAct({ dataRoot: input.dataDir, ledger: "deployments", instant: observedAt, act: "deployment.cloudflare-primary-static.witnessed", subject: input.slug, data: { route, witnessDigest: witness.witnessDigest } });
        return Object.freeze({ witnessed: true, slug: input.slug, witnessDigest: witness.witnessDigest });
      }
    } catch (error) { reason = error instanceof Error ? error.message : String(error); }
    if (attempt + 1 < attempts) await new Promise((resolveWait) => setTimeout(resolveWait, 1_000));
  }
  const observedAt = new Date().toISOString();
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "deployments", instant: observedAt, act: "deployment.cloudflare-primary-static.witness-obstructed", subject: input.slug, data: { route, reason, attempts } });
  return Object.freeze({ witnessed: false, slug: input.slug, reason });
}

export function settlePrimaryStaticRelease(input: Readonly<{ assignmentId: string; slug: string; candidateDir: string; dataDir: string; now?: string; executionMode?: "dry-run" | "live" }>): PrimaryReleaseSettlement {
  const now = input.now ?? new Date().toISOString();
  const expiresAt = new Date(Date.parse(now) + 45 * 60_000).toISOString();
  const artifactPath = realpathSync(resolve(input.candidateDir));
  const stat = lstatSync(artifactPath);
  if (!stat.isDirectory() || stat.isSymbolicLink()) throw new Error("Koios release candidate is not a regular directory");
  const manifestBytes = readFileSync(join(artifactPath, "manifest.json"));
  const manifest = JSON.parse(manifestBytes.toString("utf8")) as JsonRecord;
  const headersBytes = readFileSync(join(artifactPath, "_headers"));
  if (typeof manifest["livePublicationWitnessDigest"] !== "string") throw new Error("Koios release candidate lacks a live-publication witness digest");
  const files = treeFiles(artifactPath);
  const request = Object.freeze({
    type: "CloudflarePrimaryStaticReleaseRequest",
    executionMode: input.executionMode ?? "live",
    artifact: Object.freeze({ path: artifactPath, treeDigest: treeNi(files), manifestDigest: rawNi(manifestBytes), deliveryPolicyDigest: rawNi(headersBytes), livePublicationWitnessDigest: manifest["livePublicationWitnessDigest"] }),
    publication: Object.freeze({ assignmentId: input.assignmentId, slug: input.slug }),
    target: TARGET,
    expiresAt,
    caller: SITE_ACCOUNT.caip10,
    parentEffect: null,
  });
  const source = Object.freeze({ "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Create", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, object: Object.freeze({ type: "Note", content: "Release one accepted Koios candidate through the existing Cloudflare public authority.", attachment: Object.freeze([request]) }) });
  const solicitation = Object.freeze({ "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Offer", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity: source }) });
  const root = providerRoot();
  const offer = invokeProvider(root, "solicit-primary-release", solicitation, now);
  if (offer["type"] !== "Offer" || !object(offer["object"])) {
    appendKoiosAct({ dataRoot: input.dataDir, ledger: "deployments", instant: now, act: "deployment.cloudflare-primary-static.refused", subject: input.assignmentId, data: { contract: CONTRACT, stage: "solicitation", artifactManifestDigest: request.artifact.manifestDigest, providerOutcome: offer } as JsonObject });
    return Object.freeze({ accepted: false, outcome: offer, manifestDigest: request.artifact.manifestDigest, assignmentId: input.assignmentId, slug: input.slug });
  }
  const offerObject = offer["object"];
  const invocation = Object.freeze({
    "@context": CONTEXT,
    id: `urn:uuid:${randomUUID()}`,
    type: "Accept",
    actor: KOIOS_ACTOR,
    target: PROVIDER_ACTOR,
    inReplyTo: offer["id"],
    object: Object.freeze({
      type: "ServiceContract",
      contract: CONTRACT,
      offer,
      bindings: offerObject["bindings"],
    }),
  });
  const outcome = invokeProvider(root, "invoke-primary-release", invocation, now);
  const returnedEffect = object(outcome["object"]) ? outcome["object"]["effect"] : undefined;
  const accepted = outcome["type"] === "Accept" && object(outcome["object"]) && outcome["object"]["disposition"] === "released";
  if (outcome["type"] === "Accept" && !object(returnedEffect)) throw new Error("Resource Brokerage Team accepted primary release without the contracted RMN effect witness");
  appendKoiosAct({
    dataRoot: input.dataDir,
    ledger: "deployments",
    instant: now,
    act: accepted ? "deployment.cloudflare-primary-static.released" : "deployment.cloudflare-primary-static.refused",
    subject: input.assignmentId,
    data: {
      contract: CONTRACT,
      provider: PROVIDER_ACTOR,
      artifactManifestDigest: request.artifact.manifestDigest,
      artifactTreeDigest: request.artifact.treeDigest,
      deliveryPolicyDigest: request.artifact.deliveryPolicyDigest,
      livePublicationWitnessDigest: request.artifact.livePublicationWitnessDigest,
      slug: input.slug,
      providerOutcomeDigest: recordDigest(outcome),
      outcome,
      publicAuthority: accepted ? "cloudflare-worker:koios-news-primary" : "prior-cloudflare-worker-version",
      coldRedGatePublicOrigin: false,
      credentialRecorded: false,
    } as JsonObject,
  });
  return Object.freeze({ accepted, outcome, manifestDigest: request.artifact.manifestDigest, assignmentId: input.assignmentId, slug: input.slug });
}
