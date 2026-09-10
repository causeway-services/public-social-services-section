import assert from "node:assert/strict";
import { lstat, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:net";
import path from "node:path";
import test from "node:test";
import { generateActorKeyMaterial } from "@red-cup-engineering/activitypub-provider-service/keys";
import { MemoryKvStore } from "@red-cup-engineering/activitypub-provider-service/runtime-adapters";
import { createRetainedInbox } from "../src/retained-inbox.mjs";
import { preflightKoiosActivityPubProvider, serveKoiosActivityPubProvider } from "../src/server.mjs";

async function freePort() {
  const socket = createServer();
  await new Promise((resolve) => socket.listen(0, "127.0.0.1", resolve));
  const selected = socket.address().port;
  await new Promise((resolve) => socket.close(resolve));
  return selected;
}

test("the Koios actor exposes, retains, pages, and refuses through its local receiver", async (t) => {
  const directory = await mkdtemp("/var/tmp/koios-activitypub-");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const keyPath = path.join(directory, "keys.json");
  await writeFile(keyPath, JSON.stringify(await generateActorKeyMaterial()), { mode: 0o600 });
  const token = "koios-local-test-token-with-at-least-32-characters";
  const inbox = createRetainedInbox(path.join(directory, "retained.jsonl"));
  const port = await freePort();
  const service = await serveKoiosActivityPubProvider({ hostname: "127.0.0.1", port, keyPath, bearerToken: token, inbox, kv: new MemoryKvStore(), testOnlyInProcess: true });
  t.after(() => service.close());
  if (!service.server.listening) await new Promise((resolve) => service.server.once("listening", resolve));
  const local = "https://bare-cedar-fog.561.group";
  const request = (pathname, init) => service.provider.fetch(new Request(`${local}${pathname}`, init));

  const actor = await request("/actors/koios-news", { headers: { accept: "application/activity+json" } });
  assert.equal(actor.status, 200);
  assert.equal((await actor.json()).id, "https://bare-cedar-fog.561.group/actors/koios-news");

  const activity = { "@context": "https://www.w3.org/ns/activitystreams", id: "https://sender.example/activities/1", type: "Create", actor: "https://sender.example/actor", object: { type: "Note", content: "retained" }, to: "https://bare-cedar-fog.561.group/actors/koios-news" };
  const refusedPost = await request("/actors/koios-news/inbox", { method: "POST", headers: { "content-type": "application/activity+json" }, body: JSON.stringify(activity) });
  assert.equal(refusedPost.status, 401);

  await inbox.retain({ jsonLd: activity });
  assert.deepEqual(await inbox.retain({ jsonLd: { ...activity, object: { ...activity.object, content: "replayed" } } }), { retained: false, activityId: activity.id });
  const refusedPull = await request("/actors/koios-news/inbox", { headers: { accept: "application/activity+json" } });
  assert.equal(refusedPull.status, 401);
  const root = await request("/actors/koios-news/inbox", { headers: { accept: "application/activity+json", authorization: `Bearer ${token}` } });
  assert.equal(root.status, 200);
  const first = new URL((await root.json()).first);
  const page = await request(`${first.pathname}${first.search}`, { headers: { accept: "application/activity+json", authorization: `Bearer ${token}` } });
  assert.deepEqual((await page.json()).orderedItems, [activity]);
});

test("retained custody refuses anonymous activities and retains one activity ID across replay", async (t) => {
  const directory = await mkdtemp("/var/tmp/koios-activitypub-");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const inboxPath = path.join(directory, "retained.jsonl");
  const activity = { id: "https://sender.example/activities/replay", type: "Create", object: { type: "Note", content: "once" } };
  const inbox = createRetainedInbox(inboxPath);
  await assert.rejects(inbox.retain({ jsonLd: { type: "Create" } }), /stable id/);
  assert.deepEqual(await inbox.retain({ jsonLd: activity }), { retained: true, activityId: activity.id });
  const reopened = createRetainedInbox(inboxPath);
  assert.deepEqual(await reopened.retain({ jsonLd: activity }), { retained: false, activityId: activity.id });
  assert.deepEqual((await reopened.list({ limit: 100 })).items, [activity]);
});

test("preflight refuses mutable actor identity, implicit custody, and live inline secrets", async (t) => {
  const directory = await mkdtemp("/var/tmp/koios-activitypub-");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const keyPath = path.join(directory, "keys.json");
  const tokenPath = path.join(directory, "token");
  await writeFile(keyPath, JSON.stringify(await generateActorKeyMaterial()), { mode: 0o600 });
  await writeFile(tokenPath, "koios-local-test-token-with-at-least-32-characters\n", { mode: 0o600 });
  const base = { keyPath, bearerTokenPath: tokenPath, inbox: createRetainedInbox(path.join(directory, "retained.jsonl")), kv: new MemoryKvStore(), queue: {} };
  assert.equal((await preflightKoiosActivityPubProvider(base)).ready, true);
  await assert.rejects(preflightKoiosActivityPubProvider({ ...base, identifier: "different-actor" }), /fixed/);
  await assert.rejects(preflightKoiosActivityPubProvider({ keyPath, bearerTokenPath: tokenPath }), /ACTIVITYPUB_SQLITE_PATH/);
  const sqlitePath = path.join(directory, "preflight.sqlite");
  assert.equal((await preflightKoiosActivityPubProvider({ keyPath, bearerToken: "koios-local-test-token-with-at-least-32-characters", statePath: sqlitePath, testOnlyInProcess: true })).sqlitePath, sqlitePath);
  await assert.rejects(lstat(sqlitePath), { code: "ENOENT" });
  await assert.rejects(preflightKoiosActivityPubProvider({ ...base, bearerToken: "koios-local-test-token-with-at-least-32-characters" }), /private bearer-token file/);
});

test("the CLI runtime constructs durable SQLite custody and reports the canonical public actor", async (t) => {
  const directory = await mkdtemp("/var/tmp/koios-activitypub-");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const keyPath = path.join(directory, "keys.json");
  await writeFile(keyPath, JSON.stringify(await generateActorKeyMaterial()), { mode: 0o600 });
  const service = await serveKoiosActivityPubProvider({
    hostname: "127.0.0.1",
    port: await freePort(),
    keyPath,
    bearerToken: "koios-local-test-token-with-at-least-32-characters",
    statePath: path.join(directory, "state.sqlite"),
    testOnlyInProcess: true,
  });
  t.after(() => service.close());
  assert.equal(service.actor, "https://bare-cedar-fog.561.group/actors/koios-news");
  assert.equal(service.statePath, path.join(directory, "state.sqlite"));
  assert.equal((await preflightKoiosActivityPubProvider({
    keyPath,
    bearerToken: "koios-local-test-token-with-at-least-32-characters",
    statePath: service.statePath,
    testOnlyInProcess: true,
  })).actor, service.actor);
});

test("the live SQLite queue worker stops before its state handle closes", async (t) => {
  const directory = await mkdtemp("/var/tmp/koios-activitypub-");
  t.after(() => rm(directory, { recursive: true, force: true }));
  const keyPath = path.join(directory, "keys.json");
  const tokenPath = path.join(directory, "token");
  await writeFile(keyPath, JSON.stringify(await generateActorKeyMaterial()), { mode: 0o600 });
  await writeFile(tokenPath, "koios-local-test-token-with-at-least-32-characters\n", { mode: 0o600 });
  const service = await serveKoiosActivityPubProvider({
    hostname: "127.0.0.1",
    port: await freePort(),
    keyPath,
    bearerTokenPath: tokenPath,
    statePath: path.join(directory, "state.sqlite"),
  });
  await service.close();
});
