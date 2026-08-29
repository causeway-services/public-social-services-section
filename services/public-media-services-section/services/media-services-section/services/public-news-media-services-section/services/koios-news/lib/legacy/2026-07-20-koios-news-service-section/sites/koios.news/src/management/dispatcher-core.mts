// @ts-nocheck
import { createHash } from "node:crypto";
export const CONTEXT = "https://www.w3.org/ns/activitystreams", KOIOS = "urn:ame:koios-news", LISS = "urn:ame:logical-inference-service-section", LISS_CONTRACT = "inference-fabric-activitystreams-service";
const canonical = (value) => Array.isArray(value) ? `[${value.map(canonical).join(",")}]` : value && typeof value === "object" ? `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}` : JSON.stringify(value);
export const digest = (value) => `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
const id = (value) => `urn:${digest(value)}`, required = (value, name) => { if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} must be non-empty text`); return value; };
export function formNewsroomRepairDemand(reading) {
  for (const key of ["assignmentId", "learningEvidenceDigest", "assignmentDigest", "sourcePacketDigest", "terminalCircuitDigest", "failureLayer", "proposedMove"]) required(reading?.[key], key);
  if (!["repair-draft", "replay-writer"].includes(reading.proposedMove)) { const missing = ({"source-intelligence":"source-replay-dispatch-service",sources:"source-replay-dispatch-service",assignment:"assignment-reformation-service","provider-route":"provider-route-procurement-service"})[reading.failureLayer] ?? "software-repair-procurement-service"; return Object.freeze({type:"NewsroomRepairRefusal",code:"missing-service",missingService:missing,assignmentId:reading.assignmentId,learningEvidenceDigest:reading.learningEvidenceDigest,customerMutation:false,providerInvocation:false}); }
  const preserved={assignmentDigest:reading.assignmentDigest,sourcePacketDigest:reading.sourcePacketDigest,terminalCircuitDigest:reading.terminalCircuitDigest}, successorAssignmentId=`${reading.assignmentId}:repair:${digest({predecessor:reading.assignmentId,move:reading.proposedMove,preserved,learning:reading.learningEvidenceDigest}).slice(7,23)}`;
  const body={type:"NewsroomRepairDemand",customer:KOIOS,providerClass:"bounded-prose-repair",requiredContract:LISS_CONTRACT,repairMode:reading.proposedMove,predecessor:{assignmentId:reading.assignmentId,terminal:true,...preserved},successor:{assignmentId:successorAssignmentId,derivesFrom:reading.assignmentId,reopenPredecessor:false},learningEvidenceDigest:reading.learningEvidenceDigest,constraints:["preserve assignment and source evidence by exact digest","do not publish, alter Koios law, or admit customer bytes","return prose only","editorial verification and customer admission remain outside this contract"],customerMutation:false}; return Object.freeze({...body,id:id(body)});
}

/** v3 uses the capability actually advertised by active LISS suppliers: chat; inquiry is the routing work type. */
export function solicitLissProseRepair(demand) {
  if (demand?.type !== "NewsroomRepairDemand") throw new TypeError("executable NewsroomRepairDemand required");
  const basis = { repairDemand: demand.id, repairMode: demand.repairMode, predecessor: demand.predecessor, successor: demand.successor, learningEvidenceDigest: demand.learningEvidenceDigest };
  const request = { id: `urn:liss-job:${digest(basis).slice(7)}`, workType: "inquiry", requiredCapabilities: ["chat"], maxTokens: 1400,
    messages: [{ role: "system", content: "Return prose only. Do not claim publication, editorial acceptance, or customer-state mutation." }, { role: "user", content: `Prepare a bounded ${demand.repairMode} successor. Repair demand digest: ${digest(demand)}. Preserve assignment digest ${demand.predecessor.assignmentDigest} and source packet digest ${demand.predecessor.sourcePacketDigest}.` }] };
  const body = { type: "ServiceSolicitation", contract: LISS_CONTRACT, request };
  return Object.freeze({ "@context": CONTEXT, id: id({ actor: KOIOS, target: LISS, body }), type: "Offer", actor: KOIOS, target: LISS, object: body });
}
export function acceptExactLissOffer(demand, solicitation, offer) {
  const request = solicitation?.object?.request;
  if (solicitation?.type !== "Offer" || solicitation.actor !== KOIOS || solicitation.target !== LISS || solicitation.object?.type !== "ServiceSolicitation" || solicitation.object.contract !== LISS_CONTRACT || !request) throw new TypeError("invalid LISS solicitation");
  if (offer?.type !== "Offer" || offer.actor !== LISS || offer.target !== KOIOS || offer.object?.type !== "ExecutableServiceOffer" || offer.object?.contract !== LISS_CONTRACT) throw new TypeError("provider-issued LISS offer required");
  if (offer.inReplyTo !== solicitation.id || offer.object.sourceActivity !== solicitation.id || offer.object.jobDigest !== digest(request) || digest(offer.object.job) !== digest(request)) throw new TypeError("LISS offer is not exact to this solicitation request");
  const capability = { type: "Capability", issuer: KOIOS, holder: LISS, invocationTarget: LISS, parentOffer: offer.id, attenuation: { jobDigest: offer.object.jobDigest, buyer: KOIOS }, capTP: { target: LISS, method: "invoke-service" }, allowedActions: ["invoke-service", "provider-local-write"] };
  const body = { type: "ServiceContract", contract: LISS_CONTRACT, offer, considerationAcceptance: { termDigest: offer.object.considerationDigest, acceptedBy: KOIOS }, capability };
  return Object.freeze({ "@context": CONTEXT, id: id({ actor: KOIOS, target: LISS, body }), type: "Accept", actor: KOIOS, target: LISS, object: body });
}
export function formLissResultInquiry(submission) {
  if (submission?.type !== "Accept" || submission.actor !== LISS || submission.object?.type !== "InferenceSubmissionResult") throw new TypeError("LISS submission acceptance required");
  const body = submission.object.resultInquiry; return Object.freeze({ "@context": CONTEXT, id: id({ actor: KOIOS, target: LISS, body }), type: "Question", actor: KOIOS, target: LISS, object: body });
}
export function verifyProseInferenceSettlement(demand, settlement) {
  const expected = solicitLissProseRepair(demand).object.request;
  if (settlement?.type !== "Accept" || settlement.actor !== LISS || settlement.object?.type !== "InferenceSettlementResult" || settlement.object?.contract !== LISS_CONTRACT) throw new TypeError("terminal LISS settlement required");
  if (settlement.object.jobId !== expected.id || settlement.object.jobDigest !== digest(expected) || typeof settlement.object.result?.text !== "string" || !settlement.object.result.text.trim()) throw new TypeError("settlement does not bind a prose repair job");
  return Object.freeze({ type: "NewsroomRepairVerification", passed: true, repairDemandDigest: digest(demand), successorAssignmentId: demand.successor.assignmentId, preservedEvidence: { assignmentDigest: demand.predecessor.assignmentDigest, sourcePacketDigest: demand.predecessor.sourcePacketDigest }, customerMutation: false, nonclaims: ["editorial acceptance", "customer admission", "publication", "customer mutation"] });
}
export async function executeProposedRepair(reading, adapters) {
  const demand = formNewsroomRepairDemand(reading); if (demand.type === "NewsroomRepairRefusal") return demand;
  for (const name of ["solicitLiss", "invokeLiss", "queryLiss", "formSuccessorAssignment"]) if (typeof adapters?.[name] !== "function") throw new TypeError(`${name} adapter required`);
  const solicitation = solicitLissProseRepair(demand), offer = await adapters.solicitLiss(solicitation, demand), contract = acceptExactLissOffer(demand, solicitation, offer), submission = await adapters.invokeLiss(contract, demand), inquiry = formLissResultInquiry(submission), settlement = await adapters.queryLiss(inquiry, demand), verification = verifyProseInferenceSettlement(demand, settlement), successorAssignment = await adapters.formSuccessorAssignment({ demand, settlement, verification });
  if (successorAssignment?.assignmentId !== demand.successor.assignmentId || successorAssignment.reopenPredecessor !== false) throw new TypeError("assignment adapter did not form successor without reopening predecessor");
  return Object.freeze({ type: "ProposedNewsroomRepairExecution", demand, solicitation, contract, submission, inquiry, verification, successorAssignment, customerMutation: false, nonclaims: ["customer admission", "editorial acceptance", "publication"] });
}

