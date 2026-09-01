#!/usr/bin/env node
// writer-replay — replay one failed Koios cultivation from the Writer layer.
//
// This is deliberately narrower than another source cycle: the assignment and
// reporting packet stay fixed, so a changed outcome measures the Writer and its
// instructions rather than silently buying different reporting. The previous
// candidate remains on disk. A same-slug replay receives a revision suffix,
// and the provider use, exact prompt digest, gates, source URLs, prior
// manuscript digest, and resulting path are witnessed in Koios-owned data.
import { createHash } from "node:crypto";
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { cultivate, decodeFrontMatterDocument, encodeFrontMatterDocument, } from "@emsenn/organizing-a-content-farm";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "./config.mjs";
import { koiosFarmProperty } from "./demand.mjs";
import { enrichCandidateDraftInternalLinkGuidance, normalizeCandidateReferences, } from "./researching/sourcing/source-cycle.mjs";
const SITE_ROOT = dirname(DEFAULT_CONTENT_PRODUCTION_CONFIG);
const SUBJECT_STORE = join(SITE_ROOT, "store/decolonization/as-climate-and-conflict-collide-indigenous-leaders-confront-overlapping-crises-at-the-un.json");
const CONTEXT_STORE = join(SITE_ROOT, "store/decolonization/africa-s-greater-horn-region-is-facing-a-looming-polycrisis-fueled-by-conflict-prices-climate-and-disease.json");
const PRIOR_SLUG = "indigenous-leaders-confront-the-collision-of-climate-and-conflict";
const TERM = "extraction and the global south";
const BEAT = "decolonization";
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function claimValue(bundle, predicate) {
    const claims = Array.isArray(bundle["claims"]) ? bundle["claims"] : [];
    for (const claim of claims) {
        if (!isRecord(claim))
            continue;
        const proposition = isRecord(claim["proposition"]) ? claim["proposition"] : {};
        if (proposition["predicate"] !== predicate)
            continue;
        const value = proposition["object"];
        if (typeof value === "string" && value.trim() !== "")
            return value.trim();
    }
    return undefined;
}
function wireStory(path) {
    const value = JSON.parse(readFileSync(path, "utf8"));
    if (!isRecord(value))
        throw new TypeError(`wire bundle is not an object: ${path}`);
    const title = claimValue(value, "title");
    const url = claimValue(value, "url");
    if (title === undefined || url === undefined)
        throw new TypeError(`wire bundle lacks title or URL: ${path}`);
    return Object.freeze({
        kind: "producing-content.syndication-item",
        id: typeof value["subject"] === "string" ? value["subject"] : basename(path, ".json"),
        title,
        url,
        ...(claimValue(value, "summary") === undefined ? {} : { summary: claimValue(value, "summary") }),
        ...(claimValue(value, "published") === undefined ? {} : { published: claimValue(value, "published") }),
    });
}
function digest(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function availablePath(contentDir, requestedSlug) {
    let ordinal = 1;
    let slug = requestedSlug;
    let path = join(contentDir, `${slug}.md`);
    while (existsSync(path)) {
        ordinal += 1;
        slug = `${requestedSlug}-revision-${ordinal}`;
        path = join(contentDir, `${slug}.md`);
    }
    return Object.freeze({ slug, path });
}
function replayLogPath(dataDir, day) {
    return join(dataDir, "records", "writer-replays", day.slice(0, 4), day.slice(5, 7), day.slice(8, 10), `${day}-koios-news-writer-replays.jsonl`);
}
const day = new Date().toISOString().slice(0, 10);
const property = koiosFarmProperty();
const subject = wireStory(SUBJECT_STORE);
const context = wireStory(CONTEXT_STORE);
const priorPath = resolve(property.contentDir, `${PRIOR_SLUG}.md`);
const priorBytes = readFileSync(priorPath, "utf8");
const result = await cultivate(property, {
    at: day,
    term: TERM,
    beat: BEAT,
    items: [subject, context],
    // Freeze the reporting packet and its roles: this operation is explicitly a
    // Writer replay, not a second assignment or source-selection decision.
    select: () => Object.freeze({ story: subject, context: Object.freeze([context]) }),
    dryRun: true,
});
if ("obstruction" in result)
    throw new Error(`writer replay obstructed: ${result.evidence}`);
const cultivation = result;
const requestedSlug = String(cultivation.document.frontMatter["slug"] ?? cultivation.slug);
const destination = availablePath(resolve(property.contentDir), requestedSlug);
const document = decodeFrontMatterDocument(encodeFrontMatterDocument(cultivation.document));
const nextDocument = Object.freeze({
    ...document,
    frontMatter: Object.freeze({
        ...document.frontMatter,
        slug: destination.slug,
        draft: true,
        koios: Object.freeze({
            ...(isRecord(document.frontMatter["koios"]) ? document.frontMatter["koios"] : {}),
            replayed_from: PRIOR_SLUG,
            replay_layer: "writer",
        }),
    }),
});
mkdirSync(dirname(destination.path), { recursive: true });
writeFileSync(destination.path, encodeFrontMatterDocument(nextDocument), "utf8");
const references = normalizeCandidateReferences(destination.path);
const internalLinks = enrichCandidateDraftInternalLinkGuidance(destination.path);
const finalBytes = readFileSync(destination.path, "utf8");
const record = Object.freeze({
    kind: "koios.writer-replay",
    at: new Date().toISOString(),
    replayFrom: "writer",
    assignment: Object.freeze({ term: TERM, beat: BEAT }),
    sources: Object.freeze([
        Object.freeze({ role: "subject", title: subject.title, url: subject.url }),
        Object.freeze({ role: "supporting-context", title: context.title, url: context.url }),
    ]),
    prior: Object.freeze({ slug: PRIOR_SLUG, path: priorPath, digest: digest(priorBytes) }),
    result: Object.freeze({
        slug: destination.slug,
        path: destination.path,
        digest: digest(finalBytes),
        shippedByMechanicalGates: cultivation.shipped,
        gates: cultivation.gates,
        usage: cultivation.usage,
        inference: Object.freeze({ provider: property.provider ?? "nim", model: property.model ?? "provider-default" }),
        composition: cultivation.composition,
        references,
        internalLinks,
    }),
});
const logPath = replayLogPath(resolve(property.dataDir), day);
mkdirSync(dirname(logPath), { recursive: true });
appendFileSync(logPath, `${JSON.stringify(record)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
//# sourceMappingURL=writer-replay.mjs.map