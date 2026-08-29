// @ts-nocheck
import { semanticId } from "@red-cup-engineering/relation-model-notation-cbor-codec";
import { INFERENCE_WORK_LOT_MARKET_LAW } from "@561-group/inference-work-lot-service/law";
import { relationalRwilDocument } from "@lenticule-science/rwil-rdf-projection-service";
export const CONTEXT = "https://www.w3.org/ns/activitystreams", KOIOS = "urn:ame:koios-news", INFERENCE_MARKET = "urn:ame:inference-work-lot-service";
export const INFERENCE_WORK_CONTRACT = INFERENCE_WORK_LOT_MARKET_LAW.id;
export const digest = (value) => semanticId(relationalRwilDocument(value));
const id = (value) => digest(value), required = (value, name) => { if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} must be non-empty text`); return value; };
export function formNewsroomRepairDemand(reading) {
  for (const key of ["assignmentId", "learningEvidenceDigest", "assignmentDigest", "sourcePacketDigest", "terminalCircuitDigest", "failureLayer", "proposedMove"]) required(reading?.[key], key);
  if (!["repair-draft", "replay-writer"].includes(reading.proposedMove)) { const missing = ({"source-intelligence":"source-replay-dispatch-service",sources:"source-replay-dispatch-service",assignment:"assignment-reformation-service","provider-route":"provider-route-procurement-service"})[reading.failureLayer] ?? "software-repair-procurement-service"; return Object.freeze({type:"NewsroomRepairRefusal",code:"missing-service",missingService:missing,assignmentId:reading.assignmentId,learningEvidenceDigest:reading.learningEvidenceDigest,customerMutation:false,providerInvocation:false}); }
  const preserved={assignmentDigest:reading.assignmentDigest,sourcePacketDigest:reading.sourcePacketDigest,terminalCircuitDigest:reading.terminalCircuitDigest};
  const body={type:"NewsroomRepairDemand",customer:KOIOS,providerClass:"bounded-prose-repair",requiredContract:INFERENCE_WORK_CONTRACT,repairMode:reading.proposedMove,assignment:{assignmentId:reading.assignmentId,terminal:true,...preserved},revision:{retainsAssignmentId:reading.assignmentId,reopensOnlyAfterRetainedProduct:true},learningEvidenceDigest:reading.learningEvidenceDigest,constraints:["preserve assignment identity and source evidence by exact digest","retain the completed stage product before customer admission","do not publish, alter Koios law, or admit customer bytes","return prose only","editorial verification and customer admission remain outside this contract"],customerMutation:false}; return Object.freeze({...body,id:id(body)});
}
