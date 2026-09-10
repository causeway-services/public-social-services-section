import { Mark } from "@emsenn/metroplat";

import { chooseUnit, type AdvertisingPolicy } from "../../../lib/advertising/index.mjs";
import type { AdvertisingAdSlot } from "../../carriers/advertising/index.mjs";

export type AAdsRender = Readonly<{
  kind: "metroplat.advertising.render";
  provider: "a-ads";
  html: string;
  loaderHtml: "";
}>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

/** Returns an opaque A-Ads slot render for a configured policy. */
export function aAdsSlotMark(policy: AdvertisingPolicy, slot: AdvertisingAdSlot): Mark | null {
  const units = policy.providers.aAds?.units ?? [];
  const unit = chooseUnit(units, slot.key ?? slot.position);
  if (unit === undefined) return null;
  const position = escapeHtml(slot.position);
  const escapedUnit = escapeHtml(unit);
  return new Mark(Object.freeze({
    kind: "metroplat.advertising.render" as const,
    provider: "a-ads" as const,
    html: [
      `<aside class="koios-ad-slot" data-koios-ad-slot="${position}" data-provider="a-ads" data-unit="${escapedUnit}">`,
      `<iframe title="Advertisement" data-aa="${escapedUnit}" src="https://acceptable.a-ads.com/${escapeHtml(encodeURIComponent(unit))}/?size=Adaptive" loading="lazy"></iframe>`,
      "</aside>",
    ].join(""),
    loaderHtml: "",
  }));
}
