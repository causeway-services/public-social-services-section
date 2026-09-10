/** Koios-owned editorial judgment, executed under contract by LISS. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { decodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";

import { reviewManuscriptStandards } from "./standards.mjs";
import { appendDatedRecord, appendProviderUsage, ledgerRootPath, recordDigest } from "../../../management/ledger.mjs";
import { loadPosts } from "../../../content.mjs";
import { readAssignment } from "../assignments.mjs";
import { researchPacket } from "../../sourcing/research-packets.mjs";
import { readAdmissibleResearchPacket } from "../../sourcing/admissible-research-packet-contract.mjs";
import { EDITORIAL_ASSESSMENT_CONTRACT, procureEditorialAssessment, projectEditorialBoundaryValue, type EditorialRepairTool, type EditorialTool } from "./editorial-assessment-contract.mjs";
import { sourceOriginalityFindings, type SourceText } from "./source-originality.mjs";
import { EDITORIAL_PIPELINE_CONTEXT } from "../../../generated/editorial-pipeline-context.mjs";
import { procureRmnTextInference } from "../../../management/rmn-inference-client.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "urn:ame:koios-news";
const LISS_ACTOR = "urn:ame:logical-inference-service-section";
const CONTRACT = "liss-inference-service";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const DEFAULT_LISS_ROOT = resolve(SITE_ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section");
const SIBLING_LISS_ROOT = resolve(SITE_ROOT, "../logical-inference-service-section");

function lissRoot(explicit?: string): string {
  if (explicit !== undefined) return resolve(explicit);
  if (process.env.KOIOS_LISS_ROOT !== undefined) return resolve(process.env.KOIOS_LISS_ROOT);
  if (existsSync(join(SIBLING_LISS_ROOT, "package.json"))) return SIBLING_LISS_ROOT;
  return DEFAULT_LISS_ROOT;
}

type JsonRecord = Record<string, unknown>;
export type EditorialDisposition = "accept" | "revise" | "refuse";
export class InferenceRouteRefusal extends Error {
  readonly failedTiers: readonly string[];
  readonly refusalDigest: string;
  constructor(message: string, failedTiers: readonly string[], refusalDigest: string) {
    super(message);
    this.name = "InferenceRouteRefusal";
    this.failedTiers = Object.freeze([...failedTiers]);
    this.refusalDigest = refusalDigest;
  }
}
export type EditorialJudgment = Readonly<{
  kind: "koios.editorial-judgment";
  slug: string;
  manuscriptDigest: string;
  editorialContextDigest: string;
  disposition: EditorialDisposition;
  publishable: boolean;
  summary: string;
  findings: readonly Readonly<{ severity: "error" | "warning"; code: string; evidence: string; instruction: string }>[];
  claimAudit: readonly Readonly<{ claim: string; support: "supported" | "unsupported" | "overstated"; evidence: string }>[];
  requiredRepairs: readonly string[];
  repairTools: readonly EditorialRepairTool[];
  pipelineDiagnosis: Readonly<{
    failureLayer: "sources" | "assignment" | "instructions" | "deterministic-gates" | "writer-model" | "draft-repair" | "none";
    evidence: string;
    improvement: string;
    replayFrom: string;
  }>;
  provider: string;
  model: string;
  contract: string;
  serviceAccepted: boolean;
  report: string;
  providerResult: unknown;
  selectedTool?: EditorialTool;
  toolSelectionValidated?: boolean;
  toolSelectionDigest?: string;
  recordedAt: string;
}>;

function digest(value: unknown): string {
  return typeof value === "string" || Buffer.isBuffer(value) || value instanceof Uint8Array
    ? `sha256:${createHash("sha256").update(value).digest("hex")}`
    : recordDigest(value);
}
function isRecord(value: unknown): value is JsonRecord { return value !== null && typeof value === "object" && !Array.isArray(value); }
function jsonObjectEnvelope(text: string): string {
  const trimmed = text.trim();
  const fenced = /^```json\s*\n([\s\S]*?)\n```$/i.exec(trimmed);
  return fenced === null ? trimmed : fenced[1]!.trim();
}
function labeledField(text: string, label: string): string | undefined {
  const prose = new RegExp(`^${label}:\\s*(.+)$`, "im").exec(text)?.[1]?.trim();
  if (prose !== undefined && prose !== "") return prose;
  return new RegExp(`"${label.replaceAll("_", "(?:_|\\s)")}"\\s*:\\s*"([^"\\n]*)"`, "i").exec(text)?.[1]?.trim();
}
function labeledSection(text: string, label: string, next: string): string {
  return new RegExp(`^${label}:\\s*\\n([\\s\\S]*?)(?=^${next}:|\\s*$)`, "im").exec(text)?.[1]?.trim() ?? "";
}
function bullets(text: string): readonly string[] {
  return Object.freeze(text.split("\n").map((line) => line.replace(/^\\s*(?:[-*]|\\d+[.)])\\s*/, "").trim()).filter(Boolean));
}
function parseEditorialReport(text: string): Readonly<{
  disposition: EditorialDisposition;
  publishable: boolean;
  summary: string;
  findings: EditorialJudgment["findings"];
  claimAudit: EditorialJudgment["claimAudit"];
  requiredRepairs: readonly string[];
  pipelineDiagnosis: EditorialJudgment["pipelineDiagnosis"];
}> {
  const envelope = jsonObjectEnvelope(text);
  try {
    const raw = JSON.parse(envelope) as JsonRecord;
    const disposition = raw["disposition"];
    if (!(disposition === "accept" || disposition === "revise" || disposition === "refuse")) throw new Error("invalid disposition");
    return Object.freeze({
      disposition,
      publishable: raw["publishable"] === true,
      summary: String(raw["summary"] ?? ""),
      findings: Object.freeze(Array.isArray(raw["findings"]) ? raw["findings"] as EditorialJudgment["findings"] : []),
      claimAudit: Object.freeze(Array.isArray(raw["claimAudit"]) ? raw["claimAudit"] as EditorialJudgment["claimAudit"] : []),
      requiredRepairs: Object.freeze(Array.isArray(raw["requiredRepairs"]) ? (raw["requiredRepairs"] as unknown[]).map(String) : []),
      pipelineDiagnosis: Object.freeze(isRecord(raw["pipelineDiagnosis"]) ? {
        failureLayer: String(raw["pipelineDiagnosis"]["failureLayer"] ?? "none") as EditorialJudgment["pipelineDiagnosis"]["failureLayer"],
        evidence: String(raw["pipelineDiagnosis"]["evidence"] ?? ""),
        improvement: String(raw["pipelineDiagnosis"]["improvement"] ?? ""),
        replayFrom: String(raw["pipelineDiagnosis"]["replayFrom"] ?? ""),
      } : { failureLayer: "none", evidence: "", improvement: "", replayFrom: "" }),
    });
  } catch {
    const dispositionText = labeledField(text, "DISPOSITION") ?? labeledField(text, "disposition") ?? "";
    const disposition = dispositionText.toLowerCase().match(/accept|revise|refuse/)?.[0];
    if (!(disposition === "accept" || disposition === "revise" || disposition === "refuse")) throw new Error("editorial report has no recognizable disposition");
    const publishableText = labeledField(text, "PUBLISHABLE") ?? labeledField(text, "publishable") ?? "no";
    const failureLayer = (labeledField(text, "FAILURE_LAYER") ?? labeledField(text, "failureLayer") ?? "none").toLowerCase() as EditorialJudgment["pipelineDiagnosis"]["failureLayer"];
    return Object.freeze({
      disposition,
      publishable: /^(?:yes|true)\b/i.test(publishableText),
      summary: labeledSection(text, "SUMMARY", "FINDINGS") || labeledField(text, "summary") || "See the preserved editorial report.",
      findings: Object.freeze([]),
      claimAudit: Object.freeze([]),
      requiredRepairs: bullets(labeledSection(text, "REQUIRED REPAIRS", "PIPELINE IMPROVEMENT")),
      pipelineDiagnosis: Object.freeze({
        failureLayer,
        evidence: labeledSection(text, "PIPELINE EVIDENCE", "REPLAY_FROM") || labeledField(text, "evidence") || "See the preserved editorial report.",
        improvement: labeledSection(text, "PIPELINE IMPROVEMENT", "END REPORT") || labeledField(text, "improvement") || "See the preserved editorial report.",
        replayFrom: labeledField(text, "REPLAY_FROM") ?? labeledField(text, "replayFrom") ?? "",
      }),
    });
  }
}
function contentId(value: unknown): string { return `urn:${digest(value)}`; }
function activity(type: string, target: string, object: unknown): JsonRecord {
  const body = { type, actor: KOIOS_ACTOR, target, object };
  return { "@context": CONTEXT, id: contentId(body), ...body };
}
function endpoint(root: string, name: string): string {
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as JsonRecord;
  const bins = pkg["bin"] as JsonRecord | undefined;
  const path = bins?.[name];
  if (typeof path !== "string") throw new Error(`LISS does not advertise ${name}`);
  return resolve(root, path);
}
function invokeLiss(root: string, operation: string, input: unknown, now: string, timeout: number, resourceEnv: Readonly<Record<string, string>> = {}): JsonRecord {
  const temp = mkdtempSync(join(tmpdir(), "koios-liss-invocation-"));
  const inputPath = join(temp, "request.json");
  const outputPath = join(temp, "response.json");
  try {
    writeFileSync(inputPath, `${JSON.stringify(input)}\n`, "utf8");
    const result = spawnSync(process.execPath, [endpoint(root, operation), "--operation", operation, "--now", now, "--input-file", inputPath, "--output-file", outputPath], {
      cwd: root, encoding: "utf8", timeout, env: { ...process.env, ...resourceEnv },
    });
    let output: unknown;
    try { output = JSON.parse(readFileSync(outputPath, "utf8")); } catch { throw new Error(result.error?.message || result.stderr || result.stdout || `LISS ${operation} exited ${result.status}`); }
    if (output === null || typeof output !== "object" || Array.isArray(output)) throw new Error(`LISS ${operation} returned no activity`);
    return output as JsonRecord;
  } finally { rmSync(temp, { recursive: true, force: true }); }
}
function providerRefusal(value: JsonRecord, service: string): InferenceRouteRefusal {
  const object = isRecord(value["object"]) ? value["object"] : {};
  const attempts = Array.isArray(object["attempts"]) ? object["attempts"] : [];
  const route = attempts.flatMap((attempt): string[] => isRecord(attempt)
    ? [`${String(attempt["tier"] ?? "unknown-tier")}:${String(attempt["provider"] ?? "unknown-provider")}:${String(attempt["disposition"] ?? "refused")}`]
    : []);
  const failedTiers = attempts.flatMap((attempt): string[] => isRecord(attempt) && typeof attempt["tier"] === "string" ? [attempt["tier"]] : []);
  const reason = String(object["reason"] ?? "provider refused the contracted service").replace(/\s+/gu, " ").slice(0, 600);
  const refusalDigest = digest(value);
  return new InferenceRouteRefusal(`${service} refused: ${reason}; route=${route.join(",") || "unreported"}; refusalDigest=${refusalDigest}`, failedTiers, refusalDigest);
}
function acceptedContract(source: JsonRecord, offer: JsonRecord): JsonRecord {
  const offerObject = offer["object"] as JsonRecord;
  const effects = Array.isArray(offerObject["effects"]) ? offerObject["effects"] : [];
  const allowedActions = ["invoke-service", ...effects];
  const capability = {
    id: contentId({ source: source["id"], offer: offer["id"], allowedActions }), type: "Capability",
    issuer: KOIOS_ACTOR, holder: LISS_ACTOR, invocationTarget: LISS_ACTOR, parentOffer: offer["id"], allowedActions,
    attenuation: { sourceActivity: source["id"], requestDigest: offerObject["requestDigest"], effects, providerScope: offerObject["scope"] ?? {}, customerTerritoryMutation: false },
    capTP: { target: LISS_ACTOR, method: "invoke-service" }, grantSource: source["id"],
  };
  const object = { type: "ServiceContract", contract: CONTRACT, demand: contentId({ source: source["id"], service: "editorial-judgment" }), offer, capability };
  return { ...activity("Accept", LISS_ACTOR, object), inReplyTo: offer["id"] };
}

export async function procureLissProse(input: Readonly<{
  purpose: string;
  prompt: string;
  model?: string;
  tiers?: readonly ("free-groq" | "free-gemini" | "free-nim" | "leader-claude")[];
  models?: Readonly<Partial<Record<"free-groq" | "free-gemini" | "free-nim" | "leader-claude", string>>>;
  lissRoot?: string;
  now?: string;
  requiredText?: readonly string[];
  maxTokens?: number;
}>): Promise<Readonly<{ text: string; providerResult: JsonRecord; model: string; recordedAt: string; selectedTier: string; selectedProvider: string }>> {
  const now = input.now ?? new Date().toISOString();
  const model = input.model ?? "claude-sonnet-4-6";
  const tiers = input.tiers ?? ["leader-claude"];
  const models = { ...(input.models ?? {}), ...(tiers.includes("leader-claude") ? { "leader-claude": input.models?.["leader-claude"] ?? model } : {}) };
  type ConfiguredRoute = Readonly<{ tier: "free-gemini" | "leader-claude"; model: string; child: Readonly<{ agentCard: string; account: string; law: string }> }>;
  let configured: ConfiguredRoute | undefined;
  for (const tier of tiers) {
    if (tier === "free-gemini" && process.env["GEMINI_CHILD_AGENT_CARD_URL"] && process.env["GEMINI_CHILD_ACCOUNT"] && process.env["GEMINI_CHILD_LAW"]) {
      configured = Object.freeze({ tier, model: models[tier] ?? "gemini-3.1-flash-lite", child: Object.freeze({ agentCard: process.env["GEMINI_CHILD_AGENT_CARD_URL"], account: process.env["GEMINI_CHILD_ACCOUNT"], law: process.env["GEMINI_CHILD_LAW"] }) }); break;
    }
    if (tier === "leader-claude" && process.env["CLAUDE_CHILD_AGENT_CARD_URL"] && process.env["CLAUDE_CHILD_ACCOUNT"] && process.env["CLAUDE_CHILD_LAW"]) {
      configured = Object.freeze({ tier, model: models[tier] ?? model, child: Object.freeze({ agentCard: process.env["CLAUDE_CHILD_AGENT_CARD_URL"], account: process.env["CLAUDE_CHILD_ACCOUNT"], law: process.env["CLAUDE_CHILD_LAW"] }) }); break;
    }
  }
  if (configured === undefined) throw new InferenceRouteRefusal("no configured RMN/A2A inference team is admitted for prose repair", [...tiers], digest({ tiers }));
  const result = await procureRmnTextInference({ instruction: `${input.purpose}\nReturn only the complete repaired Markdown article body.`, prompt: input.prompt, model: configured.model, child: configured.child });
  for (const required of input.requiredText ?? []) if (!result.text.includes(required)) throw new InferenceRouteRefusal(`RMN prose repair omitted required text ${required}`, [configured.tier], result.completionNi);
  const providerResult = result.exchange as JsonRecord;
  return Object.freeze({ text: result.text, providerResult, model: configured.model, recordedAt: now, selectedTier: configured.tier, selectedProvider: "logical-inference-service-section" });
}

function markdownFiles(root: string): readonly string[] {
  return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => join(root, entry.name));
}
function jsonFiles(root: string): readonly string[] {
  const walk = (path: string): string[] => readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(path, entry.name)) : entry.name.endsWith(".json") ? [join(path, entry.name)] : []);
  return walk(root);
}
function latestRun(dataDir: string, slug: string): JsonRecord | undefined {
  const path = join(dataDir, "journals", "logs", "mill-runs.jsonl");
  try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord).filter((row) => row["slug"] === slug).at(-1); } catch { return undefined; }
}
function latestCircuitDraft(dataDir: string, slug: string): JsonRecord | undefined {
  return [...jsonlFiles(ledgerRootPath(dataDir, "contract-events"))].sort().flatMap((path): JsonRecord[] => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  }).filter((row) => row["kind"] === "koios.ledger-act" && row["act"] === "newsroom.circuit.drafted" && isRecord(row["data"]) && row["data"]["slug"] === slug).at(-1);
}
function jsonlFiles(root: string): readonly string[] {
  try { return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? jsonlFiles(join(root, entry.name)) : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []); }
  catch { return []; }
}
function latestWriterReplay(dataDir: string, slug: string): JsonRecord | undefined {
  return jsonlFiles(join(dataDir, "records", "writer-replays")).flatMap((path) => {
    try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  }).filter((row) => isRecord(row["result"]) && row["result"]["slug"] === slug).at(-1);
}
function evidenceFromRun(storeDir: string, run: JsonRecord | undefined): readonly JsonRecord[] {
  const gates = Array.isArray(run?.["gates"]) ? run["gates"] as JsonRecord[] : [];
  const sourceUrls = Array.isArray(run?.["sources"])
    ? (run!["sources"] as unknown[]).flatMap((source) => isRecord(source) && typeof source["url"] === "string" ? [source["url"]] : [])
    : [];
  const urls = [...new Set([...sourceUrls, ...gates.flatMap((gate) => String(gate["evidence"] ?? "").match(/https?:\/\/[^\s,;)]+/g) ?? []).map((url) => url.replace(/[.]+$/, ""))])];
  return jsonFiles(storeDir).flatMap((path) => {
    try {
      const value = JSON.parse(readFileSync(path, "utf8")) as JsonRecord;
      const claims = Array.isArray(value["claims"]) ? value["claims"] as JsonRecord[] : [];
      const cited = claims.some((claim) => urls.includes(String((claim["provenance"] as JsonRecord | undefined)?.["citation"] ?? "")));
      return cited ? [{ path: path.slice(storeDir.length + 1), value }] : [];
    } catch { return []; }
  });
}
function evidenceFromAssignment(contentDir: string, dataDir: string, manuscript: string): readonly JsonRecord[] {
  const document = decodeFrontMatterDocument(manuscript);
  const koios = isRecord(document.frontMatter["koios"]) ? document.frontMatter["koios"] : {};
  const assignmentId = koios["assignment_id"];
  if (typeof assignmentId !== "string" || assignmentId === "") return [];
  try {
    const assignment = readAssignment(dataDir, assignmentId, loadPosts(contentDir));
    const references = Array.isArray(document.frontMatter["references"]) ? document.frontMatter["references"] : [];
    const citedUrls = references.flatMap((reference) => isRecord(reference) && typeof reference["URL"] === "string" ? [reference["URL"]] : []);
    const sourceUrls = citedUrls.length > 0 ? citedUrls : assignment.sourceUrls;
    const packet = readAdmissibleResearchPacket(dataDir, assignmentId)
      ?? researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: Math.max(4, sourceUrls.length) });
    const priorContext = [...jsonlFiles(ledgerRootPath(dataDir, "source-claims"))].sort().flatMap((path): JsonRecord[] => {
      try { return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
      catch { return []; }
    }).filter((row) => row["kind"] === "koios.prior-research-context-admission" && row["assignmentId"] === assignmentId).at(-1);
    const compactPacket = Object.freeze({
      ...packet,
      context: Object.freeze((Array.isArray(packet.context) ? packet.context : []).slice(0, 12).map((value) => boundedEditorialValue(value, 12_000))),
    });
    return Object.freeze([
      { kind: "koios.assignment-research-packet", assignmentId, warrant: "current-event factual evidence", value: compactPacket },
      ...(priorContext === undefined ? [] : [{ kind: "koios.prior-research-context", assignmentId, warrant: "internal conceptual memory only; not current-event factual evidence", value: compactPriorResearchContext(priorContext) }]),
    ]);
  } catch { return []; }
}
function boundedEditorialValue(value: unknown, maximumCharacters: number): unknown {
  const encoded = JSON.stringify(value);
  if (encoded.length <= maximumCharacters) return value;
  return Object.freeze({
    type: "DigestBoundEditorialExcerpt",
    digest: digest(value),
    originalCharacters: encoded.length,
    excerpt: encoded.slice(0, maximumCharacters),
    truncated: true,
  });
}
function compactPriorResearchContext(value: JsonRecord): JsonRecord {
  return Object.freeze({
    kind: value["kind"],
    assignmentId: value["assignmentId"],
    contract: value["contract"],
    warrant: value["warrant"],
    terms: value["terms"],
    sourceRecovery: value["sourceRecovery"],
    filesystemReads: value["filesystemReads"],
    contextualBundleDigest: value["contextualBundleDigest"],
    gapBundleDigest: value["gapBundleDigest"],
    providerResultDigest: value["providerResultDigest"],
    contextualBundle: boundedEditorialValue(value["contextualBundle"], 24_000),
    gapBundle: boundedEditorialValue(value["gapBundle"], 24_000),
  });
}
function editorialArtifact(sourceId: string, content: string, includeContent: boolean, limit = 16_000): JsonRecord {
  const contentDigest = digest(content);
  if (!includeContent) return Object.freeze({ sourceId, digest: contentDigest, characters: content.length, contentOmitted: "digest-bound pipeline manifest; unrelated full bytes remain customer-side" });
  return Object.freeze({ sourceId, digest: contentDigest, characters: content.length, content: content.length <= limit ? content : content.slice(0, limit), ...(content.length <= limit ? {} : { contentTruncated: true }) });
}
export function editorialPipelineArtifacts(): readonly JsonRecord[] {
  const paths = [
    join(SITE_ROOT, "producing-content.config.json"),
    join(SITE_ROOT, "lib/law/editorial-product-commissions.json"),
    join(SITE_ROOT, "lib/management/offices/editor-in-chief.json"),
    join(SITE_ROOT, "lib/management/duties/judging-accountable-publication.json"),
    join(SITE_ROOT, "lib/management/duties/learning-from-newsroom-outcomes.json"),
    join(SITE_ROOT, "data/records/research/2026/07/17/2026-07-17-koios-news-research.jsonl"),
    join(SITE_ROOT, "src/researching/sourcing/source-cycle.mts"),
    join(SITE_ROOT, "src/writer-replay.mts"),
    join(SITE_ROOT, "src/newsroom/departments.mts"),
  ];
  const runtime = paths.flatMap((path) => {
    try {
      const content = readFileSync(path, "utf8");
      const sourceId = `runtime/${path.slice(SITE_ROOT.length + 1)}`;
      const policyOrDuty = /\.(?:json)$/u.test(path) && !path.endsWith("2026-07-17-koios-news-research.jsonl");
      return [editorialArtifact(sourceId, content, policyOrDuty || /(?:source-cycle|writer-replay|departments)\.mts$/u.test(path))];
    } catch { return []; }
  });
  const generated = EDITORIAL_PIPELINE_CONTEXT.map((entry) => editorialArtifact(
    entry.sourceId,
    entry.content,
    /^(?:newsroom\/|production\/(?:newsroom|inference-adapter)$)/u.test(entry.sourceId),
    24_000,
  ));
  return Object.freeze([...runtime, ...generated]);
}

function sourceTextsFromEvidence(evidence: readonly JsonRecord[]): readonly SourceText[] {
  const texts: SourceText[] = [];
  for (const entry of evidence) {
    if (entry["kind"] !== "koios.assignment-research-packet" || !isRecord(entry["value"])) continue;
    const claims = entry["value"]["claims"];
    if (!Array.isArray(claims)) continue;
    for (const claim of claims) {
      if (!isRecord(claim) || claim["predicate"] !== "summary" || typeof claim["sourceUrl"] !== "string" || typeof claim["object"] !== "string") continue;
      texts.push(Object.freeze({ sourceUrl: claim["sourceUrl"], text: claim["object"] }));
    }
  }
  return Object.freeze(texts);
}
function editorialMaterials(input: Readonly<{ slug: string; contentDir?: string; dataDir?: string; storeDir?: string }>): Readonly<{
  contentDir: string;
  dataDir: string;
  path: string;
  manuscript: string;
  standards: unknown;
  run: JsonRecord | undefined;
  evidence: readonly JsonRecord[];
  pipeline: readonly JsonRecord[];
  contextDigest: string;
}> {
  const contentDir = resolve(SITE_ROOT, input.contentDir ?? "content/posts");
  const path = markdownFiles(contentDir).find((candidate) => candidate.endsWith(`/${input.slug}.md`));
  if (path === undefined) throw new Error(`no manuscript for ${input.slug}`);
  const manuscript = readFileSync(path, "utf8");
  const standards = reviewManuscriptStandards(contentDir, input.slug);
  const dataDir = resolve(SITE_ROOT, input.dataDir ?? "data");
  const run = latestCircuitDraft(dataDir, input.slug) ?? latestRun(dataDir, input.slug) ?? latestWriterReplay(dataDir, input.slug);
  const assignmentEvidence = evidenceFromAssignment(contentDir, dataDir, manuscript);
  const evidence = assignmentEvidence.length > 0
    ? assignmentEvidence
    : evidenceFromRun(resolve(SITE_ROOT, input.storeDir ?? "store"), run);
  const pipeline = standards.publishable ? [] : editorialPipelineArtifacts();
  const portable = projectEditorialBoundaryValue({ standards, run: run ?? null, evidence, pipeline }) as Readonly<{
    standards: JsonRecord;
    run: JsonRecord | null;
    evidence: readonly JsonRecord[];
    pipeline: readonly JsonRecord[];
  }>;
  return Object.freeze({
    contentDir,
    dataDir,
    path,
    manuscript,
    standards: portable.standards,
    run: portable.run === null ? undefined : portable.run,
    evidence: portable.evidence,
    pipeline: portable.pipeline,
    contextDigest: digest(portable),
  });
}

export function editorialContextDigestForManuscript(input: Readonly<{ slug: string; contentDir?: string; dataDir?: string; storeDir?: string }>): string {
  return editorialMaterials(input).contextDigest;
}

export function judgeManuscriptUnderContract(input: Readonly<{ slug: string; contentDir?: string; dataDir?: string; storeDir?: string; lissRoot?: string; now?: string; model?: string }>): EditorialJudgment {
  const materials = editorialMaterials(input);
  const { manuscript, standards, dataDir, run, evidence, pipeline } = materials;
  const now = input.now ?? new Date().toISOString();
  const model = input.model ?? "claude-sonnet-4-6";
  const manuscriptBody = decodeFrontMatterDocument(manuscript).body;
  const originality = sourceOriginalityFindings(manuscriptBody, sourceTextsFromEvidence(evidence));
  if (originality.length > 0) {
    const examples = originality.slice(0, 4).map((finding) => `${finding.sourceUrl}: ${finding.draftSentence.slice(0, 180)}`);
    const selectionDigest = digest({ gate: "source-originality/v1", manuscript: digest(manuscript), originality });
    const judgment: EditorialJudgment = Object.freeze({
      kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest: digest(manuscript), editorialContextDigest: materials.contextDigest,
      disposition: "refuse", publishable: false,
      summary: `Deterministic source-originality gate found ${originality.length} source-shaped sentence(s) that require independent rewriting or explicit quotation.`,
      findings: Object.freeze(originality.map((finding) => Object.freeze({ severity: "error" as const, code: "source-prose-overlap", evidence: `${finding.sourceUrl}; sharedWords=${finding.sharedWordCount}; longestRun=${finding.longestSharedRun}; draft=${finding.draftSentence.slice(0, 240)}`, instruction: "Rewrite independently from the admitted facts, or use a short explicit quotation with attribution." }))),
      claimAudit: Object.freeze([]), requiredRepairs: Object.freeze(["Rewrite every flagged sentence independently from the source text; do not perform synonym substitution around copied syntax."]), repairTools: Object.freeze([]),
      pipelineDiagnosis: Object.freeze({ failureLayer: "writer-model", evidence: examples.join("\n"), improvement: "Make source-originality a hard pre-editor gate and replay from the writer.", replayFrom: "writer-model" }),
      provider: "koios-news/deterministic-source-originality-gate", model: "source-originality/v1", contract: "koios.news/source-originality-gate/v1",
      serviceAccepted: true, report: examples.join("\n"), providerResult: Object.freeze({ type: "DeterministicGateRefusal", findings: originality }),
      selectedTool: "submit_editorial_refusal", toolSelectionValidated: true, toolSelectionDigest: selectionDigest, recordedAt: now,
    });
    appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: now, record: judgment });
    return judgment;
  }
  const assessment = procureEditorialAssessment({
    slug: input.slug,
    manuscript,
    manuscriptDigest: digest(manuscript),
    standards: standards as unknown as JsonRecord,
    ...(run === undefined ? {} : { run }),
    evidence,
    pipeline,
    editorialContextDigest: materials.contextDigest,
    now,
    dataDir,
    model,
  });
  const chosen = assessment.selection;
  const disposition: EditorialDisposition = chosen.tool === "submit_editorial_acceptance" ? "accept" : chosen.tool === "submit_revision_request" ? "revise" : "refuse";
  if (disposition === "accept" && (standards as { publishable?: unknown }).publishable !== true) throw new Error("independent editor selected acceptance while deterministic standards remain unclear");
  const judgment: EditorialJudgment = Object.freeze({
    kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest: digest(manuscript), editorialContextDigest: materials.contextDigest, disposition,
    publishable: disposition === "accept", summary: chosen.summary,
    findings: Object.freeze([]), claimAudit: Object.freeze([]), requiredRepairs: chosen.requiredRepairs,
    repairTools: chosen.repairTools,
    pipelineDiagnosis: Object.freeze({ failureLayer: chosen.failureLayer, evidence: chosen.summary, improvement: chosen.requiredRepairs.join("\n"), replayFrom: chosen.replayFrom }),
    provider: "independent-editorial-assessment/logical-inference-service-section/claude-code-inference-team", model, contract: EDITORIAL_ASSESSMENT_CONTRACT,
    serviceAccepted: true, report: chosen.report, providerResult: assessment.providerResult,
    selectedTool: chosen.tool, toolSelectionValidated: true, toolSelectionDigest: assessment.selectionDigest, recordedAt: now,
  });
  appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: now, record: judgment });
  return judgment;
}

export function recoverEditorialDiagnostic(input: Readonly<{ slug: string; exchangePath: string; contentDir?: string; now?: string; model?: string }>): EditorialJudgment {
  const contentDir = resolve(SITE_ROOT, input.contentDir ?? "content/posts");
  const path = markdownFiles(contentDir).find((candidate) => candidate.endsWith(`/${input.slug}.md`));
  if (path === undefined) throw new Error(`no manuscript for ${input.slug}`);
  const manuscript = readFileSync(path, "utf8");
  const exchange = JSON.parse(readFileSync(resolve(input.exchangePath), "utf8")) as JsonRecord;
  const completion = isRecord(exchange["completion"]) ? exchange["completion"] : {};
  const report = String(completion["text"] ?? "");
  const raw = parseEditorialReport(report);
  const now = input.now ?? new Date().toISOString();
  const judgment: EditorialJudgment = Object.freeze({
    kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest: digest(manuscript), editorialContextDigest: digest({ exchangePath: resolve(input.exchangePath), report }), disposition: raw.disposition,
    // A refused carrier can guide repair but can never authorize publication.
    publishable: false, summary: raw.summary, findings: raw.findings, claimAudit: raw.claimAudit,
    requiredRepairs: raw.requiredRepairs, repairTools: Object.freeze([]), pipelineDiagnosis: raw.pipelineDiagnosis,
    provider: "logical-inference-service-section/claude-code-inference-team", model: input.model ?? String(completion["model"] ?? "claude-sonnet-4-6"),
    contract: CONTRACT, serviceAccepted: false, report,
    providerResult: Object.freeze({ type: "RefusedServiceDiagnostic", exchangePath: resolve(input.exchangePath), reason: "model prose was useful but the declared JSON envelope predicate was not satisfied" }),
    recordedAt: now,
  });
  appendDatedRecord({ dataRoot: join(SITE_ROOT, "data"), ledger: "editorial-judgments", instant: now, record: judgment });
  return judgment;
}

export function reprojectLatestEditorialJudgment(input: Readonly<{ slug: string; contentDir?: string; now?: string }>): EditorialJudgment {
  const contentDir = resolve(SITE_ROOT, input.contentDir ?? "content/posts");
  const path = markdownFiles(contentDir).find((candidate) => candidate.endsWith(`/${input.slug}.md`));
  if (path === undefined) throw new Error(`no manuscript for ${input.slug}`);
  const manuscript = readFileSync(path, "utf8");
  const manuscriptDigest = digest(manuscript);
  const records: JsonRecord[] = [...jsonlFiles(ledgerRootPath(join(SITE_ROOT, "data"), "editorial-judgments"))].sort().flatMap((recordPath): JsonRecord[] => {
    try { return readFileSync(recordPath, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line) as JsonRecord); }
    catch { return []; }
  });
  const prior = records.filter((record) => record["slug"] === input.slug
    && record["manuscriptDigest"] === manuscriptDigest
    && record["serviceAccepted"] === true
    && typeof record["report"] === "string").at(-1);
  if (prior === undefined) throw new Error(`no accepted provider result to reproject for ${input.slug} at ${manuscriptDigest}`);
  const raw = parseEditorialReport(String(prior["report"]));
  const now = input.now ?? new Date().toISOString();
  const judgment: EditorialJudgment = Object.freeze({
    kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest,
    editorialContextDigest: typeof prior["editorialContextDigest"] === "string" ? prior["editorialContextDigest"] : digest({ prior: prior["recordedAt"], report: prior["report"] }),
    disposition: raw.disposition, publishable: false,
    summary: raw.summary, findings: raw.findings, claimAudit: raw.claimAudit,
    requiredRepairs: raw.requiredRepairs, repairTools: Object.freeze([]), pipelineDiagnosis: raw.pipelineDiagnosis,
    provider: String(prior["provider"] ?? "logical-inference-service-section/claude-code-inference-team"),
    model: String(prior["model"] ?? "claude-sonnet-4-6"), contract: String(prior["contract"] ?? CONTRACT),
    // Legacy prose may guide a replay, but parsing it again can no longer
    // manufacture publication authority after the tool-selection transition.
    serviceAccepted: false, report: String(prior["report"]), providerResult: prior["providerResult"], recordedAt: now,
  });
  appendDatedRecord({ dataRoot: join(SITE_ROOT, "data"), ledger: "editorial-judgments", instant: now, record: judgment });
  return judgment;
}
