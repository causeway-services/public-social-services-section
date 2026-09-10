import { carrierFrom, type FromSchema } from "@emsenn/metroplat/carriers";

export const advertisingPolicySchema = {
  $id: "metroplat/advertising/policy",
  type: "object",
  required: ["enabled", "providers", "constraints"],
  properties: {
    enabled: { type: "boolean" },
    providers: {
      type: "object",
      properties: {
        adsense: {
          type: "object",
          required: ["client"],
          properties: {
            client: { type: "string", minLength: 1 },
          },
          additionalProperties: false,
        },
        aAds: {
          type: "object",
          required: ["units"],
          properties: {
            units: { type: "array", items: { type: "string", minLength: 1 } },
          },
          additionalProperties: false,
        },
      },
      additionalProperties: false,
    },
    constraints: { type: "array", items: { type: "string", minLength: 1 } },
  },
  additionalProperties: false,
  title: "AdvertisingPolicy",
  description: "Admits configured advertising providers and policy constraints.",
} as const;

export const advertisingAdSlotSchema = {
  $id: "metroplat/advertising/ad-slot",
  type: "object",
  required: ["position", "loci"],
  properties: {
    position: { type: "string", minLength: 1 },
    loci: { type: "array", items: { type: "string", minLength: 1 } },
    key: { type: "string", minLength: 1 },
    label: { type: "string", minLength: 1 },
  },
  additionalProperties: false,
  title: "AdvertisingAdSlot",
  description: "Admits an advertisement slot name and the page loci it may attach to.",
} as const;

export const advertisingImpressionEventSchema = {
  $id: "metroplat/advertising/impression-event",
  type: "object",
  required: ["provider", "path", "day", "kind", "at", "impressions", "clicks", "revenueMicros"],
  properties: {
    provider: { enum: ["adsense", "a-ads"] },
    path: { type: "string", pattern: "^/[\\x21-\\x7e]{0,512}$" },
    day: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$" },
    kind: { enum: ["impression", "click", "revenue", "adjustment"] },
    at: { type: "string", minLength: 1 },
    section: { type: "string", minLength: 1 },
    tags: { type: "array", items: { type: "string", minLength: 1 } },
    impressions: { type: "integer", minimum: 0 },
    clicks: { type: "integer", minimum: 0 },
    revenueMicros: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
  title: "AdvertisingImpressionEvent",
  description: "Admits an ad-performance event with provider, page, time, and counter fields.",
} as const;

const bucketSchema = {
  type: "object",
  required: ["impressions", "clicks", "revenueMicros", "rpmMicros", "cpcMicros"],
  properties: {
    impressions: { type: "integer", minimum: 0 },
    clicks: { type: "integer", minimum: 0 },
    revenueMicros: { type: "integer", minimum: 0 },
    rpmMicros: { type: "integer", minimum: 0 },
    cpcMicros: { type: "integer", minimum: 0 },
  },
  additionalProperties: false,
} as const;

export const advertisingPerformanceReadingSchema = {
  $id: "metroplat/advertising/performance-reading",
  type: "object",
  required: ["eventCount", "totals", "byProvider", "bySection", "byTag", "constraints"],
  properties: {
    eventCount: { type: "integer", minimum: 0 },
    totals: bucketSchema,
    byProvider: {
      type: "object",
      required: ["adsense", "a-ads"],
      properties: {
        adsense: bucketSchema,
        "a-ads": bucketSchema,
      },
      additionalProperties: false,
    },
    bySection: { type: "object", additionalProperties: bucketSchema },
    byTag: { type: "object", additionalProperties: bucketSchema },
    constraints: { type: "array", items: { type: "string", minLength: 1 } },
  },
  additionalProperties: false,
  title: "AdvertisingPerformanceReading",
  description: "Admits a folded ad-performance reading with total and grouped buckets.",
} as const;

export type AdvertisingPolicyCarrierValue = FromSchema<typeof advertisingPolicySchema>;
export type AdvertisingAdSlot = FromSchema<typeof advertisingAdSlotSchema>;
export type AdvertisingImpressionEventCarrierValue = FromSchema<typeof advertisingImpressionEventSchema>;
export type AdvertisingPerformanceReadingCarrierValue = FromSchema<typeof advertisingPerformanceReadingSchema>;

/** Validates and asserts advertising policy carriers. */
export const advertisingPolicyCarrier = carrierFrom(advertisingPolicySchema);

/** Validates and asserts advertising ad-slot carriers. */
export const advertisingAdSlotCarrier = carrierFrom(advertisingAdSlotSchema);

/** Validates and asserts advertising impression-event carriers. */
export const advertisingImpressionEventCarrier = carrierFrom(advertisingImpressionEventSchema);

/** Validates and asserts advertising performance-reading carriers. */
export const advertisingPerformanceReadingCarrier = carrierFrom(advertisingPerformanceReadingSchema);
