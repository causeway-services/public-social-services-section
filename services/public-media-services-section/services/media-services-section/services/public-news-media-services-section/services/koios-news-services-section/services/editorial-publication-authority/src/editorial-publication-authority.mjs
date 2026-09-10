import { createHash, createPublicKey, verify } from "node:crypto";

export const GRANT_KIND = "koios.news.editorial-publication-grant/v1";
export const ASSESSMENT_KIND = "koios.news.independent-editorial-assessment-receipt/v1";

const ED25519_SPKI_PREFIX = Buffer.from("302a300506032b6570032100", "hex");
const ED25519_FIELD = (1n << 255n) - 19n;
const ED25519_SCALAR_ORDER = (1n << 252n) + 27742317777372353535851937790883648493n;
// Canonical compressed encodings of the eight-point Ed25519 torsion subgroup.
// Older OpenSSL/Node combinations have accepted the all-zero public key and
// signature, so key admission cannot be delegated to runtime verification.
const ED25519_SMALL_ORDER = new Set([
  "0100000000000000000000000000000000000000000000000000000000000000",
  "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac037a",
  "0000000000000000000000000000000000000000000000000000000000000080",
  "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc05",
  "ecffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff7f",
  "26e8958fc2b227b045c3f489f2ef98f0d5dfac05d3c63339b13802886d53fc85",
  "0000000000000000000000000000000000000000000000000000000000000000",
  "c7176a703d4dd84fba3c0b760d10670f2a2053fa2c39ccc64ec7fd7792ac03fa",
]);
const sha256 = (bytes) => `sha256:${createHash("sha256").update(bytes).digest("hex")}`;
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isDigest = (value) => /^sha256:[a-f0-9]{64}$/u.test(value ?? "");
const isIdentifier = (value) => /^[A-Za-z0-9_-]{16,128}$/u.test(value ?? "");
const isSlug = (value) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value ?? "");
const isTimestamp = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/u.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const fail = (message) => { throw new TypeError(`editorial publication authority: ${message}`); };

// This deliberately has a smaller domain than generic JSON.  Publication
// authority records use only finite JSON data and are emitted as these exact
// UTF-8 bytes; whitespace, key order, and a trailing newline are part of the
// signed carrier contract.
export function canonicalJson(value) {
  if (value === null || typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
    if (typeof value === "number" && !Number.isFinite(value)) fail("non-finite numbers are not canonical JSON");
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (!isRecord(value)) fail("canonical JSON accepts only JSON values");
  return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(",")}}`;
}
function parseCanonical(source, label) {
  if (typeof source !== "string" || source.length === 0) fail(`${label} must be nonempty UTF-8 text`);
  let value;
  try { value = JSON.parse(source); } catch (error) { fail(`${label} is not JSON: ${error.message}`); }
  if (`${canonicalJson(value)}\n` !== source) fail(`${label} is not canonical exact bytes`);
  return value;
}
function unsigned(record) { const { signature, ...value } = record; return value; }
function base64url(value, label, size) {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]+$/u.test(value)) fail(`${label} must be unpadded base64url`);
  const bytes = Buffer.from(value, "base64url");
  if (bytes.length !== size || bytes.toString("base64url") !== value) fail(`${label} must encode exactly ${size} bytes`);
  return bytes;
}
function littleEndianInteger(bytes) { let value = 0n; for (let index = bytes.length - 1; index >= 0; index -= 1) value = value << 8n | BigInt(bytes[index]); return value; }
function strictEd25519Point(bytes, label) {
  const y = Buffer.from(bytes); y[31] &= 0x7f;
  if (littleEndianInteger(y) >= ED25519_FIELD) fail(`${label} point encoding is noncanonical`);
  if (ED25519_SMALL_ORDER.has(bytes.toString("hex"))) fail(`${label} point has small order`);
}
function trustedKey(keys, keyId, label) {
  if (!isIdentifier(keyId)) fail(`${label} key id is invalid`);
  const encoded = keys instanceof Map ? keys.get(keyId) : keys?.[keyId];
  if (typeof encoded !== "string") fail(`${label} key ${JSON.stringify(keyId)} is not independently configured`);
  const raw = base64url(encoded, `${label} public key`, 32);
  strictEd25519Point(raw, `${label} public key`);
  return createPublicKey({ key: Buffer.concat([ED25519_SPKI_PREFIX, raw]), format: "der", type: "spki" });
}
function verifySignature(record, keys, label) {
  if (!isRecord(record) || Object.getPrototypeOf(record) !== Object.prototype) fail(`${label} must be a plain object`);
  const key = trustedKey(keys, record.issuerKeyId, label);
  const signature = base64url(record.signature, `${label} signature`, 64);
  strictEd25519Point(signature.subarray(0, 32), `${label} signature R`);
  if (littleEndianInteger(signature.subarray(32)) >= ED25519_SCALAR_ORDER) fail(`${label} signature scalar is noncanonical`);
  const payload = Buffer.from(canonicalJson(unsigned(record)), "utf8");
  if (!verify(null, payload, key, signature)) fail(`${label} Ed25519 signature is invalid`);
}
function exactKeys(value, keys, label) {
  if (!isRecord(value) || Object.keys(value).length !== keys.length || keys.some((key) => !(key in value))) fail(`${label} has an invalid shape`);
}
function timeWindow(value, now, label) {
  if (!isTimestamp(now)) fail("now must be a canonical UTC timestamp");
  if (!isTimestamp(value.issuedAt) || !isTimestamp(value.expiresAt)) fail(`${label} must have canonical issuedAt and expiresAt`);
  if (Date.parse(value.issuedAt) > Date.parse(now)) fail(`${label} is not yet valid`);
  if (Date.parse(value.expiresAt) <= Date.parse(now)) fail(`${label} is expired`);
}
function manuscript(value, label) {
  exactKeys(value, ["digest", "slug"], `${label} manuscript`);
  if (!isSlug(value.slug) || !isDigest(value.digest)) fail(`${label} manuscript binding is invalid`);
}

export function verifyAssessmentReceipt({ receiptSource, assessmentKeys, manuscriptSource, manuscriptSlug, now }) {
  const receipt = parseCanonical(receiptSource, "assessment receipt");
  exactKeys(receipt, ["assessmentId", "disposition", "expiresAt", "issuedAt", "issuerKeyId", "kind", "manuscript", "policyDigest", "publishable", "signature"], "assessment receipt");
  if (receipt.kind !== ASSESSMENT_KIND || receipt.disposition !== "accept" || receipt.publishable !== true) fail("assessment receipt is not an accepting publication assessment");
  if (!isIdentifier(receipt.assessmentId) || !isDigest(receipt.policyDigest)) fail("assessment receipt identifiers are invalid");
  manuscript(receipt.manuscript, "assessment receipt");
  timeWindow(receipt, now, "assessment receipt");
  if (!isSlug(manuscriptSlug) || receipt.manuscript.slug !== manuscriptSlug) fail("assessment receipt is not bound to the supplied manuscript slug");
  if (typeof manuscriptSource !== "string" || sha256(manuscriptSource) !== receipt.manuscript.digest) fail("assessment receipt is not bound to the supplied exact manuscript bytes");
  verifySignature(receipt, assessmentKeys, "assessment receipt");
  return Object.freeze({ receipt, digest: sha256(receiptSource) });
}

export function verifyPublicationAuthority({ grantSource, authorityKeys, manuscriptSource, manuscriptSlug, assessmentReceiptSource, assessmentKeys, now }) {
  const grant = parseCanonical(grantSource, "publication grant");
  exactKeys(grant, ["expiresAt", "grantId", "issuedAt", "issuerKeyId", "kind", "scope", "signature"], "publication grant");
  if (grant.kind !== GRANT_KIND || !isIdentifier(grant.grantId)) fail("publication grant kind or id is invalid");
  timeWindow(grant, now, "publication grant");
  verifySignature(grant, authorityKeys, "publication grant");
  if (typeof manuscriptSource !== "string") fail("manuscriptSource is required");
  if (!isSlug(manuscriptSlug)) fail("manuscriptSlug is required");
  const manuscriptDigest = sha256(manuscriptSource);
  if (!isRecord(grant.scope) || typeof grant.scope.type !== "string") fail("publication grant scope is invalid");
  if (grant.scope.type === "exact-manuscript") {
    exactKeys(grant.scope, ["manuscript", "type"], "exact-manuscript scope");
    manuscript(grant.scope.manuscript, "publication grant");
    if (grant.scope.manuscript.digest !== manuscriptDigest || grant.scope.manuscript.slug !== manuscriptSlug) fail("exact-manuscript grant does not bind the supplied exact manuscript bytes and slug");
    return Object.freeze({ ok: true, grantId: grant.grantId, issuedAt: grant.issuedAt, expiresAt: grant.expiresAt, consumptionId: `grant:${grant.grantId}`, scope: "exact-manuscript", manuscriptSlug, manuscriptDigest, grantDigest: sha256(grantSource) });
  }
  if (grant.scope.type === "standing-policy") {
    exactKeys(grant.scope, ["policyDigest", "type"], "standing-policy scope");
    if (!isDigest(grant.scope.policyDigest)) fail("standing-policy digest is invalid");
    const assessment = verifyAssessmentReceipt({ receiptSource: assessmentReceiptSource, assessmentKeys, manuscriptSource, manuscriptSlug, now });
    if (assessment.receipt.policyDigest !== grant.scope.policyDigest) fail("standing-policy grant does not bind the independently verified assessment policy");
    const consumptionId = sha256(Buffer.from(canonicalJson({ grantId: grant.grantId, manuscriptDigest }), "utf8"));
    return Object.freeze({ ok: true, grantId: grant.grantId, issuedAt: grant.issuedAt, expiresAt: grant.expiresAt, consumptionId, scope: "standing-policy", manuscriptSlug, manuscriptDigest, grantDigest: sha256(grantSource), assessmentReceiptDigest: assessment.digest, assessmentId: assessment.receipt.assessmentId });
  }
  fail("publication grant scope type is not recognized");
}

// The caller owns durable, atomic replay storage.  Verification alone does
// not authorize an effect; an effecting caller must atomically consume the
// verified use coordinate. Exact grants have one coordinate. A standing policy
// has one coordinate per independently signed assessment receipt.
export function consumePublicationAuthority({ replayStore, ...input }) {
  if (!replayStore || typeof replayStore.consumeIfUnused !== "function") fail("an atomic replayStore.consumeIfUnused(consumptionId) is required before authority can be consumed");
  const verified = verifyPublicationAuthority(input);
  if (replayStore.consumeIfUnused(verified.consumptionId) !== true) fail("publication authority use has already been consumed or replay storage refused it");
  return Object.freeze({ ...verified, consumed: true });
}
