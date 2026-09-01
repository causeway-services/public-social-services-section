import { readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { createSettlementStore } from "@lenticule-science/rwil-rdf-projection-service/client";

import { DEFAULT_DATA_DIR } from "../config.mjs";
import { inspectAdmittedIssuePulse } from "./issue-controller.mjs";
import { recordDigest, type JsonObject } from "./ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const ACTOR = "https://koios.news/activitypub/actor";
const PROVIDER = "@red-cup-engineering/activitypub-services-section";
const SITE_ROOT = resolve(import.meta.dirname, "../..");
const OBSERVATIONS = "koios.news/activitypub-inbox-observations/v1";
const ARRIVALS = "koios.news/activitypub-inbox-items/v1";
const SETTLEMENTS = "koios.news/activitypub-arrival-settlements/v1";
const WORK_ORDER_MEDIA_TYPE = "application/vnd.emsenn.rmn+json";

type RecordValue = Record<string, unknown>;

function object(value: unknown): value is RecordValue {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/** Project one standards-conforming ActivityStreams Document into the exact
 * private work order that Koios law already knows how to inspect.  The public
 * protocol transports opaque customer content; it does not own or reinterpret
 * Koios's capability vocabulary. */
export function projectScheduledWorkOrderCarrier(carrier: Readonly<RecordValue>): Readonly<RecordValue> | undefined {
  const document = carrier["object"];
  if (!object(document) || document["type"] !== "Document" || document["mediaType"] !== WORK_ORDER_MEDIA_TYPE || typeof document["content"] !== "string") return undefined;
  let workOrder: unknown;
  try { workOrder = JSON.parse(document["content"]); }
  catch { return undefined; }
  if (!object(workOrder) || workOrder["type"] !== "ScheduledActivityWorkOrder" || typeof workOrder["capability"] !== "string" || !object(workOrder["demand"])) return undefined;
  return Object.freeze({
    "@context": CONTEXT,
    ...(typeof carrier["id"] === "string" ? { id: carrier["id"] } : {}),
    type: carrier["type"],
    actor: carrier["actor"],
    target: carrier["target"],
    capability: workOrder["capability"],
    ...(typeof carrier["published"] === "string" ? { published: carrier["published"] } : {}),
    object: Object.freeze({ ...workOrder["demand"] }),
  });
}

function store(dataDir: string) {
  const agentUrl = process.env.RWIL_RDF_AGENT;
  if (!agentUrl) throw new Error("RWIL_RDF_AGENT must name Koios's hired RWIL/RDF provider");
  return createSettlementStore({ settlementRoot: SITE_ROOT, agentUrl });
}

function response(type: "Accept" | "Reject" | "Question", target: unknown, objectValue: JsonObject): Readonly<JsonObject> {
  return Object.freeze({ "@context": CONTEXT, type, actor: ACTOR, target: typeof target === "string" ? target : PROVIDER, object: Object.freeze(objectValue) });
}

export async function retainActivityPubInboxItem(carrier: unknown, options: Readonly<{ dataDir?: string; now?: string; providerInbox: string }> ): Promise<Readonly<JsonObject>> {
  const now = options.now ?? new Date().toISOString();
  if (!object(carrier) || typeof carrier["id"] !== "string") {
    return response("Reject", PROVIDER, { type: "ActivityPubArrivalRefusal", code: "invalid-activity", reason: "inbox item must be one identified ActivityStreams activity" });
  }
  let providerInbox: URL;
  try { providerInbox = new URL(options.providerInbox); }
  catch { return response("Reject", PROVIDER, { type: "ActivityPubArrivalRefusal", code: "invalid-provider-inbox", reason: "provider inbox must be an absolute URL" }); }
  if (providerInbox.protocol !== "https:" && providerInbox.hostname !== "127.0.0.1" && providerInbox.hostname !== "localhost") {
    return response("Reject", PROVIDER, { type: "ActivityPubArrivalRefusal", code: "insecure-provider-inbox", reason: "provider inbox must use HTTPS outside loopback development" });
  }
  const activity = projectScheduledWorkOrderCarrier(carrier) ?? carrier;
  const pulse = inspectAdmittedIssuePulse(activity);
  const dataDir = resolve(options.dataDir ?? DEFAULT_DATA_DIR);
  const ledger = store(dataDir);
  const activityDigest = recordDigest(carrier);
  const prior = ledger.records(OBSERVATIONS).find((entry) => object(entry) && entry["activityDigest"] === activityDigest) as RecordValue | undefined;
  if (prior === undefined) {
    await ledger.record({
      category: OBSERVATIONS,
      recordedAt: now,
      record: Object.freeze({
        type: "ActivityPubInboxObservation",
        activityDigest,
        receivedAt: now,
        protocolProvider: PROVIDER,
        providerInbox: providerInbox.href,
        disposition: pulse === undefined ? "refused" : "retained",
        carrier,
      }),
    });
    if (pulse !== undefined) {
      await ledger.record({
        category: ARRIVALS,
        recordedAt: now,
        record: Object.freeze({
          type: "ActivityPubInboxItem",
          activityDigest,
          receivedAt: now,
          protocolProvider: PROVIDER,
          providerInbox: providerInbox.href,
          trigger: pulse,
          carrier,
          activity,
        }),
      });
    }
  }
  if (pulse === undefined) return response("Reject", PROVIDER, { type: "ActivityPubArrivalRefusal", code: "unadmitted-activity", reason: "protocol delivery is not sufficient; Koios issue-pulse law refused the activity", activityDigest, replayed: prior !== undefined });
  return response("Accept", PROVIDER, {
    type: "ActivityPubArrivalRetention",
    activityDigest,
    retained: prior === undefined,
    replayed: prior !== undefined,
    newsroomInvoked: false,
  });
}

function clientToken(path: string): string {
  const metadata = statSync(path);
  if (!metadata.isFile() || (metadata.mode & 0o077) !== 0) throw new Error("ActivityPub inbox client token must be one private regular file");
  const token = readFileSync(path, "utf8").trim();
  if (token.length < 32) throw new Error("ActivityPub inbox client token must contain at least 32 characters");
  return token;
}

function pageUrl(value: unknown, inbox: URL): URL {
  if (typeof value !== "string") throw new Error("ActivityPub inbox collection must provide a page URL");
  const url = new URL(value);
  if (url.origin !== inbox.origin || url.pathname !== inbox.pathname) throw new Error("ActivityPub inbox pagination escaped the contracted inbox pin");
  return url;
}

export async function pullActivityPubInbox(options: Readonly<{
  dataDir?: string;
  now?: string;
  inboxUrl?: string;
  transportUrl?: string;
  bearerToken?: string;
  bearerTokenPath?: string;
  fetch?: typeof globalThis.fetch;
  maxPages?: number;
}> = {}): Promise<Readonly<JsonObject>> {
  const inbox = new URL(options.inboxUrl ?? process.env.ACTIVITYPUB_INBOX_URL ?? "");
  if (inbox.protocol !== "https:" && inbox.hostname !== "127.0.0.1" && inbox.hostname !== "localhost") throw new Error("ActivityPub inbox must use HTTPS outside loopback development");
  const transport = new URL(options.transportUrl ?? process.env.ACTIVITYPUB_INBOX_TRANSPORT_URL ?? inbox.href);
  if (transport.protocol !== "https:" && transport.hostname !== "127.0.0.1" && transport.hostname !== "localhost") throw new Error("ActivityPub inbox transport must use HTTPS outside loopback development");
  if (transport.pathname !== inbox.pathname) throw new Error("ActivityPub inbox transport must preserve the contracted inbox path");
  const token = options.bearerToken ?? clientToken(resolve(options.bearerTokenPath ?? process.env.ACTIVITYPUB_INBOX_BEARER_TOKEN_FILE ?? ""));
  if (token.length < 32) throw new Error("ActivityPub inbox client token must contain at least 32 characters");
  const request = options.fetch ?? globalThis.fetch;
  const headers = Object.freeze({ accept: "application/activity+json", authorization: `Bearer ${token}` });
  const get = async (url: URL): Promise<RecordValue> => {
    const routed = new URL(transport);
    routed.search = url.search;
    const fetched = await request(routed, { headers, signal: AbortSignal.timeout(30_000) });
    if (!fetched.ok) throw new Error(`ActivityPub inbox returned HTTP ${fetched.status}`);
    const value: unknown = await fetched.json();
    if (!object(value)) throw new Error("ActivityPub inbox returned no ActivityStreams object");
    return value;
  };
  const root = await get(inbox);
  if (root["type"] !== "OrderedCollection" || root["id"] !== inbox.href || !Number.isSafeInteger(root["totalItems"])) throw new Error("ActivityPub inbox root is not the contracted OrderedCollection");
  let next = pageUrl(root["first"], inbox);
  const maxPages = options.maxPages ?? 1000;
  if (!Number.isSafeInteger(maxPages) || maxPages < 1 || maxPages > 1000) throw new Error("ActivityPub inbox maxPages must be 1..1000");
  const dataDir = resolve(options.dataDir ?? DEFAULT_DATA_DIR);
  const alreadyObserved = new Set(store(dataDir).records(OBSERVATIONS).flatMap((entry) => object(entry) && typeof entry["activityDigest"] === "string" ? [entry["activityDigest"]] : []));
  let pulled = 0;
  let retained = 0;
  let refused = 0;
  let stoppedAtKnownItem = false;
  const unseen: RecordValue[] = [];
  for (let pageNumber = 0; pageNumber < maxPages; pageNumber += 1) {
    const page = await get(next);
    if (page["type"] !== "OrderedCollectionPage" || page["partOf"] !== inbox.href || !Array.isArray(page["orderedItems"])) throw new Error("ActivityPub inbox page is not part of the contracted OrderedCollection");
    for (const item of page["orderedItems"] as unknown[]) {
      if (!object(item)) throw new Error("ActivityPub inbox contains a non-object item");
      const digest = recordDigest(item);
      if (alreadyObserved.has(digest)) { stoppedAtKnownItem = true; break; }
      unseen.push(item);
    }
    if (stoppedAtKnownItem || page["next"] === undefined) break;
    next = pageUrl(page["next"], inbox);
    if (pageNumber + 1 === maxPages) throw new Error("ActivityPub inbox exceeded the bounded pagination budget");
  }
  // The provider orders newest first. Commit the discovered suffix in the
  // opposite direction so a crash can only leave a newer prefix unseen. A
  // later scan then reaches that prefix before the first durable known item;
  // no older item can be stranded behind the replay stop.
  const pullInstant = options.now ?? new Date().toISOString();
  for (const [index, item] of unseen.reverse().entries()) {
    pulled += 1;
    const observedAt = new Date(Date.parse(pullInstant) + index).toISOString();
    const result = await retainActivityPubInboxItem(item, { dataDir, now: observedAt, providerInbox: inbox.href });
    alreadyObserved.add(recordDigest(item));
    if (result["type"] === "Accept") retained += 1;
    else refused += 1;
  }
  return response("Accept", PROVIDER, { type: "ActivityPubInboxPull", providerInbox: inbox.href, pulled, retained, refused, stoppedAtKnownItem });
}

export async function settleNextRetainedActivity(options: Readonly<{
  dataDir?: string;
  now?: string;
  runner?: (activity: Readonly<RecordValue>) => Readonly<RecordValue>;
}> = {}): Promise<Readonly<JsonObject>> {
  const now = options.now ?? new Date().toISOString();
  const dataDir = resolve(options.dataDir ?? DEFAULT_DATA_DIR);
  const ledger = store(dataDir);
  const settled = new Set(ledger.records(SETTLEMENTS).flatMap((entry) => object(entry) && typeof entry["activityDigest"] === "string" ? [entry["activityDigest"]] : []));
  const pending = ledger.records(ARRIVALS)
    .filter(object)
    .filter((entry) => typeof entry["activityDigest"] === "string" && !settled.has(entry["activityDigest"]))
    .sort((left, right) => String(left["receivedAt"]).localeCompare(String(right["receivedAt"])))[0];
  if (pending === undefined || !object(pending["activity"])) {
    return response("Accept", PROVIDER, { type: "ActivityPubInboxSettlement", disposition: "empty", settled: 0 });
  }
  const activity = pending["activity"];
  let terminal: RecordValue;
  if (options.runner !== undefined) terminal = options.runner(activity);
  else {
    const entry = resolve(SITE_ROOT, "dist/operate-issue.mjs");
    const result = spawnSync(process.execPath, [entry, "--data-dir", dataDir, "--now", now], {
      cwd: SITE_ROOT,
      input: `${JSON.stringify(activity)}\n`,
      encoding: "utf8",
      timeout: 1_800_000,
      maxBuffer: 64 * 1024 * 1024,
      env: process.env,
    });
    try { terminal = JSON.parse(result.stdout) as RecordValue; }
    catch { throw new Error(`Koios issue operation returned no typed settlement (status=${result.status}): ${result.stderr || result.stdout}`); }
  }
  if (!object(terminal) || !["Accept", "Reject", "Question"].includes(String(terminal["type"]))) throw new Error("Koios issue operation returned an untyped settlement");
  const activityDigest = String(pending["activityDigest"]);
  await ledger.record({ category: SETTLEMENTS, recordedAt: now, record: Object.freeze({ type: "ActivityPubArrivalSettlement", activityDigest, settledAt: now, terminalDigest: recordDigest(terminal), terminal }) });
  return response("Accept", PROVIDER, { type: "ActivityPubInboxSettlement", disposition: "settled", settled: 1, activityDigest, terminal });
}
