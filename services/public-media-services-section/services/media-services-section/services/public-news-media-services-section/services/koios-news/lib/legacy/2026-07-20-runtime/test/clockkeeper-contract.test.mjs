import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const CLOCKKEEPER_SOURCE = [
  resolve(ROOT, "../clockkeeper-service"),
  resolve(ROOT, "../../../../../../../board-of-directors/services/executive-office/services/working-services-section/services/clockkeeper-service"),
].find((candidate) => existsSync(join(candidate, "package.json")));
if (CLOCKKEEPER_SOURCE === undefined) throw new Error("clockkeeper test fixture is unavailable beside the deployed runtime or in the source tree");

function invoke(root, providerRoot, targetRoot, dataDir, now, firstDueAt, replacement) {
  const args = [
    join(ROOT, "dist/contract-clockkeeper.mjs"),
    "--now", now,
    "--first-due-at", firstDueAt,
    "--interval-seconds", "21600",
    "--target-operation", "operate-issue",
    "--provider-root", providerRoot,
    "--target-package", targetRoot,
    "--data-dir", dataDir,
    ...(replacement === undefined ? [] : ["--replace-schedule-id", replacement]),
  ];
  return spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
}

test("replacing unchanged clocked work registers a distinct binding before retiring its predecessor", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-clockkeeper-replacement-"));
  const providerRoot = join(root, "clockkeeper");
  const targetRoot = join(root, "koios-runtime");
  const dataDir = join(root, "koios-data");
  cpSync(CLOCKKEEPER_SOURCE, providerRoot, { recursive: true, filter: (path) => !path.includes(`${join(CLOCKKEEPER_SOURCE, "data")}`) });
  mkdirSync(join(targetRoot, "dist"), { recursive: true });
  writeFileSync(join(targetRoot, "dist/operate-issue.mjs"), "process.stdout.write('{}\\n');\n", "utf8");
  writeFileSync(join(targetRoot, "package.json"), `${JSON.stringify({
    bin: { "operate-issue": "./dist/operate-issue.mjs" },
    "x-agentic-metro-enterprise": {
      "node-id": "koios.news",
      "operation-catalog": { "operate-issue": { contract: "koios.news/publication-cycle/v1", timeoutMs: 900000 } },
    },
  })}\n`, "utf8");

  const firstNow = new Date().toISOString();
  const firstDueAt = new Date(Date.parse(firstNow) + 60_000).toISOString();
  const first = invoke(root, providerRoot, targetRoot, dataDir, firstNow, firstDueAt);
  assert.equal(first.status, 0, first.stderr);
  const predecessor = JSON.parse(first.stdout).subject;

  const secondNow = new Date(Date.parse(firstNow) + 1000).toISOString();
  const second = invoke(root, providerRoot, targetRoot, dataDir, secondNow, firstDueAt, predecessor);
  assert.equal(second.status, 0, second.stderr || second.stdout);
  const replacement = JSON.parse(second.stdout);
  assert.notEqual(replacement.subject, predecessor);
  assert.equal(replacement.act, "clockkeeper.schedule.replaced");
  assert.equal(replacement.data.replacedScheduleId, predecessor);
  assert.equal(replacement.data.retirementOutcome.type, "Accept");

  const registrations = readFileSync(join(providerRoot, "data/records/schedules", secondNow.slice(0, 4), secondNow.slice(5, 7), secondNow.slice(8, 10), `${secondNow.slice(0, 10)}-clockkeeper-service-schedules.jsonl`), "utf8");
  assert.match(registrations, new RegExp(replacement.subject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("the cadence contract cannot strand work by scheduling issue selection without the publication cycle", () => {
  const now = new Date().toISOString();
  const execution = spawnSync(process.execPath, [
    join(ROOT, "dist/contract-clockkeeper.mjs"),
    "--now", now,
    "--first-due-at", new Date(Date.parse(now) + 60_000).toISOString(),
    "--target-operation", "settle-issue-pulse",
  ], { cwd: ROOT, encoding: "utf8" });
  assert.notEqual(execution.status, 0);
  assert.match(execution.stderr, /public cadence must purchase operate-issue/u);
});
