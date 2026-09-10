export type AdvertisingProvider = "adsense" | "a-ads";

export type AdvertisingPolicy = Readonly<{
  enabled: boolean;
  providers: Readonly<{
    adsense?: Readonly<{ client: string }>;
    aAds?: Readonly<{ units: readonly string[] }>;
  }>;
  constraints: readonly string[];
}>;

export type AdvertisingPolicyInput = Readonly<{
  adsense?: Readonly<{ client?: string | null }>;
  aAds?: Readonly<{ units?: readonly (string | null | undefined)[] | null }>;
  constraints?: readonly string[];
}>;

export type AdvertisingCspDirective =
  | "script-src"
  | "img-src"
  | "connect-src"
  | "frame-src";

export type AdvertisingCspFragment = Readonly<Record<AdvertisingCspDirective, readonly string[]>>;

export type AdPerformanceEventKind = "impression" | "click" | "revenue" | "adjustment";

export type AdPerformanceEvent = Readonly<{
  provider: AdvertisingProvider;
  path: string;
  day: string;
  kind: AdPerformanceEventKind;
  at: string;
  section?: string;
  tags?: readonly string[];
  impressions: number;
  clicks: number;
  revenueMicros: number;
}>;

export type AdPerformanceBucket = Readonly<{
  impressions: number;
  clicks: number;
  revenueMicros: number;
  rpmMicros: number;
  cpcMicros: number;
}>;

export type AdPerformanceReading = Readonly<{
  eventCount: number;
  totals: AdPerformanceBucket;
  byProvider: Readonly<Record<AdvertisingProvider, AdPerformanceBucket>>;
  bySection: Readonly<Record<string, AdPerformanceBucket>>;
  byTag: Readonly<Record<string, AdPerformanceBucket>>;
  constraints: readonly string[];
}>;

export const AD_PERFORMANCE_CONSTRAINTS = Object.freeze([
  "Aggregate ad-performance records only; never IP addresses, user agents, cookies, or reader identifiers.",
  "Performance readings are folded from provider, path, day, section, tag, and counter fields only.",
] as const);

const EMPTY_CSP_FRAGMENT: AdvertisingCspFragment = Object.freeze({
  "script-src": Object.freeze([]),
  "img-src": Object.freeze([]),
  "connect-src": Object.freeze([]),
  "frame-src": Object.freeze([]),
});

function text(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed === undefined || trimmed === "" ? undefined : trimmed;
}

function unique(values: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(values)]);
}

function configuredUnits(units: readonly (string | null | undefined)[] | null | undefined): readonly string[] {
  return unique((units ?? []).flatMap((unit) => {
    const value = text(unit);
    return value === undefined ? [] : [value];
  }));
}

/** Constructs an advertising policy from configured provider data. */
export function advertisingPolicy(input: AdvertisingPolicyInput = {}): AdvertisingPolicy {
  const adsenseClient = text(input.adsense?.client);
  const aAdsUnits = configuredUnits(input.aAds?.units);
  const providers: AdvertisingPolicy["providers"] = Object.freeze({
    ...(adsenseClient === undefined ? {} : { adsense: Object.freeze({ client: adsenseClient }) }),
    ...(aAdsUnits.length === 0 ? {} : { aAds: Object.freeze({ units: aAdsUnits }) }),
  });
  return Object.freeze({
    enabled: providers.adsense !== undefined || providers.aAds !== undefined,
    providers,
    constraints: Object.freeze([...(input.constraints ?? AD_PERFORMANCE_CONSTRAINTS)]),
  });
}

/** Returns the public privacy paragraph for an advertising policy. */
export function advertisingPrivacyParagraph(policy: AdvertisingPolicy): string {
  if (!policy.enabled) return "Koios.News has no configured third-party advertising providers.";
  const providers = [
    policy.providers.adsense === undefined ? undefined : "Google AdSense",
    policy.providers.aAds === undefined ? undefined : "A-Ads",
  ].filter((value): value is string => value !== undefined);
  return `Koios.News may show advertisement slots from ${providers.join(" and ")}. ${policy.constraints.join(" ")}`;
}

/** Returns provider host allowances implied by an advertising policy. */
export function advertisingCspFragment(policy: AdvertisingPolicy): AdvertisingCspFragment {
  if (!policy.enabled) return EMPTY_CSP_FRAGMENT;
  const scriptSrc: string[] = [];
  const imgSrc: string[] = [];
  const connectSrc: string[] = [];
  const frameSrc: string[] = [];
  if (policy.providers.adsense !== undefined) {
    scriptSrc.push("https://pagead2.googlesyndication.com");
    imgSrc.push("https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net");
    connectSrc.push("https://pagead2.googlesyndication.com", "https://googleads.g.doubleclick.net");
    frameSrc.push("https://googleads.g.doubleclick.net", "https://tpc.googlesyndication.com");
  }
  if (policy.providers.aAds !== undefined) {
    scriptSrc.push("https://acceptable.a-ads.com");
    imgSrc.push("https://acceptable.a-ads.com");
    connectSrc.push("https://acceptable.a-ads.com");
    frameSrc.push("https://acceptable.a-ads.com");
  }
  return Object.freeze({
    "script-src": unique(scriptSrc),
    "img-src": unique(imgSrc),
    "connect-src": unique(connectSrc),
    "frame-src": unique(frameSrc),
  });
}

/** Chooses a deterministic unit from a non-empty unit list. */
export function chooseUnit(units: readonly string[], key: string): string | undefined {
  if (units.length === 0) return undefined;
  let hash = 2166136261;
  for (let index = 0; index < key.length; index += 1) {
    hash ^= key.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return units[(hash >>> 0) % units.length];
}

function emptyBucket(): AdPerformanceBucket {
  return Object.freeze({
    impressions: 0,
    clicks: 0,
    revenueMicros: 0,
    rpmMicros: 0,
    cpcMicros: 0,
  });
}

function mutableBucket(): { impressions: number; clicks: number; revenueMicros: number } {
  return { impressions: 0, clicks: 0, revenueMicros: 0 };
}

function addEvent(bucket: { impressions: number; clicks: number; revenueMicros: number }, event: AdPerformanceEvent): void {
  bucket.impressions += Math.trunc(event.impressions);
  bucket.clicks += Math.trunc(event.clicks);
  bucket.revenueMicros += Math.trunc(event.revenueMicros);
}

function freezeBucket(bucket: { impressions: number; clicks: number; revenueMicros: number }): AdPerformanceBucket {
  const rpmMicros = bucket.impressions === 0 ? 0 : Math.trunc((bucket.revenueMicros * 1000) / bucket.impressions);
  const cpcMicros = bucket.clicks === 0 ? 0 : Math.trunc(bucket.revenueMicros / bucket.clicks);
  return Object.freeze({
    impressions: bucket.impressions,
    clicks: bucket.clicks,
    revenueMicros: bucket.revenueMicros,
    rpmMicros,
    cpcMicros,
  });
}

function freezeBuckets<T extends string>(buckets: ReadonlyMap<T, { impressions: number; clicks: number; revenueMicros: number }>): Readonly<Record<T, AdPerformanceBucket>> {
  return Object.freeze(Object.fromEntries(
    [...buckets.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, bucket]) => [key, freezeBucket(bucket)]),
  ) as Record<T, AdPerformanceBucket>);
}

function bucketFor<T extends string>(
  buckets: Map<T, { impressions: number; clicks: number; revenueMicros: number }>,
  key: T,
): { impressions: number; clicks: number; revenueMicros: number } {
  const existing = buckets.get(key);
  if (existing !== undefined) return existing;
  const next = mutableBucket();
  buckets.set(key, next);
  return next;
}

/** Folds ad performance events into totals and grouped buckets. */
export function foldAdPerformance(events: readonly AdPerformanceEvent[]): AdPerformanceReading {
  const totals = mutableBucket();
  const byProvider = new Map<AdvertisingProvider, { impressions: number; clicks: number; revenueMicros: number }>();
  const bySection = new Map<string, { impressions: number; clicks: number; revenueMicros: number }>();
  const byTag = new Map<string, { impressions: number; clicks: number; revenueMicros: number }>();
  for (const event of events) {
    addEvent(totals, event);
    addEvent(bucketFor(byProvider, event.provider), event);
    if (event.section !== undefined) addEvent(bucketFor(bySection, event.section), event);
    for (const tag of event.tags ?? []) addEvent(bucketFor(byTag, tag), event);
  }
  const frozenByProvider = freezeBuckets(byProvider);
  return Object.freeze({
    eventCount: events.length,
    totals: events.length === 0 ? emptyBucket() : freezeBucket(totals),
    byProvider: Object.freeze({
      adsense: frozenByProvider.adsense ?? emptyBucket(),
      "a-ads": frozenByProvider["a-ads"] ?? emptyBucket(),
    }),
    bySection: freezeBuckets(bySection),
    byTag: freezeBuckets(byTag),
    constraints: AD_PERFORMANCE_CONSTRAINTS,
  });
}
