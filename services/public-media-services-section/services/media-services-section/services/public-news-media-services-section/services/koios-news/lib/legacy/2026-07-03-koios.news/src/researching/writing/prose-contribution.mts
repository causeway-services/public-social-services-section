// A model contributes language; it does not author Koios's manuscript record.
// This adapter projects one prose contribution into the existing draft carrier
// using source-owned facts and deterministic text selections.

import { createHash } from "node:crypto";

import {
  draftPrompt,
  type ComposeDraft,
  type PostDraft,
} from "@red-cup-engineering/organizing-a-content-farm";

function plainText(markdown: string): string {
  return markdown
    // Headings organize the article body; they are not sentences in its
    // description or summary projection.
    .replace(/^#{1,6}\s+.*$/gmu, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
    // When a possessive outlet credit owns a long exact-title link, omitting
    // the title must leave a grammatical noun behind. Otherwise metadata can
    // end in a dangling carrier artifact such as "Hyperallergic's." and the
    // deterministic repair tool can never converge.
    .replace(/\b([\p{L}][\p{L}\p{N}.-]*)(['’]s)\s+\[([^\]]+)\]\([^)]*\)/gu, (_match, outlet: string, possessive: string, label: string) => words(label).length > 8 ? `${outlet}${possessive} report` : `${outlet}${possessive} ${label}`)
    // A citation label may be the complete upstream headline. Carrying that
    // headline into metadata both bloats the carrier and risks making source
    // language look like Koios copy. Preserve short, grammatical labels and
    // omit long title citations from this metadata-only projection.
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, (_match, label: string) => words(label).length > 8 ? "" : label)
    .replace(/[*_`>]/gu, "")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .replace(/,\s*(?:according to|per)\s*(?=[,.;:!?])/giu, "")
    .replace(/\b(?:according to|per)\s*([.!?])/giu, "$1")
    .replace(/,\s*,/gu, ",")
    .replace(/\s+/gu, " ")
    .trim();
}

function words(value: string): readonly string[] {
  return value.trim().split(/\s+/gu).filter(Boolean);
}

function sentences(markdown: string): readonly string[] {
  const plain = plainText(markdown);
  const protectedPlain = plain
    .replace(/(?<=\d)\.(?=\d)/gu, "\u2024")
    .replace(/\b(Dr|Prof|Mr|Mrs|Ms|St|No)\./gu, "$1\u2024")
    .replace(/\b(?:[A-Z]\.){2,}/gu, (abbreviation) => abbreviation.replaceAll(".", "\u2024"));
  return Object.freeze((protectedPlain.match(/[^.!?]+[.!?]+(?:["'”’)]*)/gu) ?? [protectedPlain])
    .map((sentence) => sentence.replace(/\u2024/gu, ".").trim()));
}

function standaloneSentence(sentence: string): string {
  return sentence.replace(/,\s+(?:per|according to)\s+[^.!?]+([.!?])$/iu, "$1").trim();
}

function substantiveMetadataSentence(sentence: string): boolean {
  // A citation sentence can be useful in the article while still being a bad
  // audience-facing summary. Advertise what happened, not that another outlet
  // covered or documented it. Attribution remains in the body and references.
  return !/\b(?:is|are|was|were|has been|have been)\s+(?:covered|reported|described|documented)\s+(?:in|by)\b/iu.test(sentence);
}

export function proseContributionBody(raw: string): string {
  let body = raw.trim().replace(/^```(?:markdown|md)?\s*/iu, "").replace(/\s*```$/u, "").trim();
  const carriedBody = body.match(/(?:^|\n)BODY:\s*\n([\s\S]+)$/u)?.[1];
  if (carriedBody !== undefined) body = carriedBody.trim();
  const paragraphs = body.split(/\n{2,}/u);
  if (/(?:editor report|body copy defects?|material defects?|repair cycle|body is returned byte-for-byte)/iu.test(paragraphs[0] ?? "")) {
    body = paragraphs.slice(1).join("\n\n").trim();
  }
  const lines = body.split("\n");
  if (/^(?:#{1,6}\s+.+|\*\*.+\*\*)$/u.test(lines[0]?.trim() ?? "") && (lines[1]?.trim() ?? "") === "") {
    body = lines.slice(2).join("\n").trim();
  }
  if (body === "") throw new TypeError("writer returned no prose contribution");
  return body;
}

export function canonicalizeSourceUrls(body: string, sourceUrls: readonly string[]): string {
  let result = body;
  for (const sourceUrl of sourceUrls) {
    const escaped = sourceUrl.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
    result = result.replace(new RegExp(escaped, "giu"), sourceUrl);
  }
  return result;
}

export function summaryFromProse(body: string): string {
  const lede = body.split(/\n##\s/u)[0] ?? body;
  const ledeSentences = sentences(lede).filter(substantiveMetadataSentence);
  const event = standaloneSentence(ledeSentences[0] ?? "");
  const detail = standaloneSentence(ledeSentences.slice(1).find((sentence) => /\d/u.test(sentence)) ?? ledeSentences[1] ?? "");
  const frame = standaloneSentence(ledeSentences.at(-1) ?? ledeSentences[2] ?? "");
  const selected = [event, detail, frame].filter((sentence, index, values) => sentence !== "" && values.indexOf(sentence) === index);
  for (const fallback of sentences(body).filter(substantiveMetadataSentence)) {
    if (selected.length >= 3) break;
    const candidate = standaloneSentence(fallback);
    if (candidate !== "" && !selected.includes(candidate)) selected.push(candidate);
  }
  if (selected.length === 1 && words(selected[0]!).length > 90) return `${words(selected[0]!).slice(0, 89).join(" ")}…`;
  const baseline = selected.slice(0, 3).join(" ").trim();
  const baselineWords = words(baseline).length;
  if (baselineWords >= 40 && baselineWords <= 70) return baseline;

  // A conventional reported lede opens with the event and closes with its
  // nut: the consequence, institutional gap, or reason the event matters.
  // Prefer that pair when it already fits the carrier. Choosing an arbitrary
  // middle sentence merely because its length fits can turn a procedural
  // detail into the article's advertised thesis.
  const eventAndFrame = [event, frame]
    .filter((sentence, index, values) => sentence !== "" && values.indexOf(sentence) === index)
    .join(" ")
    .trim();
  const eventAndFrameWords = words(eventAndFrame).length;
  if (eventAndFrameWords >= 40 && eventAndFrameWords <= 70) return eventAndFrame;

  // Metadata is a projection, not a second prose-generation job. Select the
  // closest complete three/four-sentence account from already admitted body
  // sentences rather than asking a model to rewrite the whole manuscript.
  const available = [...new Set(sentences(body).filter(substantiveMetadataSentence).map(standaloneSentence).filter(Boolean))].slice(0, 12);
  const candidates: Readonly<{ text: string; distance: number; numeric: number }>[] = [];
  const choose = (start: number, remaining: number, indices: number[]): void => {
    if (remaining === 0) {
      if (!indices.includes(0)) return;
      const text = indices.map((index) => available[index]!).join(" ");
      const count = words(text).length;
      if (count >= 40 && count <= 70) candidates.push({ text, distance: Math.abs(55 - count), numeric: /\d/u.test(text) ? 1 : 0 });
      return;
    }
    for (let index = start; index <= available.length - remaining; index += 1) choose(index + 1, remaining - 1, [...indices, index]);
  };
  for (const size of [2, 3, 4]) choose(0, size, []);
  const candidate = candidates.sort((left, right) => right.numeric - left.numeric || left.distance - right.distance || left.text.localeCompare(right.text))[0]?.text;
  if (candidate !== undefined) return candidate;

  // Refuse to let a malformed citation label turn the summary carrier into a
  // second article. This is a bounded projection of already admitted words,
  // so a hard upper bound is lawful even when the manuscript offers no
  // complete 40–70-word combination.
  if (baselineWords > 70) return `${words(baseline).slice(0, 69).join(" ").replace(/[,:;.!?\s]+$/u, "")}…`;
  return baseline;
}

export function descriptionFromProse(body: string): string {
  const bodySentences = sentences(body).map(standaloneSentence).filter(Boolean);
  // The description is the compressed lede, not whichever later sentence
  // happens to fit a character window. A length-first search can promote a
  // request-for-comment sentence or other procedural detail over the story.
  let text = bodySentences[0] ?? plainText(body);
  for (const sentence of bodySentences.slice(1, 3)) {
    if (text.length >= 100) break;
    text = `${text} ${sentence}`;
  }
  if (text.length <= 150) return text;
  const cut = text.slice(0, 150);
  const boundary = cut.lastIndexOf(" ");
  return `${cut.slice(0, boundary >= 100 ? boundary : 149).replace(/[,:;.!?\s]+$/u, "")}…`;
}

function proseOnlyPrompt(input: Parameters<typeof draftPrompt>[0]): string {
  const legacy = draftPrompt(input);
  const instructions = legacy.replace(/\nOutput EXACTLY this structure[\s\S]*$/u, "").trimEnd();
  const assignmentLabelLaw = words(input.term).length >= 4
    ? `The assignment term “${input.term}” is an internal planning label and may preserve upstream headline syntax. Do not reproduce that multiword label verbatim in the body; describe the event independently.`
    : "The assignment term is a demand label, not source prose. Use only the minimum natural subject words needed to report the event.";
  return `${instructions}\n\n${assignmentLabelLaw}\n\nYour contribution is language, not a serialized newsroom record. Return only the Markdown article body: no title, metadata, labels, JSON, front matter, or commentary. Koios's deterministic manuscript adapter owns those records.`;
}

export const composeNewsroomProse: ComposeDraft = async ({ voice, term, story, context, ask }) => {
  const prompt = proseOnlyPrompt({ voice, term, story, context });
  const body = canonicalizeSourceUrls(proseContributionBody(await ask(prompt)), [story.url, ...context.map((source) => source.url)]);
  const summary = summaryFromProse(body);
  const draft: PostDraft = Object.freeze({
    kind: "producing-content.article.draft",
    title: story.title,
    description: descriptionFromProse(body),
    summary,
    tweet: story.title,
    tags: Object.freeze([term]),
    body,
  });
  return Object.freeze({
    draft,
    copyedits: Object.freeze([]),
    composition: Object.freeze({
      prompt,
      promptDigest: `sha256:${createHash("sha256").update(prompt).digest("hex")}`,
      promptCharacters: prompt.length,
    }),
  });
};
