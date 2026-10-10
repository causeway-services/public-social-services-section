import assert from "node:assert/strict";
import test from "node:test";
import { analyticsAuthorizedFetch, defaultClosedWindow, normalizeAnalytics } from "../src/analytics.mjs";

const query = { startDate: "2026-06-24", endDate: "2026-07-21" };
const report = { columnHeaders: ["video", "views", "estimatedMinutesWatched", "averageViewDuration"].map((name) => ({ name, columnType: name === "video" ? "DIMENSION" : "METRIC", dataType: name === "video" ? "STRING" : "INTEGER" })), rows: [["76Zr9JnLM50", 1, 3, 180]] };
test("normalizes only channel-owned bounded analytics", () => { const result = normalizeAnalytics(report, query, "2026-07-22T11:00:00.000Z"); assert.equal(result.observations.length, 1); assert.equal(result.observations[0].channel, "urn:ame:artificial-intelligence-youtube-channel-enterprise"); assert.equal("carrier" in result.observations[0], false); assert.equal(result.observations[0].rawDataHeldByChannel, true); });
test("capability refuses foreign carriers and caller credentials", () => { const call = analyticsAuthorizedFetch("token", async () => new Response("{}")), url = "https://youtubeanalytics.googleapis.com/v2/reports?ids=channel%3D%3DMINE&startDate=2026-06-24&endDate=2026-07-21&metrics=views%2CestimatedMinutesWatched%2CaverageViewDuration&dimensions=video&sort=-estimatedMinutesWatched&maxResults=200"; assert.throws(() => call("https://example.com/v2/reports"), /refuses/u); assert.throws(() => call(url, { headers: { authorization: "foreign" } }), /may not/u); });
test("daily window closes before today", () => { assert.deepEqual(defaultClosedWindow(new Date("2026-07-22T12:00:00Z")), query); });
