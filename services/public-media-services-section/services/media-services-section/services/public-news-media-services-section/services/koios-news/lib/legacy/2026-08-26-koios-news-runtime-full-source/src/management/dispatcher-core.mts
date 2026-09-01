// @ts-nocheck
import { semanticId } from "@emsenn/rmn-semantic-conformance";
import { relationalRwilDocument } from "@emsenn/rwil-rdf-services";
export const CONTEXT = "https://www.w3.org/ns/activitystreams", KOIOS = "urn:ame:koios-news", LISS = "urn:ame:logical-inference-service-section";
export const LISS_CONTRACT = "ni:///sha-256;dPKjAceg6De7UofMmCvs-nIEt9oszzMKBawJJn3YMr8";
export const digest = (value) => semanticId(relationalRwilDocument(value));
const id = (value) => digest(value), required = (value, name) => { if (typeof value !== "string" || !value.trim()) throw new TypeError(`${name} must be non-empty text`); return value; };
export function formNewsroomRepairDemand(reading) {
  for (const key of ["assignmentId", "learningEvidenceDigest", "assignmentDigest", "sourcePacketDigest", "terminalCircuitDigest", "failureLayer", "proposedMove"]) required(reading?.[key], key);
  if (!["repair-draft", "replay-writer"].includes(reading.proposedMove)) { const missing = ({"source-intelligence":"source-replay-dispatch-service",sources:"source-replay-dispatch-service",assignment:"assignment-reformation-service","provider-route":"provider-route-procurement-service"})[reading.failureLayer] ?? "software-repair-procurement-service"; return Object.freeze({type:"NewsroomRepairRefusal",code:"missing-service",missingService:missing,assignmentId:reading.assignmentId,learningEvidenceDigest:reading.learningEvidenceDigest,customerMutation:false,providerInvocation:false}); }
  const preserved={assignmentDigest:reading.assignmentDigest,sourcePacketDigest:reading.sourcePacketDigest,terminalCircuitDigest:reading.terminalCircuitDigest}, successorAssignmentId=`${reading.assignmentId}:repair:${digest({predecessor:reading.assignmentId,move:reading.proposedMove,preserved,learning:reading.learningEvidenceDigest}).slice(-16)}`;
  const body={type:"NewsroomRepairDemand",customer:KOIOS,providerClass:"bounded-prose-repair",requiredContract:LISS_CONTRACT,repairMode:reading.proposedMove,predecessor:{assignmentId:reading.assignmentId,terminal:true,...preserved},successor:{assignmentId:successorAssignmentId,derivesFrom:reading.assignmentId,reopenPredecessor:false},learningEvidenceDigest:reading.learningEvidenceDigest,constraints:["preserve assignment and source evidence by exact digest","do not publish, alter Koios law, or admit customer bytes","return prose only","editorial verification and customer admission remain outside this contract"],customerMutation:false}; return Object.freeze({...body,id:id(body)});
}
