import { type AdvertisingPolicy } from "@emsenn/organizing-a-content-mill";
export type { AdvertisingPolicy, AdPerformanceBucket, AdPerformanceEvent, AdPerformanceInput, AdPerformanceReading, AdProvider, } from "@emsenn/organizing-a-content-mill";
export { normalizeAdPerformanceInput, readAdPerformance, recordAdPerformance, } from "@emsenn/organizing-a-content-mill";
export declare function advertisingPolicy(adClient: string | undefined, options?: Readonly<{
    aAdsUnits?: readonly string[];
    adSlots?: Readonly<{
        header?: string;
        inArticle?: string;
        footer?: string;
    }>;
}>): AdvertisingPolicy;
export declare const adPerformanceJsonSchema: {
    readonly $id: "producing-content/content-mill/ad-performance-input";
    readonly title: "AdPerformanceInput";
    readonly additionalProperties: false;
    readonly type: "object";
    readonly required: readonly ["provider", "path", "day"];
    readonly properties: {
        readonly provider: {
            readonly anyOf: readonly [{
                readonly const: "adsense";
            }, {
                readonly const: "a-ads";
            }];
        };
        readonly path: {
            readonly minLength: 1;
            readonly pattern: "^/[\\x21-\\x7e]{0,512}$";
            readonly type: "string";
        };
        readonly day: {
            readonly pattern: "^\\d{4}-\\d{2}-\\d{2}$";
            readonly type: "string";
        };
        readonly section: {
            readonly minLength: 1;
            readonly type: "string";
        };
        readonly tags: {
            readonly type: "array";
            readonly items: {
                readonly minLength: 1;
                readonly type: "string";
            };
        };
        readonly impressions: {
            readonly minimum: 0;
            readonly type: "integer";
        };
        readonly clicks: {
            readonly minimum: 0;
            readonly type: "integer";
        };
        readonly revenueMicros: {
            readonly minimum: 0;
            readonly type: "integer";
        };
    };
};
export declare function advertisingContentSecurityPolicy(policy: AdvertisingPolicy): string;
//# sourceMappingURL=index.d.mts.map