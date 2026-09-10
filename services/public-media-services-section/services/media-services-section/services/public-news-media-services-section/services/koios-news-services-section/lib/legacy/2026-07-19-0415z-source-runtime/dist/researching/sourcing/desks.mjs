// researching/sourcing/desks — the desk as a first-class editorial unit.
//
// Koios has two orthogonal structures that the word "department" had been
// quietly conflating:
//
//   - a DESK is topical standing — WHAT the publication covers. A desk owns a
//     beat, a newscable wire (its sources), a seed-term vocabulary, a public
//     section, and an editorial frame. Climate, Finance, Politics, Technology,
//     Degrowth, Decolonization are desks.
//   - a DEPARTMENT is the production line — HOW any desk's stories are made:
//     researching → writing → editing → publishing → managing. A department is
//     a gerund office, not a subject.
//
// Every story passes through every department; it belongs to exactly one desk.
// The pieces of a desk were already in the system but scattered — the wire and
// its sources in the newscable, the seeds and section label in the farm
// property, the frame in the taxonomy. This module gathers them into one desk
// carrier so "the degrowth desk" is a thing you can read, not an emergent
// coincidence of four config blocks. It reads only owned config, the wire
// stores, and (optionally) the published corpus; it asserts no new state.
import { readFileSync } from "node:fs";
import { contentDesk as producingContentDesk, contentDesksReading as producingContentDesksReading, } from "@emsenn/organizing-a-content-farm";
import { koiosFarmProperty, SEED_KEYWORDS } from "../../demand.mjs";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mjs";
import { sourceRollReading } from "./sources.mjs";
import { taxonomyReading } from "./taxonomy.mjs";
function slugLabel(label) {
    return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
/** The wire keywords, read straight from the newscable config. */
function wireKeywords(configPath) {
    const document = JSON.parse(readFileSync(configPath, "utf8"));
    const map = new Map();
    for (const wire of document.newscable?.wires ?? []) {
        if (typeof wire.name === "string")
            map.set(wire.name, typeof wire.keyword === "string" ? wire.keyword : "");
    }
    return map;
}
/** Project every configured wire into a desk reading. */
export function desksReading(options = {}) {
    const configPath = options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG;
    const property = koiosFarmProperty(configPath);
    const roll = sourceRollReading({ configPath });
    const keywords = wireKeywords(configPath);
    const beatCategory = property.beatCategory ?? {};
    // Per-section published counts and freshness, from the optional corpus facts.
    const counts = new Map();
    for (const article of options.articles ?? []) {
        if (article.isPublic === false || article.section === undefined)
            continue;
        const slug = slugLabel(article.section);
        const entry = counts.get(slug) ?? { count: 0 };
        entry.count += 1;
        if (article.published !== undefined && (entry.latest === undefined || article.published > entry.latest))
            entry.latest = article.published;
        counts.set(slug, entry);
    }
    const desks = roll.wires.map((wire) => {
        const beat = wire.name;
        const name = (beatCategory[beat] ?? wire.title.replace(/^Collapse:\s*/i, "").trim()) || beat;
        const sectionSlug = slugLabel(name);
        const seedTerms = SEED_KEYWORDS.filter((seed) => seed.beat === beat).map((seed) => seed.term);
        const count = counts.get(sectionSlug);
        const taxonomy = taxonomyReading({
            taxonomy: "section",
            slug: sectionSlug,
            title: name,
            count: count?.count ?? 0,
            url: `/topics/${sectionSlug}`,
            ...(count?.latest === undefined ? {} : { latestPublished: count.latest }),
        });
        return producingContentDesk({
            beat,
            name,
            wireTitle: wire.title,
            sectionSlug,
            sectionUrl: `/topics/${sectionSlug}`,
            keyword: keywords.get(beat) ?? "",
            description: taxonomy.description,
            editorialFrame: taxonomy.editorialFrame,
            relatedBeats: taxonomy.relatedBeats,
            seedTerms: [...new Set(seedTerms)].sort(),
            sourceCount: wire.sourceCount,
            sources: wire.sources,
            wireItemCount: wire.wireItemCount,
            ...(wire.latestWireItemAt === undefined ? {} : { latestWireItemAt: wire.latestWireItemAt }),
            articleCount: count?.count ?? 0,
        });
    });
    return producingContentDesksReading({
        generatedAt: (options.now ?? (() => new Date().toISOString()))(),
        desks,
        axes: {
            desk: "Topical standing — what Koios covers. A desk owns a beat, a newscable wire and its sources, a seed-term vocabulary, a public section, and an editorial frame.",
            department: "The production line — how a desk's stories are made: researching → writing → editing → publishing → managing. Every story crosses every department; it belongs to one desk.",
        },
    });
}
//# sourceMappingURL=desks.mjs.map