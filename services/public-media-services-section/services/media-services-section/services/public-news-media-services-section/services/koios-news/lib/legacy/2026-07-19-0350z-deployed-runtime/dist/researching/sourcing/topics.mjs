// researching/sourcing/topics — the canonical Koios topic taxonomy.
//
// News has an official subject taxonomy the way mathematics has MSC and the way
// the library world has UDC: IPTC Media Topics, the controlled, nested
// vocabulary the IPTC maintains and that the NINJS format carries as a record's
// `subjects`. Koios already emits NINJS, so its topics ARE IPTC Media Topics.
//
// Public-facing these are "Topics"; in NINJS they are "subjects" identified by
// their medtop QCode. A production beat (a wire + seed vocabulary + an editorial
// desk) is pinned to one topic. "Collapse" is NOT a topic — it is a
// cross-cutting lens that emerges from coverage across these neutral subjects,
// never a top-level frame.
//
// Top-level QCodes are the verified IPTC Media Topics codes. Sub-topics nest
// under a parent and inherit the parent's medtop subject for NINJS unless they
// carry their own verified code — Koios does not fabricate QCodes.
const TOPIC_LIST = Object.freeze([
    // ---- top-level IPTC Media Topics Koios actively covers ----
    Object.freeze({ slug: "technology", label: "Technology", subject: "science and technology", qcode: "medtop:12000000", parent: null }),
    Object.freeze({ slug: "economy", label: "Economy", subject: "economy, business and finance", qcode: "medtop:04000000", parent: null }),
    Object.freeze({ slug: "culture", label: "Culture", subject: "arts, culture, entertainment and media", qcode: "medtop:01000000", parent: null }),
    Object.freeze({ slug: "politics", label: "Politics", subject: "politics", qcode: "medtop:10000000", parent: null }),
    Object.freeze({ slug: "war", label: "War", subject: "conflict, war and peace", qcode: "medtop:16000000", parent: null }),
    Object.freeze({ slug: "environment", label: "Environment", subject: "environment", qcode: "medtop:06000000", parent: null }),
    // ---- nested sub-topics (inherit the parent's medtop subject for NINJS) ----
    Object.freeze({ slug: "degrowth", label: "Degrowth", subject: "economy, business and finance", parent: "economy" }),
    Object.freeze({ slug: "decolonization", label: "Decolonization", subject: "politics", parent: "politics" }),
]);
const BY_SLUG = new Map(TOPIC_LIST.map((topic) => [topic.slug, topic]));
/** Every topic, top-level and nested. */
export const KOIOS_TOPICS = TOPIC_LIST;
/** Every top-level topic (the public Topics index). */
export const KOIOS_TOP_LEVEL_TOPICS = Object.freeze(TOPIC_LIST.filter((topic) => topic.parent === null));
/** Look up a topic by slug. */
export function topicBySlug(slug) {
    return BY_SLUG.get(slug);
}
/** The public-facing Topic title for a slug (falls back to a title-cased slug). */
export function topicLabel(slug) {
    return BY_SLUG.get(slug)?.label ?? slug.replace(/(^|-)([a-z])/g, (_, sep, char) => (sep ? " " : "") + char.toUpperCase()).trim();
}
/** The NINJS subject (medtop QCode + name) for a slug, walking to the nearest
 * ancestor that carries a verified code. Returns null when none is known. */
export function topicSubject(slug) {
    let topic = BY_SLUG.get(slug);
    const name = topic?.subject;
    while (topic !== undefined) {
        if (topic.qcode !== undefined)
            return Object.freeze({ code: topic.qcode, name: name ?? topic.subject });
        topic = topic.parent === null ? undefined : BY_SLUG.get(topic.parent);
    }
    return null;
}
/** The chain from a topic up to its top-level ancestor, nearest first. */
export function topicLineage(slug) {
    const chain = [];
    let topic = BY_SLUG.get(slug);
    while (topic !== undefined) {
        chain.push(topic);
        topic = topic.parent === null ? undefined : BY_SLUG.get(topic.parent);
    }
    return Object.freeze(chain);
}
/** The direct children of a topic slug. */
export function topicChildren(slug) {
    return Object.freeze(TOPIC_LIST.filter((topic) => topic.parent === slug));
}
//# sourceMappingURL=topics.mjs.map