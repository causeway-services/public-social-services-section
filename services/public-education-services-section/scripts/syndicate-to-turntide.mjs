#!/usr/bin/env node
// Observe owned YouTube uploads and place newly public, topical videos in TTI.
// Run where the education OAuth credentials live. Discord posting occurs over
// SSH on the Discord host, so neither service copies the other's credential.
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join } from "node:path";
import { createYouTube } from "@emsenn/youtube-engineering-services-section/api";
import { loadChannel, loadEnvironment } from "../src/channel.mjs";

const DESTINATIONS = {
  academic: { id: "1424106171735998464", name: "academic-acantilado" },
  analysis: { id: "1419140845742981130", name: "analysis-atoll" },
  blockchain: { id: "1314589752644735016", name: "blockchain-bay" },
  cooking: { id: "1346541935984115774", name: "cooking-cove" },
  economy: { id: "1346507970070052944", name: "economy-estuary" },
  garden: { id: "1346508698809532416", name: "garden-grove" },
  praxis: { id: "1346508058603421778", name: "praxis-penisula" },
  silicon: { id: "1264035560624881674", name: "silicon-sandbar" },
};
const RULES = [
  ["blockchain", /\b(blockchain|ethereum|bitcoin|crypto|web3|smart contract)\b/iu],
  ["cooking", /\b(cooking|recipe|culinary|kitchen|baking)\b/iu],
  ["garden", /\b(garden|gardening|compost|horticulture|permaculture|soil health|urban farm)\b/iu],
  ["silicon", /\b(artificial intelligence|machine learning|data center|digital twin|software|computing|cybersecurity|internet|algorithm|ai infrastructure)\b/iu],
  ["economy", /\b(economy|economic|finance|financial|insurance|mortgage|supply chain|market|trade|labor|business|costs?)\b/iu],
  ["praxis", /\b(organizing|mutual aid|direct action|community practice|field work|restoration project)\b/iu],
  ["academic", /\b(academic|mathematics|medical science|chronic illness|university|research methods|me\/cfs|long covid|infection-associated)\b/iu],
  ["analysis", /\b(climate|weather|flood|environmental|energy|governance|surveillance|mapping|model|power)\b/iu],
];

export function destination(video, sourceId) {
  if (sourceId === "climate-place-by-place") return DESTINATIONS.analysis;
  const terms = `${video.snippet?.title ?? ""} ${(video.snippet?.tags ?? []).join(" ")}`;
  return RULES.map(([key, pattern]) => pattern.test(terms) ? DESTINATIONS[key] : null).find(Boolean) ?? null;
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
function postOnDiscord(input) {
  return new Promise((resolve, reject) => {
    const ssh = spawn("ssh", ["-o", "BatchMode=yes", "-o", "ConnectTimeout=10", "red-cedar-gate", "/home/emsenn/.nvm/versions/node/v24.16.0/bin/node", "/home/emsenn/services/turntide-islands-discord-platform/shared/post-owned-video.mjs"], { stdio: ["pipe", "pipe", "pipe"] });
    let output = "", error = "";
    ssh.stdout.on("data", (chunk) => { output += chunk; });
    ssh.stderr.on("data", (chunk) => { error += chunk; });
    ssh.on("error", reject);
    ssh.on("close", (code) => code === 0 ? resolve(JSON.parse(output)) : reject(new Error(`Discord placement failed: ${error.trim() || `SSH exit ${code}`}`)));
    ssh.stdin.end(JSON.stringify(input));
  });
}

export async function syndicate({ sourceIds, live = false, env = process.env, now = new Date() }) {
  if (!sourceIds.length) throw new Error("Set TTI_YOUTUBE_CHANNELS to the owned channel IDs to syndicate");
  const path = statePath();
  const state = existsSync(path) ? JSON.parse(readFileSync(path, "utf8")) : { version: 1, sources: {} };
  if (state.version !== 1 || !state.sources || typeof state.sources !== "object") throw new Error("Invalid TTI YouTube syndication state");
  const results = [];
  for (const sourceId of sourceIds) {
    const config = loadChannel(sourceId);
    const youtube = createYouTube({ channelId: config.youtubeChannelId, refreshTokenEnv: config.refreshTokenEnv, env, fetchImpl: fetch, authorize: async () => {} });
    const uploads = await youtube.listUploads();
    const publicVideos = uploads.filter((item) => item.status?.privacyStatus === "public" && item.status?.uploadStatus !== "failed" && item.status?.uploadStatus !== "rejected");
    let previous = state.sources[sourceId];
    if (!previous) {
      const recentCutoff = now.getTime() - 24 * 60 * 60 * 1000;
      const older = publicVideos.filter((item) => Date.parse(item.snippet?.publishedAt) < recentCutoff);
      results.push({ source: sourceId, status: "baseline", olderPublicVideos: older.length, recentPublicVideos: publicVideos.length - older.length, pendingPrivate: uploads.length - publicVideos.length });
      if (live) {
        previous = { startedAt: now.toISOString(), seen: Object.fromEntries(older.map((item) => [item.id, { status: "before-activation" }])) };
        state.sources[sourceId] = previous;
        save(path, state);
      } else continue;
    }
    for (const video of publicVideos.reverse()) {
      if (previous.seen[video.id] && previous.seen[video.id].status !== "needs-topic-route") continue;
      const target = destination(video, sourceId);
      if (!target) {
        if (!previous.seen[video.id]) {
          results.push({ source: sourceId, videoId: video.id, status: "needs-topic-route", title: video.snippet?.title });
          if (live) {
            previous.seen[video.id] = { status: "needs-topic-route" };
            save(path, state);
          }
        }
        continue;
      }
      const title = String(video.snippet?.title ?? "New video").replace(/[\r\n]+/gu, " ").slice(0, 160);
      const content = `**New video from ${config.name}: ${title}**\nhttps://youtu.be/${video.id}\n\nWhat stands out, and what needs a closer look?`;
      if (!live) { results.push({ source: sourceId, videoId: video.id, status: "would-post", destination: target.name, title }); continue; }
      const receipt = await postOnDiscord({ videoId: video.id, channelId: target.id, content });
      previous.seen[video.id] = { status: "posted", channelId: receipt.channelId, messageId: receipt.messageId, recordedAt: now.toISOString() };
      save(path, state);
      results.push({ source: sourceId, videoId: video.id, status: receipt.posted ? "posted" : "already-posted", destination: target.name, messageId: receipt.messageId });
    }
  }
  return results;
}

if (process.argv[1] && new URL(import.meta.url).pathname === process.argv[1]) {
  loadEnvironment();
  const sourceIds = (process.env.TTI_YOUTUBE_CHANNELS ?? "").split(",").map((item) => item.trim()).filter(Boolean);
  const results = await syndicate({ sourceIds, live: process.argv.includes("--live") });
  for (const result of results) process.stdout.write(`${JSON.stringify(result)}\n`);
}
