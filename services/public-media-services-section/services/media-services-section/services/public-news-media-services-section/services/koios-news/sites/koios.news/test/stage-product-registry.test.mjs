import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { querySettlementRecords } from "@red-cup-engineering/witness-journal-document-service";
import { startWitnessJournalProviderProcess } from "@red-cup-engineering/witness-journal-document-service/test-provider";

import {
  settleStageProduct,
  STAGE_PRODUCT_CATEGORY,
} from "../dist/management/stage-product-registry.mjs";
import { recordDigest } from "../dist/management/ledger.mjs";

let witnessJournal;
let savedAgent;
test.before(async () => {
  savedAgent = process.env.WITNESS_JOURNAL_RDF_AGENT;
  witnessJournal = await startWitnessJournalProviderProcess();
  process.env.WITNESS_JOURNAL_RDF_AGENT = witnessJournal.agentCardUrl;
});
test.after(async () => {
  if (savedAgent === undefined) delete process.env.WITNESS_JOURNAL_RDF_AGENT;
  else process.env.WITNESS_JOURNAL_RDF_AGENT = savedAgent;
  await witnessJournal.close();
});

function admit(value) {
  if (value.type !== "FixtureProse" || typeof value.text !== "string") throw new Error("bad fixture product");
  return Object.freeze(value);
}

test("an exact completed stage product is retained once and reused without a second producer call", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-stage-product-"));
  const dataDir = join(territory, "data");
  let producerCalls = 0;
  const request = {
    dataDir,
    stage: "fixture.article-body",
    producerContract: recordDigest({ provider: "fixture-writer", version: 1 }),
    mechanismDigest: recordDigest({ mechanism: "fixture-prose", version: 1 }),
    inputs: { promptDigest: recordDigest("same prompt"), sourcePacketDigest: recordDigest({ source: "same" }) },
    execute: async () => {
      producerCalls += 1;
      return Object.freeze({ type: "FixtureProse", text: "The already-paid complete prose survives downstream refusal." });
    },
    admit,
  };
  try {
    const first = await settleStageProduct({ ...request, now: "2026-07-20T16:00:00.000Z" });
    const second = await settleStageProduct({ ...request, now: "2026-07-20T16:01:00.000Z" });
    assert.equal(first.reused, false);
    assert.equal(second.reused, true);
    assert.equal(producerCalls, 1);
    assert.equal(second.requestDigest, first.requestDigest);
    assert.equal(second.productDigest, first.productDigest);
    assert.equal(second.product.text, first.product.text);
    assert.equal((await querySettlementRecords(STAGE_PRODUCT_CATEGORY)).length, 1);
  } finally {
    rmSync(territory, { recursive: true, force: true });
  }
});
