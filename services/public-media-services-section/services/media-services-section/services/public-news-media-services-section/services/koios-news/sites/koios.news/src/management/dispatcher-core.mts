// @ts-nocheck
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { isNiUri as isCanonicalSha256NiUri } from "@red-cup-engineering/ni-services-section";
const semanticId = (value) => identifyJsonSemanticContent({ objectKind: "rsc-quiescent.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import { relationalWitnessJournalDocument } from "@red-cup-engineering/witness-journal-document-service";
export const CONTEXT = "https://www.w3.org/ns/activitystreams", KOIOS = "urn:ame:koios-news", INFERENCE_MARKET = "urn:ame:inference-work-lot-service";
export const INFERENCE_WORK_CONTRACT = (() => { const value = process.env.KOIOS_INFERENCE_WORK_CONTRACT ?? ""; if (!isCanonicalSha256NiUri(value)) throw new Error("koios-refusal: KOIOS_INFERENCE_WORK_CONTRACT must carry the inference-work-lot market contract as one exact ni:///sha-256 address"); return value; })();
export const digest = (value) => semanticId(value);
const id = (value) => digest(value), required = (value, name) => { if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} must be non-empty text`); return value; };
export function formNewsroomRepairDemand(reading) {
  for (const key of ["assignmentId", "learningEvidenceDigest", "assignmentDigest", "sourcePacketDigest", "terminalCircuitDigest", "failureLayer", "proposedMove"]) required(reading?.[key], key);
  if (!["repair-draft", "replay-writer"].includes(reading.proposedMove)) { const missing = ({"source-intelligence":"source-replay-dispatch-service",sources:"source-replay-dispatch-service",assignment:"assignment-reformation-service","provider-route":"provider-route-procurement-service"})[reading.failureLayer] ?? "software-repair-procurement-service"; return Object.freeze({type:"NewsroomRepairRefusal",code:"missing-service",missingService:missing,assignmentId:reading.assignmentId,learningEvidenceDigest:reading.learningEvidenceDigest,customerMutation:false,providerInvocation:false}); }
  const preserved={assignmentDigest:reading.assignmentDigest,sourcePacketDigest:reading.sourcePacketDigest,terminalCircuitDigest:reading.terminalCircuitDigest};
  const body={type:"NewsroomRepairDemand",customer:KOIOS,providerClass:"bounded-prose-repair",requiredContract:INFERENCE_WORK_CONTRACT,repairMode:reading.proposedMove,assignment:{assignmentId:reading.assignmentId,terminal:true,...preserved},revision:{retainsAssignmentId:reading.assignmentId,reopensOnlyAfterRetainedProduct:true},learningEvidenceDigest:reading.learningEvidenceDigest,constraints:["preserve assignment identity and source evidence by exact digest","retain the completed stage product before customer admission","do not publish, alter Koios law, or admit customer bytes","return prose only","editorial verification and customer admission remain outside this contract"],customerMutation:false}; return Object.freeze({...body,id:id(body)});
}
