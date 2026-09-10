import { accountableAttentionContract, reviewAccountableAttention } from "@red-cup-engineering/producing-content/topology";

import type { EditorialCommission } from "../../management/editorial-commissioning.mjs";

const GLUE = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "of", "on", "or", "the", "to", "with"]);
const EMPTY_CURIOSITY = /\b(?:you won'?t believe|shocking truth|what happens next|everyone is talking about|breaks the internet)\b/iu;

export type HeadlineSelection = Readonly<{
  selected: string;
  contributed?: string;
  fallback: string;
  accepted: boolean;
  findings: readonly string[];
}>;

function tokens(value: string): readonly string[] {
  return Object.freeze([...new Set(value.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length >= 3 && !GLUE.has(word)))]);
}

export function headlineCommissionPrompt(input: Readonly<{
  assignmentTerm: string;
  sourceTitle: string;
  body: string;
  commission: EditorialCommission;
}>): string {
  return [
    "Write exactly one publication headline and nothing else: no label, Markdown, quotation marks, URL, explanation, or alternate.",
    `Journalistic product: ${input.commission.genre}.`,
    `Assignment: ${input.assignmentTerm}`,
    `Upstream source headline: ${input.sourceTitle}`,
    "Create original headline language. Do not copy, lightly edit, or preserve the upstream source headline.",
    "Make the headline as attractive, vivid, specific, and useful as the admitted reporting allows.",
    "Name the actual subject. A curiosity gap may delay a detail, never the topic or factual payoff.",
    "Do not strengthen allegation, estimate, interpretation, causation, scope, urgency, intimacy, scandal, or certainty.",
    "Prefer a concrete actor, consequence, conflict, deadline, result, surprise, or reader benefit already established in the body.",
    "Keep it under 120 characters.",
    "ARTICLE BODY:",
    input.body,
  ].join("\n\n");
}

function contribution(raw: string): string | undefined {
  const text = raw.trim().replace(/^```[^\n]*\n?/u, "").replace(/\n?```$/u, "").trim();
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  if (lines.length !== 1) return undefined;
  return lines[0]!.replace(/^(?:TITLE|HEADLINE):\s*/iu, "").replace(/^[#*\s]+/u, "").replace(/^['"“”]|['"“”]$/gu, "").trim();
}

function normalizedHeadline(value: string): string {
  return value.toLowerCase().normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export function headlineMatchesSourceTitle(headline: string, sourceTitles: readonly string[]): boolean {
  const candidate = normalizedHeadline(headline);
  return candidate !== "" && sourceTitles.some((title) => normalizedHeadline(title) === candidate);
}

/** Select a model's language contribution only when deterministic attention
 * checks can prove that the exact body discharges its promise. The upstream
 * source title remains evidence, never fallback publication copy. */
export function selectAccountableHeadline(input: Readonly<{
  raw: string;
  fallback: string;
  assignmentTerm: string;
  body: string;
  sourceUrls: readonly string[];
}>): HeadlineSelection {
  const candidate = contribution(input.raw);
  const findings: string[] = [];
  if (candidate === undefined) findings.push("headline contribution must contain exactly one prose line");
  if (candidate !== undefined && (candidate.length < 20 || candidate.length > 120)) findings.push(`headline length ${candidate.length} is outside 20-120 characters`);
  if (candidate !== undefined && /https?:\/\//iu.test(candidate)) findings.push("headline contains a URL");
  if (candidate !== undefined && EMPTY_CURIOSITY.test(candidate)) findings.push("headline uses an empty curiosity template instead of naming its payoff");
  if (candidate !== undefined && headlineMatchesSourceTitle(candidate, [input.fallback])) findings.push("headline copies the upstream source title");
  if (candidate !== undefined) {
    const subjectWords = tokens(`${input.assignmentTerm} ${input.fallback}`);
    const candidateWords = new Set(tokens(candidate));
    const bodyWords = new Set(tokens(input.body));
    const namedSubjectWords = subjectWords.filter((word) => candidateWords.has(word) && bodyWords.has(word));
    if (namedSubjectWords.length < Math.min(2, subjectWords.length)) findings.push("headline does not name enough of the reported subject");
    const unsupportedNumbers = [...candidate.matchAll(/\b\d[\d,.%:-]*\b/gu)].map((match) => match[0]).filter((number) => !input.body.includes(number));
    if (unsupportedNumbers.length > 0) findings.push(`headline introduces number(s) absent from the article: ${unsupportedNumbers.join(", ")}`);
    const contract = accountableAttentionContract({
      id: `headline:${input.assignmentTerm}`,
      surface: { surface: "headline", text: candidate },
      warrant: { modality: "alleges", scope: [], evidence: input.sourceUrls, correctionState: "current" },
    });
    for (const result of reviewAccountableAttention(contract, input.body).filter((result) => result.charge === "fail")) findings.push(`${result.obligation}: ${result.evidence}`);
  }
  const accepted = candidate !== undefined && findings.length === 0;
  return Object.freeze({
    selected: accepted ? candidate : input.fallback,
    ...(candidate === undefined ? {} : { contributed: candidate }),
    fallback: input.fallback,
    accepted,
    findings: Object.freeze(findings),
  });
}
