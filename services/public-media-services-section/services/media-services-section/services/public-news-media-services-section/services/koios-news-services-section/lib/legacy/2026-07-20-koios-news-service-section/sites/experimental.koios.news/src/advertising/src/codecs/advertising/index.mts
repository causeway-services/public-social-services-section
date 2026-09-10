import { Mark } from "@emsenn/metroplat";

import type { AdvertisingPolicy } from "../../../lib/advertising/index.mjs";
import { advertisingAdSlotCarrier, type AdvertisingAdSlot } from "../../carriers/advertising/index.mjs";
import { aAdsSlotMark } from "./a-ads.mjs";
import { adsenseAdsTxt, adsenseSlotMark } from "./adsense.mjs";

export type AdvertisingRender = Readonly<{
  kind: "metroplat.advertising.render";
  provider: "adsense" | "a-ads";
  html: string;
  loaderHtml: string;
}>;

export type AdvertisingSlotInput = Readonly<{
  position: string;
  key?: string;
  loci: readonly string[];
  label?: string;
}>;

/** Constructs and validates an advertising slot carrier. */
export function advertisingSlot(input: AdvertisingSlotInput): AdvertisingAdSlot {
  return advertisingAdSlotCarrier.assert(input, `advertising slot ${input.position}`) as AdvertisingAdSlot;
}

/** Returns the first opaque provider render admitted by a policy. */
export function advertisingSlotMark(policy: AdvertisingPolicy, slot: AdvertisingAdSlot): Mark | null {
  return adsenseSlotMark(policy, slot) ?? aAdsSlotMark(policy, slot);
}

/** Reads an opaque advertising render inside the advertising codec boundary. */
export function advertisingRenderHtml(mark: Mark | null): string {
  if (mark === null) return "";
  const value = mark.value as Partial<AdvertisingRender>;
  return value.kind === "metroplat.advertising.render" && typeof value.html === "string" ? value.html : "";
}

/** Reads an opaque advertising loader inside the advertising codec boundary. */
export function advertisingRenderLoaderHtml(mark: Mark | null): string {
  if (mark === null) return "";
  const value = mark.value as Partial<AdvertisingRender>;
  return value.kind === "metroplat.advertising.render" && typeof value.loaderHtml === "string" ? value.loaderHtml : "";
}

/** Returns advertisement slot HTML through the provider codec boundary. */
export function advertisingSlotHtml(policy: AdvertisingPolicy, input: AdvertisingSlotInput): string {
  return advertisingRenderHtml(advertisingSlotMark(policy, advertisingSlot(input)));
}

/** Returns advertisement loader HTML through the provider codec boundary. */
export function advertisingLoaderHtml(policy: AdvertisingPolicy): string {
  return advertisingRenderLoaderHtml(advertisingSlotMark(policy, advertisingSlot({
    position: "loader",
    key: "metroplat.advertising.loader",
    loci: Object.freeze(["page"]),
  })));
}

/** Returns ads.txt text through the provider codec boundary. */
export function advertisingAdsTxt(policy: AdvertisingPolicy): string | null {
  return adsenseAdsTxt(policy);
}
