import { createHash } from "node:crypto";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";

export const RECEIPT_KIND = "koios.news.editorial-admission-local-custody-receipt/v1";
export const AS_CONTEXT = "https://www.w3.org/ns/activitystreams";
export const EDITORIAL_ACTOR = "urn:ame:independent-editorial-assessment";

const sha256 = (value) => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const isNi = (value) => /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u.test(value ?? "");
function fail(message) { throw new TypeError(`editorial admission receipt: ${message}`); }
function exactText(value, label) { if (typeof value !== "string" || value.length === 0) fail(`${label} is required`); return value; }
function parseJson(source, label) { try { return JSON.parse(exactText(source, label)); } catch (error) { fail(`${label} is not JSON: ${error.message}`); } }
function acceptance(selection) {
  if (!isRecord(selection) || selection.tool !== "submit_editorial_acceptance" || selection.failureLayer !== "none" || !Array.isArray(selection.requiredRepairs) || selection.requiredRepairs.length !== 0 || !Array.isArray(selection.repairTools) || selection.repairTools.length !== 0) fail("delivery does not contain a complete editorial acceptance");
}
function contractDemand(contract) {
  const object = contract?.object;
  const offer = object?.offer;
  const demand = offer?.object?.sourceActivity?.object;
  if (contract?.["@context"] !== AS_CONTEXT || contract?.type !== "Accept" || object?.type !== "ServiceContract") fail("contract is not an ActivityStreams ServiceContract");
  if (offer?.actor !== EDITORIAL_ACTOR || offer?.object?.service !== "assess-manuscript" || offer?.object?.scope?.serviceClass !== "editorial-judgment") fail("contract does not name the independent editorial assessment service");
  if (!isRecord(demand) || demand.type !== "EditorialAssessmentDemand" || !isRecord(demand.manuscript)) fail("contract lacks its exact editorial demand");
  if (offer.object.demandDigest !== semanticDigest(demand)) fail("contract demand digest is not the semantic identity of its carried demand");
  return { offer, demand };
}
function inspectInputs({ manuscriptSource, contractSource, deliverySource, ledgerSource, ledgerCoordinate }) {
  const manuscriptDigest = sha256(exactText(manuscriptSource, "manuscript"));
  const contract = parseJson(contractSource, "contract");
  const delivery = parseJson(deliverySource, "delivery");
  const { offer, demand } = contractDemand(contract);
  if (demand.manuscript.bytes !== manuscriptSource || demand.manuscript.digest !== manuscriptDigest) fail("contract demand is not bound to the supplied exact manuscript bytes");
  if (delivery?.["@context"] !== AS_CONTEXT || delivery?.type !== "Accept" || delivery?.actor !== EDITORIAL_ACTOR || delivery?.object?.type !== "EditorialToolSelectionDelivery" || delivery?.object?.disposition !== "completion" || delivery?.object?.dryRun !== false) fail("delivery is not a completed independent editorial assessment");
  if (delivery.object.demandDigest !== offer.object.demandDigest || delivery.object.manuscriptDigest !== manuscriptDigest) fail("delivery does not bind this contract demand and manuscript");
  acceptance(delivery.object.toolSelection);
  if (!isNi(delivery.object.toolSelectionDigest) || delivery.object.toolSelectionDigest !== semanticDigest(delivery.object.toolSelection)) fail("delivery tool-selection digest is absent or cannot be locally proven");
  const coordinate = exactText(ledgerCoordinate, "ledger coordinate");
  if (!isNi(coordinate)) fail("ledger coordinate must be a SHA-256 NI token");
  const lines = exactText(ledgerSource, "ledger").split(/\r?\n/u).filter(Boolean);
  let entry;
  for (const line of lines) {
    const candidate = parseJson(line, "ledger entry");
    if (candidate?.e === coordinate) { if (entry !== undefined) fail("ledger coordinate is ambiguous"); entry = candidate; }
  }
  if (!isRecord(entry) || entry.a !== "independent-editorial-assessment.provider.exchange" || !isRecord(entry.v)) fail("ledger coordinate is not a provider-exchange entry");
  if (entry.e !== semanticDigestFor("koios-news.independent-editorial-assessment.record", entry.v)) fail("ledger coordinate does not match its semantic-record-journal value");
  if (entry.v.provider !== EDITORIAL_ACTOR || entry.v.outcome !== "completion" || entry.v.demandDigest !== delivery.object.demandDigest || entry.v.toolSelectionDigest !== delivery.object.toolSelectionDigest) fail("ledger entry does not witness this completed selection");
  return Object.freeze({ manuscriptDigest, contractDigest: sha256(contractSource), deliveryDigest: sha256(deliverySource), ledgerDigest: sha256(ledgerSource), delivery, entry, coordinate });
}

function semanticDigest(value) { return identifyJsonSemanticContent({ objectKind: "rsc-quiescent.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token; }
function semanticDigestFor(objectKind, value) { return identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).id; }

export function exportReceipt(input) {
  const facts = inspectInputs({ ...input, ledgerCoordinate: input.ledgerCoordinate });
  return Object.freeze({
    kind: RECEIPT_KIND,
    proof: Object.freeze({ kind: "local-custody-proof", verifiedIssuerAuthority: false, issuer: EDITORIAL_ACTOR, limitation: "No cryptographic issuer key or signature authority was proven by the supplied evidence; this receipt is not signed editorial authority." }),
    admission: Object.freeze({ status: "editorial-selection-evidenced", routinePublicationAuthority: false, limitation: "This records a completed editorial tool selection only. It neither creates an admission nor authorizes publication." }),
    manuscript: Object.freeze({ digest: facts.manuscriptDigest }),
    judgment: Object.freeze({ contractDigest: facts.contractDigest, demandDigest: facts.delivery.object.demandDigest, toolSelectionDigest: facts.delivery.object.toolSelectionDigest, selectedTool: facts.delivery.object.toolSelection.tool, disposition: facts.delivery.object.disposition }),
    ledger: Object.freeze({ coordinate: facts.coordinate, sourceDigest: facts.ledgerDigest, category: facts.entry.a, recordedAt: facts.entry.t }),
    sources: Object.freeze({ deliveryDigest: facts.deliveryDigest }),
  });
}

export function verifyReceipt({ receiptSource, manuscriptSource, contractSource, deliverySource, ledgerSource }) {
  const receipt = parseJson(receiptSource, "receipt");
  if (!isRecord(receipt) || receipt.kind !== RECEIPT_KIND) fail("receipt kind is not recognized");
  if (receipt?.proof?.kind !== "local-custody-proof" || receipt.proof.verifiedIssuerAuthority !== false || receipt.proof.issuer !== EDITORIAL_ACTOR) fail("receipt must explicitly remain an unsigned local custody proof");
  if (receipt?.admission?.routinePublicationAuthority !== false) fail("receipt must not claim routine publication authority");
  const rebuilt = exportReceipt({ manuscriptSource, contractSource, deliverySource, ledgerSource, ledgerCoordinate: receipt?.ledger?.coordinate });
  const expected = JSON.stringify(rebuilt);
  if (JSON.stringify(receipt) !== expected) fail("receipt does not exactly match the supplied local evidence");
  return Object.freeze({ ok: true, kind: RECEIPT_KIND, authority: "unsigned-local-custody-proof", routinePublicationAuthority: false, manuscriptDigest: rebuilt.manuscript.digest, ledgerCoordinate: rebuilt.ledger.coordinate });
}
