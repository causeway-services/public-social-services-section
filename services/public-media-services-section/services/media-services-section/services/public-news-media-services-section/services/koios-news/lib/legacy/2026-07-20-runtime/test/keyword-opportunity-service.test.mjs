import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  KEYWORD_RESEARCH_CONTRACT,
  buyKeywordOpportunityResearch,
  settleKeywordOpportunityResearchOrder,
} from "../dist/management/keyword-opportunity-service.mjs";
import { readKoiosLedger } from "../dist/management/ledger.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("Journalism Commissioning buys a digest-bound keyword brief from Koios Keyword Research", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-keyword-market-"));
  const input = {
    orderId: "urn:test:issue:keyword-research",
    now: "2026-07-19T20:30:00.000Z",
    dataDir,
    contentDir: join(ROOT, "content", "posts"),
    configPath: join(ROOT, "producing-content.config.json"),
    trendProbe: { ok: true, source: "test-trends", items: [{ term: "Princess Diaries 3", traffic: "50K+" }] },
  };
  const purchase = await buyKeywordOpportunityResearch(input);
  assert.equal(purchase.brief.contract, KEYWORD_RESEARCH_CONTRACT);
  assert.equal(purchase.brief.factualWarrant, false);
  assert.equal(purchase.brief.use, "assignment-selection-only");
  assert.equal(purchase.brief.trendProbe.source, "test-trends");
  assert.ok(purchase.brief.measuredDemand.length > 0);
  assert.match(purchase.brief.briefDigest, /^sha256:/u);

  const market = readKoiosLedger(dataDir, "internal-market");
  assert.equal(market.length, 3);
  const receipt = market[0].data;
  assert.equal(receipt.contract, KEYWORD_RESEARCH_CONTRACT);
  assert.equal(receipt.buyer, "urn:micro-enterprise:koios.news:journalism-commissioning");
  assert.equal(receipt.seller, "urn:micro-enterprise:koios.news:keyword-research");
  assert.equal(receipt.consideration.unit, "keyword-opportunity-research-credit");
  assert.equal(receipt.payment.monetaryClaim, false);
  assert.equal(readKoiosLedger(dataDir, "audience-product").filter((entry) => entry.kind === "koios.keyword-opportunity-brief").length, 1);

  const replay = await buyKeywordOpportunityResearch({ ...input, now: "2026-07-19T20:31:00.000Z" });
  assert.equal(replay.brief.briefDigest, purchase.brief.briefDigest);
  assert.equal(readKoiosLedger(dataDir, "internal-market").length, 3);
});

test("Keyword Research refuses ambient callers before reading or writing Koios state", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-keyword-refusal-"));
  const response = await settleKeywordOpportunityResearchOrder({
    "@context": "https://www.w3.org/ns/activitystreams",
    id: "urn:test:ambient",
    type: "Create",
    actor: "urn:test:ambient-controller",
    target: "urn:micro-enterprise:koios.news:keyword-research",
    object: { type: "KeywordOpportunityResearchOrder", contract: KEYWORD_RESEARCH_CONTRACT, orderId: "urn:test:ambient" },
  }, { now: "2026-07-19T20:30:00.000Z", dataDir, contentDir: join(ROOT, "content", "posts"), configPath: join(ROOT, "producing-content.config.json") });
  assert.equal(response.type, "Reject");
  assert.equal(readKoiosLedger(dataDir, "internal-market").length, 0);
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg.bin["operate-keyword-research"], "./dist/operate-keyword-research.mjs");
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["operate-keyword-research"].contract, KEYWORD_RESEARCH_CONTRACT);
});
