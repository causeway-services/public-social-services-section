import type { ThemedPageStyleClaim } from "@emsenn/metroplat/projections/themed-page";

export type AdvertisingStyleTokens = Readonly<{
  inkSoft: string;
  rule: string;
}>;

/** Returns themed-page style claims for advertisement slots. */
export function advertisingStyleClaims(tokens: AdvertisingStyleTokens): readonly ThemedPageStyleClaim[] {
  return Object.freeze([
    Object.freeze({
      id: "koios-ad-slot",
      locus: "main",
      selector: ".metroplat-themed-page .koios-ad-slot",
      declarations: Object.freeze({
        "border-bottom": `2px solid ${tokens.rule}`,
        "border-top": `2px solid ${tokens.rule}`,
        color: tokens.inkSoft,
        margin: "1.6rem auto",
        padding: "0.7rem 0",
        "text-align": "center",
      }),
    }),
    Object.freeze({
      id: "koios-ad-frame",
      locus: "main",
      selector: ".metroplat-themed-page .koios-ad-slot iframe",
      declarations: Object.freeze({
        border: "0",
        width: "min(100%, 44rem)",
        "min-height": "90px",
      }),
    }),
  ]);
}
