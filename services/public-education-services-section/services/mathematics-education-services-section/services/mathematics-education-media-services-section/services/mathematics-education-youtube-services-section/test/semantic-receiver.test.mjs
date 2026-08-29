import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
import { decodeJsonByteCarrier } from "@red-cup-engineering/json-byte-carrier-service";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { admitSourcePacket, deliverSourcePacket, firstPacketDraft } from "@emsenn/mathematics-research-enterprise";
import { journalRecords as researchJournalRecords } from "@emsenn/mathematics-research-enterprise/journal";
import { admitLessonBrief, deliverLessonBrief, formNextLessonOffer, loadLessonBriefDraft } from "@emsenn/mathematics-curriculum-enterprise";
import { journalRecords as curriculumJournalRecords } from "@emsenn/mathematics-curriculum-enterprise/journal";
import { formCinematicOrder } from "../src/channel.mjs";
import { planCoursePlaylistProjection } from "../src/course-playlist-projection.mjs";
import { observeExistingPublicVideo } from "../src/existing-receiver.mjs";
import { createSettlementStore, querySettlementRecords } from "../src/journal-client.mjs";
import { JOURNAL_OBJECT_KIND } from "../src/journal.mjs";
import { formPersistentNotebookCinematicOrder } from "../src/persistent-notebook-client.mjs";

const NI = /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u;
const AT = "2026-08-03T12:00:00.000Z";

test("source-grounded lesson reaches the named existing public-video receiver without write authority", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "mathematics-receiver-test-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const researchRoot = join(root, "research"), curriculumRoot = join(root, "curriculum");
  const sourcePacket = await admitSourcePacket(firstPacketDraft(), { dataRoot: researchRoot, at: AT });
  const sourceDelivery = deliverSourcePacket(sourcePacket);
  const offer = formNextLessonOffer({ offeredAt: AT });
  const brief = loadLessonBriefDraft({ courseId: "causality-and-kinematic-space", lessonId: "order-before-distance" });
  const lessonAdmission = await admitLessonBrief({ offer, sourcePacket, brief }, { dataRoot: curriculumRoot, at: AT, verifySourcePacket: async (candidate) => sourceDelivery.object.id === candidate.id });
  const lessonDelivery = deliverLessonBrief(lessonAdmission);
  const cinematicOrder = formCinematicOrder(lessonAdmission, AT);
  const persistentNotebookOrder = formPersistentNotebookCinematicOrder(lessonAdmission);
  const fetchImpl = async () => new Response(JSON.stringify({ provider_name: "YouTube", author_name: "MathematicsInRelation", author_url: "https://www.youtube.com/@MathematicsInRelation", title: "Order before distance | Mathematics in Relation" }), { status: 200, headers: { "content-type": "application/json" } });
  const observation = await observeExistingPublicVideo({ sourcePacket, lessonAdmission, cinematicOrder, fetchImpl, observedAt: AT });
  assert.ok([sourcePacket.id, sourceDelivery.id, lessonAdmission.id, lessonDelivery.id, cinematicOrder.id, persistentNotebookOrder.id, observation.id].every((id) => NI.test(id)));
  assert.equal(sourceDelivery.object.id, sourcePacket.id);
  assert.equal(lessonDelivery.object.id, lessonAdmission.id);
  const sourceCarrier = decodeJsonByteCarrier(persistentNotebookOrder.source.carrier, { expectedMediaType: "text/markdown", maximumBytes: 10 * 1024 * 1024 });
  const { id: _providerOrderId, ...providerOrderBody } = persistentNotebookOrder;
  assert.equal(persistentNotebookOrder.id, identifyJsonSemanticContent({ objectKind: "emsweb.persistent-notebook.record", value: providerOrderBody, witnessRoot: EMPTY_WITNESS_ROOT }).token);
  assert.equal(Object.hasOwn(persistentNotebookOrder.source, "bytes"), false);
  assert.equal(persistentNotebookOrder.source.byteLength, sourceCarrier.bytes.length);
  assert.match(sourceCarrier.bytes.toString("utf8"), /^# Order before distance/u);
  assert.deepEqual(researchJournalRecords(researchRoot, "mathematics-research.source-packet-admission").map(({ id }) => id), [sourcePacket.id]);
  assert.deepEqual(curriculumJournalRecords(curriculumRoot, "mathematics-curriculum.lesson-brief-admission").map(({ id }) => id), [lessonAdmission.id]);
  assert.equal(observation.youtubeChannelId, "UCVk_gd1Tv320tj6ofCTiLMw");
  assert.equal(observation.youtubeVideoId, "80BOJp0Ys2Y");
  assert.ok(observation.authorityWithheld.includes("publication"));
  assert.equal(observation.historicalCarrierEvidence.identityLaw, "predecessor-urn-sha256-retained-as-historical-custody-only");
});

test("YouTube journal operations stay within the supplied root and expose support-only evidence", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "mathematics-youtube-journal-")), other = mkdtempSync(join(tmpdir(), "mathematics-youtube-other-"));
  t.after(() => { rmSync(root, { recursive: true, force: true }); rmSync(other, { recursive: true, force: true }); });
  const record = { type: "MathematicsJournalRootAssay", marker: "supplied-root" };
  await createSettlementStore({ dataRoot: root }).record({ category: "mathematics-youtube.root-assay", recordedAt: AT, record });
  assert.deepEqual(await querySettlementRecords("mathematics-youtube.root-assay", { dataRoot: root }), [record]);
  assert.deepEqual(await querySettlementRecords("mathematics-youtube.root-assay", { dataRoot: other }), []);
  const claims = createSemanticRecordJournal({ root, objectKind: JOURNAL_OBJECT_KIND }).claims();
  assert.ok(claims.some((claim) => claim.a === "charge:support"));
  assert.ok(!claims.some((claim) => claim.a === "charge:refutation"));
});

test("course playlist planning awaits the supplied-root journal and reports an empty public prefix", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "mathematics-youtube-playlist-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const plan = await planCoursePlaylistProjection({ courseId: "causality-and-kinematic-space", courseRevision: 1, title: "Causality and Kinematic Space", description: "Course", playlistPrivacyStatus: "public", minimumPublicLessons: 3 }, { dataRoot: root });
  assert.equal(plan.publicLessonCount, 0);
  assert.equal(plan.disposition, "waiting-for-three-public-lessons");
  assert.deepEqual(plan.externalEffects, []);
});
