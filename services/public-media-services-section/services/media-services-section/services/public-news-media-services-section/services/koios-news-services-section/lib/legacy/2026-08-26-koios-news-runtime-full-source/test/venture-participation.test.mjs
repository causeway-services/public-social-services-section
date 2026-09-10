import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { runVentureParticipation } from "../dist/venture-participation.mjs";

const C = "https://www.w3.org/ns/activitystreams";
const LMT = "urn:ame:leader-movement-team";
const KOIOS = "urn:ame:koios.news";
const NOW = "2096-07-19T12:00:00.000Z";

function intent(participant = "urn:leader:emsenn") {
  return {
    type: "VentureParticipationIntent",
    mode: "join-existing",
    venture: KOIOS,
    participant,
    requestedRole: "micro-enterprise-owner",
    externalUserOutcome: "readers choose Koios reporting and receive warranted useful understanding",
    revenueCounterparties: ["advertisers", "outside publication-product buyers"],
    contributions: [
      { type: "DomainUse", asset: "koios.news", custodian: participant, valuation: "unsettled-not-zero" },
      { type: "PaidInferenceAccess", asset: "interactive inference subscriptions", custodian: participant, valuation: "unsettled-not-zero" },
      { type: "EntrepreneurialAttention", asset: "Leader time and direction", custodian: participant, valuation: "unsettled-not-zero" },
    ],
    leadingGoal: { period: "P30D", measure: "verified external revenue minus all attributable resource and provider cost", target: { relation: "greater-than", amount: 0, unit: "USD" }, benchmarkStatus: "minimum external market proof; successor requires a best-available publisher benchmark" },
    downside: ["contributions are at risk", "no value-added means no participant payment", "a sustained miss opens the owner role to a successor bid"],
    distribution: { beneficiary: participant, share: 1, basis: "Koios value-added remaining after provider obligations, contributed-resource cost, and reserves; successor required when another at-risk participant joins" },
  };
}
function solicitation(value = intent()) {
  const source = { "@context": C, id: "urn:leader:venture", type: "Create", actor: value.participant, target: LMT, object: { type: "Note", content: "I want to participate in Koios for profit", attachment: [{ ...value }, { type: "ResourceGrant", id: "urn:grant:koios-venture", effects: ["provider-local-write"], maxRuntimeMs: 30000 }] } };
  return { "@context": C, id: "urn:lmt:solicitation", type: "Offer", actor: LMT, target: KOIOS, object: { type: "VentureParticipationSolicitation", sourceActivity: source, intent: value } };
}
function contract(offer) {
  return { "@context": C, id: "urn:lmt:accept", type: "Accept", actor: LMT, target: KOIOS, object: { type: "VentureParticipationContract", contract: offer.object.contract, offer, capability: { type: "Capability", holder: KOIOS, invocationTarget: KOIOS, parentOffer: offer.id, allowedActions: ["invoke-participation", "provider-local-write"] } } };
}
function rows(root, type) {
  const day = NOW.slice(0, 10); const [year, month, date] = day.split("-");
  const path = join(root, "data", type, year, month, date, `${day}-koios-news-${type}.jsonl`);
  return readFileSync(path, "utf8").trim().split("\n").map(JSON.parse);
}

test("Koios forms an entrepreneur relation without selling its publication cycle or inventing profit", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-venture-participation-"));
  try {
    const request = solicitation();
    const offer = runVentureParticipation(request, "solicit-participation", NOW, root);
    assert.equal(offer.type, "Offer");
    assert.equal(offer.object.type, "ExecutableParticipationOffer");
    assert.equal(offer.object.terms.internalMetabolismSoldToParticipant, false);
    assert.equal(offer.object.scope.internalServiceCustomer, false);
    const result = runVentureParticipation(contract(offer), "invoke-participation", NOW, root);
    assert.equal(result.type, "Accept");
    assert.equal(result.object.requestedRole, "micro-enterprise-owner");
    assert.deepEqual(result.object.threeRights, ["decision", "personnel", "distribution"]);
    assert.equal(result.object.profitStatus, "unproven-no-settled-external-value");
    const agreement = rows(root, "venture-participations")[0];
    assert.equal(agreement.participantIsCustomer, false);
    assert.equal(agreement.internalMetabolismIsProduct, false);
    const opening = rows(root, "venture-value-events")[0];
    assert.equal(opening.distributableValue, 0);
    assert.equal(opening.participantPayment, 0);
    assert.equal(opening.attributableCosts, "unsettled-not-zero");
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test("Koios refuses a second owner without successor qiangdan and never accepts embedded credential material", () => {
  const root = mkdtempSync(join(tmpdir(), "koios-venture-participation-"));
  try {
    const first = runVentureParticipation(solicitation(), "solicit-participation", NOW, root);
    assert.equal(runVentureParticipation(contract(first), "invoke-participation", NOW, root).type, "Accept");
    const second = runVentureParticipation(solicitation(intent("urn:leader:other")), "solicit-participation", NOW, root);
    assert.equal(second.type, "Question");
    assert.equal(second.object.type, "MicroEnterpriseOwnerRoleOccupied");
    const unsafe = intent(); unsafe.contributions.push({ type: "Account", apiKey: "must-not-cross" });
    const unsafeResult = runVentureParticipation(solicitation(unsafe), "solicit-participation", NOW, root);
    assert.equal(unsafeResult.type, "Question");
    assert.ok(unsafeResult.object.missing.includes("credential-material-forbidden"));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
