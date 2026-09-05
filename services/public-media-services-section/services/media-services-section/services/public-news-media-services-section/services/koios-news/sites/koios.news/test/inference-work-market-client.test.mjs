import assert from "node:assert/strict";
import test from "node:test";

import { startRmnProviderProcess } from "@red-cup-engineering/relation-model-notation-conformance/test-provider";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { requestTextWorkCandidate } from "../dist/management/inference-work-market-client.mjs";

const ni = (value) => identifyJsonSemanticContent({ objectKind: "koios-news.test-evidence", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
let rmn;
let priorRmn;

test.before(async () => {
  priorRmn = process.env.RMN_CONFORMANCE_AGENT;
  rmn = await startRmnProviderProcess();
  process.env.RMN_CONFORMANCE_AGENT = rmn.agentCardUrl;
});

test.after(async () => {
  if (priorRmn === undefined) delete process.env.RMN_CONFORMANCE_AGENT;
  else process.env.RMN_CONFORMANCE_AGENT = priorRmn;
  await rmn.close();
});

test("one typed text intent becomes one schema-owned market lot with exact settlement evidence", async () => {
  const requestNi = ni("request"), resultNi = ni("result"), settlementNi = ni("settlement"), receiptNi = ni("receipt");
  let observed;
  const result = await requestTextWorkCandidate({
    instruction: "Return only one bounded prose candidate.", prompt: "Write a short witnessed report.", serviceClass: "accountable-prose",
    env: { ...process.env, INFERENCE_WORK_LOT_AGENT_CARD_URL: "https://market.example/.well-known/agent-card.json" },
  }, { request: async (input) => {
    observed = input;
    return {
      result: { outcome: "candidate-pending-customer-acceptance", provider: "urn:ame:provider", model: "model", candidate: { text: "candidate" }, evidence: { settlement: settlementNi, receipt: receiptNi } },
      resultNi, provider: { account: "eip155:31337:0x1111111111111111111111111111111111111111" }, exchange: { inputNi: requestNi, outputNi: resultNi },
    };
  } });
  assert.equal(observed.agentUrl, "https://market.example/.well-known/agent-card.json");
  assert.equal(observed.request.customer, "urn:ame:koios-news");
  assert.deepEqual(observed.request.outputSchema.required, ["text"]);
  assert.equal(result.text, "candidate");
  assert.equal(result.provider, "urn:ame:provider");
  assert.equal(result.requestNi, requestNi);
  assert.equal(result.resultNi, resultNi);
  assert.equal(result.settlementNi, settlementNi);
  assert.equal(result.receiptNi, receiptNi);
});

test("a market residue never becomes prose", async () => {
  await assert.rejects(requestTextWorkCandidate({
    instruction: "Return one bounded summary candidate.", prompt: "Summarize the supplied mark.", serviceClass: "summarization",
    env: { ...process.env, INFERENCE_WORK_LOT_AGENT_CARD_URL: "https://market.example/.well-known/agent-card.json" },
  }, { request: async () => ({ result: { outcome: "market-residue", integrationAccepted: false }, resultNi: ni("refusal"), provider: { account: "eip155:31337:0x1111111111111111111111111111111111111111" }, exchange: { inputNi: ni("refused-request"), outputNi: ni("refusal") } }) }), /market-residue/u);
});
