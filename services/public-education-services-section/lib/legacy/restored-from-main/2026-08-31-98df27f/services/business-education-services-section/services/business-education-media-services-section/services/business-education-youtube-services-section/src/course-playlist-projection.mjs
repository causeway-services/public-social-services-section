#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  createSettlementStore,
  querySettlementRecords,
} from "./record-journal.mjs";
import {
  addVideoToPlaylist,
  createPlaylist,
} from "@red-cup-engineering/youtube-services-section";
import { ACTOR, NODE_ROOT, channelIdentity, contentId } from "./channel.mjs";
import { INVENTORY_CATEGORY } from "./inventory.mjs";
import { BOOTSTRAP_CATEGORY, RELEASE_CATEGORY } from "./release.mjs";
import { PUBLICATION_CATEGORY } from "./public-release.mjs";
import { PUBLICATION_CATEGORY as BRIDGE_PUBLICATION_CATEGORY } from "./scheduled-upload-bridge.mjs";
import { LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY } from "./legacy-bootstrap-publication-admission.mjs";
import { COURSE_PLAYLIST_SCOPE, REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import {
  authorizedFetch,
  loadEnvironment,
  refreshAccessToken,
} from "./private-draft-pilot.mjs";
export const PROJECTION_CATEGORY =
  "modern-business-youtube.course-playlist-projection";
const INTENT_CATEGORY = "modern-business-youtube.course-playlist-effect-intent",
  PLAYLIST_CATEGORY = "modern-business-youtube.course-playlist-creation",
  ITEM_CATEGORY = "modern-business-youtube.course-playlist-item";
function exact(v) {
  if (!v || typeof v !== "object" || Array.isArray(v)) return false;
  const { id, ...b } = v;
  return id === contentId(b);
}
function text(v) {
  return typeof v === "string" && v.trim() !== "";
}
function registry() {
  return JSON.parse(
    readFileSync(
      join(NODE_ROOT, "content/config/course-projections.json"),
      "utf8",
    ),
  );
}
function activation() {
  return JSON.parse(
    readFileSync(join(NODE_ROOT, "content/config/activation.json"), "utf8"),
  );
}
function legacyBootstrapLessons(courseId, courseRevision, dataRoot, identity) {
  const admissions = querySettlementRecords(
      LEGACY_BOOTSTRAP_PUBLICATION_ADMISSION_CATEGORY,
      { root: dataRoot },
    ),
    admissionById = new Map(admissions.map((row) => [row.id, row])),
    completions = querySettlementRecords(BOOTSTRAP_CATEGORY, {
      root: dataRoot,
    }).filter(
      (row) =>
        row.courseId === courseId &&
        row.courseRevision === courseRevision &&
        row.status === "legacy-publication-admitted" &&
        exact(row),
    );
  return completions.map((row) => {
    const admission = admissionById.get(
      row.legacyBootstrapPublicationAdmission,
    );
    if (
      !admission ||
      !exact(admission) ||
      admission.type !== "LegacyBootstrapPublicationAdmission" ||
      admission.channel !== ACTOR ||
      admission.youtubeChannelId !== identity.youtubeChannelId ||
      admission.courseId !== row.courseId ||
      admission.courseRevision !== row.courseRevision ||
      admission.lessonId !== row.lessonId ||
      admission.sequence !== row.sequence ||
      admission.youtubeVideoId !== row.youtubeVideoId ||
      admission.venueObservation?.privacyStatus !== "public" ||
      admission.venueObservation?.uploadStatus !== "processed" ||
      admission.venueObservation?.processingStatus !== "succeeded" ||
      admission.venueObservation?.publishedAt !== row.publishAt ||
      !text(admission.publicUrl)
    )
      throw new TypeError(
        "business legacy bootstrap course evidence does not preserve its admitted publication chain",
      );
    return {
      lessonId: row.lessonId,
      sequence: row.sequence,
      inventoryAdmission: null,
      releaseClaim: row.id,
      publicationReceipt: admission.id,
      youtubeVideoId: admission.youtubeVideoId,
      publicUrl: admission.publicUrl,
      publishedAt: admission.venueObservation.publishedAt,
      carrier: "legacy-bootstrap-publication-admission",
    };
  });
}
export function collectPublicCourseLessons({
  courseId,
  courseRevision,
  dataRoot = join(NODE_ROOT, "data"),
} = {}) {
  if (
    !text(courseId) ||
    !Number.isInteger(courseRevision) ||
    courseRevision < 1
  )
    throw new TypeError(
      "business course projection requires an exact course revision",
    );
  const root = resolve(dataRoot),
    identity = channelIdentity(),
    lessons = legacyBootstrapLessons(
      courseId,
      courseRevision,
      dataRoot,
      identity,
    ),
    bootstrap = querySettlementRecords(BOOTSTRAP_CATEGORY, {
      root: dataRoot,
    }).filter(
      (r) =>
        r.courseId === courseId &&
        r.courseRevision === courseRevision &&
        r.status === "scheduled-first-course-lesson" &&
        exact(r),
    ),
    bridgePublications = querySettlementRecords(BRIDGE_PUBLICATION_CATEGORY, {
      root: dataRoot,
    }).filter(
      (r) =>
        r.type === "ModernBusinessScheduledUploadBridgePublicationReceipt" &&
        r.channel === ACTOR &&
        r.youtubeChannelId === identity.youtubeChannelId &&
        r.privacyStatus === "public" &&
        text(r.publicUrl) &&
        Number.isFinite(Date.parse(r.publishedAt)) &&
        exact(r),
    );
  for (const row of bootstrap) {
    const publication = bridgePublications.find(
      (p) =>
        p.scheduledUploadReceipt === row.scheduledUploadReceipt &&
        p.youtubeVideoId === row.youtubeVideoId,
    );
    if (publication)
      lessons.push({
        lessonId: row.lessonId,
        sequence: row.sequence,
        inventoryAdmission: null,
        releaseClaim: row.id,
        publicationReceipt: publication.id,
        youtubeVideoId: publication.youtubeVideoId,
        publicUrl: publication.publicUrl,
        publishedAt: publication.publishedAt,
        carrier: "bootstrap-bridge",
      });
  }
  const inventories = querySettlementRecords(INVENTORY_CATEGORY, {
      root: dataRoot,
    }).filter(
      (r) =>
        r.courseId === courseId &&
        r.courseRevision === courseRevision &&
        exact(r),
    ),
    inventoryById = new Map(inventories.map((r) => [r.id, r])),
    claims = querySettlementRecords(RELEASE_CATEGORY, {
      root: dataRoot,
    }).filter((r) => exact(r)),
    claimById = new Map(claims.map((r) => [r.id, r])),
    publications = querySettlementRecords(PUBLICATION_CATEGORY, {
      root: dataRoot,
    }).filter(
      (r) =>
        r.type === "ModernBusinessPublicPublicationReceipt" &&
        r.channel === ACTOR &&
        r.youtubeChannelId === identity.youtubeChannelId &&
        r.privacyStatus === "public" &&
        text(r.publicUrl) &&
        Number.isFinite(Date.parse(r.publishedAt)) &&
        exact(r),
    );
  for (const publication of publications) {
    const claim = claimById.get(publication.releaseClaim),
      inventory = inventoryById.get(publication.inventoryAdmission);
    if (
      !claim ||
      !inventory ||
      claim.inventoryAdmission !== inventory.id ||
      claim.courseId !== courseId ||
      claim.courseRevision !== courseRevision ||
      claim.lessonId !== inventory.lessonId ||
      claim.sequence !== inventory.sequence
    )
      throw new TypeError(
        "business public course evidence does not preserve its admitted lesson chain",
      );
    lessons.push({
      lessonId: inventory.lessonId,
      sequence: inventory.sequence,
      inventoryAdmission: inventory.id,
      releaseClaim: claim.id,
      publicationReceipt: publication.id,
      youtubeVideoId: publication.youtubeVideoId,
      publicUrl: publication.publicUrl,
      publishedAt: publication.publishedAt,
      carrier: "routine",
    });
  }
  lessons.sort(
    (a, b) => a.sequence - b.sequence || a.lessonId.localeCompare(b.lessonId),
  );
  if (
    new Set(lessons.map((r) => r.lessonId)).size !== lessons.length ||
    new Set(lessons.map((r) => r.youtubeVideoId)).size !== lessons.length
  )
    throw new TypeError(
      "business course projection contains duplicate lessons or videos",
    );
  if (lessons.some((r, i) => r.sequence !== i + 1))
    throw new TypeError(
      "business course projection requires a contiguous curriculum prefix",
    );
  return lessons;
}
export function planCoursePlaylistProjection(spec, options = {}) {
  if (
    !spec ||
    !text(spec.courseId) ||
    !Number.isInteger(spec.courseRevision) ||
    !text(spec.title) ||
    typeof spec.description !== "string" ||
    spec.playlistPrivacyStatus !== "public" ||
    spec.minimumPublicLessons !== 3
  )
    throw new TypeError("business course playlist specification is invalid");
  const lessons = collectPublicCourseLessons({
    ...spec,
    dataRoot: options.dataRoot,
  });
  if (lessons.length < 3)
    return {
      type: "ModernBusinessCoursePlaylistProjectionReadiness",
      courseId: spec.courseId,
      courseRevision: spec.courseRevision,
      publicLessonCount: lessons.length,
      requiredPublicLessonCount: 3,
      disposition: "waiting-for-three-public-lessons",
      externalEffects: [],
    };
  const b = {
    type: "ModernBusinessCoursePlaylistProjectionOperation",
    channel: ACTOR,
    youtubeChannelId: channelIdentity().youtubeChannelId,
    courseId: spec.courseId,
    courseRevision: spec.courseRevision,
    title: spec.title,
    description: spec.description,
    playlistPrivacyStatus: "public",
    lessons,
    requestedCourseDesignation: false,
  };
  return { id: contentId(b), ...b, disposition: "ready-no-effect" };
}
async function record(store, category, at, value) {
  await store.record({ category, recordedAt: at, record: { ...value } });
}
export async function executeCoursePlaylistProjection(spec, options = {}) {
  const plan = planCoursePlaylistProjection(spec, options);
  if (!plan.id) return plan;
  const { disposition: _disposition, ...operation } = plan,
    dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")),
    prior = querySettlementRecords(PROJECTION_CATEGORY, {
      root: dataRoot,
    }).filter((r) => r.operation === operation.id);
  if (prior.length) {
    const rows = prior;
    if (
      rows.some((r) => !exact(r)) ||
      new Set(rows.map((r) => r.id)).size !== 1
    )
      throw new TypeError("business course projection ledger conflicts");
    return rows[0];
  }
  if (
    options.execute !== true ||
    options.operationId !== operation.id ||
    options.activation?.coursePlaylistWrites !== "granted"
  )
    throw new TypeError(
      "live business course projection requires exact operation and Leader activation",
    );
  if (typeof options.authorizedFetch !== "function")
    throw new TypeError(
      "business course projection requires an attenuated YouTube capability",
    );
  const at = options.at ?? new Date().toISOString(),
    store = createSettlementStore({
      settlementRoot: dataRoot,
      agentUrl:
        options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT,
    }),
    runtimeRoot = resolve(
      options.runtimeRoot ?? join(dataRoot, "runtime/course-playlist-locks"),
    ),
    lock = join(runtimeRoot, operation.id.slice(11));
  mkdirSync(runtimeRoot, { recursive: true });
  try {
    mkdirSync(lock);
  } catch (e) {
    if (e?.code === "EEXIST")
      throw new TypeError(
        "business course projection is concurrently executing",
      );
    throw e;
  }
  try {
    let playlist = querySettlementRecords(PLAYLIST_CATEGORY, {
      root: dataRoot,
    }).find((r) => r.operation === operation.id);
    if (!playlist) {
      if (
        querySettlementRecords(INTENT_CATEGORY, { root: dataRoot }).some(
          (r) => r.operation === operation.id && r.effect === "create-playlist",
        )
      )
        throw new TypeError(
          "business playlist creation has an ambiguous prior effect",
        );
      const ib = {
        type: "ModernBusinessCoursePlaylistEffectIntent",
        operation: operation.id,
        effect: "create-playlist",
        position: null,
        youtubeVideoId: null,
        startedAt: at,
      };
      await record(store, INTENT_CATEGORY, at, { id: contentId(ib), ...ib });
      const venue = await createPlaylist({
          authorizedFetch: options.authorizedFetch,
          title: operation.title,
          description: operation.description,
          privacyStatus: "public",
        }),
        b = {
          type: "ModernBusinessCoursePlaylistCreationReceipt",
          operation: operation.id,
          youtubeChannelId: operation.youtubeChannelId,
          playlistId: venue.playlistId,
          privacyStatus: "public",
          protocolResponse: venue.response,
          createdAt: at,
        };
      playlist = { id: contentId(b), ...b };
      await record(store, PLAYLIST_CATEGORY, at, playlist);
    }
    const items = [];
    for (const [position, lesson] of operation.lessons.entries()) {
      let item = querySettlementRecords(ITEM_CATEGORY, { root: dataRoot }).find(
        (r) => r.operation === operation.id && r.position === position,
      );
      if (!item) {
        if (
          querySettlementRecords(INTENT_CATEGORY, { root: dataRoot }).some(
            (r) =>
              r.operation === operation.id &&
              r.effect === "add-playlist-item" &&
              r.position === position,
          )
        )
          throw new TypeError(
            `business playlist item ${position} has an ambiguous prior effect`,
          );
        const ib = {
          type: "ModernBusinessCoursePlaylistEffectIntent",
          operation: operation.id,
          effect: "add-playlist-item",
          position,
          youtubeVideoId: lesson.youtubeVideoId,
          startedAt: at,
        };
        await record(store, INTENT_CATEGORY, at, { id: contentId(ib), ...ib });
        const venue = await addVideoToPlaylist({
            authorizedFetch: options.authorizedFetch,
            playlistId: playlist.playlistId,
            videoId: lesson.youtubeVideoId,
            position,
          }),
          b = {
            type: "ModernBusinessCoursePlaylistItemReceipt",
            operation: operation.id,
            playlistCreationReceipt: playlist.id,
            playlistId: playlist.playlistId,
            position,
            lessonId: lesson.lessonId,
            publicationReceipt: lesson.publicationReceipt,
            youtubeVideoId: lesson.youtubeVideoId,
            playlistItemId: venue.playlistItemId,
            protocolResponse: venue.response,
            addedAt: at,
          };
        item = { id: contentId(b), ...b };
        await record(store, ITEM_CATEGORY, at, item);
      }
      items.push(item.id);
    }
    const b = {
        type: "ModernBusinessCoursePlaylistProjectionReceipt",
        operation: operation.id,
        channel: ACTOR,
        youtubeChannelId: operation.youtubeChannelId,
        courseId: operation.courseId,
        courseRevision: operation.courseRevision,
        playlistId: playlist.playlistId,
        playlistCreationReceipt: playlist.id,
        orderedPlaylistItemReceipts: items,
        publicLessonCount: operation.lessons.length,
        courseDesignation: "not-designated-by-data-api",
        leaderActionRemaining:
          "designate-this-playlist-as-a-course-in-desktop-youtube-studio",
        completedAt: at,
      },
      receipt = { id: contentId(b), ...b };
    await record(store, PROJECTION_CATEGORY, at, receipt);
    return receipt;
  } finally {
    rmSync(lock, { recursive: true, force: true });
  }
}
export async function runConfiguredCourseProjection(options = {}) {
  const spec = registry().courses[0],
    gate = options.activation ?? activation(),
    plan = planCoursePlaylistProjection(spec, options);
  if (!plan.id || gate.coursePlaylistWrites !== "granted")
    return {
      ...plan,
      disposition: plan.id
        ? "deferred-until-playlist-activation"
        : plan.disposition,
    };
  let capability = options.authorizedFetch,
    witnessJournalAgentUrl = options.witnessJournalAgentUrl;
  if (!capability) {
    const env = loadEnvironment(),
      token = await refreshAccessToken(
        {
          clientId: env.YOUTUBE_OAUTH_CLIENT_ID,
          clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET,
          refreshToken: env[REFRESH_TOKEN_ENV],
        },
        fetch,
        [COURSE_PLAYLIST_SCOPE],
      );
    capability = authorizedFetch(token);
    witnessJournalAgentUrl ??= env.WITNESS_JOURNAL_RDF_AGENT;
  }
  return executeCoursePlaylistProjection(spec, {
    ...options,
    activation: gate,
    authorizedFetch: capability,
    witnessJournalAgentUrl,
    execute: true,
    operationId: plan.id,
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url))
  await runConfiguredCourseProjection()
    .then((v) => process.stdout.write(`${JSON.stringify(v)}\n`))
    .catch((e) => {
      process.stderr.write(`refused: ${e.message}\n`);
      process.exitCode = 78;
    });
