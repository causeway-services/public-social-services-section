// publishing/managing/advertising — advertising policy after publication.
//
// This module is deliberately policy-shaped, not vendor-shaped. Koios can serve
// ads, publish ads.txt, and widen CSP only when the configured policy permits it.

import {
  AdPerformanceInputSchema,
  aAdsProvider,
  adsenseProvider,
  advertisingContentSecurityPolicyFromProviders,
  advertisingPolicy as producingContentAdvertisingPolicy,
  type AdvertisingPolicy,
  type AdPerformanceBucket,
  type AdPerformanceEvent,
  type AdPerformanceInput,
  type AdPerformanceReading,
  type AdProvider,
} from "@emsenn/organizing-a-content-mill";

export type {
  AdvertisingPolicy,
  AdPerformanceBucket,
  AdPerformanceEvent,
  AdPerformanceInput,
  AdPerformanceReading,
  AdProvider,
} from "@emsenn/organizing-a-content-mill";

export {
  normalizeAdPerformanceInput,
  readAdPerformance,
  recordAdPerformance,
} from "@emsenn/organizing-a-content-mill";

export function advertisingPolicy(adClient: string | undefined, options: Readonly<{
  aAdsUnits?: readonly string[];
  adSlots?: Readonly<{ header?: string; inArticle?: string; footer?: string }>;
}> = {}): AdvertisingPolicy {
  const slots = options.adSlots === undefined
    ? undefined
    : {
      ...(options.adSlots.header === undefined ? {} : { header: options.adSlots.header }),
      ...(options.adSlots.inArticle === undefined ? {} : { "in-article": options.adSlots.inArticle }),
      ...(options.adSlots.footer === undefined ? {} : { footer: options.adSlots.footer }),
    };
  return producingContentAdvertisingPolicy({
    providers: [
      adsenseProvider({
        ...(adClient === undefined ? {} : { client: adClient }),
        ...(slots === undefined ? {} : { slots }),
      }),
      aAdsProvider({
        ...(options.aAdsUnits === undefined ? {} : { units: options.aAdsUnits }),
      }),
    ],
  });
}

export const adPerformanceJsonSchema = AdPerformanceInputSchema;

export function advertisingContentSecurityPolicy(policy: AdvertisingPolicy): string {
  return advertisingContentSecurityPolicyFromProviders(policy.providers);
}
