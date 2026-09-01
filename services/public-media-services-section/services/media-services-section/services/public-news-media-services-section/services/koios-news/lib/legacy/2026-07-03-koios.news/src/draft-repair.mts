#!/usr/bin/env node
// draft-repair — contract one bounded prose repair after an Editor judgment.
// The provider writes prose. Koios resolves source custody and serializes the act.

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "./config.mjs";
import { loadPosts } from "./content.mjs";
import { koiosFarmProperty } from "./demand.mjs";
import { appendDatedRecord, appendKoiosAct, readKoiosLedger, recordDigest } from "./management/ledger.mjs";
import { commissionForAssignment } from "./management/editorial-commissioning.mjs";
import { readAssignment, readAssignmentDisposition, recordAssignmentRepairRevalidation } from "./researching/writing/assignments.mjs";
import { researchPacket } from "./researching/sourcing/research-packets.mjs";
import { repairManuscriptEditorialSurfaces, reviewManuscriptStandards } from "./researching/writing/editing/standards.mjs";
import { procureMarketProse } from "./researching/writing/editing/market-editorial.mjs";
import type { EditorialRepairTool } from "./researching/writing/editing/editorial-assessment-contract.mjs";
import { canonicalizeSourceUrls, descriptionFromProse, proseContributionBody, summaryFromProse } from "./researching/writing/prose-contribution.mjs";

type JsonRecord = Record<string, unknown>;
const SITE_ROOT = dirname(DEFAULT_CONTENT_PRODUCTION_CONFIG);

function digest(value: string): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function isRecord(value: unknown): value is JsonRecord {
  return !!value && typeof value === "object" && !Array.isArray(value);
}
export function latestEditorialReport(dataDir: string, slug: string, manuscriptDigest: string): Readonly<{
  report: string;
  digest: string;
  repairTools: readonly EditorialRepairTool[];
  requiredRepairs: readonly string[];
  failureLayer?: string;
}> {
  const records = readKoiosLedger(dataDir, "editorial-judgments").filter((record) => record["slug"] === slug
    && record["manuscriptDigest"] === manuscriptDigest
    && (record["disposition"] === "revise" || record["disposition"] === "refuse"));
  const record = records.at(-1);
  if (record === undefined) throw new Error(`no current revise/refuse judgment for ${slug} at ${manuscriptDigest}`);
  const report = String(record["report"] ?? record["summary"] ?? "");
  const repairTools = Array.isArray(record["repairTools"])
    ? record["repairTools"].flatMap((value): EditorialRepairTool[] => isRecord(value)
      && value["tool"] === "replace_exact_body_text"
      && typeof value["before"] === "string"
      && value["before"].length > 0
      && typeof value["after"] === "string"
      ? [Object.freeze({ tool: "replace_exact_body_text", before: value["before"], after: value["after"] })]
      : isRecord(value) && value["tool"] === "repair_editorial_surfaces" && Object.keys(value).every((key) => key === "tool")
        ? [Object.freeze({ tool: "repair_editorial_surfaces" })]
        : [])
    : [];
  const requiredRepairs = Array.isArray(record["requiredRepairs"])
    ? record["requiredRepairs"].filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    : [];
  const pipelineDiagnosis = isRecord(record["pipelineDiagnosis"]) ? record["pipelineDiagnosis"] : undefined;
  const failureLayer = typeof pipelineDiagnosis?.["failureLayer"] === "string"
    ? pipelineDiagnosis["failureLayer"]
    : typeof record["failureLayer"] === "string" ? record["failureLayer"] : undefined;
  return Object.freeze({
    report,
    digest: recordDigest(record),
    repairTools: Object.freeze(repairTools),
    requiredRepairs: Object.freeze(requiredRepairs),
    ...(failureLayer === undefined ? {} : { failureLayer }),
  });
}

export type ManuscriptRepairDirective = Readonly<{
  report: string;
  digest: string;
  repairTools: readonly EditorialRepairTool[];
  requiredRepairs: readonly string[];
  failureLayer?: string;
  authority: "independent-editor" | "deterministic-source-originality-gate";
}>;

/** Return the closest byte-bound authority that can license a manuscript
 * repair. Most repairs follow an independent Editor judgment. A source-
 * originality refusal happens earlier, so its deterministic gate witness is
 * the repair authority and must not be mistaken for a source-custody defect. */
export function latestManuscriptRepairDirective(input: Readonly<{
  dataDir: string;
  assignmentId: string;
  slug: string;
  manuscript: string;
}>): ManuscriptRepairDirective {
  // Editorial judgments bind the exact manuscript bytes. Structured newsroom
  // records use NI identities; do not substitute one identity domain for the
  // other or a current judgment will appear stale.
  const manuscriptDigest = digest(input.manuscript);
  try {
    const editor = latestEditorialReport(input.dataDir, input.slug, manuscriptDigest);
    return Object.freeze({ ...editor, authority: "independent-editor" });
  } catch {
    // Continue to the earlier deterministic warranty gate.
  }
  const gate = readKoiosLedger(input.dataDir, "contract-events")
    .filter((record) => record["act"] === "newsroom.circuit.source-originality-refused"
      && record["subject"] === input.assignmentId
      && isRecord(record["data"])
      && record["data"]["slug"] === input.slug)
    .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
    .at(-1);
  const data = gate !== undefined && isRecord(gate["data"]) ? gate["data"] : undefined;
  const findings = Array.isArray(data?.["findings"])
    ? data.findings.filter((finding): finding is JsonRecord => isRecord(finding)
      && typeof finding["draftSentence"] === "string"
      && typeof finding["sourceSentence"] === "string"
      && typeof finding["sourceUrl"] === "string")
    : [];
  const recordedManuscriptDigest = typeof data?.["manuscriptDigest"] === "string" ? data.manuscriptDigest : undefined;
  const bytesAreCurrent = recordedManuscriptDigest === manuscriptDigest
    || recordedManuscriptDigest === recordDigest(input.manuscript)
    || (findings.length > 0
      && findings.every((finding) => input.manuscript.includes(String(finding["draftSentence"]))));
  if (gate === undefined || data === undefined || findings.length === 0 || !bytesAreCurrent) {
    throw new Error(`no current repair directive for ${input.slug} at ${manuscriptDigest}`);
  }
  const examples = findings.map((finding, index) => [
    `${index + 1}. Do not reuse this draft sentence: ${String(finding["draftSentence"])}`,
    `   Reconstruct its supported facts independently from ${String(finding["sourceUrl"])} or use a short explicit quotation.`,
  ].join("\n"));
  return Object.freeze({
    report: [
      `The deterministic source-originality gate found ${findings.length} source-shaped sentence(s).`,
      "Replay the writer against the same witnessed source packet. Use materially independent prose or an explicit, properly attributed quotation. Preserve all other warranted claims and citations, and do not refresh or replace the sources.",
      ...examples,
    ].join("\n"),
    digest: recordDigest(gate),
    repairTools: Object.freeze([]),
    requiredRepairs: Object.freeze(examples),
    failureLayer: "writer-model",
    authority: "deterministic-source-originality-gate",
  });
}

/** Apply only exact, unique body-span repairs selected by the independent
 * editor. The selection contributes bounded choices; code owns the mutation. */
export function applyExactBodyRepairTools(body: string, repairTools: readonly EditorialRepairTool[]): string {
  let next = body;
  for (const repair of repairTools) {
    if (repair.tool !== "replace_exact_body_text") continue;
    const first = next.indexOf(repair.before);
    if (first < 0 || next.indexOf(repair.before, first + repair.before.length) >= 0) throw new Error("editorial repair tool requires one exact unique body span");
    next = `${next.slice(0, first)}${repair.after}${next.slice(first + repair.before.length)}`;
  }
  return next;
}

export function applyBoundedEditorialRepairTools(contentDir: string, slug: string, repairTools: readonly EditorialRepairTool[]): ReturnType<typeof repairManuscriptEditorialSurfaces> {
  if (repairTools.length === 0) throw new Error("bounded editorial repair requires at least one admitted tool act");
  const path = resolve(contentDir, `${slug}.md`);
  const encoded = readFileSync(path, "utf8");
  const document = decodeFrontMatterDocument(encoded);
  const body = applyExactBodyRepairTools(document.body, repairTools);
  if (body !== document.body) writeFileSync(path, encodeFrontMatterDocument(Object.freeze({ ...document, body })), "utf8");
  const surfacesRequested = repairTools.some((repair) => repair.tool === "repair_editorial_surfaces");
  const repaired = repairManuscriptEditorialSurfaces(contentDir, slug);
  if (body === document.body && !surfacesRequested) throw new Error("bounded editorial repair changed no manuscript body bytes");
  if (body === document.body && repaired.changed.length === 0) throw new Error("bounded editorial surface repair changed no manuscript bytes");
  return repaired;
}

export function editorRequestsCarrierRepair(
  report: string,
  requiredRepairs: readonly string[] = [],
  failureLayer?: string,
): boolean {
  if (failureLayer !== undefined && /(?:writer|source|assignment|model|research)/iu.test(failureLayer)) return false;
  const carrierFinding = /(?:frontmatter|metadata fields?|artifact (?:preamble|sentences?)|process narration|editorial commentary|description and summary|body is returned byte-for-byte)/iu;
  const substantiveFinding = /(?:rewrite|replay|lede|body (?:reads|needs|omits|lacks|contains)|source citation|factual claim|attribution|news hook|reporting|sourced|evidence|near-duplicate|redundan|invent|unsupported)/iu;
  const findings = requiredRepairs.length > 0 ? requiredRepairs : [report];
  return findings.length > 0 && findings.every((finding) => carrierFinding.test(finding) && !substantiveFinding.test(finding));
}

export function renderedDraftRevisionInstructions(
  authority: ManuscriptRepairDirective["authority"] = "independent-editor",
): string {
  const operatingMaterial = [
    "lib/management/offices/reporter.json",
    "lib/management/offices/editor-in-chief.json",
    "lib/management/duties/forming-a-reported-manuscript.json",
    "lib/management/duties/judging-accountable-publication.json",
    "lib/management/contracts/inference-market-writer-work.json",
    "lib/law/accountable-attention-and-publication.json",
    "lib/law/editorial-product-commissions.json",
  ].map((relativePath) => Object.freeze({
    relativePath,
    value: JSON.parse(readFileSync(join(SITE_ROOT, relativePath), "utf8")) as unknown,
  }));
  const authorityLabel = authority === "independent-editor"
    ? "the independent Editor report"
    : "the deterministic source-originality gate report";
  return [
    `You hold Koios.News's Draft Revision duty. Rewrite the complete article body so it clears every material defect in ${authorityLabel}.`,
    "Return prose, not a serialized newsroom record: only the complete revised Markdown body, with no title, frontmatter, labels, patch language, code fence, or commentary.",
    `For this repair, ${authorityLabel} is authoritative. A later independent editorial pass will judge the exact revised manuscript.`,
    ...(authority === "independent-editor"
      ? ["When the Editor identifies bounded defects, preserve every other compliant sentence, heading, quotation, and citation byte-for-byte. Change only the named defects; do not opportunistically restyle or recompose the article."]
      : [
        "This is a full writer replay, not a local patch. Reconstruct the whole manuscript in materially independent language while preserving the licensed facts, uncertainty, attribution, and reader-facing citations.",
        "Do not preserve sentences from the failed draft byte-for-byte. Do not copy a sentence from the research packet merely because it is licensed as a claim. Use a short, explicit, attributed quotation only when the exact language itself matters.",
      ]),
    "Do not invent connective tissue, causal claims, quotations, identities, numbers, temporal order, policy contents, or geography. If the packet cannot support a requested expansion, narrow or remove the claim.",
    "Every factual paragraph must carry a normal reader-facing source link or an immediately continuing attribution. Never reproduce internal claim IDs or claim tokens.",
    ...operatingMaterial.map(({ relativePath, value }) => `${relativePath}:\n${JSON.stringify(value)}`),
  ].join("\n\n");
}

export function composeDraftRevisionPrompt(input: Readonly<{
  editorReport: string;
  researchPacket: unknown;
  currentBody: string;
  renderedInstructions?: string;
  repairAuthority?: ManuscriptRepairDirective["authority"];
}>): string {
  const cleanRoomReplay = input.repairAuthority === "deterministic-source-originality-gate";
  const reportLabel = cleanRoomReplay
    ? "DETERMINISTIC SOURCE-ORIGINALITY GATE REPORT"
    : "INDEPENDENT EDITOR REPORT";
  return [
    input.renderedInstructions ?? renderedDraftRevisionInstructions(input.repairAuthority),
    ...(cleanRoomReplay
      ? ["CLEAN-ROOM REPLAY BOUNDARY:\nDevelop an independent explanatory structure from the assignment and witnessed evidence; do not traverse the packet sentence-by-sentence. The failed manuscript remains digest-bound customer evidence but is intentionally withheld from this writer invocation so its wording cannot anchor the rewrite."]
      : []),
    `${reportLabel}:\n${input.editorReport}`,
    `WITNESSED RESEARCH PACKET:\n${JSON.stringify(input.researchPacket)}`,
    ...(cleanRoomReplay ? [] : [`CURRENT BODY:\n${input.currentBody}`]),
  ].join("\n\n");
}

export function composeCompletenessRepairPrompt(input: Readonly<{
  editorReport: string;
  researchPacket: unknown;
  candidateBody: string;
  candidateWords: number;
  minimumWords: number;
  maximumWords: number;
}>): string {
  return [
    "You hold Koios.News's bounded Draft Completion duty.",
    `The prior revision is ${input.candidateWords} words, below this commission's ${input.minimumWords}-word floor. Return a complete revised Markdown article body of ${input.minimumWords} to ${input.maximumWords} words.`,
    "Return prose only: no title, frontmatter, labels, patch language, code fence, or commentary.",
    "Preserve the prior revision's supported thesis and reader-facing source links. Expand only with facts licensed by the witnessed research packet. Do not add invented connective claims, quotations, identities, numbers, chronology, policy contents, or geography.",
    "Satisfy the independent Editor's material repairs. If evidence is too thin for a requested expansion, narrow the claim and deepen explanation of supported relationships instead of inventing facts.",
    `INDEPENDENT EDITOR REPORT:\n${input.editorReport}`,
    `WITNESSED RESEARCH PACKET:\n${JSON.stringify(input.researchPacket)}`,
    `SHORT CANDIDATE BODY:\n${input.candidateBody}`,
  ].join("\n\n");
}

function draftProblems(input: Readonly<{
  body: string;
  contributionProblem?: string | undefined;
  sourceUrls: readonly string[];
  minimumWords: number;
  maximumWords: number;
}>): readonly string[] {
  const bodyWords = input.body.split(/\s+/gu).filter(Boolean).length;
  return Object.freeze([
    ...(input.contributionProblem === undefined ? [] : [input.contributionProblem]),
    ...(input.sourceUrls.some((url) => input.body.includes(url)) ? [] : ["draft repair omitted every witnessed source citation"]),
    ...(bodyWords >= input.minimumWords ? [] : [`draft repair returned ${bodyWords} words; the commission completeness floor is ${input.minimumWords}`]),
    // The target ceiling is commissioning guidance, not factual warrant. A
    // later independent editor may call an overlong manuscript bloated, but a
    // complete, sourced product must not be discarded solely for crossing an
    // arbitrary integer after the expensive prose stage has settled.
    ...(input.body.includes("[claim:") ? ["draft repair leaked internal claim tokens into reader prose"] : []),
  ]);
}

export function shouldRetryIncompleteDraft(input: Readonly<{
  problems: readonly string[];
  words: number;
  minimumWords: number;
}>): boolean {
  return input.words < input.minimumWords
    && input.problems.length === 1
    && input.problems[0]!.includes("commission completeness floor");
}
function manuscriptAssignmentId(frontMatter: Readonly<Record<string, unknown>>): string {
  const koios = isRecord(frontMatter["koios"]) ? frontMatter["koios"] : {};
  const assignmentId = koios["assignment_id"];
  if (typeof assignmentId !== "string" || assignmentId.trim() === "") {
    throw new Error("bounded repair requires a manuscript linked to a durable assignment");
  }
  return assignmentId;
}

export type DraftRepairResult = Readonly<{
  kind: "koios.draft-repair";
  at: string;
  slug: string;
  assignmentId: string;
  editorJudgmentDigest: string;
  before: Readonly<{ path: string; digest: string }>;
  after: Readonly<{ path: string; digest: string; standards: unknown }>;
  replacement: Readonly<{ beforeBodyDigest: string; afterBodyDigest: string; beforeCharacters: number; afterCharacters: number }>;
  inference: Readonly<Record<string, unknown>>;
  composition: Readonly<{ promptDigest: string; promptCharacters: number }>;
}>;

const REPAIR_REVALIDATION_CONTRACT = "koios.news/retained-manuscript-repair-revalidation/v1";
const REPAIR_REVALIDATION_MECHANISM = recordDigest({ type: "RetainedManuscriptRepairRevalidationMechanism", version: 1, contract: REPAIR_REVALIDATION_CONTRACT });

async function retainRepairProduct(dataDir: string, record: DraftRepairResult): Promise<void> {
  await appendDatedRecord({ dataRoot: dataDir, ledger: "contract-events", instant: record.at, record: record as unknown as JsonRecord });
  if (readAssignmentDisposition(dataDir, record.assignmentId)?.disposition !== "refused") return;
  await recordAssignmentRepairRevalidation(dataDir, {
    assignmentId: record.assignmentId,
    repairProductDigest: recordDigest(record as unknown as JsonRecord),
    repairMechanismDigest: REPAIR_REVALIDATION_MECHANISM,
    authority: "koios.news/retained-manuscript-repair",
    contract: REPAIR_REVALIDATION_CONTRACT,
  }, record.at);
}

export function requireManuscriptMutation(before: string, after: string): void {
  if (after === before) throw new Error("bounded editorial repair changed no manuscript bytes");
}

export async function repairDraft(input: Readonly<{
  slug: string;
  packetGeneratedAt?: string;
  retainedProviderExchange?: string;
  now?: string;
}>): Promise<DraftRepairResult> {
  const property = koiosFarmProperty();
  const dataDir = resolve(property.dataDir);
  const contentDir = resolve(property.contentDir);
  const path = resolve(contentDir, `${input.slug}.md`);
  const before = readFileSync(path, "utf8");
  const beforeDigest = digest(before);
  const document = decodeFrontMatterDocument(before);
  const assignmentId = manuscriptAssignmentId(document.frontMatter);
  const assignment = readAssignment(dataDir, assignmentId, loadPosts(contentDir));
  const commission = commissionForAssignment(assignment);
  const minimumWords = commission.evidenceBudget.targetWords.minimum;
  const maximumWords = commission.evidenceBudget.targetWords.maximum;
  const references = Array.isArray(document.frontMatter["references"]) ? document.frontMatter["references"] : [];
  const citedUrls = references.flatMap((reference) => isRecord(reference) && typeof reference["URL"] === "string" ? [reference["URL"]] : []);
  const sourceUrls = citedUrls.length > 0 ? citedUrls : assignment.sourceUrls;
  const packetGeneratedAt = input.packetGeneratedAt ?? assignment.createdAt;
  const packet = researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: Math.max(4, sourceUrls.length), now: () => packetGeneratedAt });
  if (packet.selectedCount === 0) throw new Error(`assignment ${assignmentId} has no admitted source evidence for repair`);
  const editor = latestManuscriptRepairDirective({ dataDir, assignmentId, slug: input.slug, manuscript: before });
  if (editor.repairTools.length > 0) {
    const surfaceRepair = applyBoundedEditorialRepairTools(contentDir, input.slug, editor.repairTools);
    const after = readFileSync(path, "utf8");
    requireManuscriptMutation(before, after);
    const repairedDocument = decodeFrontMatterDocument(after);
    const at = input.now ?? new Date().toISOString();
    const record: DraftRepairResult = Object.freeze({
      kind: "koios.draft-repair", at, slug: input.slug, assignmentId, editorJudgmentDigest: editor.digest,
      before: Object.freeze({ path, digest: beforeDigest }),
      after: Object.freeze({ path, digest: recordDigest(after), standards: surfaceRepair.review }),
      replacement: Object.freeze({ beforeBodyDigest: digest(document.body), afterBodyDigest: digest(repairedDocument.body), beforeCharacters: document.body.length, afterCharacters: repairedDocument.body.length }),
      inference: Object.freeze({ provider: "koios-bounded-editorial-repair-tools", model: "none", usage: Object.freeze({ calls: 0, tokens: 0 }), toolCount: editor.repairTools.length }),
      composition: Object.freeze({ promptDigest: editor.digest, promptCharacters: 0 }),
    });
    await retainRepairProduct(dataDir, record);
    return record;
  }
  if (editorRequestsCarrierRepair(editor.report, editor.requiredRepairs, editor.failureLayer)) {
    const surfaceRepair = repairManuscriptEditorialSurfaces(contentDir, input.slug);
    const after = readFileSync(path, "utf8");
    if (after === before) {
      throw new Error("editor requested a carrier-only repair but the deterministic carrier projection was already stable; whole-manuscript inference is forbidden and the projection service requires repair");
    }
    const repairedDocument = decodeFrontMatterDocument(after);
    const at = input.now ?? new Date().toISOString();
    const record: DraftRepairResult = Object.freeze({
      kind: "koios.draft-repair",
      at,
      slug: input.slug,
      assignmentId,
      editorJudgmentDigest: editor.digest,
      before: Object.freeze({ path, digest: beforeDigest }),
      after: Object.freeze({ path, digest: recordDigest(after), standards: surfaceRepair.review }),
      replacement: Object.freeze({
        beforeBodyDigest: digest(document.body),
        afterBodyDigest: digest(repairedDocument.body),
        beforeCharacters: document.body.length,
        afterCharacters: repairedDocument.body.length,
      }),
      inference: Object.freeze({ provider: "koios-deterministic-editorial-surfaces", model: "none", usage: Object.freeze({ calls: 0, tokens: 0 }) }),
      composition: Object.freeze({ promptDigest: editor.digest, promptCharacters: 0 }),
    });
    await retainRepairProduct(dataDir, record);
    return record;
  }
  const usage = { calls: 0, tokens: 0 };
  let prompt = composeDraftRevisionPrompt({
    editorReport: editor.report,
    researchPacket: packet,
    currentBody: document.body,
    repairAuthority: editor.authority,
  });
  if (input.retainedProviderExchange !== undefined) {
    const retained = JSON.parse(readFileSync(resolve(input.retainedProviderExchange), "utf8")) as JsonRecord;
    const retainedPacket = isRecord(retained["packet"]) ? retained["packet"] : undefined;
    const messages = Array.isArray(retainedPacket?.["messages"]) ? retainedPacket["messages"] : [];
    const system = messages.find((value) => isRecord(value) && value["role"] === "system");
    const user = messages.find((value) => isRecord(value) && value["role"] === "user");
    const expectedPurpose = `Repair Koios manuscript ${input.slug} under assignment ${assignmentId}.\nReturn only the complete repaired Markdown article body.`;
    if (retained["outcome"] !== "completion"
      || retainedPacket?.["model"] !== "claude-sonnet-4-6"
      || system?.["content"] !== expectedPurpose
      || typeof user?.["content"] !== "string"
      || !user["content"].includes(editor.report)
      || sourceUrls.some((url) => !String(user["content"]).includes(url))) {
      throw new Error("retained provider exchange does not match this exact manuscript repair authority, assignment, model, and source custody");
    }
    prompt = user["content"];
  }
  const providerResults: unknown[] = [];
  const selectedRoutes: { selectedTier: string; selectedProvider: string; model: string }[] = [];
  let completion: string;
  const firstMarketResult = await procureMarketProse({
    purpose: `Repair Koios manuscript ${input.slug} under assignment ${assignmentId}.`,
    prompt,
    requiredText: [sourceUrls[0]!],
    maxTokens: 3_000,
    routingProfile: "extended",
    extendedRoutingRationale: "daily edition repair work; bounded profile insufficient for source re-research",
  });
  usage.calls = 1;
  providerResults.push(firstMarketResult.providerResult);
  selectedRoutes.push(firstMarketResult);
  completion = firstMarketResult.text;
  const promptDigests = [digest(prompt)];
  let body = "";
  let contributionProblem: string | undefined;
  const normalize = (): void => {
    body = "";
    contributionProblem = undefined;
    try { body = canonicalizeSourceUrls(proseContributionBody(completion), packet.sourceUrls); }
    catch (error) { contributionProblem = error instanceof Error ? error.message : String(error); }
  };
  normalize();
  let problems = draftProblems({ body, contributionProblem, sourceUrls: packet.sourceUrls, minimumWords, maximumWords });
  const bodyWords = (): number => body.split(/\s+/gu).filter(Boolean).length;
  if (shouldRetryIncompleteDraft({ problems, words: bodyWords(), minimumWords })) {
    const completionPrompt = composeCompletenessRepairPrompt({
      editorReport: editor.report,
      researchPacket: packet,
      candidateBody: body,
      candidateWords: bodyWords(),
      minimumWords,
      maximumWords,
    });
    const result = await procureMarketProse({
      purpose: `Complete short Koios draft repair ${input.slug} under assignment ${assignmentId}.`,
      prompt: completionPrompt,
      requiredText: [sourceUrls[0]!],
      maxTokens: 3_000,
      routingProfile: "extended",
      extendedRoutingRationale: "daily edition repair work; bounded profile insufficient for source re-research",
    });
    usage.calls += 1;
    providerResults.push(result.providerResult);
    selectedRoutes.push(result);
    promptDigests.push(digest(completionPrompt));
    completion = result.text;
    normalize();
    problems = draftProblems({ body, contributionProblem, sourceUrls: packet.sourceUrls, minimumWords, maximumWords });
  }
  const at = input.now ?? new Date().toISOString();
  if (problems.length > 0) {
    const obstruction = Object.freeze({
      kind: "koios.draft-repair-obstruction", at, slug: input.slug, assignmentId, problems,
      before: Object.freeze({ path, digest: beforeDigest }), editorJudgmentDigest: editor.digest,
      inference: Object.freeze({ provider: selectedRoutes.at(-1)?.selectedProvider ?? "urn:ame:inference-work-lot-service", model: selectedRoutes.at(-1)?.model ?? "market-selected-model", tier: selectedRoutes.at(-1)?.selectedTier ?? "market-unsettled", usage }),
      composition: Object.freeze({ promptDigest: digest(prompt), promptDigests: Object.freeze(promptDigests), promptCharacters: prompt.length, attempts: promptDigests.length }),
      completion: Object.freeze({ digest: digest(completion), characters: completion.length, words: bodyWords() }),
      ...(providerResults.length === 0 ? {} : { providerResultDigests: Object.freeze(providerResults.map(recordDigest)) }),
    });
    await appendDatedRecord({ dataRoot: dataDir, ledger: "contract-events", instant: at, record: obstruction });
    throw new Error(problems.join("; "));
  }
  const priorKoios = isRecord(document.frontMatter["koios"]) ? document.frontMatter["koios"] : {};
  const next = Object.freeze({
    ...document,
    frontMatter: Object.freeze({
      ...document.frontMatter,
      draft: true,
      description: descriptionFromProse(body),
      summary: summaryFromProse(body),
      koios: Object.freeze({ ...priorKoios, gates_clear: false }),
    }),
    body: `${body}\n`,
  });
  writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
  const after = readFileSync(path, "utf8");
  const standards = reviewManuscriptStandards(contentDir, input.slug);
  const inference = Object.freeze({
    provider: selectedRoutes.at(-1)?.selectedProvider ?? "urn:ame:inference-work-lot-service",
    model: selectedRoutes.at(-1)?.model ?? "market-selected-model",
    tier: selectedRoutes.at(-1)?.selectedTier ?? "market-unsettled",
    usage,
    ...(providerResults.length === 0 ? {} : { providerResultDigest: recordDigest(providerResults.at(-1)), providerResultDigests: Object.freeze(providerResults.map(recordDigest)) }),
  });
  const record: DraftRepairResult = Object.freeze({
    kind: "koios.draft-repair", at, slug: input.slug, assignmentId,
    editorJudgmentDigest: editor.digest,
    before: Object.freeze({ path, digest: beforeDigest }),
    after: Object.freeze({ path, digest: recordDigest(after), standards }),
    replacement: Object.freeze({
      beforeBodyDigest: digest(document.body),
      afterBodyDigest: digest(body),
      beforeCharacters: document.body.length,
      afterCharacters: body.length,
    }),
    inference,
    composition: Object.freeze({ promptDigest: digest(prompt), promptDigests: Object.freeze(promptDigests), promptCharacters: prompt.length, attempts: promptDigests.length }),
  });
  await retainRepairProduct(dataDir, record);
  await appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: at, act: "inference.consumed", subject: `draft-repair:${input.slug}:${digest(prompt)}`, data: { purpose: "bounded-draft-repair", assignmentId, provider: inference["provider"], market: "urn:ame:inference-work-lot-service", model: inference["model"], usage } });
  return record;
}

function isMain(): boolean {
  return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMain()) {
  const slug = process.argv[2];
  if (slug === undefined || slug === "") throw new TypeError("usage: draft-repair <slug>");
  const record = await repairDraft({
    slug,
    ...(process.argv.includes("--packet-generated-at") ? { packetGeneratedAt: process.argv[process.argv.indexOf("--packet-generated-at") + 1] } : {}),
    ...(process.argv.includes("--retained-provider-exchange") ? { retainedProviderExchange: process.argv[process.argv.indexOf("--retained-provider-exchange") + 1] } : {}),
  });
  process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
}
