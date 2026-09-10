import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { pendingPrimaryStaticRelease, settlePrimaryStaticRelease } from "../dist/management/cloudflare-primary-release-contract.mjs";
import { releaseClosedCorrection } from "../dist/management/correction-release.mjs";
import { appendKoiosAct, readKoiosLedger } from "../dist/management/ledger.mjs";

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "koios-primary-release-client-"));
  const data = join(root, "data");
  const candidate = join(root, "candidate");
  const provider = join(root, "provider");
  mkdirSync(join(candidate, "posts", "fresh-story"), { recursive: true });
  mkdirSync(join(provider, "src"), { recursive: true });
  writeFileSync(join(candidate, "index.html"), "<h1>Koios</h1>\n");
  writeFileSync(join(candidate, "posts", "fresh-story", "index.html"), "<article>Fresh story.</article>\n");
  writeFileSync(join(candidate, "_headers"), "/*\n  Referrer-Policy: no-referrer\n");
  writeFileSync(join(candidate, "manifest.json"), `${JSON.stringify({ kind: "koios.static-publication-manifest", node: "koios-news", canonicalOrigin: "https://koios.news", profile: "cutover-candidate", authority: "non-authoritative-cutover-candidate", livePublicationWitnessDigest: `sha256:${"9".repeat(64)}`, artifacts: [] }, null, 2)}\n`);
  writeFileSync(join(provider, "package.json"), JSON.stringify({ type: "module", bin: { "solicit-primary-release": "./src/provider.mjs", "invoke-primary-release": "./src/provider.mjs" } }));
  writeFileSync(join(provider, "src/provider.mjs"), `import { readFileSync } from "node:fs";
const activity = JSON.parse(readFileSync(0, "utf8"));
const operation = process.argv[process.argv.indexOf("--operation") + 1];
if (operation === "solicit-primary-release") {
  const request = activity.object.sourceActivity.object.attachment[0];
  const effects = ["read-one-customer-supplied-static-candidate", "append-provider-local-release-evidence"];
  const bindings = { artifactManifestDigest: request.artifact.manifestDigest, assignmentId: request.publication.assignmentId, slug: request.publication.slug, target: request.target, effects };
  process.stdout.write(JSON.stringify({ "@context": "https://www.w3.org/ns/activitystreams", id: "urn:test:offer", type: "Offer", actor: "urn:ame:resource-brokerage-team", target: activity.actor, object: { type: "ExecutableServiceOffer", contract: "cloudflare-primary-static-release/v1", request, requestDigest: "sha256:test-request", bindings, effects } }));
} else {
  process.stdout.write(JSON.stringify({ "@context": "https://www.w3.org/ns/activitystreams", id: "urn:test:receipt", type: "Accept", actor: "urn:ame:resource-brokerage-team", target: activity.actor, object: { type: "CloudflarePrimaryStaticReleaseReceipt", contract: "cloudflare-primary-static-release/v1", disposition: "released", routeMutated: false, dnsMutated: false, vpsPublicOrigin: false, credentialRecorded: false } }));
}
`);
  return { root, data, candidate, provider };
}

test("an unreleased candidate is retried through the provider and then leaves the pending queue", () => {
  const found = fixture();
  const prior = process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT;
  try {
    const manifestBytes = readFileSync(join(found.candidate, "manifest.json"));
    const manifestDigest = `sha256:${createHash("sha256").update(manifestBytes).digest("hex")}`;
    appendKoiosAct({ dataRoot: found.data, ledger: "shadow-deliveries", instant: "2026-07-19T03:40:00.000Z", act: "candidate.projected", subject: "urn:koios:assignment:fresh-story", data: { slug: "fresh-story", manifestDigest } });
    const pending = pendingPrimaryStaticRelease(found.data, found.candidate);
    assert.equal(pending?.slug, "fresh-story");
    process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT = found.provider;
    const settled = settlePrimaryStaticRelease({ assignmentId: pending.assignmentId, slug: pending.slug, candidateDir: found.candidate, dataDir: found.data, now: "2026-07-19T03:41:00.000Z" });
    assert.equal(settled.accepted, true);
    assert.equal(settled.outcome.object.disposition, "released");
    assert.equal(pendingPrimaryStaticRelease(found.data, found.candidate), undefined);
  } finally {
    if (prior === undefined) delete process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT; else process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT = prior;
    rmSync(found.root, { recursive: true, force: true });
  }
});

test("a closed correction contracts the same Cloudflare releaser and remains resumable until accepted", () => {
  const found = fixture();
  const prior = process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT;
  try {
    const manifestBytes = readFileSync(join(found.candidate, "manifest.json"));
    const manifestDigest = `sha256:${createHash("sha256").update(manifestBytes).digest("hex")}`;
    process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT = found.provider;
    const settled = releaseClosedCorrection({
      correction: {
        correctionId: "fresh-story-correction-2026-07-19-test",
        slug: "fresh-story",
        manuscriptDigest: `sha256:${"1".repeat(64)}`,
        editorialAcceptanceDigest: `sha256:${"2".repeat(64)}`,
        triggerActDigest: `sha256:${"3".repeat(64)}`,
        priorManifestDigest: `sha256:${"4".repeat(64)}`,
        manifestDigest,
        routeDigests: {},
        routeChanges: {},
      },
      outputDir: found.candidate,
      dataDir: found.data,
      now: "2026-07-19T04:30:00.000Z",
    });
    assert.equal(settled.disposition, "released");
    assert.equal(settled.release.accepted, true);
    assert.equal(pendingPrimaryStaticRelease(found.data, found.candidate), undefined);
    const correctionActs = readKoiosLedger(found.data, "corrections-omissions");
    assert.equal(correctionActs.at(-1)?.act, "correction.publication.released");
    assert.equal(correctionActs.at(-1)?.data.coldRedGatePublicOrigin, false);
  } finally {
    if (prior === undefined) delete process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT; else process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT = prior;
    rmSync(found.root, { recursive: true, force: true });
  }
});
