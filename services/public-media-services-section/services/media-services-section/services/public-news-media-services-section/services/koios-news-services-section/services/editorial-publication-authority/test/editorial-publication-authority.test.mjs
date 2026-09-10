import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, sign } from "node:crypto";
import test from "node:test";

import { canonicalJson, consumePublicationAuthority, verifyPublicationAuthority } from "../src/editorial-publication-authority.mjs";

const now = "2099-01-01T00:00:00.000Z";
const manuscript = "---\ntitle: Exact\ndraft: true\nslug: exact\n---\nExact manuscript.\n";
const manuscriptDigest = `sha256:${createHash("sha256").update(manuscript).digest("hex")}`;
const blankSignature = "A".repeat(86);
const testKey = "A".repeat(43);
const exactGrant = { expiresAt: "2099-01-02T00:00:00.000Z", grantId: "exact-grant-id-0001", issuedAt: "2098-12-31T00:00:00.000Z", issuerKeyId: "test-authority-key", kind: "koios.news.editorial-publication-grant/v1", scope: { manuscript: { digest: "sha256:0000000000000000000000000000000000000000000000000000000000000000", slug: "exact" }, type: "exact-manuscript" }, signature: blankSignature };

function signingFixture(keyId) {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  return { keyId, privateKey, keys: { [keyId]: publicKey.export({ format: "jwk" }).x } };
}
function signedSource(record, fixture) {
  const unsigned = { ...record, issuerKeyId: fixture.keyId };
  const signature = sign(null, Buffer.from(canonicalJson(unsigned), "utf8"), fixture.privateKey).toString("base64url");
  return `${canonicalJson({ ...unsigned, signature })}\n`;
}
function replayStore() {
  const used = new Set();
  return { consumeIfUnused(id) { if (used.has(id)) return false; used.add(id); return true; } };
}

test("canonical JSON fixes ordering and exact carrier bytes", () => {
  assert.equal(canonicalJson({ z: [true, null], a: "x" }), '{"a":"x","z":[true,null]}');
  const source = `${canonicalJson(exactGrant)}\n`;
  assert.throws(() => verifyPublicationAuthority({ grantSource: source.replace(/\n$/u, ""), authorityKeys: {}, manuscriptSource: manuscript, manuscriptSlug: "exact", now }), /canonical exact bytes/u);
});

test("fails closed without configured authority, valid signature, exact bytes, or current time", () => {
  const source = `${canonicalJson(exactGrant)}\n`;
  assert.throws(() => verifyPublicationAuthority({ grantSource: source, authorityKeys: {}, manuscriptSource: manuscript, manuscriptSlug: "exact", now }), /not independently configured/u);
  assert.throws(() => verifyPublicationAuthority({ grantSource: source, authorityKeys: { "test-authority-key": testKey }, manuscriptSource: manuscript, manuscriptSlug: "exact", now }), /small order/u);
  assert.throws(() => verifyPublicationAuthority({ grantSource: source, authorityKeys: { "test-authority-key": testKey }, manuscriptSource: manuscript, manuscriptSlug: "exact", now: "2099-01-02T00:00:00.000Z" }), /expired/u);
});

test("an effect cannot consume unverified authority or omit atomic replay storage", () => {
  const source = `${canonicalJson(exactGrant)}\n`;
  assert.throws(() => consumePublicationAuthority({ grantSource: source, authorityKeys: { "test-authority-key": testKey }, manuscriptSource: manuscript, manuscriptSlug: "exact", now }), /atomic replayStore/u);
});

test("a real Ed25519 exact-manuscript grant binds bytes and is consumed once", () => {
  const authority = signingFixture("authority-key-0001");
  const source = signedSource({
    expiresAt: "2099-01-02T00:00:00.000Z", grantId: "exact-grant-id-0002", issuedAt: "2098-12-31T00:00:00.000Z",
    kind: "koios.news.editorial-publication-grant/v1", scope: { manuscript: { digest: manuscriptDigest, slug: "exact" }, type: "exact-manuscript" },
  }, authority);
  const store = replayStore();
  const result = consumePublicationAuthority({ replayStore: store, grantSource: source, authorityKeys: authority.keys, manuscriptSource: manuscript, manuscriptSlug: "exact", now });
  assert.equal(result.ok, true);
  assert.equal(result.consumed, true);
  assert.equal(result.scope, "exact-manuscript");
  assert.equal(result.issuedAt, "2098-12-31T00:00:00.000Z");
  assert.equal(result.expiresAt, "2099-01-02T00:00:00.000Z");
  assert.throws(() => consumePublicationAuthority({ replayStore: store, grantSource: source, authorityKeys: authority.keys, manuscriptSource: manuscript, manuscriptSlug: "exact", now }), /already been consumed/u);
  assert.throws(() => verifyPublicationAuthority({ grantSource: source, authorityKeys: authority.keys, manuscriptSource: `${manuscript}tampered`, manuscriptSlug: "exact", now }), /does not bind/u);
});

test("a standing policy admits distinct independently assessed manuscripts but not replay", () => {
  const authority = signingFixture("authority-key-0002");
  const assessor = signingFixture("assessment-key-0001");
  const policyDigest = `sha256:${"1".repeat(64)}`;
  const grantSource = signedSource({
    expiresAt: "2099-01-02T00:00:00.000Z", grantId: "standing-grant-0001", issuedAt: "2098-12-31T00:00:00.000Z",
    kind: "koios.news.editorial-publication-grant/v1", scope: { policyDigest, type: "standing-policy" },
  }, authority);
  const store = replayStore();
  for (const [index, input] of [manuscript, manuscript.replaceAll("Exact", "Second").replace("slug: exact", "slug: second")].entries()) {
    const slug = index === 0 ? "exact" : "second";
    const digest = `sha256:${createHash("sha256").update(input).digest("hex")}`;
    const receiptSource = signedSource({
      assessmentId: `assessment-id-000${index + 1}`, disposition: "accept", expiresAt: "2099-01-01T12:00:00.000Z", issuedAt: "2098-12-31T12:00:00.000Z",
      kind: "koios.news.independent-editorial-assessment-receipt/v1", manuscript: { digest, slug }, policyDigest, publishable: true,
    }, assessor);
    const call = () => consumePublicationAuthority({ replayStore: store, grantSource, authorityKeys: authority.keys, assessmentReceiptSource: receiptSource, assessmentKeys: assessor.keys, manuscriptSource: input, manuscriptSlug: slug, now });
    const result = call();
    assert.equal(result.scope, "standing-policy");
    assert.equal(result.expiresAt, "2099-01-02T00:00:00.000Z");
    assert.equal(result.assessmentId, `assessment-id-000${index + 1}`);
    assert.throws(call, /already been consumed/u);
  }
});
