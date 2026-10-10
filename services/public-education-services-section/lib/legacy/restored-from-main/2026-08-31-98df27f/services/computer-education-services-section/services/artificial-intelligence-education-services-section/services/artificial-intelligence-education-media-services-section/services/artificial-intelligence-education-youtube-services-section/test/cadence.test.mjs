import assert from "node:assert/strict";
import test from "node:test";
import { formCadenceStatus, releaseTarget } from "../src/cadence.mjs";
test("AI channel targets Monday Wednesday Friday only", () => {
  assert.deepEqual(["2096-07-16", "2096-07-17", "2096-07-18", "2096-07-19", "2096-07-20", "2096-07-21", "2096-07-22"].map(releaseTarget), [1, 0, 1, 0, 1, 0, 0]);
});
test("non-eligible days have zero deficit and refuse invented work", () => {
  const status = formCadenceStatus({ civilDay: "2096-07-21", reportedAt: "2096-07-21T12:00:00Z" }); assert.equal(status.eligible, false); assert.deepEqual(status.deficits, { generation: 0, releasePlan: 0, publication: 0 });
  assert.throws(() => formCadenceStatus({ civilDay: "2096-07-21", generationAdmissions: [{ id: "urn:g", civilDay: "2096-07-21" }] }), /exceeds/u);
});
test("eligible day reports and clears one exact deficit", () => {
  const empty = formCadenceStatus({ civilDay: "2096-07-20", reportedAt: "2096-07-20T12:00:00Z" }); assert.equal(empty.deficits.publication, 1);
  const full = formCadenceStatus({ civilDay: "2096-07-20", generationAdmissions: [{ id: "urn:g", civilDay: "2096-07-20" }], releaseClaims: [{ id: "urn:r", civilDay: "2096-07-20" }], publicationReceipts: [{ id: "urn:p", civilDay: "2096-07-20" }], reportedAt: "2096-07-20T16:00:00Z" }); assert.deepEqual(full.deficits, { generation: 0, releasePlan: 0, publication: 0 });
});
