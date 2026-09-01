import test from "node:test";
import assert from "node:assert/strict";
import {
  admitCommunitySourceLead,
  reconcileFetchedSource,
  projectSaleableKnowledge,
  fulfillCommunityKnowledgeQuery,
  contentDigest,
  WITHHELD_EFFECTS,
} from "../src/law.mjs";

const LEAD = Object.freeze({
  sourceUrl: "https://example.org/articles/induction-stoves",
  rosterRef: `sha256:${"a".repeat(64)}`,
  contributorRef: "urn:tti:contributor:m8x2",
  offeredAtIso: "2026-07-23T18:00:00Z",
});

const FETCH_EVIDENCE = Object.freeze({
  contentDigest: `sha256:${"b".repeat(64)}`,
  storageRef: "urn:uuid:0d9f5f3a-6b0e-4c57-9a4e-2f4f2a9c1d11",
  byteCount: 48213,
  mediaType: "text/html",
  title: "Induction stoves, reviewed",
});

const ANALYSIS_EVIDENCE = Object.freeze({
  summary: "A comparative review of consumer induction stoves.",
  claims: ["Induction transfers heat faster than radiant electric."],
  topics: ["induction-stoves", "kitchen-appliances"],
  inferenceReceipt: Object.freeze({ provider: "urn:ame:inference-work-lot-service", receiptDigest: `sha256:${"c".repeat(64)}` }),
});

function reconciled() {
  const admission = admitCommunitySourceLead(LEAD);
  return reconcileFetchedSource(admission, FETCH_EVIDENCE, ANALYSIS_EVIDENCE, "2026-07-23T18:30:00Z");
}

test("admission refuses Discord message material, credentials, private hosts, and bare identities", () => {
  assert.equal(admitCommunitySourceLead({ ...LEAD, messageText: "hi" }).reason, "discord-message-material-refused:messageText");
  assert.equal(admitCommunitySourceLead({ ...LEAD, note: { apiKey: "x" } }).reason, "credential-shaped-key-refused:apiKey");
  assert.equal(admitCommunitySourceLead({ ...LEAD, sourceUrl: "https://192.168.1.5/x" }).reason, "source-host-not-public");
  assert.equal(admitCommunitySourceLead({ ...LEAD, sourceUrl: "ftp://example.org/x" }).reason, "source-url-scheme-refused");
  assert.equal(admitCommunitySourceLead({ ...LEAD, contributorRef: "morgan#1234" }).reason, "contributor-reference-not-opaque");
  assert.equal(admitCommunitySourceLead({ ...LEAD, rosterRef: undefined }).reason, "roster-reference-missing");
});

test("an admitted lead is content-addressed and carries only bounded fields", () => {
  const admission = admitCommunitySourceLead(LEAD);
  assert.equal(admission.disposition, "admitted");
  assert.equal(admission.id, contentDigest(admission.lead));
  assert.deepEqual(Object.keys(admission.lead).sort(), ["contributorRef", "offeredAtIso", "rosterRef", "sourceUrl", "type"]);
});

test("reconciliation demands fetch evidence, out-of-repo storage, and a traced inference receipt", () => {
  const admission = admitCommunitySourceLead(LEAD);
  assert.equal(reconcileFetchedSource(admission, { ...FETCH_EVIDENCE, storageRef: "/tmp/x" }, ANALYSIS_EVIDENCE, "2026-07-23T18:30:00Z").reason, "storage-reference-not-urn");
  assert.equal(reconcileFetchedSource(admission, FETCH_EVIDENCE, { ...ANALYSIS_EVIDENCE, inferenceReceipt: undefined }, "2026-07-23T18:30:00Z").reason, "inference-receipt-missing");
  assert.equal(reconcileFetchedSource(admitCommunitySourceLead({}), FETCH_EVIDENCE, ANALYSIS_EVIDENCE, "2026-07-23T18:30:00Z").reason, "lead-not-admitted");
  const outcome = reconciled();
  assert.equal(outcome.disposition, "reconciled");
  assert.equal(outcome.record.provenance.contributorRef, LEAD.contributorRef);
});

test("saleable projection withholds contributor and roster provenance", () => {
  const projected = projectSaleableKnowledge(reconciled().record);
  assert.equal(projected.disposition, "projected");
  assert.equal(JSON.stringify(projected.projection).includes(LEAD.contributorRef), false);
  assert.equal(JSON.stringify(projected.projection).includes(LEAD.rosterRef), false);
  assert.deepEqual([...projected.projection.withheld], ["contributor-identity", "roster-reference", "raw-bytes"]);
});

test("query fulfillment keeps refused and unknown distinct and never ranks", () => {
  const entry = reconciled();
  const instant = "2026-07-23T19:00:00Z";
  assert.equal(fulfillCommunityKnowledgeQuery({ topic: "induction-stoves" }, null, instant).disposition, "unknown");
  assert.equal(fulfillCommunityKnowledgeQuery({ topic: "gas-stoves" }, [entry], instant).reason, "no-matching-record");
  assert.equal(fulfillCommunityKnowledgeQuery({ contributor: "who" }, [entry], instant).reason, "query-key-refused:contributor");
  const fulfilled = fulfillCommunityKnowledgeQuery({ topic: "Induction-Stoves" }, [entry], instant);
  assert.equal(fulfilled.disposition, "fulfilled");
  assert.equal(fulfilled.projection.fetched.storageRef, FETCH_EVIDENCE.storageRef);
});

test("withheld effects name the boundary", () => {
  for (const effect of ["discord-write", "message-text-import", "contributor-identity-resale", "payment-settlement"]) {
    assert.equal(WITHHELD_EFFECTS.includes(effect), true);
  }
});
