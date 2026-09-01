/** Koios customer-side treaty for reusing already-settled prior research.
 *
 * The Corpus Management Team owns the source recovery and its copied excerpts.
 * Koios names the exact recovery digests, asks for an issue-sized projection,
 * and admits only the returned value into its own evidence log. The provider
 * rereads no source settlement and never writes Koios territory.
 */
import { spawnSync } from "node:child_process";
import { constants, accessSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { appendDatedRecord, appendKoiosAct, ledgerRootPath, recordDigest, type JsonObject } from "../../management/ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "urn:ame:koios-news";
const PROVIDER_ACTOR = "urn:ame:corpus-management-team";
const CONTRACT = "recovering-prior-research";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const CUSTOMER_CONTRACT_PATH = resolve(SITE_ROOT, "lib/management/contracts/corpus-management-team-prior-research-recovery.json");

type CachedRecovery = Readonly<{
  id: string;
  contextualBundleDigest: string;
  gapBundleDigest: string;
  sourceCount: number;
  gapCount: number;
  recoveredAt: string;
}>;

export type PriorResearchContext = Readonly<{
  contract: "corpus-management-team/recovering-prior-research/v1";
  assignmentId: string;
  sourceRecovery: string;
  contextualBundleDigest: string;
  gapBundleDigest: string;
  contextualBundle: Readonly<JsonObject>;
  gapBundle: Readonly<JsonObject>;
  providerResultDigest: string;
  providerDelivery?: Readonly<JsonObject>;
  filesystemReads: 0;
}>;

function record(value: unknown, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a record`);
  return value as JsonObject;
}
function debug(label: string): void { if (process.env["KOIOS_DEBUG_CONTRACT"] === "1") process.stderr.write(`[koios prior research] ${label}\n`); }

function contractReading(): Readonly<{ providerRoot: string; cached: CachedRecovery }> {
  const contract = record(JSON.parse(readFileSync(CUSTOMER_CONTRACT_PATH, "utf8")), "Koios prior-research contract");
  const cached = record(contract["admittedCachedRecovery"], "admitted cached recovery");
  for (const key of ["id", "contextualBundleDigest", "gapBundleDigest", "recoveredAt"] as const) if (typeof cached[key] !== "string") throw new Error(`cached recovery lacks ${key}`);
  const embedded = resolve(SITE_ROOT, contract["providerRoot"] as string ?? "../../../../../../../board-of-directors/services/executive-office/services/knowledge-services-section/services/corpus-management-team");
  const sibling = resolve(SITE_ROOT, "../../services/corpus-management-team");
  const providerRoot = process.env["KOIOS_CORPUS_MANAGEMENT_TEAM_ROOT"] ?? (existsSync(join(sibling, "package.json")) ? sibling : embedded);
  return Object.freeze({ providerRoot: resolve(providerRoot), cached: cached as unknown as CachedRecovery });
}

function providerEndpoint(root: string, operation: "solicit-service" | "invoke-service"): string {
  const packageJson = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")), "Corpus Management Team package");
  const bins = record(packageJson["bin"], "Corpus Management Team operation catalog");
  const relative = bins[operation];
  if (typeof relative !== "string" || relative.trim() === "") throw new Error(`Corpus Management Team does not advertise ${operation}`);
  const endpoint = resolve(root, relative);
  if (!endpoint.startsWith(`${root}/`)) throw new Error(`Corpus Management Team ${operation} endpoint escapes its membrane`);
  return endpoint;
}

function invokeProvider(providerRoot: string, operation: "solicit-service" | "invoke-service", activity: JsonObject, now: string): JsonObject {
  debug(`begin ${operation}`);
  const provider = providerEndpoint(providerRoot, operation);
  accessSync(provider, constants.R_OK);
  const invocationRoot = join(SITE_ROOT, ".tmp");
  mkdirSync(invocationRoot, { recursive: true });
  const temp = mkdtempSync(join(invocationRoot, "cmt-invocation-"));
  const inputPath = join(temp, "request.json");
  const outputPath = join(temp, "response.json");
  try {
    writeFileSync(inputPath, `${JSON.stringify(activity)}\n`, "utf8");
    const execution = spawnSync(process.execPath, [provider, "--operation", operation, "--now", now, "--input-file", inputPath, "--output-file", outputPath], { cwd: providerRoot, encoding: "utf8", timeout: 120_000, maxBuffer: 4 * 1024 * 1024 });
    if (execution.error !== undefined) throw execution.error;
    debug(`end ${operation}`);
    let value: JsonObject;
    try { value = record(JSON.parse(readFileSync(outputPath, "utf8")), `Corpus Management Team ${operation} response`); }
    catch { throw new Error(`Corpus Management Team returned no ${operation} response: ${execution.stderr.trim()}`); }
    if (execution.status !== 0 || value["type"] === "Reject") {
      const object = value["object"];
      const reason = object !== null && typeof object === "object" && !Array.isArray(object) ? String((object as JsonObject)["reason"] ?? "provider refusal") : "provider refusal";
      throw new Error(`Corpus Management Team refused ${operation}: ${reason}`);
    }
    return value;
  } finally { rmSync(temp, { recursive: true, force: true }); }
}

function activityId(value: unknown): string { return `urn:koios:${recordDigest(value).replace(/^sha256:/u, "")}`; }

function jsonlFiles(root: string): readonly string[] {
  try { return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? jsonlFiles(join(root, entry.name)) : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []); }
  catch { return []; }
}

export function admittedPriorResearchContext(dataDir: string, assignmentId: string): PriorResearchContext | undefined {
  const match = [...jsonlFiles(ledgerRootPath(resolve(dataDir), "source-claims"))].sort().flatMap((path): JsonObject[] => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => record(JSON.parse(line), "prior-research admission")); }
    catch { return []; }
  }).filter((value) => value["kind"] === "koios.prior-research-context-admission" && value["assignmentId"] === assignmentId).at(-1);
  if (match === undefined) return undefined;
  const contextualBundle = record(match["contextualBundle"], "admitted contextual bundle");
  const gapBundle = record(match["gapBundle"], "admitted gap bundle");
  const providerDelivery = match["providerDelivery"] === null || typeof match["providerDelivery"] !== "object" || Array.isArray(match["providerDelivery"])
    ? undefined
    : Object.freeze(match["providerDelivery"] as JsonObject);
  return Object.freeze({ contract: "corpus-management-team/recovering-prior-research/v1", assignmentId, sourceRecovery: String(match["sourceRecovery"]), contextualBundleDigest: String(match["contextualBundleDigest"]), gapBundleDigest: String(match["gapBundleDigest"]), contextualBundle: Object.freeze(contextualBundle), gapBundle: Object.freeze(gapBundle), providerResultDigest: String(match["providerResultDigest"]), ...(providerDelivery === undefined ? {} : { providerDelivery }), filesystemReads: 0 });
}

export function priorResearchContextBrief(context: PriorResearchContext): string {
  const sources = Array.isArray(context.contextualBundle["sources"]) ? context.contextualBundle["sources"] : [];
  const lines = sources.slice(0, 4).flatMap((value, index): string[] => {
    if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
    const source = value as JsonObject;
    const snippets = Array.isArray(source["snippets"]) ? source["snippets"] : [];
    const excerpts = snippets.flatMap((snippet): string[] => snippet !== null && typeof snippet === "object" && !Array.isArray(snippet) && typeof (snippet as JsonObject)["text"] === "string" ? [String((snippet as JsonObject)["text"])] : []).slice(0, 1);
    return [`PRIOR CONTEXT ${index + 1}: ${String(source["path"] ?? "provider-held-source")} (${String(source["digest"] ?? "unwitnessed")})\n${excerpts.join("\n").slice(0, 600)}`];
  });
  return [
    "PRIOR-RESEARCH CONTEXT POLICY: This is cached institutional memory, not warrant for claims about the current event. Use it to notice questions, distinctions, and possible context. Do not state a factual claim from it unless that claim is independently licensed by the admitted current-event source assertions.",
    `Cached recovery: ${context.sourceRecovery}; projection: ${context.contextualBundleDigest}; gaps: ${context.gapBundleDigest}.`,
    ...lines,
  ].join("\n\n");
}

export function projectPriorResearchForIssue(input: Readonly<{
  assignmentId: string;
  terms: readonly string[];
  now?: string;
  maxFiles?: number;
  dataDir?: string;
  providerInterface?: string;
  requireProviderDelivery?: boolean;
}>): PriorResearchContext {
  const now = input.now ?? new Date().toISOString();
  const reading = contractReading();
  debug("read customer contract");
  const provider = resolve(input.providerInterface ?? reading.providerRoot);
  const dataDir = resolve(input.dataDir ?? "data");
  const admitted = admittedPriorResearchContext(dataDir, input.assignmentId);
  debug("checked customer cache");
  if (admitted !== undefined && (!input.requireProviderDelivery || admitted.providerDelivery !== undefined)) return admitted;
  const terms = [...new Set(input.terms.map((term) => term.trim()).filter((term) => term.length >= 2))];
  if (terms.length === 0) throw new Error("prior-research projection requires at least one issue term");
  const request = Object.freeze({ type: "PriorResearchProjectionRequest", sourceResultId: reading.cached.id, contextualBundleDigest: reading.cached.contextualBundleDigest, gapBundleDigest: reading.cached.gapBundleDigest, terms, maxFiles: Math.max(1, Math.min(20, input.maxFiles ?? 8)), executionMode: "live" });
  const source = Object.freeze({ "@context": CONTEXT, id: activityId({ assignmentId: input.assignmentId, request }), type: "Create", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "Note", content: `Project cached prior research for Koios assignment ${input.assignmentId}.`, attachment: Object.freeze([request]) }) });
  const solicitation = Object.freeze({ "@context": CONTEXT, id: activityId({ source: source.id, move: "solicit" }), type: "Offer", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity: source, requestedEvidence: Object.freeze(["provider-authored-offer", "digest-bound-contextual-bundle", "explicit-gap-bundle", "zero-source-territory-read"]) }) });
  const offer = invokeProvider(provider, "solicit-service", solicitation as unknown as JsonObject, now);
  debug("received offer");
  if (offer["type"] !== "Offer" || offer["actor"] !== PROVIDER_ACTOR) throw new Error("Corpus Management Team returned no executable projection offer");
  const offered = record(offer["object"], "provider offer");
  const effects = Array.isArray(offered["effects"]) ? offered["effects"].map(String) : [];
  if (effects.length !== 0) throw new Error(`cached projection unexpectedly requests effects: ${effects.join(", ")}`);
  const capability = Object.freeze({ type: "Capability", issuer: KOIOS_ACTOR, holder: PROVIDER_ACTOR, invocationTarget: PROVIDER_ACTOR, parentOffer: offer["id"], allowedActions: Object.freeze(["invoke-service"]), attenuation: Object.freeze({ requestDigest: offered["requestDigest"], providerScope: offered["scope"], customerTerritoryMutation: false }) });
  const acceptance = Object.freeze({ "@context": CONTEXT, id: activityId({ offer: offer["id"], move: "accept" }), type: "Accept", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceContract", contract: CONTRACT, offer, capability }) });
  const response = invokeProvider(provider, "invoke-service", acceptance as unknown as JsonObject, now);
  debug("received projection");
  if (response["type"] !== "Accept" || response["actor"] !== PROVIDER_ACTOR) throw new Error("Corpus Management Team did not accept the projection contract");
  const result = record(response["object"], "prior-research projection result");
  if (result["type"] !== "PriorResearchProjectionResult" || result["sourceRecovery"] !== reading.cached.id || result["filesystemReads"] !== 0) throw new Error("provider returned an incompatible prior-research projection");
  const contextualBundle = record(result["contextualBundle"], "projected contextual bundle");
  const gapBundle = record(result["gapBundle"], "projected gap bundle");
  if (recordDigest(contextualBundle) !== result["contextualBundleDigest"] || recordDigest(gapBundle) !== result["gapBundleDigest"]) throw new Error("prior-research projection digest mismatch");
  debug("verified projected digests");
  const providerResultDigest = recordDigest(response);
  appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: Object.freeze({ kind: "koios.prior-research-context-admission", at: now, assignmentId: input.assignmentId, terms, warrant: "internal conceptual memory only; no current-event factual claim is licensed unless independently supported by the assignment's admitted source assertions", contract: "corpus-management-team/recovering-prior-research/v1", sourceRecovery: result["sourceRecovery"], sourceContextualBundleDigest: result["sourceContextualBundleDigest"], sourceGapBundleDigest: result["sourceGapBundleDigest"], contextualBundle, contextualBundleDigest: result["contextualBundleDigest"], gapBundle, gapBundleDigest: result["gapBundleDigest"], filesystemReads: 0, providerResultDigest, providerDelivery: response }) as JsonObject });
  debug("admitted customer context");
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "prior-research.context.admitted", subject: input.assignmentId, data: { provider: "corpus-management-team", sourceRecovery: String(result["sourceRecovery"]), contextualBundleDigest: String(result["contextualBundleDigest"]), gapBundleDigest: String(result["gapBundleDigest"]), sourceCount: Number(contextualBundle["sourceCount"] ?? 0), gapCount: Number(gapBundle["gapCount"] ?? 0), filesystemReads: 0 } });
  appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: now, act: "provider.service.consumed", subject: String(result["id"] ?? providerResultDigest), data: { purpose: `project-prior-research:${input.assignmentId}`, provider: "corpus-management-team", service: "cached-prior-research-projection", price: { amount: 0, currency: "USD" }, filesystemReads: 0, providerResultDigest } });
  return Object.freeze({ contract: "corpus-management-team/recovering-prior-research/v1", assignmentId: input.assignmentId, sourceRecovery: String(result["sourceRecovery"]), contextualBundleDigest: String(result["contextualBundleDigest"]), gapBundleDigest: String(result["gapBundleDigest"]), contextualBundle: Object.freeze(contextualBundle), gapBundle: Object.freeze(gapBundle), providerResultDigest, providerDelivery: Object.freeze(response), filesystemReads: 0 });
}
