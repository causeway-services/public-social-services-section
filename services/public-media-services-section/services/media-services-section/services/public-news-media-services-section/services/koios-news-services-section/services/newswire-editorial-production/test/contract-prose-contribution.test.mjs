import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";

import { ACTOR, newswireAccount, invokeProseContribution } from "../src/contract-prose-contribution.mjs";

test("the module imports without deployment identity and malformed work is refused first", async () => {
  assert.equal(ACTOR, "urn:ame:newswire-editorial-production");
  await assert.rejects(invokeProseContribution({}), /prose contribution must be an ActivityStreams Accept<ServiceContract>/u);
});

test("deployment identity is an explicit, validated CAIP-10 boundary", () => {
  const previous = process.env.NEWSWIRE_EDITORIAL_PRODUCTION_ACCOUNT;
  try {
    process.env.NEWSWIRE_EDITORIAL_PRODUCTION_ACCOUNT = "eip155:31337:0x1111111111111111111111111111111111111111";
    assert.equal(newswireAccount(), process.env.NEWSWIRE_EDITORIAL_PRODUCTION_ACCOUNT);
    process.env.NEWSWIRE_EDITORIAL_PRODUCTION_ACCOUNT = "not-an-account";
    assert.throws(() => newswireAccount(), /must name one EIP-155 CAIP-10 account/u);
  } finally {
    if (previous === undefined) delete process.env.NEWSWIRE_EDITORIAL_PRODUCTION_ACCOUNT;
    else process.env.NEWSWIRE_EDITORIAL_PRODUCTION_ACCOUNT = previous;
  }
});

test("the source CLI main guard executes and returns a refusal exit", () => {
  const run = spawnSync(process.execPath, [resolve("src/contract-prose-contribution.mjs")], { encoding: "utf8", input: "{}" });
  assert.equal(run.status, 1);
  assert.match(run.stderr, /prose contribution must be an ActivityStreams Accept<ServiceContract>/u);
});
