import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { ACTOR, channelIdentity } from "../src/channel.mjs";
import { REFRESH_TOKEN_ENV } from "../src/oauth-setup.mjs";
test("modern-business channel, notebook, and credential custody are exactly bound", () => { const identity = channelIdentity(), lane = JSON.parse(readFileSync(new URL("../content/deployment/cloud-run/channel-lane-contract.json", import.meta.url), "utf8")); assert.equal(identity.actor, ACTOR); assert.equal(identity.youtubeChannelId, "UC79JnGCE1tfUZm2qQwSrleQ"); assert.equal(identity.youtubeHandle, "@ModernBusinessPractices"); assert.equal(identity.persistentNotebook.notebookId, "763fbe07-e786-4e23-9b33-b53f05230573"); assert.equal(REFRESH_TOKEN_ENV, "MODERN_BUSINESS_YOUTUBE_OAUTH_REFRESH_TOKEN"); assert.equal(lane.channel, "modern-business"); assert.equal(lane.cadence.schedule, "30 14 * * 2,4,6"); assert.equal(lane.cadence.timeZone, "America/Chicago"); assert.ok(lane.secretEnvironmentNames.includes(REFRESH_TOKEN_ENV)); });
