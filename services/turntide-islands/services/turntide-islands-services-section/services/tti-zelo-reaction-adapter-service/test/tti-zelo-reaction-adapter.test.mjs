import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import test from "node:test";

import { prepareTtiZeloShadowInput } from "../src/tti-zelo-reaction-adapter.mjs";

const root = resolve(import.meta.dirname, "..", "..", "..", "..", "..");
const configFile = resolve(root, "content/configurations/discord-reaction-system.json");
const stateFile = resolve(root, "data/state/discord-reaction-system-state.json");
const options = Object.freeze({ now: new Date("2026-08-30T00:00:00.000Z"), maxObservationAgeMs: 86_400_000 });

async function fixture() {
  return {
    configuration: JSON.parse(await readFile(configFile, "utf8")),
    observed: JSON.parse(await readFile(stateFile, "utf8")),
  };
}

const clone = (value) => JSON.parse(JSON.stringify(value));

test("committed config and state fixture yields four visa review proposals and a dock block", async () => {
  const { configuration, observed } = await fixture();
  const result = prepareTtiZeloShadowInput(configuration, observed, options);
  assert.equal(result.bindings.length, 4);
  assert.deepEqual(result.blocked.map((item) => item.reason), ["unresolved-dock-grant"]);
  assert.ok(result.bindings.every((binding) => binding.execution === "review-proposal-only" && binding.executable === false));
});

test("refuses stale state", async () => {
  const { configuration, observed } = await fixture(); observed.observedAt = "2026-08-20T00:00:00.000Z";
  assert.throws(() => prepareTtiZeloShadowInput(configuration, observed, options), /stale/);
});

test("refuses future state", async () => {
  const { configuration, observed } = await fixture(); observed.observedAt = "2026-08-31T00:00:00.000Z";
  assert.throws(() => prepareTtiZeloShadowInput(configuration, observed, options), /future/);
});

test("refuses malformed timestamp and invalid freshness bound", async () => {
  const { configuration, observed } = await fixture(); observed.observedAt = "not-a-time";
  assert.throws(() => prepareTtiZeloShadowInput(configuration, observed, options), /ISO timestamp/);
  const fresh = await fixture();
  assert.throws(() => prepareTtiZeloShadowInput(fresh.configuration, fresh.observed, { now: options.now, maxObservationAgeMs: 0 }), /positive safe integer/);
});

test("refuses config/state version, completeness, and guild mismatch", async () => {
  const first = await fixture(); first.configuration.version = 2;
  assert.throws(() => prepareTtiZeloShadowInput(first.configuration, first.observed, options), /unsupported/);
  const second = await fixture(); second.observed.completeness = "incomplete";
  assert.throws(() => prepareTtiZeloShadowInput(second.configuration, second.observed, options), /complete/);
  const third = await fixture(); third.observed.guild.id = "other";
  assert.throws(() => prepareTtiZeloShadowInput(third.configuration, third.observed, options), /does not match/);
});

test("refuses duplicate selectors, configuration mappings, and observed mapping joins", async () => {
  const first = await fixture(); first.configuration.selectors.push(clone(first.configuration.selectors[0]));
  assert.throws(() => prepareTtiZeloShadowInput(first.configuration, first.observed, options), /selector purposes/);
  const second = await fixture(); second.configuration.mappings.push(clone(second.configuration.mappings[0]));
  assert.throws(() => prepareTtiZeloShadowInput(second.configuration, second.observed, options), /mappings must be unique/);
  const third = await fixture(); third.observed.reactionMappings.push(clone(third.observed.reactionMappings[0]));
  assert.throws(() => prepareTtiZeloShadowInput(third.configuration, third.observed, options), /reaction mappings must be unique/);
});

test("blocks a message selector mismatch without proposing that visa", async () => {
  const { configuration, observed } = await fixture(); observed.reactionMappings[0].messageId = "different-message";
  const result = prepareTtiZeloShadowInput(configuration, observed, options);
  assert.equal(result.bindings.length, 3);
  assert.equal(result.desiredVsObserved[0].status, "blocked");
});

test("blocks a role mismatch without proposing that visa", async () => {
  const { configuration, observed } = await fixture(); observed.reactionMappings[0].grantRoleId = observed.roles.find((role) => role.name === "techie").id;
  assert.equal(prepareTtiZeloShadowInput(configuration, observed, options).bindings.length, 3);
});

test("blocks a target channel set mismatch without proposing that visa", async () => {
  const { configuration, observed } = await fixture(); observed.reactionMappings[1].targetChannelIds.pop();
  assert.equal(prepareTtiZeloShadowInput(configuration, observed, options).bindings.length, 3);
});

test("blocks mappings whose configured owner is missing or does not match", async () => {
  const missing = await fixture(); missing.observed.integrations = missing.observed.integrations.filter((item) => item.name !== "carl-bot");
  assert.equal(prepareTtiZeloShadowInput(missing.configuration, missing.observed, options).bindings.length, 0);
  const mismatched = await fixture(); mismatched.observed.reactionMappings[0].automationOwner.botId = "different-bot";
  assert.equal(prepareTtiZeloShadowInput(mismatched.configuration, mismatched.observed, options).bindings.length, 3);
});

test("refuses missing or resolved dock evidence", async () => {
  const first = await fixture(); first.observed.unresolved = [];
  assert.throws(() => prepareTtiZeloShadowInput(first.configuration, first.observed, options), /entry reaction must remain unresolved/);
  const second = await fixture(); second.configuration.unresolved = [];
  assert.throws(() => prepareTtiZeloShadowInput(second.configuration, second.observed, options), /entry reaction must remain explicitly unresolved/);
});

test("output is deeply frozen, cloned, non-executable, and contains no candidate or member identity", async () => {
  const { configuration, observed } = await fixture();
  const result = prepareTtiZeloShadowInput(configuration, observed, options);
  const serialized = JSON.stringify(result);
  for (const forbidden of ["candidateRoleIds", "candidateRoleNames", "ownerId", "administratorAuthorIds", "currentBot", "reactionUsers", "members"]) assert.equal(serialized.includes(forbidden), false, forbidden);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.bindings), true);
  assert.equal(Object.isFrozen(result.bindings[0]), true);
  assert.equal(Object.isFrozen(result.bindings[0].emoji), true);
  assert.throws(() => { result.bindings[0].emoji.name = "changed"; }, TypeError);
  configuration.mappings[0].emoji.name = "changed-input";
  assert.equal(result.bindings[0].emoji.name, "⚒️");
});
