import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import { prepareTtiZeloMemberLifecycleShadowConfig } from "../src/tti-zelo-member-lifecycle-adapter.mjs";

const ttiRoot = resolve(import.meta.dirname, "..", "..", "..", "..", "..");
const configFile = resolve(ttiRoot, "content/configurations/zelo-member-lifecycle.json");
const lifecycleService = await import(new URL("../../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-systems-engineering-services-section/services/web-services-section/services/web-platform-services-section/services/web2-platform-services-section/services/discord-services-section/services/discord-engineering-services-section/services/discord-member-lifecycle-planning-service/src/index.mjs", import.meta.url));
const configuration = async () => JSON.parse(await readFile(configFile, "utf8"));
const clone = (value) => JSON.parse(JSON.stringify(value));

test("TTI lifecycle config preserves the dock and channel-visas journey in a shadow-only Zelo config", async () => {
  const result = prepareTtiZeloMemberLifecycleShadowConfig(await configuration());
  assert.deepEqual(result.permittedKinds, ["arrival", "leave", "milestone"]);
  assert.equal(result.type, "ZeloMemberLifecycleShadowConfig");
  assert.equal(result.purpose, "tti-member-lifecycle-review");
  assert.equal(Object.isFrozen(result.policy.templates), true);
  assert.equal(JSON.stringify(result).includes("1184863861065658419"), false);
  assert.equal(JSON.stringify(result).includes('"memberId"'), false);
});

test("the generic planner can create only a non-executable, no-mention arrival review proposal", async () => {
  const config = prepareTtiZeloMemberLifecycleShadowConfig(await configuration());
  const plan = lifecycleService.planMemberLifecycle({
    communityId: config.communityId, memberId: "synthetic-member", kind: "arrival", now: new Date("2026-08-29T21:58:00.000Z"), policy: config.policy,
    state: { sourceRevision: "tti-lifecycle-r20260829-1", observedAt: "2026-08-29T21:57:33.032Z", lastContactAt: null, priorReceipts: [] },
    event: { eventId: "synthetic-arrival", sourceRevision: "tti-lifecycle-r20260829-1", occurredAt: "2026-08-29T21:57:00.000Z", completedParticipation: null, tenureStartedAt: null, explicitOptIn: null },
  });
  assert.equal(plan.delivery, "forbidden");
  assert.equal(plan.executable, false);
  assert.equal(plan.allowedMentions, "none");
});

test("adapter fails closed if it would replace incumbent onboarding or admit unsolicited reengagement", async () => {
  const replacement = clone(await configuration()); replacement.establishedJourney.replacement = "allowed";
  assert.throws(() => prepareTtiZeloMemberLifecycleShadowConfig(replacement), /journey/u);
  const reengagement = clone(await configuration()); reengagement.admittedKinds.push("reengagement");
  assert.throws(() => prepareTtiZeloMemberLifecycleShadowConfig(reengagement), /non-reengagement/u);
  const wrongStatus = clone(await configuration()); wrongStatus.status = "active";
  assert.throws(() => prepareTtiZeloMemberLifecycleShadowConfig(wrongStatus), /shadow-only/u);
});
