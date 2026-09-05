import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { startWitnessJournalProviderProcess } from "@red-cup-engineering/witness-journal-document-service/test-provider";
import { querySettlementRecords } from "@red-cup-engineering/witness-journal-document-service";
import { projectScheduledWorkOrderCarrier, pullActivityPubInbox, retainActivityPubInboxItem, settleNextRetainedActivity } from "../dist/management/activitypub-inbox.mjs";
import { recordDigest } from "../dist/management/ledger.mjs";

let witnessJournal;
let savedAgent;
test.before(async () => { savedAgent = process.env.WITNESS_JOURNAL_RDF_AGENT; witnessJournal = await startWitnessJournalProviderProcess(); process.env.WITNESS_JOURNAL_RDF_AGENT = witnessJournal.agentCardUrl; });
test.after(async () => { if (savedAgent === undefined) delete process.env.WITNESS_JOURNAL_RDF_AGENT; else process.env.WITNESS_JOURNAL_RDF_AGENT = savedAgent; await witnessJournal.close(); });

function pulse(suffix = "") {
  const policy = JSON.parse(readFileSync(new URL("../lib/law/publication-issue-policy.json", import.meta.url), "utf8"));
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `urn:test:clockkeeper:activitypub-pulse${suffix}`,
    type: "Create",
    actor: "https://bare-cedar-fog.561.group/actors/cold-red-gate-clockkeeper",
    target: "https://koios.news/activitypub/actor",
    capability: "urn:capability:koios-news:clockkeeper:cold-red-gate:publication-issue-pulse:v1",
    published: "2026-07-20T22:40:00.000Z",
    object: { type: "NewsroomIssueDemand", pulseId: `urn:test:clockkeeper:activitypub-pulse${suffix}#0`, policy, policyDigest: recordDigest(policy) },
  };
}

function carrier(suffix = "") {
  const activity = pulse(suffix);
  return {
    "@context": activity["@context"],
    id: activity.id,
    type: activity.type,
    actor: activity.actor,
    target: activity.target,
    published: activity.published,
    object: {
      type: "Document",
      mediaType: "application/vnd.emsenn.rmn+json",
      content: JSON.stringify({ type: "ScheduledActivityWorkOrder", capability: activity.capability, demand: activity.object }),
    },
  };
}

test("a public ActivityStreams Document projects the exact private Koios work order", () => {
  assert.deepEqual(projectScheduledWorkOrderCarrier(carrier()), pulse());
});

function inboxFetch(items) {
  return async (request, init) => {
    const url = new URL(request);
    assert.equal(init.headers.authorization, "Bearer koios-test-client-token-with-at-least-32-characters");
    if (url.searchParams.get("page") === "true") return new Response(JSON.stringify({
      "@context": "https://www.w3.org/ns/activitystreams",
      id: `https://bare-cedar-fog.561.group/actors/koios-news/inbox${url.search}`,
      type: "OrderedCollectionPage",
      partOf: "https://bare-cedar-fog.561.group/actors/koios-news/inbox",
      orderedItems: items,
    }), { headers: { "content-type": "application/activity+json" } });
    return new Response(JSON.stringify({
      "@context": "https://www.w3.org/ns/activitystreams",
      id: "https://bare-cedar-fog.561.group/actors/koios-news/inbox",
      type: "OrderedCollection",
      totalItems: items.length,
      first: "https://bare-cedar-fog.561.group/actors/koios-news/inbox?page=true",
    }), { headers: { "content-type": "application/activity+json" } });
  };
}

test("Koios pulls the standard provider inbox and retains one admitted pulse without invoking the newsroom", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-activitypub-inbox-"));
  const options = {
    dataDir,
    inboxUrl: "https://bare-cedar-fog.561.group/actors/koios-news/inbox",
    transportUrl: "http://127.0.0.1:8794/actors/koios-news/inbox",
    bearerToken: "koios-test-client-token-with-at-least-32-characters",
    fetch: inboxFetch([carrier()]),
  };
  const first = await pullActivityPubInbox({ ...options, now: "2026-07-20T22:40:01.000Z" });
  const replay = await pullActivityPubInbox({ ...options, now: "2026-07-20T22:40:02.000Z" });
  assert.equal(first.type, "Accept");
  assert.equal(first.object.retained, 1);
  assert.equal(replay.object.stoppedAtKnownItem, true);
  assert.equal((await querySettlementRecords("koios.news/activitypub-inbox-observations/v1")).length, 1);
  assert.equal((await querySettlementRecords("koios.news/activitypub-inbox-items/v1")).length, 1);

  const settled = await settleNextRetainedActivity({ dataDir, now: "2026-07-20T22:41:00.000Z", runner: () => ({ type: "Question", object: { code: "test-newsroom-terminal" } }) });
  assert.equal(settled.object.disposition, "settled");
  assert.equal((await querySettlementRecords("koios.news/activitypub-arrival-settlements/v1")).length, 1);
  assert.equal((await settleNextRetainedActivity({ dataDir, now: "2026-07-20T22:42:00.000Z", runner: () => { throw new Error("must not replay"); } })).object.disposition, "empty");
});

test("network verification cannot override Koios issue-pulse law", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-activitypub-refusal-"));
  const activity = { ...pulse(), actor: "https://intruder.invalid/actor" };
  const result = await retainActivityPubInboxItem(activity, { dataDir, providerInbox: "https://bare-cedar-fog.561.group/actors/koios-news/inbox" });
  assert.equal(result.type, "Reject");
  assert.equal((await querySettlementRecords("koios.news/activitypub-inbox-observations/v1")).length, 1);
  assert.equal((await querySettlementRecords("koios.news/activitypub-inbox-items/v1")).length, 0);
});

test("a discovered newest-first suffix commits oldest-first so a crash cannot strand older work", async () => {
  const dataDir = mkdtempSync(join(tmpdir(), "koios-activitypub-order-"));
  await pullActivityPubInbox({
    dataDir,
    inboxUrl: "https://bare-cedar-fog.561.group/actors/koios-news/inbox",
    transportUrl: "http://127.0.0.1:8794/actors/koios-news/inbox",
    bearerToken: "koios-test-client-token-with-at-least-32-characters",
    fetch: inboxFetch([carrier(":newer"), carrier(":older")]),
  });
  const observations = await querySettlementRecords("koios.news/activitypub-inbox-observations/v1");
  assert.deepEqual(observations.map((entry) => entry.carrier.id), [
    "urn:test:clockkeeper:activitypub-pulse:older",
    "urn:test:clockkeeper:activitypub-pulse:newer",
  ]);
});
