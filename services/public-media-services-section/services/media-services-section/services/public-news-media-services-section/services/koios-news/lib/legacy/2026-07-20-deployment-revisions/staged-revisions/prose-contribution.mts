// A model contributes language; it does not author Koios's manuscript record.
// This adapter projects one prose contribution into the existing draft carrier
// using source-owned facts and deterministic text selections.

import { createHash } from "node:crypto";

import {
  draftPrompt,
  type ComposeDraft,
  type PostDraft,
} from "@emsenn/organizing-a-content-farm";

function plainText(markdown: string): string {
  return markdown
    .replace(/^#{1,6}\s+/gmu, "")
    .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
    .replace(/[*_`>]/gu, "")
    .replace(/\s+/gu, " ")
    .trim();
}

function words(value: string): readonly string[] {
  return value.trim().split(/\s+/gu).filter(Boolean);
}

function sentences(markdown: string): readonly string[] {
  const plain = plainText(markdown);
  const protectedPlain = plain.replace(/\b(Dr|Prof|Mr|Mrs|Ms|St|No)\./gu, "$1\u2024");
  return Object.freeze((protectedPlain.match(/[^.!?]+[.!?]+(?:["'”’)]*)/gu) ?? [protectedPlain])
    .map((sentence) => sentence.replace(/\u2024/gu, ".").trim()));
}

function standaloneSentence(sentence: string): string {
  return sentence.replace(/,\s+(?:per|according to)\s+[^.!?]+([.!?])$/iu, "$1").trim();
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
  const ledeSentences = sentences(lede);
  const event = standaloneSentence(ledeSentences[0] ?? "");
  const detail = standaloneSentence(ledeSentences.slice(1).find((sentence) => /\d/u.test(sentence)) ?? ledeSentences[1] ?? "");
  const frame = standaloneSentence(ledeSentences.at(-1) ?? ledeSentences[2] ?? "");
  const selected = [event, detail, frame].filter((sentence, index, values) => sentence !== "" && values.indexOf(sentence) === index);
  for (const fallback of sentences(body)) {
    if (selected.length >= 3) break;
    const candidate = standaloneSentence(fallback);
    if (candidate !== "" && !selected.includes(candidate)) selected.push(candidate);
  }
  if (selected.length === 1 && words(selected[0]!).length > 90) return `${words(selected[0]!).slice(0, 89).join(" ")}…`;
  const baseline = selected.slice(0, 3).join(" ").trim();
  const baselineWords = words(baseline).length;
  if (baselineWords >= 40 && baselineWords <= 70) return baseline;

  // Metadata is a projection, not a second prose-generation job. Select the
  // closest complete three/four-sentence account from already admitted body
  // sentences rather than asking a model to rewrite the whole manuscript.
  const available = [...new Set(sentences(body).map(standaloneSentence).filter(Boolean))].slice(0, 12);
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
  choose(0, 3, []);
  return candidates.sort((left, right) => right.numeric - left.numeric || left.distance - right.distance || left.text.localeCompare(right.text))[0]?.text ?? baseline;
}

export function descriptionFromProse(body: string): string {
  const bodySentences = sentences(body).map(standaloneSentence).filter(Boolean);
  const text = bodySentences.find((sentence) => sentence.length >= 100 && sentence.length <= 150)
    ?? bodySentences[0]
    ?? plainText(body);
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
