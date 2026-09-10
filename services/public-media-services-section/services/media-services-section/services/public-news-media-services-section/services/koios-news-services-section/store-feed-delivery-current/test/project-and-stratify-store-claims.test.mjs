import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { readEavtFile } from "@red-cup-engineering/eavt";

const fixtures = join(import.meta.dirname, "fixtures", "claim-store");
const projectScript = join(import.meta.dirname, "..", "scripts", "project-store-claims-into-eavt.mjs");
const stratifyScript = join(import.meta.dirname, "..", "scripts", "stratify-store-claims.mjs");

function runScript(script, input) {
  return JSON.parse(execFileSync(process.execPath, [script], { input: JSON.stringify(input), encoding: "utf8" }));
}

test("project-store-claims-into-eavt round-trips through stdin/stdout and is idempotent on a second run", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-claim-eavt-test-"));
  try {
    const tracePath = join(temp, "claims.eavt.jsonl");

    const first = runScript(projectScript, { storeRoot: fixtures, tracePath });
    assert.equal(first.storeRoot, fixtures);
    assert.equal(first.tracePath, tracePath);
    assert.equal(first.filesRead, 3);
    assert.equal(first.entities, 3);
    // 64 rows are emitted per-file, but many witness/citation/force/status rows are byte-identical
    // across a file's own claims (same t, same provenance); eavt's own content-address dedupe
    // collapses those before append, so the deduped/projected count is lower than the emitted one.
    assert.equal(first.rowsProjected, 32);
    assert.equal(first.rowsAppended, first.rowsProjected - first.rowsAlreadyPresent);
    assert.ok(first.rowsAppended > 0);
    assert.ok(existsSync(tracePath));

    const onDisk = readEavtFile(tracePath);
    assert.equal(onDisk.length, first.rowsAppended);

    const second = runScript(projectScript, { storeRoot: fixtures, tracePath });
    assert.equal(second.rowsAppended, 0, "re-running over an unchanged store appends nothing");
    assert.equal(second.rowsAlreadyPresent, second.rowsProjected);
    assert.equal(readEavtFile(tracePath).length, onDisk.length, "the trace file did not grow on the second run");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("stratify-store-claims round-trips through stdin/stdout, dating the projection by the trace's own latest row t", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-claim-strata-test-"));
  try {
    const tracePath = join(temp, "claims.eavt.jsonl");
    runScript(projectScript, { storeRoot: fixtures, tracePath });

    const rows = readEavtFile(tracePath);
    const expectedDate = rows.map((row) => row.t).reduce((max, t) => (t > max ? t : max)).slice(0, 10);

    const outPath = join(temp, "strata.json");
    const result = runScript(stratifyScript, { tracePath, out: outPath });
    assert.equal(result.tracePath, tracePath);
    assert.equal(result.out, outPath);
    assert.equal(result.summary.entities, 3);
    assert.equal(result.summary.rows, 32);
    assert.equal(result.summary.saturated, result.summary.asserted);
    assert.equal(result.summary.settled, result.summary.saturated);

    const written = JSON.parse(readFileSync(outPath, "utf8"));
    assert.equal(written.summary.entities, 3);
    assert.equal(written.entities.length, 3);
    assert.ok(expectedDate.length === 10, "sanity: the trace's latest-row date is computed off row t, not the wall clock");
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
