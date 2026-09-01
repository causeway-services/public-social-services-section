import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { DurableA2aTaskStore } from "@red-cup-engineering/a2a-contracted-agent-service/durable-task-store";
import { DurablePushNotificationStore } from "@red-cup-engineering/a2a-contracted-agent-service/durable-push-notifications";
import { CHANNEL, executeDeliveryRequest } from "../src/a2a-delivery-executor.mjs";
import { localA2aMembrane } from "../src/local-a2a-membrane.mjs";
import { ACTOR, CATEGORY, RECORD_OBJECT_KIND, RESEARCH, admitLessonProduct, contentId, deliverLessonProduct, digest, formNextLessonOffer, loadCourse, loadLessonBriefDraft, validateCourse } from "../src/curriculum.mjs";
const NOW="2026-07-22T02:00:00.000Z",SETTLEMENT="eip155:31337:0x4444444444444444444444444444444444444444";
function exact(body){return{id:contentId(body),...body};}
function semanticJson(value){if(value instanceof Uint8Array)return{"$bytes":Buffer.from(value).toString("base64url")};if(Array.isArray(value))return value.map(semanticJson);if(value&&typeof value==="object")return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,semanticJson(child)]));return value;}
function researchExact(body){return{id:identifyJsonSemanticContent({objectKind:"emsweb.artificial-intelligence-research.record",value:semanticJson(body),witnessRoot:EMPTY_WITNESS_ROOT}).token,...body};}
function researchDelivery(){const bytes=Buffer.from("# Historical source packet\n\nPrimary-source synthesis with enough bounded material for an explainer.\n"),sourcePacket=researchExact({type:"ArtificialIntelligenceResearchSourcePacket",provider:RESEARCH,courseId:"history-and-frontiers-of-machine-learning",lessonId:"cybernetics-computation-symbolic-ai",carrier:{path:"private.md",mediaType:"text/markdown",byteLength:bytes.length,sha256:digest(bytes)}}),settlement=researchExact({type:"InternalResearchSettlementReceipt",payer:ACTOR,payee:RESEARCH,productClass:"artificial-intelligence-research",accountingUnit:"USD-micros",amountMicros:300000,cashSettlementRequired:false,status:"settled",sourcePacket:sourcePacket.id}),product=researchExact({type:"ArtificialIntelligenceResearchProductAdmission",provider:RESEARCH,customer:ACTOR,courseId:"history-and-frontiers-of-machine-learning",lessonId:"cybernetics-computation-symbolic-ai",researchProductClasses:["primary-history","technical-retrospective"],sourcePacket,sourceCorpusDigest:`sha256:${"a".repeat(64)}`,observedThrough:"2026-07-21T00:00:00.000Z",expiresAt:"2036-07-18T00:00:00.000Z",reuseGrant:["notebooklm-transformation","artificial-intelligence-curriculum","public-youtube-release"],correctionIdentity:"urn:correction:ai-history-v1",researchSettlementReceipt:settlement,researchSettlementStatus:"settled",admittedAt:NOW});const object=researchExact({type:"ArtificialIntelligenceResearchProductDelivery",product,source:{title:"AI historical source",digest:digest(bytes),mediaType:"text/markdown",byteLength:bytes.length,bytes}});return researchExact({type:"Accept",actor:RESEARCH,target:ACTOR,object});}
test("AI course is an eight-lesson acyclic research-freshness graph", () => { const assay = validateCourse(loadCourse()); assert.equal(assay.lessonCount, 8); assert.equal(assay.competencyCount, 5); });
test("AI delivery supplies the durable task and coordination membrane required by contracted A2A 2.1", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ai-curriculum-a2a-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const membrane = localA2aMembrane(root, "delivery");
  const tasks = new DurableA2aTaskStore(membrane.taskSource);
  const pushes = new DurablePushNotificationStore(membrane.coordinationSource);
  await tasks.save({ id: "task-1", contextId: "context-1", status: { state: "TASK_STATE_SUBMITTED" } }, { tenant: "curriculum" });
  assert.equal((await tasks.load("task-1", { tenant: "curriculum" })).id, "task-1");
  await pushes.save("task-1", { tenant: "curriculum", requestedVersion: "1.0" }, { id: "push-1", url: "https://customer.example/callback" });
  assert.equal((await pushes.load("task-1", { tenant: "curriculum" }))[0].id, "push-1");
});
test("AI curriculum offers only the first prerequisite-eligible lesson", () => { const first = formNextLessonOffer({ offeredAt: "2096-07-21T12:00:00Z" }); assert.equal(first.object.lesson.sequence, 1); const second = formNextLessonOffer({ completedLessonIds: [first.object.lesson.id], offeredAt: "2096-07-21T12:01:00Z" }); assert.equal(second.object.lesson.sequence, 2); assert.ok(second.object.requiredResearchProductTerms.includes("price and settlement receipt")); });
test("AI curriculum refuses cyclic or skipped completion", () => { const changed = structuredClone(loadCourse()); changed.lessons[0].prerequisites = [changed.lessons[1].id]; assert.throws(() => validateCourse(changed), /point backward/u); assert.throws(() => formNextLessonOffer({ completedLessonIds: [loadCourse().lessons[1].id] }), /prerequisite-incomplete/u); });
test("AI curriculum admits one settled path-free research product with local SEAVT evidence and replays it",async(t)=>{const root=mkdtempSync(join(tmpdir(),"ai-curriculum-"));t.after(()=>rmSync(root,{recursive:true,force:true}));const offer=formNextLessonOffer({offeredAt:NOW}),delivery=researchDelivery(),brief=loadLessonBriefDraft({courseId:"history-and-frontiers-of-machine-learning",lessonId:"cybernetics-computation-symbolic-ai"}),options={dataRoot:root,settlement:SETTLEMENT,at:NOW,verifyResearchDelivery:async()=>true},product=await admitLessonProduct({offer,researchDelivery:delivery,brief},options),replay=await admitLessonProduct({offer,researchDelivery:delivery,brief},{...options,at:"2026-07-23T02:00:00.000Z"}),journal=createSemanticRecordJournal({root,objectKind:RECORD_OBJECT_KIND});assert.equal(replay.id,product.id);assert.equal(product.researchProduct,delivery.object.product.id);assert.equal(Object.hasOwn(product.source,"path"),false);assert.equal(deliverLessonProduct(product).object.id,product.id);assert.equal(journal.query({category:CATEGORY}).length,1);assert.ok(journal.claims().some((claim)=>claim.a==="charge:support"));});
test("AI delivery reads admitted lessons from the explicit witness-journal document provider", async (t) => {
  const product = exact({
    type: "ArtificialIntelligenceLessonProductAdmission",
    provider: ACTOR,
    courseId: "history-and-frontiers-of-machine-learning",
    courseRevision: 1,
    lessonId: "cybernetics-computation-symbolic-ai",
    sequence: 1,
    prerequisites: [],
  });
  const requests = [];
  const fetchImpl = globalThis.fetch;
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    return new Response(JSON.stringify([{
      id: "ni:///sha-256;test-document",
      type: "RelationalWitnessJournalDocument",
      term: null,
      value: { type: "SettlementRecord", category: CATEGORY, recordedAt: NOW, record: product },
    }]), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  };
  t.after(() => { globalThis.fetch = fetchImpl; });
  const request = exact({
    type: "ArtificialIntelligenceNextLessonDeliveryRequest",
    customer: CHANNEL,
    courseId: "history-and-frontiers-of-machine-learning",
    courseRevision: 1,
    completedLessonIds: [],
  });
  const result = await executeDeliveryRequest(request, {
    at: NOW,
    witnessJournalAgentUrl: "http://witness-journal.example/.well-known/agent-card.json",
  });
  assert.equal(result.disposition, "delivered");
  assert.equal(result.delivery.object.id, product.id);
  assert.deepEqual(requests, [`http://witness-journal.example/documents?category=${encodeURIComponent(CATEGORY)}&predicate=${encodeURIComponent("urn:emsenn:witness-journal:category")}`]);
});
test("AI delivery selects directly from its explicitly mounted subject journal", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "ai-curriculum-mounted-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const course = loadCourse(), offer = formNextLessonOffer({ course, offeredAt: NOW }), delivery = researchDelivery();
  const product = await admitLessonProduct({ course, offer, researchDelivery: delivery, brief: loadLessonBriefDraft({ courseId: course.courseId, lessonId: offer.object.lesson.id }) }, { dataRoot: root, at: NOW, verifyResearchDelivery: async () => true });
  const request = exact({ type: "ArtificialIntelligenceNextLessonDeliveryRequest", customer: CHANNEL, courseId: course.courseId, courseRevision: course.revision, completedLessonIds: [] });
  const result = await executeDeliveryRequest(request, { at: NOW, curriculumJournalRoot: root });
  assert.equal(result.disposition, "delivered");
  assert.equal(result.delivery.object.id, product.id);
});
