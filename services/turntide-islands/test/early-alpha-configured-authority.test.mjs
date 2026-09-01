import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const policy = JSON.parse(readFileSync(new URL("../content/admissions/early-alpha-configured-authority.json", import.meta.url), "utf8"));

test("admits configured authority only as a receipted one-action development-chain alpha", () => {
  assert.equal(policy.status, "admitted-bounded-early-alpha-only");
  assert.equal(policy.allowlist.chain.caip2, "eip155:31337");
  assert.equal(policy.limits.maximumActionsPerExperiment, 1);
  assert.equal(policy.limits.maximumTokenTransferWeiPerExperiment, "0");
  assert.equal(policy.limits.maximumContractDeploymentsPerExperiment, 0);
  assert.match(policy.limits.replayKey, /atomically claimed/u);
  assert.deepEqual(policy.requiredReceipt.fields, ["experimentId", "actionDigest", "chain", "targetContract", "transactionHash", "blockNumber", "recordedAt"]);
  assert.ok(policy.allowlist.contracts.every((contract) => /^0x[0-9a-f]{40}$/u.test(contract.address)));
});

test("does not convert an alpha authority admission into a DAO or production payment claim", () => {
  assert.match(policy.authoritySource, /no secret.*tracked artifact/iu);
  assert.ok(policy.doesNotSupersede.includes("TTILocalityX402ProductionActivationAdmission"));
  for (const refusal of policy.refusals) assert.match(refusal, /^Refuse /u);
  assert.match(policy.requiredReceipt.effect, /not payment, revenue, entitlement, governance, token issuance, DAO formation, or production activation/u);
});
