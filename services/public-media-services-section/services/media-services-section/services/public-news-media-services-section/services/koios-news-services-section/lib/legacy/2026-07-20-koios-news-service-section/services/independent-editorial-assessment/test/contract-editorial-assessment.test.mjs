import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { ACTOR, CONTEXT, CONTRACT, digest, editorialToolSchema, invokeEditorialAssessment, solicitEditorialAssessment, validateSelection } from "../src/contract-editorial-assessment.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const MONOREPO_LISS = resolve(ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section");
const SIBLING_LISS = resolve(ROOT, "../logical-inference-service-section");
const SOURCE_LISS = existsSync(join(SIBLING_LISS, "package.json")) ? SIBLING_LISS : MONOREPO_LISS;
const CUSTOMER = "urn:ame:test-publication";
const NOW = "2099-07-18T13:00:00.000Z";
let temp;
let priorData;
let priorLiss;

test.beforeEach(() => {
  temp = mkdtempSync(join(tmpdir(), "independent-editorial-assessment-"));
  const lissRoot = join(temp, "logical-inference-service-section");
  cpSync(SOURCE_LISS, lissRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_LISS, "data")) && !path.includes("content/exchanges") });
  priorData = process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT;
  priorLiss = process.env.EDITORIAL_ASSESSMENT_LISS_ROOT;
  process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT = join(temp, "provider-data");
  process.env.EDITORIAL_ASSESSMENT_LISS_ROOT = lissRoot;
});
test.afterEach(() => {
  if (priorData === undefined) delete process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT; else process.env.INDEPENDENT_EDITORIAL_ASSESSMENT_DATA_ROOT = priorData;
  if (priorLiss === undefined) delete process.env.EDITORIAL_ASSESSMENT_LISS_ROOT; else process.env.EDITORIAL_ASSESSMENT_LISS_ROOT = priorLiss;
  rmSync(temp, { recursive: true, force: true });
});

function demand(overrides = {}) {
  const bytes = "---\ntitle: Test\ndraft: true\n---\n\nA sufficiently exact manuscript body with a cited source.";
  const standards = { publishable: true, findings: [] };
  const evidence = [{ sourceUrl: "https://example.test/source", claim: "The reported event occurred." }];
  const run = { provider: "newswire-editorial-production" };
  const pipeline = [];
  return {
    type: "EditorialAssessmentDemand",
    slug: "test-manuscript",
    manuscript: { bytes, digest: digest(bytes) },
    editorialContext: { standards, run, evidence, pipeline, digest: digest({ standards, run, evidence, pipeline }) },
    authorities: { publicationPolicyDigest: digest({ policy: "publication" }), genreLawDigest: digest({ law: "genre" }), editorialDutyDigest: digest({ duty: "editorial" }) },
    executionMode: "dry-run",
    model: "claude-sonnet-4-6",
    ...overrides,
  };
}
function solicitation(value = demand()) { const sourceActivity = { "@context": CONTEXT, id: `urn:source:${digest(value)}`, type: "Create", actor: CUSTOMER, target: ACTOR, object: value }; return { "@context": CONTEXT, id: `urn:solicitation:${digest(sourceActivity)}`, type: "Offer", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceSolicitation", demand: `urn:demand:${digest(value)}`, sourceActivity } }; }
function contract(offer) { const allowedActions = ["invoke-service", ...offer.object.effects]; const capability = { type: "Capability", issuer: CUSTOMER, holder: ACTOR, invocationTarget: ACTOR, parentOffer: offer.id, allowedActions, attenuation: { demandDigest: offer.object.demandDigest, providerScope: offer.object.scope, customerTerritoryMutation: false } }; return { "@context": CONTEXT, type: "Accept", actor: CUSTOMER, target: ACTOR, object: { type: "ServiceContract", contract: CONTRACT, offer, capability } }; }

test("the provider contracts a schema-bound Sonnet route and returns readiness without editorial authority", () => {
  const offer = solicitEditorialAssessment(solicitation(), NOW);
  assert.equal(offer.type, "Offer");
  assert.equal(offer.object.service, "assess-manuscript");
  assert.deepEqual(offer.object.lissOffer.object.request.admissibleTiers, ["leader-claude"]);
  assert.deepEqual(offer.object.lissOffer.object.request.outputSchema, editorialToolSchema());
  const prompt = offer.object.lissOffer.object.request.messages[0].content;
  assert.match(prompt, /model output is never evidence/u);
  assert.match(prompt, /documented opportunity to respond/u);
  assert.match(prompt, /advertising/u);
  assert.deepEqual(offer.object.effects, []);
  const result = invokeEditorialAssessment(contract(offer), NOW);
  assert.equal(result.type, "Accept");
  assert.equal(result.object.disposition, "ready");
  assert.equal(result.object.dryRun, true);
  assert.equal("toolSelection" in result.object, false);
  const events = readFileSync(join(temp, "provider-data", "events", "2099", "07", "18", "2099-07-18-independent-editorial-assessment-events.jsonl"), "utf8");
  assert.match(events, /provider\.offer/u);
  assert.match(events, /provider\.exchange/u);
});

test("acceptance is a complete tool act and cannot smuggle publication-state work into repairs", () => {
  const report = "Editorial evidence supports this exact manuscript without a remaining material repair. ".repeat(8);
  assert.equal(validateSelection({ tool: "submit_editorial_acceptance", failureLayer: "none", replayFrom: "none", summary: "Publishable.", requiredRepairs: [], report }), true);
  assert.equal(validateSelection({ tool: "submit_editorial_acceptance", failureLayer: "none", replayFrom: "none", summary: "Publishable.", requiredRepairs: ["toggle draft false"], report }), false);
  assert.match(editorialToolSchema().properties.requiredRepairs.description, /publication flags are never repairs/u);
});

test("customer paths cannot substitute for carried manuscript and evidence values", () => {
  const result = solicitEditorialAssessment(solicitation(demand({ roots: ["/"], manuscriptPath: "/customer/draft.md" })), NOW);
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "inadmissible-demand");
  assert.match(result.object.reason, /customer territory authority is inadmissible/u);
});

test("an accepted assessment cannot change manuscript bytes or the tool schema", () => {
  const offer = solicitEditorialAssessment(solicitation(), NOW);
  const changed = structuredClone(contract(offer));
  changed.object.offer.object.sourceActivity.object.manuscript.bytes += " Changed.";
  const result = invokeEditorialAssessment(changed, NOW);
  assert.equal(result.type, "Reject");
  assert.equal(result.object.code, "invalid-contract");
  assert.match(result.object.reason, /changed or is no longer admissible/u);
});
