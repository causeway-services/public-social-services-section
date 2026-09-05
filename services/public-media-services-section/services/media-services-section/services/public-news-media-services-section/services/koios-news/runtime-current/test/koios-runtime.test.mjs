import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { dryRunPlan, inspectRuntime } from "../src/koios-runtime.mjs";

const ROOT = new URL("..", import.meta.url);
const CONFIG = new URL("../config/runtime.json", import.meta.url).pathname;

test("the checked-in runtime is a reachable, dry-run-only four-provider seam", () => {
  const report = inspectRuntime(CONFIG);
  assert.equal(report.ok, true, JSON.stringify(report, null, 2));
  assert.equal(report.executionMode, "dry-run");
  assert.deepEqual(report.providers.map((provider) => provider.name), ["sourceDiscovery", "sourceAcquisition", "editorialAssessment", "proseContribution"]);
  assert.ok(report.providers.every((provider) => provider.reachable));
  const plan = dryRunPlan(report);
  assert.equal(plan.disposition, "ready");
  assert.equal(plan.authority, "none");
  assert.deepEqual(plan.effects, []);
  assert.ok(plan.steps.every((step) => step.invocation === "not-performed"));
});

test("the runtime refuses live activation and credentials before provider inspection", () => {
  const temp = mkdtempSync(join(tmpdir(), "koios-runtime-current-"));
  try {
    const unsafe = {
      version: 1,
      executionMode: "live",
      customer: "urn:test:customer",
      apiKey: "must-not-be-accepted",
      providers: {}
    };
    const path = join(temp, "unsafe.json");
    writeFileSync(path, JSON.stringify(unsafe));
    const report = inspectRuntime(path);
    assert.equal(report.ok, false);
    assert.ok(report.errors.some((entry) => entry.code === "unsafe-execution-mode"));
    assert.ok(report.errors.some((entry) => entry.code === "forbidden-control-surface"));
    assert.equal(dryRunPlan(report).disposition, "refused");
  } finally { rmSync(temp, { recursive: true, force: true }); }
});

test("the runtime refuses an unsupported Node version without executing a provider", () => {
  const report = inspectRuntime(CONFIG, { nodeVersion: "22.17.0" });
  assert.equal(report.ok, false);
  assert.ok(report.errors.some((entry) => entry.code === "node-too-old"));
});
