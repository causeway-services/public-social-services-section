// A model contributes language; it does not author Koios's manuscript record.
// This adapter projects one prose contribution into the existing draft carrier
// using source-owned facts and deterministic text selections.
import { createHash } from "node:crypto";
import { draftPrompt, } from "@emsenn/organizing-a-content-farm";
function plainText(markdown) {
    return markdown
        .replace(/^#{1,6}\s+/gmu, "")
        .replace(/!\[[^\]]*\]\([^)]*\)/gu, "")
        .replace(/\[([^\]]+)\]\([^)]*\)/gu, "$1")
        .replace(/[*_`>]/gu, "")
        .replace(/\s+/gu, " ")
        .trim();
}
function words(value) {
    return value.trim().split(/\s+/gu).filter(Boolean);
}
export function proseContributionBody(raw) {
    let body = raw.trim().replace(/^```(?:markdown|md)?\s*/iu, "").replace(/\s*```$/u, "").trim();
    const carriedBody = body.match(/(?:^|\n)BODY:\s*\n([\s\S]+)$/u)?.[1];
    if (carriedBody !== undefined)
        body = carriedBody.trim();
    const lines = body.split("\n");
    if (/^(?:#{1,6}\s+.+|\*\*.+\*\*)$/u.test(lines[0]?.trim() ?? "") && (lines[1]?.trim() ?? "") === "") {
        body = lines.slice(2).join("\n").trim();
    }
    if (body === "")
        throw new TypeError("writer returned no prose contribution");
    return body;
}
export function canonicalizeSourceUrls(body, sourceUrls) {
    let result = body;
    for (const sourceUrl of sourceUrls) {
        const escaped = sourceUrl.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
        result = result.replace(new RegExp(escaped, "giu"), sourceUrl);
    }
    return result;
}
export function summaryFromProse(body) {
    const plain = plainText(body);
    const sentences = plain.match(/[^.!?]+[.!?]+(?:["'”’)]*)/gu) ?? [plain];
    const selected = [];
    let count = 0;
    for (const sentence of sentences) {
        const sentenceWords = words(sentence);
        if (selected.length > 0 && count >= 40 && count + sentenceWords.length > 70)
            break;
        if (selected.length === 0 && sentenceWords.length > 70)
            return `${sentenceWords.slice(0, 69).join(" ")}…`;
        selected.push(sentence.trim());
        count += sentenceWords.length;
        if (count >= 40)
            break;
    }
    return selected.join(" ").trim();
}
export function descriptionFromProse(body) {
    const text = plainText(body);
    if (text.length <= 150)
        return text;
    const cut = text.slice(0, 150);
    const boundary = cut.lastIndexOf(" ");
    return `${cut.slice(0, boundary >= 100 ? boundary : 149).replace(/[,:;.!?\s]+$/u, "")}…`;
}
function proseOnlyPrompt(input) {
    const legacy = draftPrompt(input);
    const instructions = legacy.replace(/\nOutput EXACTLY this structure[\s\S]*$/u, "").trimEnd();
    return `${instructions}\n\nYour contribution is language, not a serialized newsroom record. Return only the Markdown article body: no title, metadata, labels, JSON, front matter, or commentary. Koios's deterministic manuscript adapter owns those records.`;
}
export const composeNewsroomProse = async ({ voice, term, story, context, ask }) => {
    const prompt = proseOnlyPrompt({ voice, term, story, context });
    const body = canonicalizeSourceUrls(proseContributionBody(await ask(prompt)), [story.url, ...context.map((source) => source.url)]);
    const summary = summaryFromProse(body);
    const draft = Object.freeze({
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
//# sourceMappingURL=prose-contribution.mjs.map