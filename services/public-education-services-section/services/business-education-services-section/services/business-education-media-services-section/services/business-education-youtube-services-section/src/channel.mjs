import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
export const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ACTOR = "urn:ame:modern-business-youtube-channel-enterprise";
export function canonical(value) { if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`; if (value && typeof value === "object") return `{${Object.keys(value).sort().filter((key) => value[key] !== undefined).map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`; return JSON.stringify(value); }
export function digest(value) { return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
function semanticJson(value) { if (value instanceof Uint8Array) return { "$bytes": Buffer.from(value).toString("base64url") }; if (Array.isArray(value)) return value.map(semanticJson); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, semanticJson(child)])); return value; }
export function contentId(value) { return identifyJsonSemanticContent({ objectKind: "emsweb.modern-business-youtube-channel.record", value: semanticJson(value), witnessRoot: EMPTY_WITNESS_ROOT }).token; }
export function channelIdentity(path = join(NODE_ROOT, "content/config/channel.json")) {
  const value = JSON.parse(readFileSync(path, "utf8"));
  if (value?.type !== "YouTubeChannelIdentity" || value.actor !== ACTOR || !/^UC[A-Za-z0-9_-]{22}$/u.test(value.youtubeChannelId ?? "") || value.youtubeHandle !== "@ModernBusinessPractices") throw new TypeError("modern-business YouTube identity is not exactly bound");
  return value;
}
