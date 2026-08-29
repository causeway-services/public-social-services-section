import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { requireSettlementAccountId, SETTLEMENT_ACCOUNT_ENV, settlementAccountIdFromEnvironment } from "../src/settlement-account.mjs";

const ACCOUNT = "eip155:31337:0x55fcbe35bda4165658278a99d647a9fa3a9e604f";
const RUNNERS = ["daily-cinematic-runner.mjs", "observe-pending-publication.mjs"];

test("every mathematics runner receives its public settlement identity through the explicit runtime contract", () => {
  assert.equal(SETTLEMENT_ACCOUNT_ENV, "MATHEMATICS_YOUTUBE_SETTLEMENT_ACCOUNT");
  assert.equal(requireSettlementAccountId(ACCOUNT), ACCOUNT);
  assert.equal(settlementAccountIdFromEnvironment({ [SETTLEMENT_ACCOUNT_ENV]: ACCOUNT }), ACCOUNT);
  assert.throws(() => requireSettlementAccountId(undefined), /explicit EIP-155 CAIP-10 settlementAccountId/u);
  assert.throws(() => requireSettlementAccountId("eip155:31337:not-an-address"), /explicit EIP-155 CAIP-10 settlementAccountId/u);
  for (const name of RUNNERS) {
    const source = readFileSync(new URL(`../src/${name}`, import.meta.url), "utf8");
    assert.match(source, /settlementAccountId/u, `${name} does not consume the settlement contract`);
    assert.doesNotMatch(source, /content\/evm\/accounts/u, `${name} still assumes an undeclared carrier`);
  }
});
