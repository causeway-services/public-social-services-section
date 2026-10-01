#!/usr/bin/env node
// Education channel production.
//
//   status [channel|all]                    commissioned lessons and where each stands
//   research <channel> <lesson>            research a lesson without producing a video
//   produce [channel|all] [lesson]          fill publication slots or advance a named lesson
//   artifacts <channel>                     list the channel notebook's NotebookLM videos
//   adopt <channel> <lesson> <artifact-id>  adopt the artifact of an uncertain video submission
//   begin-thumbnail <channel> <lesson>      claim the held account capacity before using its UI
//   adopt-thumbnail <channel> <lesson> <image> <spent-units>  accept operator image
//   release-thumbnail <channel> <lesson> <reason>  release a packet with no artifact
//   retry <channel> <lesson>                readmit a failed or abandoned video to its formats
//   verify [channel|all]                    confirm each channel's YouTube credential
//
// Production commissions unpublished curriculum lessons to fill upcoming slots.
// Running produce again continues where the last run stopped. The exit status
// reports a fault in the program or its retained data; a lesson that is waiting
// on a provider, an operator or a retry is an outcome, printed but not a fault.
import { join } from "node:path";
import { homedir } from "node:os";
import { createNotebookAdapter } from "@red-cup-engineering/gemini-notebook-services-section/gemini-notebook-cli";
import { channelIds, loadChannel, loadEnvironment, readJson } from "./channel.mjs";
import { adoptArtifact, adoptOperatorThumbnail, advanceLesson, beginOperatorThumbnail, episodeState, isRequested, releaseOperatorThumbnail, retryVideo } from "./lesson.mjs";
import { createYouTube } from "@emsenn/youtube-engineering-services-section/api";
import { existsSync, readdirSync } from "node:fs";
import { extendCurriculum } from "./curriculum.mjs";
import { EducationCandidateRefusal, EducationInferenceUnavailable } from "./inference.mjs";

loadEnvironment();
process.env.EXPECTED_RESOLUTION_PRICING_ROOT ||= join(
  process.env.XDG_STATE_HOME || join(homedir(), ".local", "state"),
  "561-group", "computer-inference-engine", "expected-resolution-pricing",
);
const [command = "status", ...rest] = process.argv.slice(2);
const positional = rest.filter((value, i) => !value.startsWith("--") && !rest[i - 1]?.startsWith("--"));
const channelsOf = (value = "all") => (value === "all" ? channelIds() : [value]).map((id) => loadChannel(id)).filter((config) => config.enabled !== false);
const out = (value) => process.stdout.write(`${JSON.stringify(value)}\n`);
const episodes = (config) => {
  const dir = join(config.directory, "production", "episodes");
  return existsSync(dir) ? readdirSync(dir).filter((id) => existsSync(join(dir, id, "state.json"))).map((id) => episodeState(config, id)) : [];
};
const FINISHED = new Set(["scheduled", "published"]);
const ABANDONED = "abandoned";
// Blocked statuses that mean retained state or provenance disagrees with itself.
const FAULT = /changed|missing|mismatch|corrupt|provenance|conflict|invalid|rejected/u;
const BUFFER_SLOTS = 2;
const historyOf = (config) => readJson(join(config.directory, "history.json"), {});
const historyEntries = (history) => [...(history.publications ?? []), ...(history.ready ?? [])];
const normalizeTitle = (title) => String(title ?? "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim();
const historicalLessons = (history, curriculum = []) => {
  const entries = historyEntries(history);
  const publishedTitles = new Set(entries.map((item) => normalizeTitle(item.title)).filter(Boolean));
  return new Set([...entries.map((item) => item.lessonId), ...curriculum.filter((lesson) => publishedTitles.has(normalizeTitle(lesson.title))).map((lesson) => lesson.id)].filter(Boolean));
};
const productionLesson = (config, upload) => {
  const marker = (upload.snippet?.description ?? "").match(/\[production:([^/\]]+)\/([a-z0-9-]+)\]/u);
  return marker?.[1] === config.id ? marker[2] : undefined;
};
const futureUploads = (uploads, now) => uploads.filter((upload) => {
  const publishAt = upload.status?.publishAt;
  return publishAt && new Date(publishAt) > now && !["failed", "rejected"].includes(upload.status?.uploadStatus);
});

let failures = 0;
if (command === "status") {
  for (const config of channelsOf(positional[0])) {
    const byLesson = new Map(episodes(config).map((state) => [state.lessonId, state]));
    out({ channel: config.id, format: config.video.format, credentialPresent: Boolean(process.env[config.refreshTokenEnv]),
      requested: config.curriculum.filter((l) => isRequested(l, byLesson.get(l.id))).map((l) => ({ lesson: l.id, stage: byLesson.get(l.id)?.stage ?? "new", videoId: byLesson.get(l.id)?.youtubeVideoId, error: byLesson.get(l.id)?.lastError?.message })) });
  }
} else if (command === "research") {
  const [channel, lesson] = positional;
  if (!channel || !lesson || channel === "all") throw new Error("usage: research <channel> <lesson>");
  out(await advanceLesson(loadChannel(channel), lesson, { researchOnly: true }));
} else if (command === "produce") {
  const [channel = "all", only] = positional;
  for (const config of channelsOf(channel)) {
    try {
    const byLesson = new Map(episodes(config).map((state) => [state.lessonId, state]));
    const history = historyOf(config);
    const historical = historicalLessons(history, config.curriculum);
    const youtube = createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env: process.env, fetchImpl: globalThis.fetch, authorize: async () => {} });
    let uploads = [], inventoryAvailable = true;
    try { uploads = await youtube.listUploads(); }
    catch (error) {
      inventoryAvailable = false;
      failures += 1;
      out({ channel: config.id, status: "youtube-inventory-unavailable", error: error.message });
    }
    const represented = new Set(uploads.map((upload) => productionLesson(config, upload)).filter(Boolean));
    let lessons;
    if (only) {
      const named = config.curriculum.find((lesson) => lesson.id === only);
      if (!named) throw new Error(`${config.id} has no curriculum lesson ${only}`);
      lessons = historical.has(only) || (represented.has(only) && !byLesson.get(only)?.youtubeVideoId) ? [] : [named];
      if (!lessons.length) out({ channel: config.id, lesson: only, status: "already-covered" });
    } else {
      const pending = config.curriculum.filter((lesson) => {
        const state = byLesson.get(lesson.id);
        return state?.stage === "scheduled" || (!historical.has(lesson.id) && isRequested(lesson, state) && !FINISHED.has(state?.stage) && state?.stage !== ABANDONED);
      });
      const pendingIds = new Set(pending.map(({ id }) => id));
      const future = futureUploads(uploads, new Date());
      lessons = pending;
      const pendingReservations = pending.filter((lesson) => !byLesson.get(lesson.id)?.youtubeVideoId && !represented.has(lesson.id)).length;
      const needed = inventoryAvailable ? Math.max(0, BUFFER_SLOTS - future.length - pendingReservations) : 0;
      const available = () => config.curriculum.filter((lesson) => !historical.has(lesson.id) && !represented.has(lesson.id) && !byLesson.get(lesson.id)?.youtubeVideoId && byLesson.get(lesson.id)?.stage !== ABANDONED && !pendingIds.has(lesson.id));
      let candidates = available();
      if (candidates.length < needed) {
        try {
          const added = await extendCurriculum(config, Math.min(3, needed - candidates.length), { history, env: process.env });
          config.curriculum.push(...added);
          candidates = available();
        } catch (error) {
          if (!(error instanceof EducationInferenceUnavailable || error instanceof EducationCandidateRefusal)) failures += 1;
          out({ channel: config.id, status: "curriculum-extension-failed", error: error.message });
        }
      }
      lessons.push(...candidates.slice(0, needed));
    }
    for (const lesson of lessons) {
      try {
        const result = await advanceLesson(config, lesson.id, { commissioned: true });
        out(result);
        if (FAULT.test(result.status)) failures += 1;
      } catch (error) { failures += 1; out({ channel: config.id, lesson: lesson.id, error: error.message }); }
    }
    } catch (error) {
      failures += 1;
      out({ channel: config.id, error: error.message });
    }
  }
} else if (command === "artifacts") {
  const config = loadChannel(positional[0]);
  const notebookId = config.notebookId ?? readJson(join(config.directory, "production", "notebook.json"), {}).notebookId;
  out(await createNotebookAdapter().listVideos({ notebookId }));
} else if (command === "adopt") {
  const [channel, lesson, artifactId] = positional;
  out({ channel, lesson, status: "adopted", artifact: await adoptArtifact(loadChannel(channel), lesson, artifactId) });
} else if (command === "begin-thumbnail") {
  const [channel, lesson] = positional;
  if (!channel || !lesson) throw new Error("usage: begin-thumbnail <channel> <lesson>");
  out({ channel, lesson, ...await beginOperatorThumbnail(loadChannel(channel), lesson) });
} else if (command === "adopt-thumbnail") {
  const [channel, lesson, image, spent] = positional;
  if (!channel || !lesson || !image || !/^(0|[1-9][0-9]*)$/u.test(spent ?? "")) throw new Error("usage: adopt-thumbnail <channel> <lesson> <image> <spent-units>");
  out({ channel, lesson, status: "thumbnail-adopted", ...await adoptOperatorThumbnail(loadChannel(channel), lesson, image, Number(spent)) });
} else if (command === "release-thumbnail") {
  const [channel, lesson, reason] = positional;
  if (!channel || !lesson || !reason) throw new Error("usage: release-thumbnail <channel> <lesson> <expired|logged-out|quota-exhausted|ui-changed|operator-declined>");
  out({ channel, lesson, status: "thumbnail-released", ...await releaseOperatorThumbnail(loadChannel(channel), lesson, reason) });
} else if (command === "retry") {
  const [channel, lesson] = positional;
  if (!channel || !lesson) throw new Error("usage: retry <channel> <lesson>");
  retryVideo(loadChannel(channel), lesson);
  out({ channel, lesson, status: "readmitted" });
} else if (command === "verify") {
  for (const config of channelsOf(positional[0])) {
    try {
      const identity = await createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env: process.env, fetchImpl: globalThis.fetch, authorize: async () => {} }).verifyIdentity();
      out({ channel: config.id, youtubeChannelId: identity.id, status: "authenticated" });
    } catch (error) { failures += 1; out({ channel: config.id, error: error.message }); }
  }
} else {
  throw new Error("usage: status|research|produce|artifacts|adopt|begin-thumbnail|adopt-thumbnail|release-thumbnail|retry|verify (see src/cli.mjs)");
}
if (failures) process.exitCode = 1;
