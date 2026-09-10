import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { ACTOR, invokeSourceBundleService, solicitSourceBundleService } from "../src/contract-source-bundles.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const NOW = "2026-07-19T02:25:00.000Z";
const FEED = `data:application/xml,${encodeURIComponent("<rss><channel><item><title>Portable source broker works</title><link>https://example.test/portable</link><description>A declared source became an immutable provider bundle.</description><pubDate>Sun, 19 Jul 2026 02:00:00 GMT</pubDate></item></channel></rss>")}`;

function solicitation() {
  const demand = { type: "SourceBundleDemand", wires: [{ name: "technology", sources: [{ adapter: "rss", url: FEED }] }] };
  const sourceActivity = { "@context": CONTEXT, type: "Create", actor: CUSTOMER, target: ACTOR, object: demand };
  return { "@context": CONTEXT, type: "Offer", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceSolicitation", sourceActivity } };
}

test("Newscable delivers immutable bundles from provider territory without customer writes", async () => {
  const providerData = mkdtempSync(join(tmpdir(), "newscable-provider-data-"));
  process.env["NEWSCABLE_SOURCE_BROKER_DATA_ROOT"] = providerData;
  const offer = solicitSourceBundleService(solicitation(), NOW);
  assert.equal(offer.type, "Offer");
  const result = await invokeSourceBundleService({ "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", offer } }, NOW);
  assert.equal(result.type, "Accept");
  assert.equal(result.object.bundles.length, 1);
  assert.equal(result.object.bundles[0].bundle.subject, "portable-source-broker-works");
  assert.equal(result.object.providerExchange.price.amount, 0);
  assert.match(readFileSync(join(providerData, "events", "2026", "07", "19", "2026-07-19-newscable-source-broker-events.jsonl"), "utf8"), /provider.delivery/u);
});
