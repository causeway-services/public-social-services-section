import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { appendKoiosAct, readKoiosLedger } from "../dist/management/ledger.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const EXECUTABLE = join(ROOT, "dist", "operate-learning-pulse.mjs");
const ACTOR = "urn:colony:cold-red-gate:clockkeeper";
const TARGET = "https://koios.news/activitypub/actor";
const CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-learning-pulse:v1";
const CONTRACT = "koios-news/newsroom-learning-pulse/v1";

function activity(overrides = {}) {
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:learning-pulse",
    type: "Create",
    actor: ACTOR,
    target: TARGET,
    capability: CAPABILITY,
    published: "2026-07-19T06:30:00.000Z",
    object: { type: "NewsroomLearningDemand", contract: CONTRACT, pulseId: "test-learning-1" },
    ...overrides,
  };
}

function run(dataDir, input) {
  return spawnSync(process.execPath, [EXECUTABLE, "--data-dir", dataDir], {
    cwd: mkdtempSync(join(tmpdir(), "koios-learning-caller-")),
    input: `${JSON.stringify(input)}\n`,
    encoding: "utf8",
  });
}

test("the advertised learning operation accepts only ScheduleDelivery and appends only new evidence", () => {
  const dataDir = join(mkdtempSync(join(tmpdir(), "koios-learning-ingress-")), "data");
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-19T06:00:00.000Z", act: "newsroom.circuit.opened", subject: "culture-1", data: {} });
  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: "2026-07-19T06:05:00.000Z", act: "newsroom.circuit.completed", subject: "culture-1", data: { slug: "culture-story" } });

  const first = run(dataDir, activity());
  assert.equal(first.status, 0, first.stderr);
  const settlement = JSON.parse(first.stdout);
  assert.equal(settlement.type, "Accept");
  assert.equal(settlement.object.readingCount, 1);
  assert.equal(settlement.object.proposedMoves["observe-more"], 1);
  assert.equal(settlement.object.evidenceSettlement, "recorded");
  assert.equal(settlement.object.customerMutation, true);
  assert.equal(readKoiosLedger(dataDir, "research-lessons").length, 1);

  const second = run(dataDir, activity({ id: "urn:test:learning-pulse-2", object: { type: "NewsroomLearningDemand", contract: CONTRACT, pulseId: "test-learning-2" } }));
  assert.equal(second.status, 0, second.stderr);
  const unchanged = JSON.parse(second.stdout);
  assert.equal(unchanged.object.evidenceSettlement, "unchanged");
  assert.equal(unchanged.object.customerMutation, false);
  assert.equal(readKoiosLedger(dataDir, "research-lessons").length, 1);
});

test("an unadmitted caller receives a typed refusal and no learning record", () => {
  const dataDir = join(mkdtempSync(join(tmpdir(), "koios-learning-refusal-")), "data");
  const execution = run(dataDir, activity({ actor: "urn:test:not-clockkeeper" }));
  assert.equal(execution.status, 0, execution.stderr);
  assert.equal(JSON.parse(execution.stdout).object.code, "unauthorized-trigger");
  assert.equal(readKoiosLedger(dataDir, "research-lessons").length, 0);
});

test("the newsroom learning pulse is an advertised ScheduleDelivery target", () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.bin["operate-learning-pulse"], "./dist/operate-learning-pulse.mjs");
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-learning-pulse"].contract, CONTRACT);
});
