// Koios's customer-side treaty with the separately hireable Independent
// Editorial Assessment settlement. The provider returns one validated tool
// selection; only Koios-owned deterministic code may invoke that tool.

import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { appendKoiosAct, appendProviderUsage, recordDigest, type JsonObject } from "../../../management/ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "urn:ame:independent-editorial-assessment";
export const EDITORIAL_ASSESSMENT_CONTRACT = "independent-editorial-assessment/editorial-assessment/v1";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/independent-editorial-assessment");
const CUSTOMER_TERRITORY_AUTHORITY_KEYS = new Set(["root", "roots", "path", "paths", "contentDir", "dataDir", "storeDir", "manuscriptPath", "outputPath", "customerFilesystem"]);
function customerTerritoryAuthorityKey(key: string): boolean { return CUSTOMER_TERRITORY_AUTHORITY_KEYS.has(key) || /(?:path|paths|root|roots|dir|dirs)$/iu.test(key); }

type JsonRecord = Record<string, unknown>;
export type EditorialTool = "submit_editorial_acceptance" | "submit_revision_request" | "submit_editorial_refusal";
export type EditorialFailureLayer = "sources" | "assignment" | "instructions" | "deterministic-gates" | "writer-model" | "draft-repair" | "none";
export type EditorialToolSelection = Readonly<{
  tool: EditorialTool;
  failureLayer: EditorialFailureLayer;
  replayFrom: string;
  summary: string;
  requiredRepairs: readonly string[];
  report: string;
}>;

export class EditorialAssessmentRefusal extends Error {
  readonly code: string;
  readonly providerResult?: Readonly<JsonRecord>;
  constructor(code: string, message: string, providerResult?: Readonly<JsonRecord>) { super(message); this.name = "EditorialAssessmentRefusal"; this.code = code; if (providerResult !== undefined) this.providerResult = providerResult; }
}
function record(value: unknown, label: string): JsonRecord { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a record`); return value as JsonRecord; }
export function projectEditorialBoundaryValue(value: unknown): unknown {
  if (Array.isArray(value)) return Object.freeze(value.map(projectEditorialBoundaryValue));
  if (value === null || typeof value !== "object") return value;
  return Object.freeze(Object.fromEntries(Object.entries(value as JsonRecord)
    .filter(([key]) => !customerTerritoryAuthorityKey(key))
    .map(([key, child]) => [key, projectEditorialBoundaryValue(child)])));
}
function contentId(value: unknown): string { return `urn:sha256:${createHash("sha256").update(JSON.stringify(value)).digest("hex")}`; }
function endpoint(root: string, operation: string): string { const pkg = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")), "editorial provider package"); const bins = record(pkg["bin"], "editorial provider operations"); const path = bins[operation]; if (typeof path !== "string") throw new Error(`Independent Editorial Assessment does not advertise ${operation}`); return resolve(root, path); }
function invokeProvider(root: string, operation: string, activity: JsonRecord, now: string, timeout: number, resourceEnv: Readonly<Record<string, string>> = {}): JsonRecord { const temp = mkdtempSync(join(tmpdir(), "koios-editorial-assessment-")); const inputPath = join(temp, "input.json"); const outputPath = join(temp, "output.json"); try { writeFileSync(inputPath, `${JSON.stringify(activity)}\n`, "utf8"); const execution = spawnSync(process.execPath, [endpoint(root, operation), "--operation", operation, "--now", now, "--input-file", inputPath, "--output-file", outputPath], { cwd: root, encoding: "utf8", timeout, env: { ...process.env, ...resourceEnv } }); let output: unknown; try { output = JSON.parse(readFileSync(outputPath, "utf8")); } catch { throw new Error(execution.error?.message || execution.stderr || execution.stdout || `editorial provider ${operation} exited ${execution.status}`); } return record(output, `editorial provider ${operation} response`); } finally { rmSync(temp, { recursive: true, force: true }); } }
function accept(offer: JsonRecord): JsonRecord { const offerObject = record(offer["object"], "editorial offer"); const effects = Array.isArray(offerObject["effects"]) ? offerObject["effects"].map(String) : []; const allowedActions = Object.freeze(["invoke-service", ...effects]); const capability = Object.freeze({ id: contentId({ offer: offer["id"], allowedActions }), type: "Capability", issuer: CUSTOMER, holder: PROVIDER, invocationTarget: PROVIDER, parentOffer: offer["id"], allowedActions, attenuation: Object.freeze({ demandDigest: offerObject["demandDigest"], providerScope: offerObject["scope"], customerTerritoryMutation: false }), capTP: Object.freeze({ target: PROVIDER, method: "invoke-service" }) }); const object = Object.freeze({ type: "ServiceContract", contract: EDITORIAL_ASSESSMENT_CONTRACT, offer, capability }); return Object.freeze({ "@context": CONTEXT, id: contentId({ actor: CUSTOMER, target: PROVIDER, object }), type: "Accept", actor: CUSTOMER, target: PROVIDER, inReplyTo: offer["id"], object }); }
function policyDigest(path: string): string { return recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, path), "utf8"))); }
function selection(value: unknown): EditorialToolSelection { const raw = record(value, "editorial tool selection"); const tools = ["submit_editorial_acceptance", "submit_revision_request", "submit_editorial_refusal"]; const layers = ["sources", "assignment", "instructions", "deterministic-gates", "writer-model", "draft-repair", "none"]; if (!tools.includes(String(raw["tool"])) || !layers.includes(String(raw["failureLayer"])) || typeof raw["replayFrom"] !== "string" || typeof raw["summary"] !== "string" || !Array.isArray(raw["requiredRepairs"]) || raw["requiredRepairs"].some((item) => typeof item !== "string") || typeof raw["report"] !== "string") throw new EditorialAssessmentRefusal("invalid-tool-selection", "provider delivery carried no admissible editorial tool selection"); return Object.freeze({ tool: raw["tool"] as EditorialTool, failureLayer: raw["failureLayer"] as EditorialFailureLayer, replayFrom: raw["replayFrom"], summary: raw["summary"], requiredRepairs: Object.freeze(raw["requiredRepairs"] as string[]), report: raw["report"] }); }

export function procureEditorialAssessment(input: Readonly<{
  slug: string;
  manuscript: string;
  manuscriptDigest: string;
  standards: Readonly<JsonObject>;
  run?: Readonly<JsonObject>;
  evidence: readonly Readonly<JsonObject>[];
  pipeline: readonly Readonly<JsonObject>[];
  editorialContextDigest: string;
  now: string;
  dataDir: string;
  model?: string;
  executionMode?: "dry-run" | "live";
  providerRoot?: string;
  lissRoot?: string;
}>): Readonly<{ selection: EditorialToolSelection; selectionDigest: string; providerResult: JsonRecord; providerExchange: JsonRecord; recordedAt: string }> {
  if (recordDigest(input.manuscript) !== input.manuscriptDigest) throw new Error("editorial assessment input manuscript digest mismatch");
  const context = record(projectEditorialBoundaryValue({ standards: input.standards, run: input.run ?? null, evidence: input.evidence, pipeline: input.pipeline }), "portable editorial context");
  if (recordDigest(context) !== input.editorialContextDigest) throw new Error("editorial assessment input context digest mismatch");
  const demand = Object.freeze({ type: "EditorialAssessmentDemand", slug: input.slug, manuscript: Object.freeze({ bytes: input.manuscript, digest: input.manuscriptDigest }), editorialContext: Object.freeze({ ...context, digest: input.editorialContextDigest }), authorities: Object.freeze({ publicationPolicyDigest: policyDigest("lib/law/accountable-attention-and-publication.json"), genreLawDigest: policyDigest("lib/law/reported-analysis-genre-contract.json"), editorialDutyDigest: policyDigest("lib/management/duties/judging-accountable-publication.json") }), executionMode: input.executionMode ?? "live", model: input.model ?? "claude-sonnet-4-6" });
  const sourceActivity = Object.freeze({ "@context": CONTEXT, id: contentId(demand), type: "Create", actor: CUSTOMER, target: PROVIDER, object: demand });
  const solicitation = Object.freeze({ "@context": CONTEXT, id: contentId({ sourceActivity: sourceActivity.id, service: EDITORIAL_ASSESSMENT_CONTRACT }), type: "Offer", actor: CUSTOMER, target: PROVIDER, object: Object.freeze({ type: "ServiceSolicitation", demand: contentId({ slug: input.slug, manuscript: input.manuscriptDigest, context: input.editorialContextDigest }), sourceActivity }) });
  const root = resolve(input.providerRoot ?? process.env["KOIOS_INDEPENDENT_EDITORIAL_ASSESSMENT_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
  const resourceEnv = input.lissRoot === undefined ? {} : { EDITORIAL_ASSESSMENT_LISS_ROOT: resolve(input.lissRoot) };
  const offer = invokeProvider(root, "solicit-service", solicitation as unknown as JsonRecord, input.now, 30_000, resourceEnv);
  if (offer["type"] !== "Offer") { const denied = record(offer["object"] ?? {}, "editorial solicitation refusal"); throw new EditorialAssessmentRefusal(String(denied["code"] ?? "solicitation-refused"), String(denied["reason"] ?? "Independent Editorial Assessment refused the demand"), offer); }
  const delivery = invokeProvider(root, "invoke-service", accept(offer), input.now, 1_200_000, resourceEnv);
  if (delivery["type"] !== "Accept") { const denied = record(delivery["object"] ?? {}, "editorial invocation refusal"); throw new EditorialAssessmentRefusal(String(denied["code"] ?? "invocation-refused"), String(denied["reason"] ?? "Independent Editorial Assessment did not deliver a tool selection"), delivery); }
  const result = record(delivery["object"], "editorial assessment delivery");
  if (result["dryRun"] === true) throw new EditorialAssessmentRefusal("dry-run-has-no-tool-selection", "a dry-run readiness witness cannot authorize an editorial act", delivery);
  if (result["manuscriptDigest"] !== input.manuscriptDigest || result["editorialContextDigest"] !== input.editorialContextDigest) throw new EditorialAssessmentRefusal("delivery-context-mismatch", "editorial provider delivery is not bound to the exact manuscript and context", delivery);
  const chosen = selection(result["toolSelection"]); const selectionDigest = recordDigest(chosen);
  if (selectionDigest !== result["toolSelectionDigest"]) throw new EditorialAssessmentRefusal("tool-selection-digest-mismatch", "editorial provider delivery does not bind its tool selection", delivery);
  const providerExchange = record(result["providerExchange"], "editorial provider exchange");
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "editorial.tool-selection.delivered", subject: input.slug, data: { service: EDITORIAL_ASSESSMENT_CONTRACT, manuscriptDigest: input.manuscriptDigest, editorialContextDigest: input.editorialContextDigest, selectedTool: chosen.tool, selectionDigest } });
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(providerExchange["exchangeId"] ?? selectionDigest), data: { purpose: `Independently assess Koios manuscript ${input.slug}.`, provider: "independent-editorial-assessment", service: "assess-manuscript", price: providerExchange["price"] ?? { amount: 0, currency: "USD" }, selectedTool: chosen.tool, selectionDigest } });
  appendProviderUsage({ dataRoot: input.dataDir, instant: input.now, providerResult: result["providerResult"], purpose: `Independently assess Koios manuscript ${input.slug}.` });
  return Object.freeze({ selection: chosen, selectionDigest, providerResult: record(result["providerResult"], "LISS editorial result"), providerExchange, recordedAt: input.now });
}
