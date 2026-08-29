#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { agentRmnMessage, extractRmnPart, parseA2aMessage } from "@red-cup-engineering/a2a-rmn-part-service";
import { admitJsonSemanticContent, EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
import { join, resolve } from "node:path";
import { ACTOR, CATEGORY, NODE_ROOT, contentId, deliverLessonProduct } from "./curriculum.mjs";
const KIND = "rsc-quiescent.a2a-json";
const bytes = (value) => identifyJsonSemanticContent({ objectKind: KIND, value, witnessRoot: EMPTY_WITNESS_ROOT }).bytes;
const decode = (value) => admitJsonSemanticContent({ bytes: value, objectKind: KIND }).value;
const CHANNEL = "urn:ame:modern-business-youtube-channel-enterprise";
function exact(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === contentId(body); }
export function selectNextLesson(products, completedLessonIds) {
  if (!Array.isArray(products) || !Array.isArray(completedLessonIds) || new Set(completedLessonIds).size !== completedLessonIds.length || completedLessonIds.some((id) => typeof id !== "string")) throw new TypeError("business curriculum next-product selection requires unique completed lesson identities");
  const completed = new Set(completedLessonIds), rows = products.filter((row) => row?.type === "ModernBusinessLessonProductAdmission" && row.provider === ACTOR).sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
  return rows.find((row) => !completed.has(row.lessonId) && row.prerequisites.every((id) => completed.has(id))) ?? null;
}
export async function executeDeliveryRequest(request, options = {}) {
  const at = options.at ?? new Date().toISOString();
  if (!exact(request) || request.type !== "ModernBusinessNextLessonDeliveryRequest" || request.customer !== CHANNEL || request.courseId !== "modern-firm-as-operational-system" || request.courseRevision !== 1 || !Array.isArray(request.completedLessonIds)) return { type: "ModernBusinessNextLessonDeliveryResult", provider: ACTOR, request: request?.id ?? null, disposition: "refused", code: "invalid-request", retryable: false, refusedAt: at };
  const root = resolve(options.dataRoot ?? process.env.MODERN_BUSINESS_CURRICULUM_JOURNAL_ROOT ?? join(NODE_ROOT, "data")), rows = options.products ?? createSemanticRecordJournal({ root, objectKind: "emsweb.modern-business-curriculum.record" }).query({ category: CATEGORY }).map((row) => row.record), lesson = selectNextLesson(rows, request.completedLessonIds);
  if (!lesson) return { type: "ModernBusinessNextLessonDeliveryResult", provider: ACTOR, request: request.id, disposition: "refused", code: "no-eligible-admitted-lesson", retryable: true, refusedAt: at };
  return { type: "ModernBusinessNextLessonDeliveryResult", provider: ACTOR, request: request.id, disposition: "delivered", delivery: deliverLessonProduct(lesson, CHANNEL), deliveredAt: at };
}
async function main() {
  let input = ""; process.stdin.setEncoding("utf8"); for await (const chunk of process.stdin) input += chunk;
  const message = parseA2aMessage(JSON.parse(input)), part = extractRmnPart(message.parts), term = decode(part.bytes);
  if (!bytes(term).equals(part.bytes) || term?.[0] !== "modern-business-next-lesson-delivery-request" || term.length !== 2) throw new TypeError("foreign business curriculum request");
  const result = await executeDeliveryRequest(term[1]);
  process.stdout.write(`${JSON.stringify(agentRmnMessage(bytes(["modern-business-next-lesson-delivery-result", result]), "modern-business-next-lesson-delivery-result.rmn.cbor"))}\n`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) main().catch((error) => { process.stderr.write(`${error.message}\n`); process.exitCode = 2; });
