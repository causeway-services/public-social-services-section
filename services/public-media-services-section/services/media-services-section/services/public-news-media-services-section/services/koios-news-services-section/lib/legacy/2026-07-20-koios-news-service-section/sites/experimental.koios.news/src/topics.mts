export type KoiosTopic = Readonly<{
  slug: string;
  label: string;
  subject: string;
  qcode?: string;
  parent: string | null;
}>;

const TOPIC_LIST: readonly KoiosTopic[] = Object.freeze([
  Object.freeze({ slug: "technology", label: "Technology", subject: "science and technology", qcode: "medtop:12000000", parent: null }),
  Object.freeze({ slug: "economy", label: "Economy", subject: "economy, business and finance", qcode: "medtop:04000000", parent: null }),
  Object.freeze({ slug: "culture", label: "Culture", subject: "arts, culture, entertainment and media", qcode: "medtop:01000000", parent: null }),
  Object.freeze({ slug: "politics", label: "Politics", subject: "politics", qcode: "medtop:10000000", parent: null }),
  Object.freeze({ slug: "war", label: "War", subject: "conflict, war and peace", qcode: "medtop:16000000", parent: null }),
  Object.freeze({ slug: "environment", label: "Environment", subject: "environment", qcode: "medtop:06000000", parent: null }),
  Object.freeze({ slug: "degrowth", label: "Degrowth", subject: "economy, business and finance", parent: "economy" }),
  Object.freeze({ slug: "decolonization", label: "Decolonization", subject: "politics", parent: "politics" }),
  Object.freeze({ slug: "crypto-finance", label: "Crypto Finance", subject: "economy, business and finance", parent: "economy" }),
  Object.freeze({ slug: "macro-economy", label: "Macro Economy", subject: "economy, business and finance", parent: "economy" }),
  Object.freeze({ slug: "markets", label: "Markets", subject: "economy, business and finance", parent: "economy" }),
  Object.freeze({ slug: "climate-breakdown", label: "Climate Breakdown", subject: "environment", parent: "environment" }),
  Object.freeze({ slug: "science", label: "Science", subject: "science and technology", parent: "technology" }),
  Object.freeze({ slug: "geopolitics", label: "Geopolitics", subject: "politics", parent: "politics" }),
] as const);

const BY_SLUG: ReadonlyMap<string, KoiosTopic> = new Map(TOPIC_LIST.map((topic) => [topic.slug, topic]));

export const KOIOS_TOPICS: readonly KoiosTopic[] = TOPIC_LIST;

export const KOIOS_TOP_LEVEL_TOPICS: readonly KoiosTopic[] = Object.freeze(TOPIC_LIST.filter((topic) => topic.parent === null));

export function topicBySlug(slug: string): KoiosTopic | undefined {
  return BY_SLUG.get(slug);
}

export function topicLabel(slug: string): string {
  return BY_SLUG.get(slug)?.label ?? slug.replace(/(^|-)([a-z])/gu, (_, sep: string, char: string) => (sep ? " " : "") + char.toUpperCase()).trim();
}

export function topicSubject(slug: string): Readonly<{ code: string; name: string }> | null {
  let topic = BY_SLUG.get(slug);
  const name = topic?.subject;
  while (topic !== undefined) {
    if (topic.qcode !== undefined) return Object.freeze({ code: topic.qcode, name: name ?? topic.subject });
    topic = topic.parent === null ? undefined : BY_SLUG.get(topic.parent);
  }
  return null;
}

export function topicLineage(slug: string): readonly KoiosTopic[] {
  const chain: KoiosTopic[] = [];
  let topic = BY_SLUG.get(slug);
  while (topic !== undefined) {
    chain.push(topic);
    topic = topic.parent === null ? undefined : BY_SLUG.get(topic.parent);
  }
  return Object.freeze(chain);
}

export function topicChildren(slug: string): readonly KoiosTopic[] {
  return Object.freeze(TOPIC_LIST.filter((topic) => topic.parent === slug));
}
