#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mts";
import {
  NEWSROOM_LEARNING_CONTRACT,
  settleNewsroomLearningPulse,
} from "./management/newsroom-learning.mts";
import type { JsonObject } from "./management/ledger.mts";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const PUBLICATION = "https://koios.news/activitypub/actor";
const CLOCKKEEPER = "urn:colony:cold-red-gate:clockkeeper";
export const LEARNING_PULSE_CAPABILITY = "urn:capability:koios-news:clockkeeper:cold-red-gate:newsroom-learning-pulse:v1";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

function object(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function response(activity: Readonly<JsonObject>, type: "Accept" | "Reject", payload: Readonly<JsonObject>): Readonly<JsonObject> {
  return Object.freeze({
    "@context": CONTEXT,
    type,
    actor: PUBLICATION,
    target: activity["actor"] ?? "urn:actor:unidentified",
    ...(typeof activity["id"] === "string" ? { inReplyTo: activity["id"] } : {}),
    object: Object.freeze({ type: "NewsroomLearningSettlement", contract: NEWSROOM_LEARNING_CONTRACT, ...payload }),
  });
}

function refusal(activity: Readonly<JsonObject>, code: string, reason: string): Readonly<JsonObject> {
  return response(activity, "Reject", { code, reason, customerMutation: false });
}

let activity: JsonObject;
try {
  const input = readFileSync(0, "utf8").trim();
  if (input === "") throw new Error("learning operation requires one externally authored ActivityStreams object");
  const parsed: unknown = JSON.parse(input);
  if (!object(parsed)) throw new Error("learning operation input must be one JSON object");
  activity = parsed;
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
  activity = {};
}

if (process.exitCode !== 1) {
  const demand = object(activity["object"]) ? activity["object"] : undefined;
  let settlement: Readonly<JsonObject>;
  if (activity["@context"] !== CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION) {
    settlement = refusal(activity, "wrong-boundary", "learning pulse must be an ActivityStreams Create<NewsroomLearningDemand> addressed to Koios.News");
  } else if (activity["actor"] !== CLOCKKEEPER || activity["capability"] !== LEARNING_PULSE_CAPABILITY) {
    settlement = refusal(activity, "unauthorized-trigger", "learning pulse requires the admitted Cold Red Gate ScheduleDelivery actor and learning capability");
  } else if (demand?.["type"] !== "NewsroomLearningDemand"
    || demand["contract"] !== NEWSROOM_LEARNING_CONTRACT
    || typeof demand["pulseId"] !== "string"
    || demand["pulseId"].trim() === "") {
    settlement = refusal(activity, "invalid-demand", "learning pulse requires its exact contract and a provider-authored pulse id");
  } else {
    const now = argument("--now") ?? (typeof activity["published"] === "string" ? activity["published"] : new Date().toISOString());
    const pulse = await settleNewsroomLearningPulse({
      dataDir: resolve(argument("--data-dir") ?? DEFAULT_DATA_DIR),
      pulseId: demand["pulseId"],
      now,
    });
    const moves = Object.fromEntries([...new Set(pulse.readings.map((reading) => reading.proposedMove))]
      .sort()
      .map((move) => [move, pulse.readings.filter((reading) => reading.proposedMove === move).length]));
    settlement = response(activity, "Accept", {
      pulseId: pulse.pulseId,
      evidenceDigest: pulse.evidenceDigest,
      disposition: pulse.disposition,
      readingCount: pulse.readings.length,
      proposedMoves: moves,
      authority: pulse.authority,
      evidenceSettlement: pulse.settlement,
      customerMutation: pulse.settlement === "recorded",
      mutation: pulse.settlement === "recorded" ? "appended one new evidence-bound proposal" : "none; the evidence digest was already settled",
    });
  }
  process.stdout.write(`${JSON.stringify(settlement)}\n`);
}
