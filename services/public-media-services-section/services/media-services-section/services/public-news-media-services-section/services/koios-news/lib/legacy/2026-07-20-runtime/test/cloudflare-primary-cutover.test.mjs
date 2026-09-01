import assert from "node:assert/strict";
import test from "node:test";

import { primaryRoute, probeRoutes, validateAuthorityTransferGrant, validatePrimaryGrant, withoutCloudflareBrowserInsights } from "../dist/cloudflare-primary-cutover.mjs";

const bindings = Object.freeze({
  accountId: "account", zoneName: "koios.news", workerName: "koios-news-primary", routePattern: "koios.news/*",
  artifactManifestDigest: "sha256:manifest", livePublicationWitnessDigest: "sha256:witness", deliveryPolicyDigest: "sha256:policy",
});

test("route snapshot refuses ambiguous exact Cloudflare routes", () => {
  assert.equal(primaryRoute([{ id: "one", pattern: "other/*" }], "koios.news/*"), null);
  assert.deepEqual(primaryRoute([{ id: "one", pattern: "koios.news/*", script: "old" }], "koios.news/*"), { id: "one", pattern: "koios.news/*", script: "old" });
  assert.throws(() => primaryRoute([{ id: "one", pattern: "koios.news/*" }, { id: "two", pattern: "koios.news/*" }], "koios.news/*"), /duplicate exact routes/u);
});

test("production probes bind exact public surfaces and one article", () => {
  const artifacts = ["/", "/feed.json", "/sitemap.xml", "/privacy", "/standards", "/corrections", "/posts/example"].map((route) => ({ route, file: `${route}.html`, mediaType: "text/html", digest: `sha256:${route}` }));
  assert.deepEqual(probeRoutes({ profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", canonicalOrigin: "https://koios.news", routeCount: 7, livePublicationWitnessDigest: "sha256:witness", artifacts }).map((value) => value.route), artifacts.map((value) => value.route));
});

test("the obsolete VPS-rollback cutover grant is retired", () => {
  const now = "2026-07-18T23:30:00Z";
  const grant = {
    type: "CloudflarePrimaryCutoverGrant", id: "urn:grant:one", issuer: "urn:ame:leader-movement-team", holder: "urn:ame:koios-news", action: "cloudflare-primary-cutover", bindings,
    effects: ["cloudflare-primary-worker-deploy", "cloudflare-worker-route-snapshot", "cloudflare-worker-route-bind", "public-production-probes", "automatic-route-restore-on-failure", "koios-local-append-only-evidence"],
    issuedAt: now, expiresAt: "2026-07-18T23:59:00Z", authorization: { maxBudgetUsd: 0, persistence: false, delegation: false }, rollback: { automaticOnProbeFailure: true, retainVpsOrigin: true },
  };
  assert.throws(() => validatePrimaryGrant(grant, bindings, now), /retired under cloudflare-public-authority\/v3/u);
});

test("authority-transfer grant retires the VPS public route without automatic restoration", () => {
  const now = "2026-07-18T23:30:00Z";
  const grant = {
    type: "CloudflarePrimaryAuthorityTransferGrant", id: "urn:grant:transfer", issuer: "urn:ame:leader-movement-team", holder: "urn:ame:koios-news", action: "cloudflare-primary-authority-transfer", bindings,
    effects: ["cloudflare-primary-worker-deploy-or-reuse", "cloudflare-worker-route-snapshot", "cloudflare-worker-route-bind", "public-propagation-observation", "koios-local-append-only-evidence"],
    expiresAt: "2026-07-18T23:59:00Z", authorization: { maxBudgetUsd: 0, persistence: false, delegation: false },
    publicAuthority: { from: "cold-red-gate-vps", to: "cloudflare-worker:koios-news-primary", vpsPublicAuthorityRetired: true },
  };
  assert.equal(validateAuthorityTransferGrant(grant, bindings, now).id, grant.id);
  assert.throws(() => validateAuthorityTransferGrant({ ...grant, publicAuthority: { ...grant.publicAuthority, vpsPublicAuthorityRetired: false } }, bindings, now), /does not retire/u);
});

test("production verification isolates Cloudflare Browser Insights as a provider delivery delta", () => {
  const candidate = "<html>\n<body>Koios\n</body>\n</html>\n";
  const delivered = candidate.replace("</body>", '<script defer src="https://static.cloudflareinsights.com/beacon.min.js/v4" integrity="sha" data-cf-beacon=\'{"token":"public"}\' crossorigin="anonymous"></script>\n</body>');
  assert.equal(withoutCloudflareBrowserInsights(delivered), candidate);
});
