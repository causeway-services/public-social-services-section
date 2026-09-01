import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { issueArticleAdInventoryLot } from "../dist/management/article-ad-inventory.mjs";
import { COMMISSIONED_JOURNALISM_CONTRACT, settleCommissionedJournalismDelivery } from "../dist/management/commissioned-journalism-service.mjs";
import { appendDatedRecord, readKoiosLedger } from "../dist/management/ledger.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const NOW = "2026-07-19T21:00:00.000Z";

function rawNi(bytes) {
  return identifyJsonSemanticContent({ objectKind: "koios-news.test-artifact", value: { encoding: "base64", bytes: Buffer.from(bytes).toString("base64") }, witnessRoot: EMPTY_WITNESS_ROOT }).token;
}

test("Publishing buys only a warranted article descended from its exact opportunity purchase", () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-product-triangle-"));
  const pulseId = "urn:test:product-triangle";
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "audience-product",
    instant: NOW,
    record: { kind: "koios.keyword-opportunity-brief", orderId: `${pulseId}:keyword-research`, brief: { briefDigest: "sha256:opportunity" } },
  });
  const result = {
    kind: "koios.newsroom-circuit",
    disposition: "published",
    assignmentId: "urn:test:assignment",
    slug: "tested-article",
    transitions: [],
    candidate: { manifestDigest: "ni:///sha-256;article", routeCount: 1, outputDir: "/tmp/candidate", profile: "cutover-candidate" },
  };
  const sale = settleCommissionedJournalismDelivery({ dataDir, pulseId, result, settledAt: NOW });
  assert.equal(sale.delivery.contract, COMMISSIONED_JOURNALISM_CONTRACT);
  assert.equal(sale.delivery.opportunityBriefDigest, "sha256:opportunity");
  assert.equal(sale.delivery.publicStatus, "candidate-not-yet-live");
  assert.equal(sale.internalMarketSettlement.receipt.buyer, "urn:micro-enterprise:koios.news:publishing-and-ad-inventory");
  assert.equal(sale.internalMarketSettlement.receipt.seller, "urn:micro-enterprise:koios.news:journalism-commissioning");
  assert.equal(sale.internalMarketSettlement.receipt.consideration.unit, "commissioned-journalism-credit");
  assert.equal(sale.internalMarketSettlement.receipt.payment.monetaryClaim, false);
  assert.equal(readKoiosLedger(dataDir, "internal-market").length, 3);

  assert.throws(() => settleCommissionedJournalismDelivery({ dataDir, pulseId, result: { ...result, disposition: "refused", candidate: undefined }, settledAt: NOW }), /only an editorially admitted article/u);
});

test("a public witness turns the article into bounded ad inventory, not imaginary revenue", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-ad-inventory-"));
  const dataDir = join(root, "data");
  const candidateDir = join(root, "candidate");
  mkdirSync(join(candidateDir, "posts", "tested-article"), { recursive: true });
  writeFileSync(join(candidateDir, "posts", "tested-article", "index.html"), '<article>story</article><div data-provider="a-ads" data-placement="article-banner" data-unit="123"></div>');
  const manifest = `${JSON.stringify({ policy: { advertising: true }, artifacts: [{ route: "/posts/tested-article", file: "posts/tested-article/index.html" }] })}\n`;
  writeFileSync(join(candidateDir, "manifest.json"), manifest);
  const manifestDigest = rawNi(Buffer.from(manifest));
  const lot = issueArticleAdInventoryLot({
    dataDir,
    assignmentId: "urn:test:assignment",
    slug: "tested-article",
    candidateDir,
    artifactManifestDigest: manifestDigest,
    publicWitness: { witnessed: true, witnessDigest: "sha256:public-witness" },
    issuedAt: NOW,
  });
  assert.equal(lot.contract, "koios.news/article-ad-inventory/v1");
  assert.equal(lot.readerIsCommodity, false);
  assert.equal(lot.externalRevenueObserved, false);
  assert.equal(lot.placements.length, 1);
  assert.equal(lot.placements[0].placement, "article-banner");
  assert.match(lot.saleStatus, /awaiting-external/u);
  const replay = issueArticleAdInventoryLot({ dataDir, assignmentId: "urn:test:assignment", slug: "tested-article", candidateDir, artifactManifestDigest: manifestDigest, publicWitness: { witnessed: true, witnessDigest: "sha256:public-witness" }, issuedAt: NOW });
  assert.equal(replay.id, lot.id);
  assert.equal(readKoiosLedger(dataDir, "advertising").filter((entry) => entry.act === "advertising.inventory-lot.available").length, 1);

  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["commissioned-journalism"].contract, COMMISSIONED_JOURNALISM_CONTRACT);
  assert.equal(pkg["x-agentic-metro-enterprise"]["operation-catalog"]["article-ad-inventory"].contract, "koios.news/article-ad-inventory/v1");
});
