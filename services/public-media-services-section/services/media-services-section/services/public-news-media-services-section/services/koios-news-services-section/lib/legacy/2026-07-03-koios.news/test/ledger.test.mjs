import assert from "node:assert/strict";
import { mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";

import { appendDatedRecord, appendKoiosAct, readKoiosLedger } from "../dist/management/ledger.mjs";
import { appendViewWitness, viewAssertion, viewCounts } from "../dist/views.mjs";
import { replayMillRuns } from "../dist/newsroom-site.mjs";

let provider;
let priorAgent;

test.before(async () => {
  priorAgent = process.env.RWIL_RDF_AGENT;
  provider = await startRwilProviderProcess();
  process.env.RWIL_RDF_AGENT = provider.agentCardUrl;
});

test.after(async () => {
  if (priorAgent === undefined) delete process.env.RWIL_RDF_AGENT;
  else process.env.RWIL_RDF_AGENT = priorAgent;
  await provider.close();
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

test("the Koios memory die conducts one act through RMN and RDF without a JSONL carrier", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-rwil-ledger-"));
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
    assert.deepEqual(readKoiosLedger(root, "contract-events"), [act]);
    const carriers = files(root);
    assert.equal(carriers.some((path) => path.endsWith(".rmn.cbor")), true);
    assert.equal(carriers.some((path) => path.endsWith(".nq")), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the attention circuit folds canonical Koios witnesses without a second trace store", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-rwil-attention-"));
  try {
    const first = viewAssertion({ p: "/posts/one", r: "example.test", day: "2026-07-21" });
    const second = viewAssertion({ p: "/posts/one", day: "2026-07-22" });
    assert.notEqual(first, null); assert.notEqual(second, null);
    await appendViewWitness(root, first, "2026-07-21T15:00:00.000Z");
    await appendViewWitness(root, second, "2026-07-22T15:00:00.000Z");
    assert.deepEqual(viewCounts(root), {
      kind: "producing-content.content-view-counts",
      total: 2,
      byPath: { "/posts/one": 2 },
      byReferrer: { "example.test": 1 },
      byDay: { "2026-07-21": 1, "2026-07-22": 1 },
      constraints: [
        "A view event is path, optional referrer host, and day only.",
        "No IP addresses, user agents, cookies, browser fingerprints, or reader identifiers are admitted to the view trace.",
      ],
    });
    assert.equal(files(root).some((path) => path.endsWith(".rmn.cbor")), true);
    assert.equal(files(root).some((path) => path.endsWith(".nq")), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("the newsroom replays run witnesses from Koios memory rather than a mill-owned trace", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-rwil-runs-"));
  try {
    const recordedAt = "2026-07-21T16:00:00.000Z";
    const run = { kind: "koios.content-farm-run", recordedAt, property: "koios.news", term: "test", beat: "technology", shipped: false, gates: [], usage: { calls: 0, tokens: 0 }, t: recordedAt };
    await appendDatedRecord({ dataRoot: root, ledger: "contract-events", instant: recordedAt, record: run });
    await appendKoiosAct({ dataRoot: root, ledger: "contract-events", instant: "2026-07-21T16:01:00.000Z", act: "unrelated", subject: "urn:test:other" });
    assert.deepEqual(replayMillRuns(root), [run]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
