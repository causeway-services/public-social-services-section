import assert from "node:assert/strict";
import { cpSync, existsSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";
import { querySettlementRecords } from "@lenticule-science/rwil-rdf-projection-service/client";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCHEDULED_ACTIVITY_DELIVERY_SOURCE = [
  resolve(ROOT, "../scheduled-activity-delivery-service"),
  resolve(ROOT, "../../../../../../../board-of-directors/services/executive-office/services/working-services-section/services/scheduled-activity-delivery-service"),
].find((candidate) => existsSync(join(candidate, "package.json")));
if (SCHEDULED_ACTIVITY_DELIVERY_SOURCE === undefined) throw new Error("clockkeeper test fixture is unavailable beside the deployed runtime or in the source tree");

let rwil;
let savedRwilAgent;
test.before(async () => {
  savedRwilAgent = process.env.RWIL_RDF_AGENT;
  rwil = await startRwilProviderProcess();
  process.env.RWIL_RDF_AGENT = rwil.agentCardUrl;
});
test.after(async () => {
  if (savedRwilAgent === undefined) delete process.env.RWIL_RDF_AGENT;
  else process.env.RWIL_RDF_AGENT = savedRwilAgent;
  await rwil.close();
});

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

test("replacing unchanged clocked work registers a distinct binding before retiring its predecessor", async () => {
  const root = mkdtempSync(join(tmpdir(), "koios-clockkeeper-replacement-"));
  const providerRoot = join(root, "clockkeeper");
  const targetRoot = join(root, "koios-runtime");
  const dataDir = join(root, "koios-data");
  cpSync(SCHEDULED_ACTIVITY_DELIVERY_SOURCE, providerRoot, { recursive: true, filter: (path) => !path.includes(`${join(SCHEDULED_ACTIVITY_DELIVERY_SOURCE, "data")}`) });
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

  const registrations = await querySettlementRecords("ni:///sha-256;MJEOd4w7xWL3i1gomnpUis5sytiyM-D9Od02XMEikg8.schedules");
  assert.equal(registrations.some((registration) => registration.scheduleId === replacement.subject), true);
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
