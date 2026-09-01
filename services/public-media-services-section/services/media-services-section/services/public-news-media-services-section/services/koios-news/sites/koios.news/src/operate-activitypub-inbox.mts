#!/usr/bin/env node

import { pullActivityPubInbox, settleNextRetainedActivity } from "./management/activitypub-inbox.mts";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const operation = argument("--operation") ?? "pull-and-settle-next";
const dataDir = argument("--data-dir");
const now = argument("--now") ?? new Date().toISOString();
const result = operation === "pull-inbox"
  ? await pullActivityPubInbox({ ...(dataDir === undefined ? {} : { dataDir }), now })
  : operation === "settle-next"
    ? await settleNextRetainedActivity({ ...(dataDir === undefined ? {} : { dataDir }), now })
    : operation === "pull-and-settle-next"
      ? {
          pull: await pullActivityPubInbox({ ...(dataDir === undefined ? {} : { dataDir }), now }),
          settlement: await settleNextRetainedActivity({ ...(dataDir === undefined ? {} : { dataDir }), now }),
        }
    : { "@context": "https://www.w3.org/ns/activitystreams", type: "Reject", actor: "https://koios.news/activitypub/actor", object: { type: "ActivityPubInboxRefusal", reason: `unsupported operation: ${operation}` } };
process.stdout.write(`${JSON.stringify(result)}\n`);
