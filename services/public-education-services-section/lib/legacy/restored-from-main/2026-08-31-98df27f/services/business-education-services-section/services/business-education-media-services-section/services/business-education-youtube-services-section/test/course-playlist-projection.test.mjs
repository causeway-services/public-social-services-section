import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { recordSettlementRecord } from "../src/record-journal.mjs";
import { ACTOR, channelIdentity, contentId } from "../src/channel.mjs";
import { INVENTORY_CATEGORY } from "../src/inventory.mjs";
import { BOOTSTRAP_CATEGORY, RELEASE_CATEGORY } from "../src/release.mjs";
import { PUBLICATION_CATEGORY } from "../src/public-release.mjs";
import { PUBLICATION_CATEGORY as BRIDGE_PUBLICATION_CATEGORY } from "../src/scheduled-upload-bridge.mjs";
import { LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY } from "../src/legacy-bootstrap-publication-admission.mjs";
import {
  executeCoursePlaylistProjection,
  planCoursePlaylistProjection,
} from "../src/course-playlist-projection.mjs";
const AT = "2096-07-28T16:00:00.000Z",
  SETTLEMENT = "eip155:31337:0x9999999999999999999999999999999999999999",
  SPEC = {
    courseId: "modern-firm-as-operational-system",
    courseRevision: 1,
    title: "The Modern Firm as an Operational System",
    description: "An ordered business course.",
    playlistPrivacyStatus: "public",
    minimumPublicLessons: 3,
  };
function exact(b) {
  return { id: contentId(b), ...b };
}
async function write(witnessJournal, dataRoot, category, value) {
  await recordSettlementRecord({
    root: dataRoot,
    agentUrl: witnessJournal.agentCardUrl,
    settlement: SETTLEMENT,
    actor: ACTOR,
    category,
    recordedAt: AT,
    record: { ...value },
  });
}
async function fixture(t, count = 3, legacy = false) {
  const root = mkdtempSync(join(tmpdir(), "business-course-projection-")),
    witnessJournal = { agentCardUrl: null, close: async () => {} },
    dataRoot = join(root, "data"),
    scheduledUploadReceipt = "urn:sha256:" + "1".repeat(64),
    bootstrap = exact({
      type: "ModernBusinessBootstrapCourseCompletion",
      channel: ACTOR,
      courseId: SPEC.courseId,
      courseRevision: 1,
      lessonId: "value-proposition-business-model-purpose",
      sequence: 1,
      youtubeVideoId: "business_video_1",
      scheduledUploadReceipt,
      civilDay: "2096-07-21",
      publishAt: "2096-07-21T15:00:00.000Z",
      status: "scheduled-first-course-lesson",
      admittedAt: AT,
    }),
    bridge = exact({
      type: "ModernBusinessScheduledUploadBridgePublicationReceipt",
      channel: ACTOR,
      scheduledUploadReceipt,
      civilDay: "2096-07-21",
      youtubeChannelId: channelIdentity().youtubeChannelId,
      youtubeVideoId: "business_video_1",
      privacyStatus: "public",
      publicUrl: "https://www.youtube.com/watch?v=business_video_1",
      publishedAt: "2096-07-21T15:00:00.000Z",
    }),
    legacyAdmission = exact({
      type: "LegacyBootstrapPublicationAdmission",
      channel: ACTOR,
      youtubeChannelId: channelIdentity().youtubeChannelId,
      generation: 1,
      previousAdmission: null,
      operation: "urn:operation:legacy-bootstrap",
      courseId: SPEC.courseId,
      courseRevision: 1,
      lessonId: "value-proposition-business-model-purpose",
      sequence: 1,
      youtubeVideoId: "business_video_1",
      plannedPublishAt: "2096-07-21T15:00:00.000Z",
      videoSha256: `sha256:${"9".repeat(64)}`,
      venueObservation: { privacyStatus: "public", uploadStatus: "processed", processingStatus: "succeeded", publishedAt: "2096-07-21T15:00:00.000Z" },
      publicUrl: "https://www.youtube.com/watch?v=business_video_1",
      admittedAt: AT,
    }),
    legacyCompletion = exact({
      type: "ModernBusinessBootstrapCourseCompletion",
      channel: ACTOR,
      courseId: SPEC.courseId,
      courseRevision: 1,
      lessonId: "value-proposition-business-model-purpose",
      sequence: 1,
      youtubeVideoId: "business_video_1",
      legacyBootstrapPublicationAdmission: legacyAdmission.id,
      civilDay: "2096-07-21",
      publishAt: "2096-07-21T15:00:00.000Z",
      status: "legacy-publication-admitted",
      admittedAt: AT,
    });
  t.after(async () => {
    rmSync(root, { recursive: true, force: true });
  });
  if (legacy) {
    await write(witnessJournal, dataRoot, LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY, legacyAdmission);
    await write(witnessJournal, dataRoot, BOOTSTRAP_CATEGORY, legacyCompletion);
  } else {
    await write(witnessJournal, dataRoot, BOOTSTRAP_CATEGORY, bootstrap);
    await write(witnessJournal, dataRoot, BRIDGE_PUBLICATION_CATEGORY, bridge);
  }
  for (let i = 2; i <= count; i++) {
    const inventory = exact({
        type: "ModernBusinessExplainerInventoryAdmission",
        channel: ACTOR,
        courseId: SPEC.courseId,
        courseRevision: 1,
        lessonId: `lesson-${i}`,
        sequence: i,
      }),
      claim = exact({
        type: "ModernBusinessAlternatingReleaseClaim",
        channel: ACTOR,
        courseId: SPEC.courseId,
        courseRevision: 1,
        lessonId: inventory.lessonId,
        sequence: i,
        inventoryAdmission: inventory.id,
      }),
      publication = exact({
        type: "ModernBusinessPublicPublicationReceipt",
        channel: ACTOR,
        releaseClaim: claim.id,
        inventoryAdmission: inventory.id,
        youtubeChannelId: channelIdentity().youtubeChannelId,
        youtubeVideoId: `business_video_${i}`,
        privacyStatus: "public",
        publicUrl: `https://www.youtube.com/watch?v=business_video_${i}`,
        publishedAt: `2096-07-${20 + i}T15:00:00.000Z`,
      });
    await write(witnessJournal, dataRoot, INVENTORY_CATEGORY, inventory);
    await write(witnessJournal, dataRoot, RELEASE_CATEGORY, claim);
    await write(witnessJournal, dataRoot, PUBLICATION_CATEGORY, publication);
  }
  return {
    dataRoot,
    runtimeRoot: join(root, "runtime"),
    witnessJournalAgentUrl: witnessJournal.agentCardUrl,
    at: AT,
  };
}
test("business projection counts the public bootstrap bridge but still waits for three lessons", async (t) => {
  const options = await fixture(t, 2),
    plan = planCoursePlaylistProjection(SPEC, options);
  assert.equal(plan.publicLessonCount, 2);
  assert.equal(plan.disposition, "waiting-for-three-public-lessons");
});
test("business bootstrap and routine lessons project in one order and replay without YouTube", async (t) => {
  const options = await fixture(t),
    calls = [],
    capability = async (url, init) => {
      calls.push({ url: String(url), body: JSON.parse(init.body) });
      return new Response(
        JSON.stringify(
          String(url).includes("playlistItems")
            ? { id: `PLI_business_${calls.length}` }
            : { id: "PL_business_course_123" },
        ),
        { status: 200 },
      );
    },
    plan = planCoursePlaylistProjection(SPEC, options);
  assert.equal(plan.lessons[0].carrier, "bootstrap-bridge");
  const receipt = await executeCoursePlaylistProjection(SPEC, {
    ...options,
    execute: true,
    operationId: plan.id,
    activation: { coursePlaylistWrites: "granted" },
    authorizedFetch: capability,
  });
  assert.equal(receipt.courseDesignation, "not-designated-by-data-api");
  assert.deepEqual(
    calls.slice(1).map((r) => r.body.snippet.position),
    [0, 1, 2],
  );
  const replay = await executeCoursePlaylistProjection(SPEC, {
    ...options,
    execute: true,
    operationId: plan.id,
    activation: { coursePlaylistWrites: "granted" },
    authorizedFetch: async () => {
      throw new Error("replay crossed YouTube");
    },
  });
  assert.deepEqual(replay, receipt);
});

test("business projection counts the admitted legacy publication without inventing a bridge receipt", async (t) => {
  const options = await fixture(t, 3, true),
    plan = planCoursePlaylistProjection(SPEC, options);
  assert.equal(plan.lessons[0].carrier, "legacy-bootstrap-publication-admission");
  assert.match(plan.lessons[0].publicationReceipt, /^ni:\/\/\/sha-256;/u);
  assert.equal(Object.hasOwn(plan.lessons[0], "scheduledUploadReceipt"), false);
  assert.equal(plan.lessons.length, 3);
});
