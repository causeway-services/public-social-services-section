import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { ACTOR, CONTEXT, CONTRACT, digest, invokeProseContribution, solicitProseContribution } from "../src/contract-prose-contribution.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SOURCE_LISS = resolve(ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section");
const CUSTOMER = "urn:ame:test-publication";
const NOW = "2099-07-18T12:00:00.000Z";

let temp;
let priorDataRoot;
let priorLissRoot;
let priorLissSocket;

test.beforeEach(() => {
  temp = mkdtempSync(join(tmpdir(), "newswire-editorial-production-"));
  const lissRoot = join(temp, "logical-inference-service-section");
  cpSync(SOURCE_LISS, lissRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_LISS, "data")) });
  priorDataRoot = process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT;
  priorLissRoot = process.env.NEWSWIRE_LISS_ROOT;
  priorLissSocket = process.env.NEWSWIRE_LISS_SOCKET;
  process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT = join(temp, "newswire-data");
  process.env.NEWSWIRE_LISS_ROOT = lissRoot;
  process.env.NEWSWIRE_LISS_SOCKET = join(temp, "no-socket", "inference.sock");
});

test.afterEach(() => {
  if (priorDataRoot === undefined) delete process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT; else process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT = priorDataRoot;
  if (priorLissRoot === undefined) delete process.env.NEWSWIRE_LISS_ROOT; else process.env.NEWSWIRE_LISS_ROOT = priorLissRoot;
  if (priorLissSocket === undefined) delete process.env.NEWSWIRE_LISS_SOCKET; else process.env.NEWSWIRE_LISS_SOCKET = priorLissSocket;
  rmSync(temp, { recursive: true, force: true });
});

function demand(overrides = {}) {
  const prompt = "Write a reported analysis using https://example.com/primary and return only the Markdown article body.";
  return {
    type: "ProseContributionDemand",
    purpose: "Draft one reported analysis.",
    assignment: { id: "assignment:test", digest: digest({ id: "assignment:test" }) },
    authorities: {
      licensedEditorialStateDigest: digest({ state: "licensed" }),
      researchPacketDigest: digest({ packet: "admitted" }),
      writingPolicyDigest: digest({ policy: "writing" }),
      stylePolicyDigest: digest({ policy: "style" }),
    },
    commission: { prompt, promptDigest: digest(prompt) },
    requiredSourceUrls: ["https://example.com/primary"],
    route: { executionMode: "dry-run", admissibleTiers: ["free-groq", "leader-claude"], models: { "free-groq": "llama-3.1-8b-instant", "leader-claude": "claude-sonnet-4-6" }, maxTokens: 1500, minimumCharacters: 500 },
    ...overrides,
  };
}

function solicitation(value = demand()) {
  const sourceActivity = { "@context": CONTEXT, id: `urn:source:${digest(value)}`, type: "Create", actor: CUSTOMER, target: ACTOR, object: value };
  return { "@context": CONTEXT, id: `urn:solicitation:${digest(sourceActivity)}`, type: "Offer", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceSolicitation", demand: `urn:demand:${digest(value)}`, sourceActivity } };
}

function contract(offer) {
  const allowedActions = ["invoke-service", ...offer.object.effects];
  const capability = { type: "Capability", issuer: CUSTOMER, holder: ACTOR, invocationTarget: ACTOR, parentOffer: offer.id, allowedActions, attenuation: { demandDigest: offer.object.demandDigest, providerScope: offer.object.scope, customerTerritoryMutation: false } };
  return { "@context": CONTEXT, id: `urn:contract:${offer.id}`, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", contract: CONTRACT, offer, capability } };
}

test("the provider contracts LISS and proves a dry route without producing or writing a manuscript", () => {
  const offer = solicitProseContribution(solicitation(), NOW);
  assert.equal(offer.type, "Offer");
  assert.equal(offer.object.service, "produce-prose-contribution");
  assert.equal(offer.object.lissCarrier, "direct-compatibility");
  assert.equal(offer.object.lissOffer.actor, "urn:ame:logical-inference-service-section");
  assert.deepEqual(offer.object.scope.lissRoute.plan.map((step) => step.tier), ["free-groq", "leader-claude"]);

  const result = invokeProseContribution(contract(offer), NOW);
  assert.equal(result.type, "Accept");
  assert.equal(result.object.type, "ProseContributionDelivery");
  assert.equal(result.object.disposition, "ready");
  assert.equal(result.object.dryRun, true);
  assert.equal(result.object.lissCarrier, "direct-compatibility");
  assert.equal("prose" in result.object, false);
  assert.equal(result.object.providerResult.object.type, "RoutedInferenceResult");
  assert.deepEqual(result.object.providerResult.object.attempts, []);
  assert.equal(result.object.providerExchange.upstreamResultDigest, digest(result.object.providerResult));
  assert.match(readFileSync(join(temp, "newswire-data", "events", "2099", "07", "18", "2099-07-18-newswire-editorial-production-events.jsonl"), "utf8"), /provider\.exchange/u);
});

test("customer filesystem authority cannot masquerade as a prose commission", () => {
  const value = demand({ roots: ["/"], manuscriptPath: "/customer/content/draft.md" });
  const result = solicitProseContribution(solicitation(value), NOW);
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "inadmissible-demand");
  assert.match(result.object.reason, /customer territory authority is inadmissible/u);
});

test("an accepted offer cannot be widened or changed after solicitation", () => {
  const offer = solicitProseContribution(solicitation(), NOW);
  const widened = structuredClone(contract(offer));
  widened.object.offer.object.sourceActivity.object.commission.prompt += " Also write JSON.";
  const result = invokeProseContribution(widened, NOW);
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "invalid-contract");
  assert.match(result.object.reason, /changed or is no longer admissible/u);
});
