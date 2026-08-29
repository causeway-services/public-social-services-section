import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, existsSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { recordDigest } from "../../management/ledger.mjs";
import type { EditorialCommission } from "../../management/editorial-commissioning.mjs";
import type { ResearchPacket } from "./research-packets.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "https://koios-news-service-section.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const EMBEDDED_PROVIDER_ROOT = resolve(SITE_ROOT, "../..");
const SIBLING_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/koios-news-service-section");

type JsonRecord = Record<string, unknown>;

export type LicensedAssertion = Readonly<{
  id: string;
  sourceSubject: string;
  sourceUrl: string;
  sourceTitle: string;
  text: string;
  force: "alleges";
  status: "source-supported";
  attribution: "required";
  scope: string;
  sourcePublished?: string;
}>;

export type LicensedEditorialState = Readonly<{
  kind: "koios-news.licensed-editorial-state";
  version: 1;
  formedAt: string;
  assignment: Readonly<{ assignmentId: string; term: string; beat: string; demandStatus: "attention-pressure-not-evidence" }>;
  assertions: readonly LicensedAssertion[];
  plan: Readonly<{
    genre: string;
    evidenceBudget: Readonly<{
      targetWords: Readonly<{ minimum: number; maximum: number }>;
      licensedMaximumWords: number;
      distinctAssertionCount: number;
      primaryAssertionCount: number;
      maximumWordsPerAssertion: number;
      status: "cleared";
    }>;
    headline: Readonly<{ subject: string; claimIds: readonly string[]; law: string }>;
    ledeClaimIds: readonly string[];
    sections: readonly Readonly<{ id: string; purpose: string; claimIds: readonly string[] }>[];
    interpretation: Readonly<{ requestedAngle: string; authority: "editorial-purpose-only"; law: string }>;
    writerPromptLaws: readonly string[];
  }>;
  prohibitions: readonly string[];
  correctionPolicy: string;
}>;

export type LicensedEditorialDiagnosis = Readonly<{
  failureLayer: string;
  requiredMove: string;
  replayFrom: string;
  evidence?: JsonRecord;
  suggestedAssignment?: Readonly<{
    term: string;
    summary: string;
    angle: string;
    sourceUrls: readonly string[];
  }>;
}>;

export class LicensedEditorialStateRefusal extends Error {
  readonly code: string;
  readonly diagnosis: LicensedEditorialDiagnosis;

  constructor(code: string, message: string, diagnosis: LicensedEditorialDiagnosis) {
    super(message);
    this.name = "LicensedEditorialStateRefusal";
    this.code = code;
    this.diagnosis = diagnosis;
  }
}

function defaultProviderRoot(): string {
  return existsSync(join(SIBLING_PROVIDER_ROOT, "package.json")) ? SIBLING_PROVIDER_ROOT : EMBEDDED_PROVIDER_ROOT;
}

function providerEndpoint(root: string): string {
  const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as JsonRecord;
  const bins = packageJson["bin"] as JsonRecord | undefined;
  const relative = bins?.["settle-message"];
  if (typeof relative !== "string" || relative.trim() === "") throw new Error("Service Section does not advertise settle-message");
  const endpoint = resolve(root, relative);
  if (!endpoint.startsWith(`${root}/`)) throw new Error("Service Section settle-message endpoint escapes its membrane");
  accessSync(endpoint, constants.R_OK);
  return endpoint;
}

function invokeProvider(root: string, activity: JsonRecord, instant: string): JsonRecord {
  const result = spawnSync(process.execPath, [providerEndpoint(root), "settle-message", instant], {
    cwd: root,
    input: JSON.stringify(activity),
    encoding: "utf8",
    timeout: 120_000,
    maxBuffer: 128 * 1024 * 1024,
  });
  if (result.error !== undefined) throw result.error;
  if (result.status !== 0) throw new Error(`Service Section failed (${result.status}): ${result.stderr.trim()}`);
  const line = result.stdout.trim().split("\n").at(-1);
  if (line === undefined) throw new Error("Service Section returned no ActivityStreams result");
  const value: unknown = JSON.parse(line);
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError("licensed-editorial-state provider returned no ActivityStreams object");
  return value as JsonRecord;
}

function lawDigest(name: string): string {
  return recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", name), "utf8")));
}

export async function procureLicensedEditorialState(input: Readonly<{
  assignment: Readonly<{
    assignmentId: string;
    term: string;
    beat: string;
    summary: string;
    angle: string;
    sourceUrls: readonly string[];
  }>;
  researchPacket: ResearchPacket;
  commission: EditorialCommission;
  now: string;
  providerRoot?: string;
}>): Promise<Readonly<{ state: LicensedEditorialState; stateDigest: string; providerExchange: JsonRecord }>> {
  const demand = Object.freeze({
    type: "LicensedEditorialStateDemand",
    assignment: Object.freeze({ ...input.assignment, sourceUrls: Object.freeze([...input.assignment.sourceUrls]) }),
    researchPacket: input.researchPacket,
    genreId: input.commission.genre,
    genreLawDigest: input.commission.lawDigest,
    genreRequirements: input.commission.evidenceBudget,
    writerPromptLaws: input.commission.writerPromptLaws,
    publicationPolicyDigest: lawDigest("accountable-attention-and-publication.json"),
  });
  const sourceActivity = Object.freeze({ "@context": CONTEXT, type: "Create", actor: CUSTOMER, object: demand });
  const solicitation = Object.freeze({
    "@context": CONTEXT,
    type: "Offer",
    actor: CUSTOMER,
    target: PROVIDER,
    object: Object.freeze({ type: "ServiceSolicitation", sourceActivity }),
  });
  const providerRoot = resolve(input.providerRoot ?? process.env["KOIOS_NEWS_SERVICE_SECTION_ROOT"] ?? defaultProviderRoot());
  const offer = invokeProvider(providerRoot, solicitation, input.now);
  if (offer["type"] !== "Offer") throw new Error(`licensed-editorial-state solicitation refused: ${String(offer["summary"] ?? "unknown provider refusal")}`);
  const invocation = Object.freeze({
    "@context": CONTEXT,
    type: "Accept",
    actor: CUSTOMER,
    target: PROVIDER,
    object: Object.freeze({ type: "ServiceContract", offer }),
  });
  const delivery = invokeProvider(providerRoot, invocation, input.now);
  const deliveryObject = delivery["object"] as JsonRecord | undefined;
  const result = deliveryObject?.["result"] as JsonRecord | undefined;
  if (result?.["status"] === "refused") {
    const rawDiagnosis = result["diagnosis"] as JsonRecord | undefined;
    const rawSuggested = rawDiagnosis?.["suggestedAssignment"] as JsonRecord | undefined;
    const suggestedUrls = rawSuggested?.["sourceUrls"];
    const diagnosis: LicensedEditorialDiagnosis = Object.freeze({
      failureLayer: String(rawDiagnosis?.["failureLayer"] ?? "unknown"),
      requiredMove: String(rawDiagnosis?.["requiredMove"] ?? "inspect-provider-refusal"),
      replayFrom: String(rawDiagnosis?.["replayFrom"] ?? "unknown"),
      ...(rawDiagnosis?.["evidence"] === undefined ? {} : { evidence: rawDiagnosis["evidence"] as JsonRecord }),
      ...(rawSuggested === undefined || !Array.isArray(suggestedUrls) || !suggestedUrls.every((value) => typeof value === "string") ? {} : {
        suggestedAssignment: Object.freeze({
          term: String(rawSuggested["term"] ?? ""),
          summary: String(rawSuggested["summary"] ?? ""),
          angle: String(rawSuggested["angle"] ?? ""),
          sourceUrls: Object.freeze(suggestedUrls),
        }),
      }),
    });
    throw new LicensedEditorialStateRefusal(
      String(result["code"] ?? "provider-refusal"),
      String(result["reason"] ?? "source evidence did not license the assignment"),
      diagnosis,
    );
  }
  if (delivery["type"] !== "Accept" || result?.["status"] !== "licensed") throw new Error("licensed-editorial-state provider returned no admissible delivery");
  return Object.freeze({
    state: result["state"] as LicensedEditorialState,
    stateDigest: String(result["stateDigest"]),
    providerExchange: deliveryObject?.["providerExchange"] as JsonRecord,
  });
}

export function licensedEditorialBrief(state: LicensedEditorialState, fallbackWriterPromptLaws: readonly string[] = []): string {
  const claimDeck = licensedClaimDeck(state);
  const lines = [
    "LICENSED EDITORIAL STATE — this is the complete factual boundary for the draft.",
    `Assignment demand: ${state.assignment.term} (${state.assignment.beat}). Demand selects attention; it is not evidence.`,
    `Commission: ${state.plan.genre}.`,
    `Headline law: ${state.plan.headline.law}`,
    `Evidence budget: ${state.plan.evidenceBudget.distinctAssertionCount} distinct licensed assertions support ${state.plan.evidenceBudget.targetWords.minimum}-${state.plan.evidenceBudget.licensedMaximumWords} words. Do not exceed that range or pad it.`,
    "Passage plan:",
  ];
  for (const section of state.plan.sections) {
    lines.push(`- ${section.id}: ${section.purpose}`);
    for (const claimId of section.claimIds) {
      if (state.assertions.some((claim) => claim.id === claimId)) lines.push(`  - [${claimId}] use the corresponding evidence card below`);
    }
  }
  lines.push("CLEAN-ROOM EVIDENCE CARDS (source sentences and source titles are deliberately absent):");
  lines.push(JSON.stringify(claimDeck));
  lines.push("Commission-specific writing law:");
  const writerPromptLaws = Array.isArray(state.plan.writerPromptLaws)
    ? state.plan.writerPromptLaws
    : fallbackWriterPromptLaws;
  for (const instruction of writerPromptLaws) lines.push(`- ${instruction}`);
  lines.push(`Interpretation law: ${state.plan.interpretation.law}`);
  lines.push(...state.prohibitions.map((law) => `PROHIBITED: ${law}`));
  lines.push("Every factual paragraph must remain traceable to the bracketed claim IDs above. If the plan cannot support a full article, return REPORTING_NEEDED instead of padding.");
  return lines.join("\n");
}

const FUNCTION_WORDS = new Set([
  "a", "about", "after", "again", "against", "all", "also", "am", "an", "and", "any", "are", "as", "at", "be", "because", "been", "before", "being", "between", "both", "but", "by", "can", "could", "did", "do", "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its", "itself", "just", "me", "more", "most", "my", "myself", "of", "off", "on", "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom", "why", "will", "with", "would", "you", "your", "yours", "yourself", "yourselves",
]);

function sourceLexemes(text: string, claimId: string): readonly string[] {
  const seen = new Set<string>();
  const lexemes = [...text.normalize("NFKC").matchAll(/[\p{L}\p{N}]+(?:['’.-][\p{L}\p{N}]+)*%?/gu)]
    .map((match) => match[0]!)
    .filter((lexeme) => {
      const normalized = lexeme.toLocaleLowerCase("en-US");
      if (FUNCTION_WORDS.has(normalized) || seen.has(normalized)) return false;
      seen.add(normalized);
      return normalized.length > 1 || /\d/u.test(normalized);
    });
  return Object.freeze(lexemes.sort((left, right) => recordDigest({ claimId, lexeme: left.toLocaleLowerCase("en-US") })
    .localeCompare(recordDigest({ claimId, lexeme: right.toLocaleLowerCase("en-US") }))));
}

function sourceQuantities(text: string): readonly string[] {
  return Object.freeze([...new Set([...text.matchAll(/(?:[$€£¥])?\b\d[\d,.]*(?:%|\s?(?:percent|million|billion|trillion|years?|days?|hours?))?/giu)]
    .map((match) => match[0]!.trim())
    .filter(Boolean))].sort());
}

/** Project source-bound assertions into an order-independent clean-room deck.
 * The raw research packet remains the customer's exact evidence and is still
 * available to gates and the independent editor. A repair writer receives
 * a shuffled lexical projection instead of source sentences, source titles,
 * paragraphs, or narrative order. The model may propose prose from this
 * deliberately lossy evidence; deterministic gates and the independent editor
 * retain the raw packet and decide whether that prose is warranted. */
export function licensedClaimDeck(state: LicensedEditorialState): Readonly<JsonRecord> {
  const claims = [...state.assertions]
    .sort((left, right) => recordDigest(left.id).localeCompare(recordDigest(right.id)))
    .map((claim) => Object.freeze({
      id: claim.id,
      sourceUrl: claim.sourceUrl,
      evidenceLexemes: sourceLexemes(claim.text, claim.id),
      quantities: sourceQuantities(claim.text),
      sourceAssertionDigest: recordDigest(claim.text),
      force: claim.force,
      attribution: claim.attribution,
      scope: claim.scope,
      ...(claim.sourcePublished === undefined ? {} : { sourcePublished: claim.sourcePublished }),
    }));
  return Object.freeze({
    kind: "koios-news.clean-room-claim-deck",
    version: 2,
    assignment: state.assignment,
    genre: state.plan.genre,
    evidenceBudget: state.plan.evidenceBudget,
    claims: Object.freeze(claims),
    prohibitions: state.prohibitions,
    writingLaw: Object.freeze([
      "Each card is a deliberately shuffled lexical projection, never a source sentence or a complete proposition.",
      "Use lexemes only to identify a candidate fact; do not infer a relationship, chronology, causation, or quotation the card does not safely establish.",
      "Attribute factual paragraphs to the carried source URL and preserve the card's force and quantities.",
      "Return REPORTING_NEEDED whenever the lossy cards do not warrant independent prose.",
    ]),
  });
}
