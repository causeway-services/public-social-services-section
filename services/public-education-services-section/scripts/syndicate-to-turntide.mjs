#!/usr/bin/env node
// Observe owned YouTube uploads and offer newly public videos to Turntide.
// Every education channel whose config declares `turntide.subjects` takes
// part. Run where the education OAuth credentials live; Zelo's placement desk
// on the Discord host decides the island and the pace, so neither service
// copies the other's credential.
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createYouTube } from "@emsenn/youtube-engineering-services-section/api";
import { offerToZelo } from "@red-cup-engineering/turntide-islands-discord-platform/placement-offer";
import { channelIds, loadChannel, loadEnvironment } from "../src/channel.mjs";

const offeredStatuses = new Set(["before-activation", "posted", "offered"]);

/** The education channels that syndicate to Turntide, or the subset named in TTI_YOUTUBE_CHANNELS. */
export function syndicatedChannels(env = process.env) {
  const named = (env.TTI_YOUTUBE_CHANNELS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  return (named.length > 0 ? named : channelIds()).map((id) => loadChannel(id)).filter((config) => Array.isArray(config.turntide?.subjects) && config.turntide.subjects.length > 0);
}

export function videoOffer(config, video) {
  return {
    type: "TTIPlacementOffer",
    version: 1,
    key: `youtube:${video.id}`,
    kind: "video",
    source: { id: config.id, name: config.name },
    item: {
      url: `https://youtu.be/${video.id}`,
      title: String(video.snippet?.title ?? "New video").replace(/[\r\n]+/gu, " ").slice(0, 300),
      ...(video.snippet?.description ? { summary: video.snippet.description.slice(0, 2000) } : {}),
      ...(video.snippet?.tags ? { tags: video.snippet.tags } : {}),
      ...(video.snippet?.publishedAt ? { published: video.snippet.publishedAt } : {}),
    },
    subjects: config.turntide.subjects,
  };
}

function statePath() {
  return process.env.TTI_YOUTUBE_SYNDICATION_STATE ?? join(process.env.XDG_STATE_HOME ?? join(homedir(), ".local", "state"), "turntide-islands", "youtube-chatter.json");
}
function save(path, value) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temp = `${path}.${process.pid}.tmp`;
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
  renameSync(temp, path);
}

export async function syndicate({ channels, live = false, env = process.env, now = new Date() }) {
  if (!channels.length) throw new Error("No education channel declares turntide.subjects");
  const path = statePath();
  const state = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : { version: 1, sources: {} };
  if (state.version !== 1 || !state.sources || typeof state.sources !== "object") throw new Error("Invalid TTI YouTube syndication state");
  const results = [];
  const pending = [];
  for (const config of channels) {
    let uploads;
    try {
      uploads = await createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env, fetchImpl: fetch, authorize: async () => {} }).listUploads();
    } catch (error) {
      results.push({ source: config.id, status: "unobservable", error: String(error instanceof Error ? error.message : error).slice(0, 300) });
      continue;
    }
    const publicVideos = uploads.filter((item) => item.status?.privacyStatus === "public" && item.status?.uploadStatus !== "failed" && item.status?.uploadStatus !== "rejected");
    let previous = state.sources[config.id];
    if (!previous) {
      const recentCutoff = now.getTime() - 24 * 60 * 60 * 1000;
      const older = publicVideos.filter((item) => Date.parse(item.snippet?.publishedAt) < recentCutoff);
      results.push({ source: config.id, status: "baseline", olderPublicVideos: older.length, recentPublicVideos: publicVideos.length - older.length });
      previous = { startedAt: now.toISOString(), seen: Object.fromEntries(older.map((item) => [item.id, { status: "before-activation" }])) };
      if (live) state.sources[config.id] = previous;
    }
    for (const video of publicVideos.reverse()) {
      if (offeredStatuses.has(previous.seen[video.id]?.status)) continue;
      pending.push({ config, video, seen: previous.seen });
    }
  }
  if (pending.length > 0) {
    const report = await offerToZelo(pending.map(({ config, video }) => videoOffer(config, video)), { live });
    const byKey = new Map(report.admitted.map((entry) => [entry.key, entry]));
    for (const { config, video, seen } of pending) {
      const admitted = byKey.get(`youtube:${video.id}`);
      if (live) seen[video.id] = { status: "offered", desk: admitted?.status, targets: admitted?.targets, recordedAt: now.toISOString() };
      results.push({ source: config.id, videoId: video.id, status: live ? "offered" : "would-offer", desk: admitted?.status, targets: admitted?.targets });
    }
    for (const placement of report.placements) results.push({ placement });
  }
  if (live) save(path, state);
  return results;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  loadEnvironment();
  const results = await syndicate({ channels: syndicatedChannels(), live: process.argv.includes("--live") });
  for (const result of results) process.stdout.write(`${JSON.stringify(result)}\n`);
}
