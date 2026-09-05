import assert from "node:assert/strict";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { recordDigest } from "../dist/management/ledger.mjs";
import { refreshSourceCorpus } from "../dist/researching/sourcing/newscable-contract.mjs";

const NOW = "2026-07-19T02:00:00.000Z";
const ACTOR = "https://newscable-source-broker.invalid/activitypub/actor";

function fixtureProvider(root) {
  mkdirSync(root, { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({
    type: "module",
    bin: { "solicit-service": "./provider.mjs", "invoke-service": "./provider.mjs" },
  }));
  writeFileSync(join(root, "provider.mjs"), `
import { createHash } from "node:crypto";
const chunks = []; for await (const chunk of process.stdin) chunks.push(chunk);
const input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
const canonical = (value) => Array.isArray(value) ? \`[\${value.map(canonical).join(",")}]\` : value && typeof value === "object" ? \`{\${Object.keys(value).sort().map((key) => \`\${JSON.stringify(key)}:\${canonical(value[key])}\`).join(",")}}\` : JSON.stringify(value);
const digest = (value) => \`sha256:\${createHash("sha256").update(canonical(value)).digest("hex")}\`;
let output;
if (process.argv[2] === "solicit-service") {
  const sourceActivity = input.object.sourceActivity;
  const demandDigest = digest(sourceActivity.object);
  output = { "@context": input["@context"], type: "Offer", actor: ${JSON.stringify(ACTOR)}, target: input.actor, object: { type: "ServiceOffer", service: "source-bundle-refresh", contract: "newscable-source-broker/source-bundle-service/v1", demandDigest, sourceActivity, capability: { type: "AttenuatedCapability", demandDigest }, price: { amount: 0, currency: "USD" } } };
} else {
  const bundles = [];
  output = { "@context": input["@context"], type: "Accept", actor: ${JSON.stringify(ACTOR)}, target: input.actor, object: { type: "SourceBundleDelivery", deliveryDigest: digest(bundles), bundles, results: [], providerExchange: { exchangeId: "fixture-exchange", provider: "fixture-newscable", price: { amount: 0, currency: "USD" } } } };
}
process.stdout.write(JSON.stringify(output) + "\\n");
`);
}

test("Koios resolves Newscable through its advertised portable provider root", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-newscable-customer-"));
  const providerRoot = join(territory, "provider");
  const customerRoot = join(territory, "customer");
  fixtureProvider(providerRoot);
  mkdirSync(customerRoot, { recursive: true });
  const configPath = join(customerRoot, "producing-content.config.json");
  writeFileSync(configPath, JSON.stringify({ newscable: { wires: [{ name: "technology", store: "store/technology", sources: [{ adapter: "rss", url: "https://example.test/feed.xml" }] }] } }));

  const result = refreshSourceCorpus({ configPath, dataDir: join(customerRoot, "data"), providerRoot, now: NOW });
  assert.equal(result.contract, "newscable-source-broker/source-bundle-service/v1");
  assert.equal(result.deliveryDigest, recordDigest([]));
  assert.equal(result.offered, 0);
  assert.equal(existsSync(join(providerRoot, "data")), false, "customer treaty does not write provider territory");
  assert.equal(existsSync(join(customerRoot, "data")), true, "Koios records its own contract settlement");
  assert.match(readFileSync(join(providerRoot, "package.json"), "utf8"), /solicit-service/u);
});
