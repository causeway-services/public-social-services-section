import assert from "node:assert/strict";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createSettlementStore, querySettlementRecords } from "../src/record-journal.mjs";

test("business journal treats a service root and its data directory as one custody root", (t) => {
  const root = mkdtempSync(join(tmpdir(), "business-journal-root-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const record = { id: "urn:test:business-root", type: "BusinessRootContract" };
  createSettlementStore({ settlementRoot: join(root, "data") }).record({ category: "root-contract", recordedAt: "2096-01-01T00:00:00.000Z", record });
  assert.deepEqual(querySettlementRecords("root-contract", { root }), [record]);
  assert.equal(existsSync(join(root, "data", "data", "logs")), false);
});
