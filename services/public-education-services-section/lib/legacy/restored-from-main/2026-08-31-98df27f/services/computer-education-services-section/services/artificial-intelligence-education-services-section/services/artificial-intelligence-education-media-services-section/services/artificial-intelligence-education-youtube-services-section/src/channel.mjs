import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { admitJsonSemanticContent, EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const A2A_JSON_OBJECT_KIND = "rsc-quiescent.a2a-json";
const CHANNEL_RECORD_OBJECT_KIND = "emsweb.artificial-intelligence-youtube-channel.record";
const CHANNEL_PORTFOLIO_RECORD_OBJECT_KIND = "emsweb.channel-portfolio-status.record";
const identifySemanticJson = (objectKind, value) => identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT });
const semanticBytes = (value) => identifySemanticJson(A2A_JSON_OBJECT_KIND, value).bytes;
const decodeSemantic = (bytes) => admitJsonSemanticContent({ bytes, objectKind: A2A_JSON_OBJECT_KIND }).value;
export const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ACTOR = "urn:ame:artificial-intelligence-youtube-channel-enterprise";
export function canonical(value) { if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`; if (value && typeof value === "object") return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`; return JSON.stringify(value); }
export function digest(value) { return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
export function contentId(value) { return identifySemanticJson(CHANNEL_RECORD_OBJECT_KIND, value).token; }
export function channelIdentity(path = join(NODE_ROOT, "content/config/channel.json")) {
  const value = JSON.parse(readFileSync(path, "utf8"));
  if (value?.type !== "YouTubeChannelIdentity" || value.actor !== ACTOR || !/^UC[A-Za-z0-9_-]{22}$/u.test(value.youtubeChannelId ?? "") || value.youtubeHandle !== "@MachineLearningHistoryFrontier") throw new TypeError("AI/ML YouTube identity is not exactly bound");
  return value;
}
