import assert from "node:assert/strict";
import test from "node:test";

import { probePublicActivityPub, PUBLIC_ACTIVITYPUB } from "../src/public-smoke.mjs";

const jsonResponse = (value, contentType, status = 200) => new Response(JSON.stringify(value), {
  status, headers: { "content-type": contentType },
});

function validFetch() {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, options });
    if (url === PUBLIC_ACTIVITYPUB.actor) return jsonResponse({ id: PUBLIC_ACTIVITYPUB.actor, type: "Service", inbox: PUBLIC_ACTIVITYPUB.inbox }, "application/activity+json");
    if (url === PUBLIC_ACTIVITYPUB.webfinger) return jsonResponse({ subject: PUBLIC_ACTIVITYPUB.account, aliases: [PUBLIC_ACTIVITYPUB.actor], links: [{ rel: "self", href: PUBLIC_ACTIVITYPUB.actor, type: "application/activity+json" }] }, "application/jrd+json");
    throw new Error(`unexpected URL ${url}`);
  };
  return { calls, fetchImpl };
}

test("public smoke verifies actor, inbox, and WebFinger without mutation", async () => {
  const { calls, fetchImpl } = validFetch();
  const result = await probePublicActivityPub({ fetchImpl });
  assert.equal(result.actor, PUBLIC_ACTIVITYPUB.actor);
  assert.equal(result.inbox, PUBLIC_ACTIVITYPUB.inbox);
  assert.equal(result.mutationPerformed, false);
  assert.equal(calls.length, 2);
  assert.ok(calls.every(({ options }) => options.method === undefined && options.redirect === "error"));
});

test("public smoke refuses route drift and malformed discovery", async () => {
  await assert.rejects(probePublicActivityPub({ fetchImpl: async () => jsonResponse({ id: "https://wrong.example/actor", type: "Service", inbox: PUBLIC_ACTIVITYPUB.inbox }, "application/activity+json") }), /fixed Koios identity/u);
  const { fetchImpl } = validFetch();
  let count = 0;
  await assert.rejects(probePublicActivityPub({ fetchImpl: async (...args) => ++count === 1 ? fetchImpl(...args) : jsonResponse({ subject: PUBLIC_ACTIVITYPUB.account, aliases: [], links: [] }, "application/jrd+json") }), /does not bind/u);
});
