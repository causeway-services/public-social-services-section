import { advertisingCspFragment, type AdvertisingPolicy } from "../../../lib/advertising/index.mjs";

/** Returns Koios response headers with advertising CSP allowances. */
export function koiosAdvertisingResponseHeaders(policy: AdvertisingPolicy): Readonly<Record<string, string>> {
  const fragment = advertisingCspFragment(policy);
  const directives = new Map<string, string[]>([
    ["default-src", ["'self'"]],
    ["base-uri", ["'self'"]],
    ["object-src", ["'none'"]],
    ["frame-ancestors", ["'none'"]],
    ["form-action", ["'self'"]],
    ["script-src", ["'self'", "'unsafe-inline'", ...fragment["script-src"]]],
    ["style-src", ["'self'", "'unsafe-inline'"]],
    ["img-src", ["'self'", "data:", ...fragment["img-src"]]],
    ["connect-src", ["'self'", ...fragment["connect-src"]]],
    ["frame-src", ["'self'", ...fragment["frame-src"]]],
  ]);
  const contentSecurityPolicy = [...directives.entries()]
    .map(([name, values]) => `${name} ${[...new Set(values)].join(" ")}`)
    .join("; ");
  return Object.freeze({ "content-security-policy": contentSecurityPolicy });
}
