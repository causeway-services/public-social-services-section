import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { appendDatedRecord, appendKoiosAct, appendProviderUsage, ledgerCustodyRoot, readKoiosLedgerAsync } from "../dist/management/ledger.mjs";

let priorSettlement;

test.before(() => {
  priorSettlement = process.env.KOIOS_WITNESS_JOURNAL_SETTLEMENT;
  process.env.KOIOS_WITNESS_JOURNAL_SETTLEMENT = "eip155:31337:0x0000000000000000000000000000000000000001";
});

test.after(() => {
  if (priorSettlement === undefined) delete process.env.KOIOS_WITNESS_JOURNAL_SETTLEMENT;
  else process.env.KOIOS_WITNESS_JOURNAL_SETTLEMENT = priorSettlement;
});

function files(root) {
  try {
    return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
      const path = join(root, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    });
  } catch {
    return [];
  }
}

test("the Koios memory die writes and reopens a local custody-bound act without a JSONL or RDF carrier", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-witness-journal-ledger-"));
  try {
    const recordedAt = "2026-07-21T15:00:00.000Z";
    const act = await appendKoiosAct({
      dataRoot: root,
      ledger: "contract-events",
      instant: recordedAt,
      act: "test.seam.closed",
      subject: "urn:koios:test-seam",
      data: { positiveEvidence: true, negativeEvidence: false },
    });
    assert.match(String(act.recordDigest), /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u);
    assert.deepEqual(await readKoiosLedgerAsync(root, "contract-events"), [act]);
    const carriers = files(ledgerCustodyRoot(root));
    assert.equal(carriers.some((path) => path.includes(`${join("objects", "sha-256")}`)), true);
    assert.equal(carriers.some((path) => path.includes(`${join("indexes", "category-reference", "sha-256")}`)), true);
    assert.equal(files(root).some((path) => path.endsWith(".jsonl") || path.endsWith(".nq")), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the filesystem boundary retains dated records in category and instant order", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-witness-journal-dated-"));
  try {
    await appendDatedRecord({ dataRoot: root, ledger: "contract-events", instant: "2026-07-21T16:00:00.000Z", record: { kind: "later" } });
    await appendDatedRecord({ dataRoot: root, ledger: "contract-events", instant: "2026-07-21T15:00:00.000Z", record: { kind: "earlier" } });
    assert.deepEqual(await readKoiosLedgerAsync(root, "contract-events"), [{ kind: "earlier" }, { kind: "later" }]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("provider exchanges are projected once through local custody", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-witness-journal-provider-"));
  try {
    const providerResult = { selectedProvider: "local-test", providerExchange: { id: "exchange-1", outcome: "complete", completion: { model: "test", usage: { input: 1 } } } };
    assert.equal((await appendProviderUsage({ dataRoot: root, instant: "2026-07-21T16:00:00.000Z", providerResult, purpose: "ledger-test" })).length, 1);
    assert.equal((await appendProviderUsage({ dataRoot: root, instant: "2026-07-21T16:01:00.000Z", providerResult, purpose: "ledger-test" })).length, 0);
    assert.equal((await readKoiosLedgerAsync(root, "provider-usage")).length, 1);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
