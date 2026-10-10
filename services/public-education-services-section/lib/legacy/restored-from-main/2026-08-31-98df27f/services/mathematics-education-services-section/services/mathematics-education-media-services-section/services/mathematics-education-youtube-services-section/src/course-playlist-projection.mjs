#!/usr/bin/env node
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSettlementStore, querySettlementRecords } from "./journal-client.mjs";
import { addVideoToPlaylist, createPlaylist } from "@red-cup-engineering/youtube-services-section";
import { ACTOR, NODE_ROOT, channelIdentity, contentId } from "./channel.mjs";
import { COURSE_PLAYLIST_SCOPE, REFRESH_TOKEN_ENV } from "./oauth-setup.mjs";
import { createAuthorizedFetch, loadChannelEnvironment, refreshAccessToken } from "./private-pilot.mjs";

export const PROJECTION_CATEGORY = "mathematics-youtube.course-playlist-projection";
const INTENT_CATEGORY = "mathematics-youtube.course-playlist-effect-intent";
const PLAYLIST_CATEGORY = "mathematics-youtube.course-playlist-creation";
const ITEM_CATEGORY = "mathematics-youtube.course-playlist-item";
const INVENTORY_CATEGORY = "mathematics-youtube.cinematic-inventory-admission";
const CLAIM_CATEGORY = "mathematics-youtube.daily-release-claim";
const PUBLICATION_CATEGORY = "mathematics-youtube.publication-receipt";
const HISTORICAL_PUBLICATION_CATEGORY = "mathematics-youtube.historical-publication-admission";

function exact(value) { if (!value || typeof value !== "object" || Array.isArray(value)) return false; const { id, ...body } = value; return id === contentId(body); }
function text(value) { return typeof value === "string" && value.trim() !== ""; }
function registry() { return JSON.parse(readFileSync(join(NODE_ROOT, "content/config/course-projections.json"), "utf8")); }
function activation() { return JSON.parse(readFileSync(join(NODE_ROOT, "content/config/activation.json"), "utf8")); }

export async function collectPublicCourseLessons({ courseId, courseRevision, dataRoot = join(NODE_ROOT, "data") } = {}) {
  if (!text(courseId) || !Number.isInteger(courseRevision) || courseRevision < 1) throw new TypeError("course projection requires an exact course revision");
  const root = resolve(dataRoot), identity = channelIdentity();
  const inventories = (await querySettlementRecords(INVENTORY_CATEGORY, { dataRoot: root })).filter((row) => row.courseId === courseId && row.courseRevision === courseRevision && exact(row));
  const inventoryById = new Map(inventories.map((row) => [row.id, row]));
  const claims = (await querySettlementRecords(CLAIM_CATEGORY, { dataRoot: root })).filter((row) => exact(row));
  const claimById = new Map(claims.map((row) => [row.id, row]));
  const publications = (await querySettlementRecords(PUBLICATION_CATEGORY, { dataRoot: root })).filter((row) => row.type === "MathematicsPublicPublicationReceipt" && row.channel === ACTOR && row.youtubeChannelId === identity.youtubeChannelId && row.privacyStatus === "public" && text(row.publicUrl) && Number.isFinite(Date.parse(row.publishedAt)) && exact(row));
  const lessons = publications.map((publication) => {
    const claim = claimById.get(publication.releaseClaim), inventory = inventoryById.get(publication.inventoryAdmission);
    if (!claim || !inventory || claim.inventoryAdmission !== inventory.id || claim.courseId !== courseId || claim.courseRevision !== courseRevision || claim.lessonId !== inventory.lessonId || claim.sequence !== inventory.sequence || publication.releaseClaim !== claim.id) throw new TypeError("public mathematics course evidence does not preserve its admitted lesson chain");
    return { lessonId: inventory.lessonId, sequence: inventory.sequence, inventoryAdmission: inventory.id, releaseClaim: claim.id, publicationReceipt: publication.id, youtubeVideoId: publication.youtubeVideoId, publicUrl: publication.publicUrl, publishedAt: publication.publishedAt };
  });
  const historical = (await querySettlementRecords(HISTORICAL_PUBLICATION_CATEGORY, { dataRoot: root })).filter((row) => exact(row) && row.type === "MathematicsHistoricalPublicReleaseAdmission" && row.channel === ACTOR && row.youtubeChannelId === identity.youtubeChannelId && row.courseId === courseId && row.courseRevision === courseRevision).map((row) => ({ lessonId: row.lessonId, sequence: row.sequence, inventoryAdmission: null, releaseClaim: null, publicationReceipt: row.id, youtubeVideoId: row.youtubeVideoId, publicUrl: row.publicUrl, publishedAt: row.publishedAt }));
  lessons.push(...historical); lessons.sort((a, b) => a.sequence - b.sequence || a.lessonId.localeCompare(b.lessonId));
  if (new Set(lessons.map((row) => row.lessonId)).size !== lessons.length || new Set(lessons.map((row) => row.youtubeVideoId)).size !== lessons.length) throw new TypeError("course projection contains duplicate lessons or videos");
  if (lessons.some((row, index) => row.sequence !== index + 1)) throw new TypeError("course projection requires a contiguous curriculum prefix");
  return lessons;
}

export async function planCoursePlaylistProjection(specification, options = {}) {
  if (!specification || !text(specification.courseId) || !Number.isInteger(specification.courseRevision) || !text(specification.title) || typeof specification.description !== "string" || specification.playlistPrivacyStatus !== "public" || specification.minimumPublicLessons !== 3) throw new TypeError("course playlist specification is invalid");
  const lessons = await collectPublicCourseLessons({ ...specification, dataRoot: options.dataRoot });
  if (lessons.length < specification.minimumPublicLessons) return { type: "MathematicsCoursePlaylistProjectionReadiness", courseId: specification.courseId, courseRevision: specification.courseRevision, publicLessonCount: lessons.length, requiredPublicLessonCount: specification.minimumPublicLessons, disposition: "waiting-for-three-public-lessons", externalEffects: [] };
  const body = { type: "MathematicsCoursePlaylistProjectionOperation", channel: ACTOR, youtubeChannelId: channelIdentity().youtubeChannelId, courseId: specification.courseId, courseRevision: specification.courseRevision, title: specification.title, description: specification.description, playlistPrivacyStatus: specification.playlistPrivacyStatus, lessons, requestedCourseDesignation: false };
  return { id: contentId(body), ...body, disposition: "ready-no-effect" };
}

async function record(store, category, at, value) { await store.record({ category, recordedAt: at, record: { ...value } }); }

export async function executeCoursePlaylistProjection(specification, options = {}) {
  const plan = await planCoursePlaylistProjection(specification, options);
  if (!plan.id) return plan;
  const { disposition: _disposition, ...operation } = plan, dataRoot = resolve(options.dataRoot ?? join(NODE_ROOT, "data")), prior = (await querySettlementRecords(PROJECTION_CATEGORY, { dataRoot })).filter((row) => row.operation === operation.id);
  if (prior.length) { const rows = prior; if (rows.some((row) => !exact(row)) || new Set(rows.map((row) => row.id)).size !== 1) throw new TypeError("course playlist projection ledger conflicts"); return rows[0]; }
  if (options.execute !== true) return plan;
  if (options.operationId !== operation.id || options.activation?.coursePlaylistWrites !== "granted") throw new TypeError("live course playlist projection requires exact operation and Leader activation");
  if (typeof options.authorizedFetch !== "function") throw new TypeError("course playlist projection requires an attenuated YouTube capability");
  const at = options.at ?? new Date().toISOString(), store = createSettlementStore({ dataRoot, agentUrl: options.witnessJournalAgentUrl ?? process.env.WITNESS_JOURNAL_RDF_AGENT }), runtimeRoot = resolve(options.runtimeRoot ?? join(dataRoot, "runtime/course-playlist-locks")), lock = join(runtimeRoot, operation.id.slice(11)); mkdirSync(runtimeRoot, { recursive: true });
  try { mkdirSync(lock); } catch (error) { if (error?.code === "EEXIST") throw new TypeError("course playlist projection is concurrently executing"); throw error; }
  try {
    let playlist = (await querySettlementRecords(PLAYLIST_CATEGORY, { dataRoot })).find((row) => row.operation === operation.id);
    if (!playlist) {
      if ((await querySettlementRecords(INTENT_CATEGORY, { dataRoot })).some((row) => row.operation === operation.id && row.effect === "create-playlist")) throw new TypeError("course playlist creation has an ambiguous prior effect");
      const intentBody = { type: "MathematicsCoursePlaylistEffectIntent", operation: operation.id, effect: "create-playlist", position: null, youtubeVideoId: null, startedAt: at }; await record(store, INTENT_CATEGORY, at, { id: contentId(intentBody), ...intentBody });
      const venue = await createPlaylist({ authorizedFetch: options.authorizedFetch, title: operation.title, description: operation.description, privacyStatus: operation.playlistPrivacyStatus });
      const body = { type: "MathematicsCoursePlaylistCreationReceipt", operation: operation.id, youtubeChannelId: operation.youtubeChannelId, playlistId: venue.playlistId, privacyStatus: operation.playlistPrivacyStatus, protocolResponse: venue.response, createdAt: at }; playlist = { id: contentId(body), ...body }; await record(store, PLAYLIST_CATEGORY, at, playlist);
    }
    const items = [];
    for (const [position, lesson] of operation.lessons.entries()) {
      let item = (await querySettlementRecords(ITEM_CATEGORY, { dataRoot })).find((row) => row.operation === operation.id && row.position === position);
      if (!item) {
        if ((await querySettlementRecords(INTENT_CATEGORY, { dataRoot })).some((row) => row.operation === operation.id && row.effect === "add-playlist-item" && row.position === position)) throw new TypeError(`course playlist item ${position} has an ambiguous prior effect`);
        const intentBody = { type: "MathematicsCoursePlaylistEffectIntent", operation: operation.id, effect: "add-playlist-item", position, youtubeVideoId: lesson.youtubeVideoId, startedAt: at }; await record(store, INTENT_CATEGORY, at, { id: contentId(intentBody), ...intentBody });
        const venue = await addVideoToPlaylist({ authorizedFetch: options.authorizedFetch, playlistId: playlist.playlistId, videoId: lesson.youtubeVideoId, position });
        const body = { type: "MathematicsCoursePlaylistItemReceipt", operation: operation.id, playlistCreationReceipt: playlist.id, playlistId: playlist.playlistId, position, lessonId: lesson.lessonId, publicationReceipt: lesson.publicationReceipt, youtubeVideoId: lesson.youtubeVideoId, playlistItemId: venue.playlistItemId, protocolResponse: venue.response, addedAt: at }; item = { id: contentId(body), ...body }; await record(store, ITEM_CATEGORY, at, item);
      }
      items.push(item.id);
    }
    const body = { type: "MathematicsCoursePlaylistProjectionReceipt", operation: operation.id, channel: ACTOR, youtubeChannelId: operation.youtubeChannelId, courseId: operation.courseId, courseRevision: operation.courseRevision, playlistId: playlist.playlistId, playlistCreationReceipt: playlist.id, orderedPlaylistItemReceipts: items, publicLessonCount: operation.lessons.length, courseDesignation: "not-designated-by-data-api", leaderActionRemaining: "designate-this-playlist-as-a-course-in-desktop-youtube-studio", completedAt: at }, receipt = { id: contentId(body), ...body }; await record(store, PROJECTION_CATEGORY, at, receipt); return receipt;
  } finally { rmSync(lock, { recursive: true, force: true }); }
}

export async function runConfiguredCourseProjection(options = {}) {
  const specification = registry().courses[0], gate = options.activation ?? activation(), plan = await planCoursePlaylistProjection(specification, options);
  if (!plan.id || gate.coursePlaylistWrites !== "granted") return { ...plan, disposition: plan.id ? "deferred-until-playlist-activation" : plan.disposition };
  let authorizedFetch = options.authorizedFetch, witnessJournalAgentUrl = options.witnessJournalAgentUrl;
  if (!authorizedFetch) { const env = loadChannelEnvironment(), token = await refreshAccessToken({ clientId: env.YOUTUBE_OAUTH_CLIENT_ID, clientSecret: env.YOUTUBE_OAUTH_CLIENT_SECRET, refreshToken: env[REFRESH_TOKEN_ENV] }, { requiredScopes: [COURSE_PLAYLIST_SCOPE] }); authorizedFetch = createAuthorizedFetch(token.accessToken); witnessJournalAgentUrl ??= env.WITNESS_JOURNAL_RDF_AGENT; }
  return executeCoursePlaylistProjection(specification, { ...options, activation: gate, authorizedFetch, witnessJournalAgentUrl, execute: true, operationId: plan.id });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await runConfiguredCourseProjection().then((value) => process.stdout.write(`${JSON.stringify(value)}\n`)).catch((error) => { process.stderr.write(`refused: ${error.message}\n`); process.exitCode = 78; });
