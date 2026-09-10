import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { pendingPrimaryStaticRelease, settlePrimaryStaticRelease } from "../dist/management/cloudflare-primary-release-contract.mjs";
import { appendKoiosAct } from "../dist/management/ledger.mjs";

function rawNi(value) { return `ni:///sha-256;${createHash("sha256").update(value).digest("base64url")}`; }

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "koios-primary-release-client-"));
  const data = join(root, "data");
  const candidate = join(root, "candidate");
  mkdirSync(join(candidate, "posts", "fresh-story"), { recursive: true });
  const index = "<h1>Koios</h1>\n";
  const article = "<article>Fresh story.</article>\n";
  const headers = "/*\n  Referrer-Policy: no-referrer\n";
  writeFileSync(join(candidate, "index.html"), index);
  writeFileSync(join(candidate, "posts", "fresh-story", "index.html"), article);
  writeFileSync(join(candidate, "_headers"), headers);
  const manifest = {
    kind: "koios.static-publication-manifest",
    node: "koios-news",
    canonicalOrigin: "https://koios.news",
    profile: "cutover-candidate",
    authority: "non-authoritative-cutover-candidate",
    livePublicationWitnessDigest: rawNi("publication-witness"),
    artifacts: [
      { route: "/", file: "index.html", mediaType: "text/html", bytes: Buffer.byteLength(index), digest: rawNi(index) },
      { route: "/posts/fresh-story", file: "posts/fresh-story/index.html", mediaType: "text/html", bytes: Buffer.byteLength(article), digest: rawNi(article) },
      { route: "urn:cloudflare:_headers", file: "_headers", mediaType: "text/plain", bytes: Buffer.byteLength(headers), digest: rawNi(headers) },
    ],
  };
  writeFileSync(join(candidate, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return { root, data, candidate };
}

test("Koios settles primary packaging through its sovereign account while leaving the unreleased candidate pending", () => {
  const found = fixture();
  try {
    const manifestDigest = rawNi(readFileSync(join(found.candidate, "manifest.json")));
    appendKoiosAct({ dataRoot: found.data, ledger: "shadow-deliveries", instant: "2099-07-19T03:40:00.000Z", act: "candidate.projected", subject: "urn:koios:assignment:fresh-story", data: { slug: "fresh-story", manifestDigest } });
    const pending = pendingPrimaryStaticRelease(found.data, found.candidate);
    assert.equal(pending?.slug, "fresh-story");
    const settled = settlePrimaryStaticRelease({ assignmentId: pending.assignmentId, slug: pending.slug, candidateDir: found.candidate, dataDir: found.data, now: "2099-07-19T03:41:00.000Z", executionMode: "dry-run" });
    assert.equal(settled.accepted, false);
    assert.equal(settled.outcome.type, "Accept");
    assert.equal(settled.outcome.object.disposition, "packaged");
    assert.deepEqual(settled.outcome.object.effect.outcome, { positiveEvidence: true, negativeEvidence: false });
    assert.match(settled.outcome.object.effect.witness, /^ni:\/\/\/sha-256;/u);
    assert.equal(pendingPrimaryStaticRelease(found.data, found.candidate)?.slug, "fresh-story");
  } finally { rmSync(found.root, { recursive: true, force: true }); }
});

test("an explicitly retired candidate cannot keep preempting later newsroom work", () => {
  const found = fixture();
  try {
    const manifestDigest = rawNi(readFileSync(join(found.candidate, "manifest.json")));
    appendKoiosAct({ dataRoot: found.data, ledger: "shadow-deliveries", instant: "2099-07-19T03:40:00.000Z", act: "candidate.projected", subject: "urn:koios:incident:withdrawn", data: { slug: "fresh-story", manifestDigest } });
    assert.equal(pendingPrimaryStaticRelease(found.data, found.candidate)?.slug, "fresh-story");
    appendKoiosAct({ dataRoot: found.data, ledger: "shadow-deliveries", instant: "2099-07-19T03:41:00.000Z", act: "candidate.retired", subject: "urn:koios:incident:withdrawn", data: { slug: "fresh-story", manifestDigest, reason: "the incident withdrew this candidate before public release" } });
    assert.equal(pendingPrimaryStaticRelease(found.data, found.candidate), undefined);
  } finally { rmSync(found.root, { recursive: true, force: true }); }
});
