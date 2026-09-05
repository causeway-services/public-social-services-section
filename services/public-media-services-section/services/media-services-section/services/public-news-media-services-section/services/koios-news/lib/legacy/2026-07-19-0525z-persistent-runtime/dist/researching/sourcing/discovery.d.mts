import { type WireItem } from "@emsenn/organizing-a-newswire";
import { type CandidateContentKeyword, type CandidateContentSource, type ContentCoverageGap, type ContentDiscoveryReading, type ContentTrendSignal, type ContentTrendsReading } from "@emsenn/organizing-a-content-farm";
export type CoverageGap = ContentCoverageGap;
export type CandidateKeyword = CandidateContentKeyword;
export type CandidateSource = CandidateContentSource;
export type TrendSignal = ContentTrendSignal;
export type TrendsReading = ContentTrendsReading;
export type KeywordDiscoveryReading = ContentDiscoveryReading;
type IntakeItem = WireItem & Readonly<{
    sourcePublished?: string;
}>;
type BeatIntake = Readonly<{
    beat: string;
    storeDir: string;
    items: readonly IntakeItem[];
}>;
/** Read every configured wire's local bundle store and project items. No
 * server: discovery reads the owned evidence substrate directly. */
export declare function readBeatIntake(configPath?: string): Promise<readonly BeatIntake[]>;
export type SourceDrivenNomination = Readonly<{
    kind: "koios.source-driven-nomination";
    beat: string;
    subject: string;
    term: string;
    title: string;
    url: string;
    summary?: string;
    sourcePublished: string;
    ingestedAt?: string;
    evidenceCharacters: number;
    ageDays: number;
    priority: number;
}>;
/** Nominate fresh, not-yet-used events from Koios's admitted source corpus.
 *
 * This is deliberately not a popularity reading. The source desk may notice a
 * warranted event before search demand exists. The title supplies a bounded
 * subject lens; the source bundle remains the evidence and the later research
 * packet must independently pass the assignment-support gate. */
export declare function sourceDrivenNominations(options?: Readonly<{
    configPath?: string;
    excludedUrls?: ReadonlySet<string>;
    now?: string;
    maxAgeDays?: number;
    limit?: number;
}>): Promise<readonly SourceDrivenNomination[]>;
export type KeywordDiscoveryOptions = Readonly<{
    configPath?: string;
    contentDir?: string;
    now?: () => string;
    /** How many candidate keywords to surface per beat (default 6). */
    perBeatKeywords?: number;
    /** A resolved trends probe, folded into the reading when supplied. */
    trends?: TrendProbeResult;
}>;
export declare function keywordDiscoveryReading(options?: KeywordDiscoveryOptions): Promise<KeywordDiscoveryReading>;
export type TrendProbeItem = Readonly<{
    term: string;
    traffic?: string;
}>;
export type TrendProbeResult = Readonly<{
    ok: true;
    source: string;
    items: readonly TrendProbeItem[];
}> | Readonly<{
    ok: false;
    source: string;
    obstruction: string;
}>;
type FetchLike = (url: string) => Promise<{
    ok: boolean;
    status: number;
    text(): Promise<string>;
}>;
/** Probe the keyless public Google Trends daily-trends RSS feed. Returns the
 * trending search terms, or an obstruction value when the feed is unreachable
 * or unparsable — never throws. This is the wider web's attention, folded in
 * the same obstruction-respecting way the Search Console 403 already is. */
export declare function googleTrendsProbe(options?: Readonly<{
    geo?: string;
    fetchImpl?: FetchLike;
}>): Promise<TrendProbeResult>;
export {};
//# sourceMappingURL=discovery.d.mts.map