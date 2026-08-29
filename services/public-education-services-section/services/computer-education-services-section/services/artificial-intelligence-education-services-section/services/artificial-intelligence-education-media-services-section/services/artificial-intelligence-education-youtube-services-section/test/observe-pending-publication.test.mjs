import assert from "node:assert/strict";
import test from "node:test";
import { selectPendingPublication } from "../src/observe-pending-publication.mjs";
test("AI publication observer chooses the earliest schedule lacking a public receipt", () => { const schedules = [{ id: "later", status: "scheduled-not-observed", publishAt: "2096-07-24T15:00:00.000Z" }, { id: "first", status: "scheduled-not-observed", publishAt: "2096-07-22T15:00:00.000Z" }], publications = [{ scheduledPublicationReceipt: "later" }]; assert.equal(selectPendingPublication(schedules, publications).id, "first"); });
test("AI publication observer has no work after the public receipt", () => { assert.equal(selectPendingPublication([{ id: "done", status: "scheduled-not-observed", publishAt: "2096-07-22T15:00:00.000Z" }], [{ scheduledPublicationReceipt: "done" }]), null); });
