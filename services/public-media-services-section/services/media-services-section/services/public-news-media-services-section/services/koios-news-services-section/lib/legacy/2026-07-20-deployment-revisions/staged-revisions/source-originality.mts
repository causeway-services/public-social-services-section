export type SourceText = Readonly<{ sourceUrl: string; text: string }>;

export type SourceOriginalityFinding = Readonly<{
  sourceUrl: string;
  draftSentence: string;
  sourceSentence: string;
  sharedWordCount: number;
  wordContainment: number;
  trigramContainment: number;
  longestSharedRun: number;
}>;

function visibleText(value: string): string {
  return value
    .replace(/```[\s\S]*?```/gu, " ")
    .replace(/^>.*$/gmu, " ")
    .replace(/[“"]([^”"\n]{40,})[”"]/gu, " ")
    .replace(/\[([^\]]+)\]\([^)]+\)/gu, "$1")
    .replace(/<[^>]+>/gu, " ")
    .replace(/https?:\/\/\S+/gu, " ")
    .replace(/&(?:nbsp|amp|quot|apos|rsquo|lsquo|rdquo|ldquo|mdash|ndash);/giu, " ")
    .replace(/^#{1,6}\s+/gmu, "");
}

function words(value: string): readonly string[] {
  return Object.freeze(visibleText(value).toLowerCase().normalize("NFKC")
    .replace(/[^\p{L}\p{N}']+/gu, " ").trim().split(/\s+/u).filter(Boolean));
}

function sentences(value: string): readonly string[] {
  return Object.freeze(visibleText(value).split(/(?<=[.!?])\s+|\n\s*\n/gu)
    .map((sentence) => sentence.replace(/\s+/gu, " ").trim())
    .filter((sentence) => words(sentence).length >= 10));
}

function ngrams(tokens: readonly string[], size: number): ReadonlySet<string> {
  return new Set(tokens.slice(0, Math.max(0, tokens.length - size + 1)).map((_, index) => tokens.slice(index, index + size).join(" ")));
}

function longestSharedRun(left: readonly string[], right: readonly string[]): number {
  const prior = new Array<number>(right.length + 1).fill(0);
  let longest = 0;
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = new Array<number>(right.length + 1).fill(0);
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      if (left[leftIndex - 1] !== right[rightIndex - 1]) continue;
      current[rightIndex] = (prior[rightIndex - 1] ?? 0) + 1;
      longest = Math.max(longest, current[rightIndex]!);
    }
    for (let index = 0; index < current.length; index += 1) prior[index] = current[index]!;
  }
  return longest;
}

function capitalizedTokens(value: string): ReadonlySet<string> {
  return new Set(visibleText(value).normalize("NFKC").match(/\b[\p{Lu}][\p{L}\p{M}'’.-]*\b/gu)?.map((token) => token.toLowerCase()) ?? []);
}

function sharedRunTokens(left: readonly string[], right: readonly string[], size: number): readonly string[] {
  if (size < 1) return Object.freeze([]);
  const rightRuns = ngrams(right, size);
  for (let index = 0; index <= left.length - size; index += 1) {
    const candidate = left.slice(index, index + size);
    if (rightRuns.has(candidate.join(" "))) return Object.freeze(candidate);
  }
  return Object.freeze([]);
}

function rigidAttributedEnumeration(draftSentence: string, sourceSentence: string, runTokens: readonly string[]): boolean {
  if (!/(?:according to|citing|reported|reports|per\s+)/iu.test(draftSentence)) return false;
  if ((draftSentence.match(/,/gu)?.length ?? 0) < 3 || (sourceSentence.match(/,/gu)?.length ?? 0) < 3) return false;
  const namedInBoth = new Set([...capitalizedTokens(draftSentence)].filter((token) => capitalizedTokens(sourceSentence).has(token)));
  const rigidTokens = runTokens.filter((token) => namedInBoth.has(token) || /^\d/u.test(token));
  return rigidTokens.length >= 4 && rigidTokens.length / Math.max(1, runTokens.length) >= 0.45;
}

function compare(draftSentence: string, sourceSentence: string, sourceUrl: string): SourceOriginalityFinding | undefined {
  const draftWords = words(draftSentence);
  const sourceWords = words(sourceSentence);
  const smallerWordCount = Math.min(draftWords.length, sourceWords.length);
  if (smallerWordCount < 10) return undefined;
  const draftSet = new Set(draftWords);
  const sourceSet = new Set(sourceWords);
  const sharedWordCount = [...draftSet].filter((word) => sourceSet.has(word)).length;
  const wordContainment = sharedWordCount / Math.min(draftSet.size, sourceSet.size);
  const draftTrigrams = ngrams(draftWords, 3);
  const sourceTrigrams = ngrams(sourceWords, 3);
  const sharedTrigrams = [...draftTrigrams].filter((value) => sourceTrigrams.has(value)).length;
  const trigramContainment = sharedTrigrams / Math.max(1, Math.min(draftTrigrams.size, sourceTrigrams.size));
  const run = longestSharedRun(draftWords, sourceWords);
  const runTokens = sharedRunTokens(draftWords, sourceWords, run);
  // A long exact run is copying even if the surrounding sentence is padded.
  // The fuzzy branch catches light synonym swaps and inserted attribution.
  const sourceShapedParaphrase = smallerWordCount >= 12 && sharedWordCount >= 10 && wordContainment >= 0.68 && trigramContainment >= 0.28;
  const copiedShortSentence = smallerWordCount >= 9 && sharedWordCount >= 8 && wordContainment >= 0.82 && trigramContainment >= 0.45;
  const rigidFactList = run >= 10 && rigidAttributedEnumeration(draftSentence, sourceSentence, runTokens);
  if ((run < 10 || rigidFactList) && !sourceShapedParaphrase && !copiedShortSentence) return undefined;
  return Object.freeze({ sourceUrl, draftSentence, sourceSentence, sharedWordCount, wordContainment, trigramContainment, longestSharedRun: run });
}

/** Exact executable identity for revalidating historical originality refusals
 * after the detector changes. */
export function sourceOriginalityMechanismDigest(): string {
  return `sha256:${createHash("sha256").update(readFileSync(new URL(import.meta.url))).digest("hex")}`;
}

/**
 * Refuse unattributed source-shaped prose before an inference editor can waive
 * it. Long visibly quoted passages and Markdown block quotes are excluded;
 * everything else must be independently worded even when a citation is near.
 */
export function sourceOriginalityFindings(body: string, sources: readonly SourceText[]): readonly SourceOriginalityFinding[] {
  const findings: SourceOriginalityFinding[] = [];
  for (const draftSentence of sentences(body)) {
    let strongest: SourceOriginalityFinding | undefined;
    for (const source of sources) {
      for (const sourceSentence of sentences(source.text)) {
        const candidate = compare(draftSentence, sourceSentence, source.sourceUrl);
        if (candidate === undefined) continue;
        if (strongest === undefined || candidate.longestSharedRun > strongest.longestSharedRun
          || candidate.trigramContainment > strongest.trigramContainment) strongest = candidate;
      }
    }
    if (strongest !== undefined) findings.push(strongest);
  }
  return Object.freeze(findings);
}
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
