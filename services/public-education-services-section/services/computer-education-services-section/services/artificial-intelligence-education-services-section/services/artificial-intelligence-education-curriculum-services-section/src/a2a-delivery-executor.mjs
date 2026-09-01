#!/usr/bin/env node
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { agentRmnMessage, extractRmnPart, parseA2aMessage } from "@red-cup-engineering/a2a-rmn-part-service";
import { admitJsonSemanticContent, EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const A2A_CARRIER_KIND = "rsc-quiescent.a2a-json";
const semanticBytes = (value) => identifyJsonSemanticContent({ objectKind: A2A_CARRIER_KIND, value, witnessRoot: EMPTY_WITNESS_ROOT }).bytes;
const decodeSemantic = (bytes) => admitJsonSemanticContent({ bytes, objectKind: A2A_CARRIER_KIND }).value;
import { querySettlementRecords } from "@red-cup-engineering/witness-journal-document-service";
import { ACTOR, CATEGORY, NODE_ROOT, admittedLessonProducts, contentId, deliverLessonProduct } from "./curriculum.mjs";

export const CHANNEL = "urn:ame:artificial-intelligence-youtube-channel-enterprise";
function exact(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
export function selectNextLesson(products, completedLessonIds) {
  if (!Array.isArray(products) || !Array.isArray(completedLessonIds) || new Set(completedLessonIds).size !== completedLessonIds.length || completedLessonIds.some((id) => typeof id !== "string")) throw new TypeError("AI curriculum next-product selection requires bounded unique completed lesson identities");
  const completed = new Set(completedLessonIds), rows = products.filter((row) => row?.type === "ArtificialIntelligenceLessonProductAdmission" && row.provider === ACTOR).sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  return rows.find((row) => !completed.has(row.lessonId) && row.prerequisites.every((id) => completed.has(id))) ?? null;
}
export async function executeDeliveryRequest(request, options = {}) {
  const at = options.at ?? new Date().toISOString();
  if (!exact(request) || request.type !== "ArtificialIntelligenceNextLessonDeliveryRequest" || request.customer !== CHANNEL || request.courseId !== "history-and-frontiers-of-machine-learning" || request.courseRevision !== 1 || !Array.isArray(request.completedLessonIds)) return { type: "ArtificialIntelligenceNextLessonDeliveryResult", provider: ACTOR, request: request?.id ?? null, disposition: "refused", code: "invalid-request", retryable: false, refusedAt: at };
  const curriculumJournalRoot = options.curriculumJournalRoot ?? process.env.ARTIFICIAL_INTELLIGENCE_CURRICULUM_JOURNAL_ROOT;
  const products = options.products ?? (curriculumJournalRoot ? admittedLessonProducts({ dataRoot: curriculumJournalRoot }) : await querySettlementRecords(CATEGORY, {
    agentUrl: options.witnessJournalAgentUrl
      ?? process.env.WITNESS_JOURNAL_DOCUMENT_AGENT
      ?? process.env.WITNESS_JOURNAL_RDF_AGENT,
  })), lesson = selectNextLesson(products, request.completedLessonIds);
  if (!lesson) return { type: "ArtificialIntelligenceNextLessonDeliveryResult", provider: ACTOR, request: request.id, disposition: "refused", code: "no-eligible-admitted-lesson", retryable: true, refusedAt: at };
  return { type: "ArtificialIntelligenceNextLessonDeliveryResult", provider: ACTOR, request: request.id, disposition: "delivered", delivery: deliverLessonProduct(lesson, CHANNEL), deliveredAt: at };
}
export async function main() { let input = ""; process.stdin.setEncoding("utf8"); for await (const chunk of process.stdin) input += chunk; const message = parseA2aMessage(JSON.parse(input)), term = decodeSemantic(extractRmnPart(message.parts).bytes); if (!semanticBytes(term).equals(extractRmnPart(message.parts).bytes) || term?.[0] !== "artificial-intelligence-next-lesson-delivery-request" || term.length !== 2) throw new TypeError("foreign or noncanonical AI curriculum request"); const result = await executeDeliveryRequest(term[1]); process.stdout.write(`${JSON.stringify(agentRmnMessage(semanticBytes(["artificial-intelligence-next-lesson-delivery-result", result]), "artificial-intelligence-next-lesson-delivery-result.rmn.cbor"))}\n`); }
if (process.argv[1] === fileURLToPath(import.meta.url)) await main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 2; });
