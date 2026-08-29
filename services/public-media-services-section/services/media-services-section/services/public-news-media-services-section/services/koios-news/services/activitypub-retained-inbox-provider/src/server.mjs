#!/usr/bin/env node

import path from "node:path";
import { chmod, lstat } from "node:fs/promises";
import { createActivityPubSqliteCustody } from "@red-cup-engineering/activitypub-services-section/sqlite-custody";
import { createSqliteActivityPubRuntime } from "@red-cup-engineering/activitypub-services-section/sqlite-runtime";
import { serveActivityPubProvider } from "@red-cup-engineering/activitypub-provider-service/server";

const KOIOS_ORIGIN = "https://bare-cedar-fog.561.group";
const KOIOS_IDENTIFIER = "koios-news";
const KOIOS_ACTOR_NAME = "Koios News";
const KOIOS_SUMMARY = "Koios News retained ActivityPub ingress.";
export const KOIOS_ACTOR_URI = `${KOIOS_ORIGIN}/actors/${KOIOS_IDENTIFIER}`;

function configured(options, name, fallback) {
  const value = options[name] ?? fallback;
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function assertKoiosIdentity(options) {
  for (const [name, expected] of Object.entries({ origin: KOIOS_ORIGIN, identifier: KOIOS_IDENTIFIER, actorName: KOIOS_ACTOR_NAME, summary: KOIOS_SUMMARY })) {
    if (options[name] !== undefined && options[name] !== expected) {
      throw new TypeError(`Koios ActivityPub ${name} is fixed and must equal ${expected}`);
    }
  }
}

async function assertPrivateRegularFile(filePath, label, { allowMissing = false } = {}) {
  let metadata;
  try { metadata = await lstat(path.resolve(filePath)); }
  catch (error) {
    if (allowMissing && error?.code === "ENOENT") return;
    throw error;
  }
  if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o077) !== 0) {
    throw new TypeError(`${label} must be one private non-symlink regular file`);
  }
}

async function assertPrivateDirectory(directory) {
  const metadata = await lstat(path.resolve(directory));
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || (metadata.mode & 0o077) !== 0) {
    throw new TypeError("Koios retained inbox directory must be one private non-symlink directory");
  }
}

/** Read-only operational readiness check.  It never reads secret contents. */
export async function preflightKoiosActivityPubProvider(options = {}) {
  if (options === null || typeof options !== "object") throw new TypeError("Koios ActivityPub options must be an object");
  assertKoiosIdentity(options);
  const testOnlyInProcess = options.testOnlyInProcess === true;
  const usesInjectedAdapters = options.kv !== undefined || options.queue !== undefined || options.inbox !== undefined;
  if (usesInjectedAdapters) {
    if (!options.kv || !options.inbox) throw new TypeError("Koios ActivityPub injected adapters require both durable KV and inbox custody");
    if (!testOnlyInProcess && !options.queue) throw new TypeError("Koios ActivityPub injected adapters require a durable network queue");
  }
  if (!testOnlyInProcess && options.bearerToken !== undefined) {
    throw new TypeError("Koios ActivityPub live operation requires a private bearer-token file, not an injected token");
  }
  const keyPath = configured(options, "keyPath", process.env.ACTIVITYPUB_KEYS_PATH);
  if (keyPath === undefined) throw new TypeError("ACTIVITYPUB_KEYS_PATH is required");
  await assertPrivateRegularFile(keyPath, "Koios ActivityPub actor key material");
  const bearerTokenPath = configured(options, "bearerTokenPath", process.env.ACTIVITYPUB_INBOX_BEARER_TOKEN_FILE);
  if (options.bearerToken === undefined) {
    if (bearerTokenPath === undefined) throw new TypeError("ACTIVITYPUB_INBOX_BEARER_TOKEN_FILE is required");
    await assertPrivateRegularFile(bearerTokenPath, "Koios ActivityPub inbox bearer token");
  }
  const sqlitePath = configured(options, "statePath", process.env.ACTIVITYPUB_SQLITE_PATH);
  if (!usesInjectedAdapters) {
    if (sqlitePath === undefined) throw new TypeError("ACTIVITYPUB_SQLITE_PATH is required; refusing an implicit working-directory inbox");
    await assertPrivateDirectory(path.dirname(path.resolve(sqlitePath)));
    await assertPrivateRegularFile(sqlitePath, "Koios ActivityPub SQLite state", { allowMissing: true });
  }
  return Object.freeze({
    ready: true,
    actor: KOIOS_ACTOR_URI,
    sqlitePath: usesInjectedAdapters ? null : path.resolve(sqlitePath),
    usesInjectedAdapters,
    testOnlyInProcess,
  });
}

export async function serveKoiosActivityPubProvider(options = {}) {
  const readiness = await preflightKoiosActivityPubProvider(options);
  const usesInjectedAdapters = options.kv !== undefined || options.queue !== undefined || options.inbox !== undefined;
  let runtime;
  let custody;
  if (usesInjectedAdapters) {
    custody = { kv: options.kv, inbox: options.inbox, inboxIndex: options.inboxIndex ?? options.inbox };
  } else {
    runtime = await createSqliteActivityPubRuntime({ statePath: readiness.sqlitePath });
    await chmod(runtime.statePath, 0o600);
    await assertPrivateRegularFile(runtime.statePath, "Koios ActivityPub SQLite state");
    custody = createActivityPubSqliteCustody({ database: runtime.database });
  }
  const running = await serveActivityPubProvider({
    origin: KOIOS_ORIGIN,
    identifier: KOIOS_IDENTIFIER,
    actorName: KOIOS_ACTOR_NAME,
    summary: KOIOS_SUMMARY,
    ...options,
    inbox: custody.inbox,
    inboxIndex: custody.inboxIndex,
    kv: custody.kv,
    ...(options.testOnlyInProcess === true ? {} : { queue: options.queue ?? runtime?.queue }),
  });
  const queueAbort = runtime === undefined || options.testOnlyInProcess === true ? undefined : new AbortController();
  const queueWorker = queueAbort === undefined ? undefined : running.provider.federation
    .startQueue(undefined, { signal: queueAbort.signal })
    .catch((error) => {
      if (!queueAbort.signal.aborted) process.stderr.write(`Koios ActivityPub SQLite queue worker stopped: ${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
    });
  return Object.freeze({
    ...running,
    actor: KOIOS_ACTOR_URI,
    statePath: runtime?.statePath ?? null,
    close: async () => {
      queueAbort?.abort();
      await queueWorker;
      await running.close();
      runtime?.close();
    },
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  serveKoiosActivityPubProvider().then(({ actor, statePath }) => {
    process.stdout.write(`${JSON.stringify({ actor, statePath })}\n`);
  }).catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.stack : String(error)}\n`);
    process.exitCode = 1;
  });
}
