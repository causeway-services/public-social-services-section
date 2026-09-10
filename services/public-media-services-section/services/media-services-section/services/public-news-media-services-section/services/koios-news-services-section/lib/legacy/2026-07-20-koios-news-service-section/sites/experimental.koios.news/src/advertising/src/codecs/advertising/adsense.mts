import { Mark } from "@emsenn/metroplat";

import type { AdvertisingPolicy } from "../../../lib/advertising/index.mjs";
import type { AdvertisingAdSlot } from "../../carriers/advertising/index.mjs";

export type AdsenseRender = Readonly<{
  kind: "metroplat.advertising.render";
  provider: "adsense";
  html: string;
  loaderHtml: string;
}>;

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

/** Returns an opaque AdSense slot render for a configured policy. */
export function adsenseSlotMark(policy: AdvertisingPolicy, slot: AdvertisingAdSlot): Mark | null {
  const adsense = policy.providers.adsense;
  if (adsense === undefined) return null;
  const position = escapeHtml(slot.position);
  const client = escapeHtml(adsense.client);
  const unit = escapeHtml(slot.key ?? slot.position);
  return new Mark(Object.freeze({
    kind: "metroplat.advertising.render" as const,
    provider: "adsense" as const,
    html: [
      `<aside class="koios-ad-slot" data-koios-ad-slot="${position}" data-provider="adsense">`,
      `<ins class="adsbygoogle" style="display:block" data-ad-client="${client}" data-ad-slot="${unit}" data-ad-format="auto" data-full-width-responsive="true"></ins>`,
      "<script>(adsbygoogle=window.adsbygoogle||[]).push({});</script>",
      "</aside>",
    ].join(""),
    loaderHtml: `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}" crossorigin="anonymous"></script>`,
  }));
}

/** Returns an ads.txt line for a configured AdSense policy. */
export function adsenseAdsTxt(policy: AdvertisingPolicy): string | null {
  const client = policy.providers.adsense?.client;
  if (client === undefined) return null;
  return `google.com, ${client.replace(/^ca-/u, "")}, DIRECT, f08c47fec0942fa0\n`;
}
