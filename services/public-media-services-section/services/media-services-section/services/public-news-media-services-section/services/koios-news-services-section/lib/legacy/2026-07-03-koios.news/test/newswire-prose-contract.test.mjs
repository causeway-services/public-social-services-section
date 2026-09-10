import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { startRmnProviderProcess } from "@red-cup-engineering/relation-model-notation-conformance/test-provider";
import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";

import { procureNewswireProse } from "../dist/researching/writing/newswire-prose-contract.mjs";
import { readKoiosLedger, recordDigest } from "../dist/management/ledger.mjs";

const NOW = "2099-07-18T12:00:00.000Z";
const ROUTE_ENV = ["INFERENCE_WORK_LOT_AGENT_CARD_URL"];

let rmn;
let rwil;
test.before(async () => {
  rmn = await startRmnProviderProcess();
  rwil = await startRwilProviderProcess();
  process.env.RMN_CONFORMANCE_AGENT = rmn.agentCardUrl;
  process.env.RWIL_RDF_AGENT = rwil.agentCardUrl;
});
test.after(async () => {
  delete process.env.RMN_CONFORMANCE_AGENT;
  delete process.env.RWIL_RDF_AGENT;
  await rwil.close();
  await rmn.close();
});

test("Newswire refuses prose when its inference market contract is unavailable", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-newswire-customer-"));
  const saved = Object.fromEntries(ROUTE_ENV.map((name) => [name, process.env[name]]));
  try {
    for (const name of ROUTE_ENV) delete process.env[name];
    await assert.rejects(procureNewswireProse({
      purpose: "Rehearse a prose commission without consuming inference.",
      assignmentId: "assignment:test-newswire",
      assignmentDigest: recordDigest({ assignmentId: "assignment:test-newswire" }),
      prompt: "Write a reported analysis from https://example.test/source and return prose only.",
      licensedEditorialStateDigest: recordDigest({ licensed: true }),
      researchPacketDigest: recordDigest({ admitted: true }),
      writingPolicyDigest: recordDigest({ writing: "law" }),
      stylePolicyDigest: recordDigest({ style: "law" }),
      requiredSourceUrls: ["https://example.test/source"],
      now: NOW,
      dataDir: join(territory, "koios-data"),
      executionMode: "dry-run",
    }), (error) => /INFERENCE_WORK_LOT_AGENT_CARD_URL/u.test(error.message));
  } finally {
    for (const name of ROUTE_ENV) {
      const value = saved[name];
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(territory, { recursive: true, force: true });
  }
});

test("the ordinary Newswire commission reuses its exact retained article instead of invoking the provider twice", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-newswire-retention-"));
  const providerRoot = join(territory, "provider"), dataDir = join(territory, "koios-data"), countPath = join(territory, "provider-calls.txt");
  const account = "eip155:31337:0x1111111111111111111111111111111111111111";
  mkdirSync(join(providerRoot, "content/evm/accounts"), { recursive: true });
  writeFileSync(join(providerRoot, "package.json"), JSON.stringify({ type: "module", bin: { "invoke-service": "./invoke.mjs" } }));
  writeFileSync(join(providerRoot, "content/evm/accounts/eip155-31337.json"), JSON.stringify({ account: { caip10: account } }));
  writeFileSync(join(providerRoot, "invoke.mjs"), [
    'import { appendFileSync, readFileSync } from "node:fs";',
    'const source = JSON.parse(readFileSync(0, "utf8"));',
    `appendFileSync(${JSON.stringify(countPath)}, "called\\n");`,
    'const object = { disposition: "completion", text: "A complete retained article cites https://example.test/source.", proposal: source.object.proposal.id, completion: "ni:///sha-256;AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", witness: "ni:///sha-256;BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB", inference: { disposition: "candidate-pending-customer-acceptance", provider: "urn:ame:fixture-provider", model: "fixture-model" } };',
    'process.stdout.write(JSON.stringify({ type: "Accept", object }));',
  ].join("\n"));
  const saved = Object.fromEntries(ROUTE_ENV.map((name) => [name, process.env[name]]));
  try {
    process.env.INFERENCE_WORK_LOT_AGENT_CARD_URL = "http://127.0.0.1:9/fixture-market-card";
    const request = {
      purpose: "Produce the admitted article body.",
      assignmentId: "assignment:retained-newswire",
      assignmentDigest: recordDigest({ assignmentId: "assignment:retained-newswire" }),
      prompt: "Write the complete report from the admitted source packet.",
      licensedEditorialStateDigest: recordDigest({ licensed: true }),
      researchPacketDigest: recordDigest({ sources: ["https://example.test/source"] }),
      writingPolicyDigest: recordDigest({ writing: "law" }),
      stylePolicyDigest: recordDigest({ style: "law" }),
      requiredSourceUrls: ["https://example.test/source"],
      dataDir,
      providerRoot,
      executionMode: "live",
    };
    const first = await procureNewswireProse({ ...request, now: "2026-07-20T16:10:00.000Z" });
    const second = await procureNewswireProse({ ...request, now: "2026-07-20T16:11:00.000Z" });
    assert.equal(first.reused, false);
    assert.equal(second.reused, true);
    assert.equal(second.text, first.text);
    assert.equal(readFileSync(countPath, "utf8").trim().split("\n").length, 1);
    assert.equal(readKoiosLedger(dataDir, "provider-usage").filter((entry) => entry.act === "provider.service.consumed").length, 1);
    assert.equal(readKoiosLedger(dataDir, "contract-events").filter((entry) => entry.act === "writer.prose.reused").length, 1);
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    rmSync(territory, { recursive: true, force: true });
  }
});
