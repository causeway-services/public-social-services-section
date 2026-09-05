// @ts-nocheck
import { formNewsroomRepairDemand as formBaseDemand, digest, CONTEXT, KOIOS, INFERENCE_MARKET, INFERENCE_WORK_CONTRACT } from "./dispatcher-core.mts";
export { digest, CONTEXT, KOIOS, INFERENCE_MARKET, INFERENCE_WORK_CONTRACT };
const id = (value) => digest(value);
const nonempty = (value) => typeof value === "string" && value.trim();

/** Koios owns this reading; the carrier only rejects incomplete custody before the inference market is contacted. */
export function validateRepairContext(context) {
  if (!context || typeof context !== "object") throw new TypeError("RepairContext is required");
  for (const field of ["currentBody", "manuscriptDigest", "editorReport", "editorJudgmentDigest", "sourcePacketDigest", "assignmentDigest", "renderedInstructions", "instructionsDigest"]) if (!nonempty(context[field])) throw new TypeError(`RepairContext.${field} is required`);
  if (!context.witnessedResearchPacket || typeof context.witnessedResearchPacket !== "object" || !context.assignmentContext || typeof context.assignmentContext !== "object") throw new TypeError("RepairContext requires witnessedResearchPacket and assignmentContext");
  if (context.manuscriptDigest !== digest(context.currentBody) || context.sourcePacketDigest !== digest(context.witnessedResearchPacket) || context.assignmentDigest !== digest(context.assignmentContext) || context.instructionsDigest !== digest(context.renderedInstructions)) throw new TypeError("RepairContext digest does not bind its supplied bytes");
  if (context.repairAuthority === "deterministic-source-originality-gate") {
    if (!context.writerEvidenceProjection || typeof context.writerEvidenceProjection !== "object" || !nonempty(context.writerEvidenceProjectionDigest)) throw new TypeError("source-originality replay requires a clean-room writer evidence projection");
    if (context.writerEvidenceProjectionDigest !== digest(context.writerEvidenceProjection)) throw new TypeError("writer evidence projection digest does not bind its supplied claims");
  }
  return Object.freeze(structuredClone(context));
}
export function formNewsroomRepairDemand(reading, repairContext) {
  const base = formBaseDemand(reading); if (base.type === "NewsroomRepairRefusal") return base;
  let context; try { context = validateRepairContext(repairContext); } catch (error) { return Object.freeze({ type:"NewsroomRepairRefusal", code:"missing-repair-context", reason:error.message, assignmentId:reading.assignmentId, learningEvidenceDigest:reading.learningEvidenceDigest, customerMutation:false, providerInvocation:false }); }
  if (context.assignmentDigest !== base.assignment.assignmentDigest || context.sourcePacketDigest !== base.assignment.sourcePacketDigest) return Object.freeze({type:"NewsroomRepairRefusal",code:"repair-context-evidence-mismatch",assignmentId:reading.assignmentId,customerMutation:false,providerInvocation:false});
  const { id: _old, ...body } = base, next = { ...body, repairContext: context, repairContextDigest: digest(context) };
  return Object.freeze({ ...next, id: id(next) });
}
