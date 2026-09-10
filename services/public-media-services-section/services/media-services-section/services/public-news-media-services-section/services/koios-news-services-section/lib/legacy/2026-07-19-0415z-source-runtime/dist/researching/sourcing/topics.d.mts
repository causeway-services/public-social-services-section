export type KoiosTopic = Readonly<{
    /** The Koios topic/beat slug (also the production beat id). */
    slug: string;
    /** The public-facing Topic title. */
    label: string;
    /** The IPTC Media Topic name (the NINJS subject name). */
    subject: string;
    /** The medtop QCode, when this topic carries its own verified IPTC code. A
     * sub-topic without one inherits its parent's for NINJS. */
    qcode?: string;
    /** The parent topic slug, or null at the top level. */
    parent: string | null;
}>;
/** Every topic, top-level and nested. */
export declare const KOIOS_TOPICS: readonly KoiosTopic[];
/** Every top-level topic (the public Topics index). */
export declare const KOIOS_TOP_LEVEL_TOPICS: readonly KoiosTopic[];
/** Look up a topic by slug. */
export declare function topicBySlug(slug: string): KoiosTopic | undefined;
/** The public-facing Topic title for a slug (falls back to a title-cased slug). */
export declare function topicLabel(slug: string): string;
/** The NINJS subject (medtop QCode + name) for a slug, walking to the nearest
 * ancestor that carries a verified code. Returns null when none is known. */
export declare function topicSubject(slug: string): Readonly<{
    code: string;
    name: string;
}> | null;
/** The chain from a topic up to its top-level ancestor, nearest first. */
export declare function topicLineage(slug: string): readonly KoiosTopic[];
/** The direct children of a topic slug. */
export declare function topicChildren(slug: string): readonly KoiosTopic[];
//# sourceMappingURL=topics.d.mts.map