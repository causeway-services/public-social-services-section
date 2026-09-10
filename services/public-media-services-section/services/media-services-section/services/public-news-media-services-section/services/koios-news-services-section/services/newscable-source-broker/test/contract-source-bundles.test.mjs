import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { querySettlementRecords } from "../src/record-journal.mjs";

import { ACTOR, CONTRACT, RECALL_CONTRACT, invokeSourceBundleRecall, invokeSourceBundleService, solicitSourceBundleRecall, solicitSourceBundleService } from "../src/contract-source-bundles.mjs";
import { reconcileLegacySourceAssets } from "../src/reconcile-legacy-source-assets.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const NOW = "2026-07-19T02:25:00.000Z";
const FEED = `data:application/xml,${encodeURIComponent("<rss><channel><item><title>Portable source broker works</title><link>https://example.test/portable</link><description>A declared source became an immutable provider bundle.</description><pubDate>Sun, 19 Jul 2026 02:00:00 GMT</pubDate></item></channel></rss>")}`;
let providerData;
test.beforeEach(() => { providerData = mkdtempSync(join(tmpdir(), "newscable-provider-witness-journal-")); process.env.NEWSCABLE_SOURCE_BROKER_DATA_ROOT = providerData; });
test.afterEach(() => { rmSync(providerData, { recursive: true, force: true }); });

function solicitation() {
  const demand = { type: "SourceBundleDemand", wires: [{ name: "technology", sources: [{ adapter: "rss", url: FEED }] }] };
  const sourceActivity = { "@context": CONTEXT, type: "Create", actor: CUSTOMER, target: ACTOR, object: demand };
  return { "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceSolicitation", sourceActivity } };
}

test("Newscable delivers immutable bundles from provider territory without customer writes", async () => {
  const offer = await solicitSourceBundleService(solicitation(), NOW);
  assert.equal(offer.type, "Offer");
  const result = await invokeSourceBundleService({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", offer } }, NOW);
  assert.equal(result.type, "Accept");
  assert.equal(result.object.bundles.length, 1);
  assert.equal(result.object.bundles[0].bundle.subject, "portable-source-broker-works");
  assert.equal(result.object.providerExchange.price.amount, 0);
  assert.match(result.object.deliveryDigest, /^ni:\/\/\/sha-256;/u);
  assert.equal(querySettlementRecords(`${CONTRACT}.bundles`, { root: providerData }).length, 1);
  assert.equal(querySettlementRecords(`${CONTRACT}.events`, { root: providerData }).some((event) => event.disposition === "settled"), true);
});

test("Newscable recalls a prior provider-held bundle by exact URL without another network fetch", async () => {
  const refreshOffer = await solicitSourceBundleService(solicitation(), NOW);
  const refreshed = await invokeSourceBundleService({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", offer: refreshOffer } }, NOW);
  assert.equal(refreshed.type, "Accept");
  const demand = { type: "SourceBundleRecallDemand", urls: ["https://example.test/portable"] };
  const sourceActivity = { "@context": CONTEXT, type: "Create", actor: CUSTOMER, target: ACTOR, object: demand };
  const recallOffer = await solicitSourceBundleRecall({ "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceSolicitation", sourceActivity } }, "2026-07-19T02:26:00.000Z");
  assert.equal(recallOffer.type, "Offer");
  const recalled = await invokeSourceBundleRecall({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", offer: recallOffer } }, "2026-07-19T02:26:01.000Z");
  assert.equal(recalled.type, "Accept");
  assert.equal(recalled.object.sourceMode, "provider-witness-journal-recall");
  assert.equal(recalled.object.bundles[0].bundle.subject, "portable-source-broker-works");
  assert.equal(recalled.object.providerExchange.networkRequests, 0);
  assert.equal(querySettlementRecords(`${RECALL_CONTRACT}.events`, { root: providerData }).some((event) => event.disposition === "settled"), true);
});

test("Newscable reconciles an already-paid legacy claim bundle once and can recall it without inference or network", async () => {
  const legacyRoot = join(providerData, "ledgers", "exchanges");
  mkdirSync(join(legacyRoot, "culture"), { recursive: true });
  const legacyPath = join(legacyRoot, "culture", "paid-report.json");
  const claim = (predicate, object) => ({ id: predicate, proposition: { predicate, object }, time: { asserted: NOW }, force: "alleges", provenance: { witness: "culture", citation: "https://example.test/already-paid" }, status: "supported" });
  writeFileSync(legacyPath, JSON.stringify({ subject: "already-paid-report", claims: [claim("title", "The report Koios already paid for"), claim("url", "https://example.test/already-paid"), claim("summary", "Prior reporting remains useful inventory."), claim("published", "Sun, 19 Jul 2026 02:00:00 GMT")] }));

  const first = await reconcileLegacySourceAssets({ legacyRoots: [legacyRoot], instant: "2026-07-19T02:27:00.000Z" });
  const second = await reconcileLegacySourceAssets({ legacyRoots: [legacyRoot], instant: "2026-07-19T02:28:00.000Z" });
  assert.deepEqual({ inspected: first.inspected, imported: first.imported, alreadyHeld: first.alreadyHeld, refused: first.refused }, { inspected: 1, imported: 1, alreadyHeld: 0, refused: 0 });
  assert.deepEqual({ inspected: second.inspected, imported: second.imported, alreadyHeld: second.alreadyHeld, refused: second.refused }, { inspected: 1, imported: 0, alreadyHeld: 1, refused: 0 });
  assert.equal(querySettlementRecords(`${CONTRACT}.legacy-bundle-imports`, { root: providerData }).length, 1);
  assert.equal(querySettlementRecords(`${CONTRACT}.legacy-bundle-index`, { root: providerData }).length, 1);

  const demand = { type: "SourceBundleRecallDemand", urls: ["https://example.test/already-paid"] };
  const sourceActivity = { "@context": CONTEXT, type: "Create", actor: CUSTOMER, target: ACTOR, object: demand };
  const recallOffer = await solicitSourceBundleRecall({ "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceSolicitation", sourceActivity } }, "2026-07-19T02:29:00.000Z");
  assert.equal(recallOffer.type, "Offer");
  const recalled = await invokeSourceBundleRecall({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", offer: recallOffer } }, "2026-07-19T02:29:01.000Z");
  assert.equal(recalled.type, "Accept");
  assert.equal(recalled.object.bundles[0].bundle.source.title, "The report Koios already paid for");
  assert.equal(recalled.object.bundles[0].importProvenance.carrier, "newscable-claim-bundle-json");
  assert.equal(recalled.object.providerExchange.networkRequests, 0);
});
