import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { querySettlementRecords } from "@lenticule-science/rwil-rdf-projection-service/client";
import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";
import { recordDigest } from "../dist/management/ledger.mjs";
import { SOURCE_BUNDLE_CONTRACT, SOURCE_BUNDLE_RECALL_CONTRACT, recallSourceBundles, refreshSourceCorpus } from "../dist/researching/sourcing/newscable-contract.mjs";

const NOW = "2026-07-19T02:00:00.000Z";
const PROVIDER_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../services/newscable-source-broker");
const FEED = `data:application/xml,${encodeURIComponent("<rss><channel><item><title>Koios customer seam works</title><link>https://example.test/customer-seam</link><description>A directly contracted provider report crosses into Koios RWIL.</description><pubDate>Sun, 19 Jul 2026 02:00:00 GMT</pubDate></item></channel></rss>")}`;
let rwil;
test.before(async () => { rwil = await startRwilProviderProcess(); process.env.RWIL_RDF_AGENT = rwil.agentCardUrl; });
test.after(async () => { await rwil.close(); });

test("Koios contracts Newscable by RMN law and independently admits provider bundles to RWIL", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-newscable-customer-"));
  try {
    const customerRoot = join(territory, "customer"); const customerData = join(customerRoot, "data"); const providerData = join(territory, "provider-rwil");
    process.env.NEWSCABLE_SOURCE_BROKER_DATA_ROOT = providerData;
    mkdirSync(customerRoot, { recursive: true });
    const configPath = join(customerRoot, "producing-content.config.json");
    writeFileSync(configPath, JSON.stringify({ newscable: { wires: [{ name: "technology", sources: [{ adapter: "rss", url: FEED }] }] } }));

    const result = await refreshSourceCorpus({ configPath, dataDir: customerData, providerRoot: PROVIDER_ROOT, now: NOW });
    assert.equal(result.contract, SOURCE_BUNDLE_CONTRACT);
    assert.match(result.deliveryDigest, /^ni:\/\/\/sha-256;/u);
    assert.equal(result.offered, 1);
    assert.equal(result.admitted, 1);
    const [admission] = await querySettlementRecords(`${SOURCE_BUNDLE_CONTRACT}.admissions`);
    assert.equal(admission.bundle.id, admission.digest);
    const { id: _id, ...bundleBody } = admission.bundle;
    assert.equal(recordDigest(bundleBody), admission.digest);
    assert.deepEqual(admission.outcome, { positiveEvidence: true, negativeEvidence: false });

    const recalled = await recallSourceBundles({ sourceUrls: ["https://example.test/customer-seam"], dataDir: customerData, providerRoot: PROVIDER_ROOT, now: "2026-07-19T02:01:00.000Z" });
    assert.equal(recalled.object.sourceMode, "provider-rwil-recall");
    assert.equal(recalled.object.law, SOURCE_BUNDLE_RECALL_CONTRACT);
    assert.equal(recalled.object.bundles[0].bundle.subject, "koios-customer-seam-works");
    assert.equal(recalled.object.providerExchange.networkRequests, 0);
    assert.equal((await querySettlementRecords(`${SOURCE_BUNDLE_RECALL_CONTRACT}.receipts`)).length, 1);
  } finally { rmSync(territory, { recursive: true, force: true }); }
});
