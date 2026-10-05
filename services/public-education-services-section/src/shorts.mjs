// A lesson's Short: a vertical Google Flow clip of the lesson's own illustration, published on the
// lesson's channel and pointing to the full video. It turns Flow's video credits, which lapse at
// each renewal, into published work on channels the house can upload to.
//
//   order      once the lesson's video is on YouTube, one 9:16 clip is queued with Flow's queue
//              (google-flow `queueFlowOrder`) under a consumer naming the channel and the lesson;
//              the queue spends it when its credits allow and keeps the media by digest;
//   kept       the clip is found in Flow's generation journal by that consumer;
//   upload     it is uploaded private, scheduled no earlier than the lesson itself, titled for
//              Shorts and describing the full lesson by its link; resumable and never duplicated
//              (the adapter's marker), as the lesson's own upload is.
//
// short.json in the episode directory is the checkpoint, and each effect is appended to the
// episode's record.jsonl like the video's.
import { appendFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { flowStateDir, queueFlowOrder } from "@red-cup-engineering/google-flow-services-section/flow-generate";
import { createYouTube } from "@emsenn/youtube-engineering-services-section/api";
import { episodeDirectory, readJson, writeAtomic } from "./channel.mjs";

const CLIP_MODEL = "veo_3_1_t2v_lite";
const SHORT_TITLE = 100;

/** The Flow consumer a lesson's clip is ordered and kept under. */
export const shortConsumer = (config, lessonId) => `education-short--${config.id}--${lessonId}`;

/** Whether a lesson can have its Short: its video is on YouTube (scheduled or published) and described. */
export const shortReady = (config, state) => Boolean(state?.youtubeVideoId && ["scheduled", "published"].includes(state.stage)
  && existsSync(join(episodeDirectory(config, state.lessonId), "metadata.json")));

/** The clip Flow kept for `consumer`, from its generation journal: { path, sha256, mediaId } or null. */
export function keptClip(consumer, { journal = join(flowStateDir(), "generations.jsonl") } = {}) {
  if (!existsSync(journal)) return null;
  const rows = readFileSync(journal, "utf8").split("\n").filter(Boolean).map((line) => { try { return JSON.parse(line); } catch { return null; } });
  const row = rows.reverse().find((entry) => entry?.consumer === consumer && entry.resource?.path && /video/u.test(`${entry.capability} ${entry.output?.mimeType}`));
  return row && existsSync(row.resource.path) ? { path: row.resource.path, sha256: row.resource.sha256 ?? null, mediaId: row.providerArtifactId ?? null } : null;
}

/** The instant a Short goes public: with the lesson, or half an hour from now if the lesson is already out. */
function publishAtFor(state, now) {
  const lesson = Date.parse(state.publishAt ?? state.plannedPublishAt ?? "");
  const soonest = now.getTime() + 30 * 60_000;
  return new Date(Math.ceil(Math.max(Number.isFinite(lesson) ? lesson : 0, soonest) / 1000) * 1000).toISOString();
}

/**
 * Advance one lesson's Short as far as it goes now.
 * @returns {Promise<{channel, lesson, status, videoId?}>} status `short-queued`, `short-awaiting-flow`, `short-scheduled`, or `short-not-ready`
 */
export async function advanceShort(config, state, { env = process.env, now = new Date(), youtube } = {}) {
  const lessonId = state.lessonId;
  if (!shortReady(config, state)) return { channel: config.id, lesson: lessonId, status: "short-not-ready" };
  const dir = episodeDirectory(config, lessonId);
  const checkpointPath = join(dir, "short.json");
  const checkpoint = readJson(checkpointPath, {});
  const save = (change) => { Object.assign(checkpoint, change); writeAtomic(checkpointPath, checkpoint); };
  const record = (entry) => appendFileSync(join(dir, "record.jsonl"), `${JSON.stringify({ at: new Date().toISOString(), lesson: lessonId, ...entry })}\n`);
  if (checkpoint.youtubeVideoId) return { channel: config.id, lesson: lessonId, status: "short-scheduled", videoId: checkpoint.youtubeVideoId, already: true };
  const metadata = readJson(join(dir, "metadata.json"));
  const consumer = shortConsumer(config, lessonId);
  if (!checkpoint.queuedAt) {
    const prompt = `Vertical 9:16 cinematic motion, no text, no captions, no faces in close-up: ${metadata.thumbnailPrompt}`.slice(0, 1600);
    queueFlowOrder([{ consumer, medium: "video", model: CLIP_MODEL, aspect: "9:16", count: 1, prompt }], { name: `education-short-${config.id}-${lessonId}` });
    save({ consumer, queuedAt: now.toISOString() });
    record({ step: "short", provider: "google-flow", outcome: "queued", consumer });
    return { channel: config.id, lesson: lessonId, status: "short-queued" };
  }
  const clip = keptClip(consumer);
  if (!clip) return { channel: config.id, lesson: lessonId, status: "short-awaiting-flow" };
  const yt = youtube ?? createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env, fetchImpl: globalThis.fetch,
    authorize: async (operation, detail) => { if (operation !== "youtube.observe" && operation !== "youtube.auth") record({ step: "youtube", effect: operation, detail: { ...detail, url: new URL(detail.url).origin + new URL(detail.url).pathname } }); } });
  const title = `${metadata.title.replace(/\s*#shorts\b/giu, "").slice(0, SHORT_TITLE - " #Shorts".length)} #Shorts`;
  const description = `The full lesson: https://youtu.be/${state.youtubeVideoId}\n\n${metadata.description.split("\n\n")[0]}`.slice(0, 4500);
  const publishAt = checkpoint.publishAt ?? publishAtFor(state, now);
  save({ publishAt, clip });
  mkdirSync(join(dir, "work"), { recursive: true });
  const uploadCheckpoint = join(dir, "work", "short-upload.json");
  const video = await yt.upload({ filePath: clip.path, metadata: { title, description, tags: [...(metadata.tags ?? []), "shorts"] }, publishAt,
    marker: `${config.id}/${lessonId}/short`, checkpoint: readJson(uploadCheckpoint, undefined), onCheckpoint: async (upload) => writeAtomic(uploadCheckpoint, upload) });
  save({ youtubeVideoId: video.id });
  record({ step: "short", provider: "youtube", outcome: "scheduled", videoId: video.id, publishAt });
  return { channel: config.id, lesson: lessonId, status: "short-scheduled", videoId: video.id };
}
