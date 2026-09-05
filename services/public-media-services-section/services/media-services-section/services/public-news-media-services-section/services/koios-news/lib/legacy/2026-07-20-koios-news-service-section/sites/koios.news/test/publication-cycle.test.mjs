import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { appendKoiosAct, readKoiosLedger } from "../dist/management/ledger.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("publication cycle is an advertised contract rather than an ambient CLI", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  const operation = pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-issue"];
  assert.equal(pkg.bin["operate-issue"], "./dist/operate-issue.mjs");
  assert.equal(operation.contract, "koios.news/publication-cycle/v1");
  assert.equal(operation.timeoutMs, 900000);
});

test("publication cycle entrypoint operates independently of caller cwd", () => {
  const foreignCwd = mkdtempSync(join(tmpdir(), "koios-publication-cycle-caller-"));
  const pulse = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Create",
    actor: "urn:test:wrong-clock",
    target: "urn:test:wrong-target",
    object: { type: "NewsroomIssueDemand" },
  };
  const execution = spawnSync(process.execPath, [join(ROOT, "dist/operate-issue.mjs"), "--data-dir", join(foreignCwd, "data"), "--now", "2026-07-19T01:20:00.000Z"], {
    cwd: foreignCwd,
    input: `${JSON.stringify(pulse)}\n`,
    encoding: "utf8",
  });
  assert.equal(execution.status, 0, execution.stderr);
  const response = JSON.parse(execution.stdout);
  assert.equal(response.type, "Reject");
  assert.equal(response.object.code, "wrong-boundary");
});

test("publication cycle preserves the issue controller's exact typed refusal", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-publication-cycle-"));
  const pulse = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Create",
    actor: "urn:test:wrong-clock",
    target: "urn:test:wrong-target",
    object: { type: "NewsroomIssueDemand" },
  };
  const execution = spawnSync(process.execPath, [join(ROOT, "dist/operate-issue.mjs"), "--data-dir", dataDir, "--now", "2026-07-19T01:20:00.000Z"], {
    cwd: ROOT,
    input: `${JSON.stringify(pulse)}\n`,
    encoding: "utf8",
  });
  assert.equal(execution.status, 0, execution.stderr);
  const response = JSON.parse(execution.stdout);
  assert.equal(response.type, "Reject");
  assert.equal(response.object.type, "IssuePulseSettlement");
  assert.equal(response.object.code, "wrong-boundary");
});

test("a pending candidate cannot bypass issue-pulse authority", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-publication-cycle-pending-authority-"));
  const dataDir = join(root, "data");
  const candidateDir = join(root, "candidate");
  mkdirSync(candidateDir, { recursive: true });
  const manifest = JSON.stringify({ kind: "koios.static-publication-manifest", canonicalOrigin: "https://koios.news", artifacts: [] });
  writeFileSync(join(candidateDir, "manifest.json"), manifest);
  const manifestDigest = `sha256:${createHash("sha256").update(manifest).digest("hex")}`;
  appendKoiosAct({ dataRoot: dataDir, ledger: "shadow-deliveries", instant: "2026-07-19T01:19:00.000Z", act: "candidate.projected", subject: "urn:test:pending-assignment", data: { slug: "pending-story", manifestDigest } });
  const pulse = { "@context": "https://www.w3.org/ns/activitystreams", type: "Create", actor: "urn:test:intruder", target: "https://koios.news/activitypub/actor", object: { type: "NewsroomIssueDemand" } };
  const execution = spawnSync(process.execPath, [join(ROOT, "dist/operate-issue.mjs"), "--data-dir", dataDir, "--out", candidateDir, "--now", "2026-07-19T01:20:00.000Z"], { cwd: ROOT, input: `${JSON.stringify(pulse)}\n`, encoding: "utf8", env: { ...process.env, KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT: join(root, "provider-that-must-not-run") } });
  assert.equal(execution.status, 0, execution.stderr);
  const response = JSON.parse(execution.stdout);
  assert.equal(response.type, "Reject");
  assert.equal(response.object.code, "invalid-demand");
  assert.equal(readKoiosLedger(dataDir, "deployments").length, 0);
});
