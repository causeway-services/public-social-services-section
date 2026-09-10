import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";
import { startRwilProviderProcess } from "@lenticule-science/rwil-rdf-projection-service/test-provider";

import { isReportablePublicSourceCandidate, procurePublicSourceDiscovery } from "../dist/researching/sourcing/public-source-discovery-contract.mjs";
import { readKoiosLedger } from "../dist/management/ledger.mjs";

const NOW = "2026-07-19T21:30:00.000Z";

let rwil;
let priorRwilAgent;
test.before(async () => { priorRwilAgent = process.env.RWIL_RDF_AGENT; rwil = await startRwilProviderProcess(); process.env.RWIL_RDF_AGENT = rwil.agentCardUrl; });
test.after(async () => { if (priorRwilAgent === undefined) delete process.env.RWIL_RDF_AGENT; else process.env.RWIL_RDF_AGENT = priorRwilAgent; await rwil.close(); });

test("source discovery refuses navigation, stock-photo, and video results before retrieval", () => {
  const candidate = (url, title) => ({ type: "PublicSourceDiscoveryCandidate", url, title });
  assert.equal(isReportablePublicSourceCandidate(candidate("https://www.gettyimages.ae/detail/news-photo/eva-longoria-news-photo/1", "Eva Longoria is seen in New York City")), false);
  assert.equal(isReportablePublicSourceCandidate(candidate("https://example.com/tags/eva-longoria", "Eva Longoria celebrity news")), false);
  assert.equal(isReportablePublicSourceCandidate(candidate("https://youtube.com/shorts/abc", "Eva Longoria arrives at Cannes")), false);
  assert.equal(isReportablePublicSourceCandidate(candidate("https://www.harpersbazaar.com/celebrity/latest/a71361884/eva-longoria-cannes-film-festival-2026-outfit-streak", "Eva Longoria Wears Five Different Looks at Cannes")), true);
});

function fixtureProvider(root) {
  mkdirSync(join(root, "src"), { recursive: true });
  writeFileSync(join(root, "package.json"), JSON.stringify({ type: "module", bin: { "solicit-source-discovery": "./src/provider.mjs", "invoke-source-discovery": "./src/provider.mjs" } }));
  const rmn = pathToFileURL(join(process.cwd(), "node_modules/@red-cup-engineering/relation-model-notation-cbor-codec/src/index.mjs")).href;
  const rwil = pathToFileURL(join(process.cwd(), "node_modules/@lenticule-science/rwil-rdf-projection-service/src/rwil-rdf.mjs")).href;
  writeFileSync(join(root, "src/provider.mjs"), `
import { semanticId } from ${JSON.stringify(rmn)};
import { relationalRwilDocument } from ${JSON.stringify(rwil)};
const digest=(v)=>semanticId(relationalRwilDocument(v));
const chunks=[]; for await (const chunk of process.stdin) chunks.push(chunk);
const activity=JSON.parse(Buffer.concat(chunks).toString("utf8"));
const command=process.argv[2]; const now=process.argv[3];
if(command==="solicit-source-discovery") {
  const sourceActivity=activity.object.sourceActivity;
  const demandDigest=digest(sourceActivity.object);
  console.log(JSON.stringify({"@context":"https://www.w3.org/ns/activitystreams",id:"urn:test:offer",type:"Offer",actor:"urn:ame:web-source-acquisition",target:activity.actor,published:now,object:{type:"ServiceOffer",service:"public-source-discovery",contract:"ni:///sha-256;otqx16XpWh1j0spvQvtPTgcKzL_cNWrQFF3qk3U8Ii0",demandDigest,sourceActivity,capability:{type:"AttenuatedCapability",effect:"discover-grounded-public-source-candidates",demandDigest},consideration:{amount:1,unit:"google-ai-studio-grounded-search-request",monetaryClaim:false}}}));
} else {
  const offer=activity.object.offer;
  const lead=offer.object.sourceActivity.object.lead;
  const candidates=[{type:"PublicSourceDiscoveryCandidate",rank:1,url:"https://independent.example/report",title:"Independent report",custody:"google-search-grounding-metadata",admission:"candidate-only-requires-independent-retrieval-and-editorial-admission"}];
  const core={type:"PublicSourceDiscoveryDelivery",purpose:"journalistic-source-discovery",lead,candidates,searchQueries:["fixture query"],carrier:"google-search-grounding",model:"fixture-grounded-model",providerResponseDigest:digest("provider-response"),factualWarrant:false,customerTerritoryMutation:false,discoveredAt:now,resourceAccount:{groundedSearchRequests:1,citationResolutionRequests:0,responseBytes:100,promptCharacters:200,candidateCount:1,monetaryPrice:{status:"not-observed"}}};
  const deliveryDigest=digest(core);
  console.log(JSON.stringify({"@context":"https://www.w3.org/ns/activitystreams",type:"Accept",actor:"urn:ame:web-source-acquisition",target:activity.actor,published:now,code:"source-discovery-settled",summary:"fixture",object:{status:"settled",...core,deliveryDigest,providerExchange:{exchangeId:"fixture-exchange",provider:"web-source-acquisition",service:"public-source-discovery",consideration:offer.object.consideration,demandDigest:offer.object.demandDigest,deliveryDigest,candidateCount:1,resourceAccount:core.resourceAccount,recordedAt:now}}}));
}
`);
}

test("Journalism Commissioning purchases grounded discovery without treating it as warrant", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-public-source-discovery-"));
  const providerRoot = join(territory, "provider");
  const dataDir = join(territory, "customer-data");
  fixtureProvider(providerRoot);
  const result = await procurePublicSourceDiscovery({
    requestId: "commission:one:discovery",
    lead: { title: "A lead that needs corroboration", url: "https://lead.example/story", published: "2026-07-19T18:00:00Z", summary: "A bounded source summary." },
    queryHints: ["named event public records"],
    excludedUrls: ["https://lead.example/story"],
    now: NOW,
    dataDir,
    providerRoot,
  });
  assert.deepEqual(result.candidateUrls, ["https://independent.example/report"]);
  assert.equal(result.delivery.object.factualWarrant, false);
  const sourceLedger = readKoiosLedger(dataDir, "source-claims");
  const usageLedger = readKoiosLedger(dataDir, "provider-usage");
  assert.equal(sourceLedger[0].kind, "koios.public-source-discovery");
  assert.equal(usageLedger[0].data.consideration.unit, "google-ai-studio-grounded-search-request");
  assert.equal(usageLedger.some((record) => record.act === "external.revenue.received"), false);

  writeFileSync(join(providerRoot, "src/provider.mjs"), "throw new Error('a same-day recall must not invoke the provider again');\n");
  const recalled = await procurePublicSourceDiscovery({
    requestId: "commission:two:discovery",
    lead: { title: "A lead that needs corroboration", url: "https://lead.example/story", published: "2026-07-19T18:00:00Z", summary: "A bounded source summary." },
    queryHints: ["named event public records"],
    excludedUrls: ["https://lead.example/story"],
    now: "2026-07-19T21:35:00.000Z",
    dataDir,
    providerRoot,
  });
  assert.deepEqual(recalled.candidateUrls, result.candidateUrls);
  assert.equal(readKoiosLedger(dataDir, "source-claims").length, 1);
  assert.equal(readKoiosLedger(dataDir, "provider-usage").length, 1);
  assert.equal(readKoiosLedger(dataDir, "contract-events").some((record) => record.act === "source-discovery.public-web.recalled"), true);
});
