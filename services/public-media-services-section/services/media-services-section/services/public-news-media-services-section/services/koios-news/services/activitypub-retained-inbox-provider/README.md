# Koios ActivityPub retained inbox provider

The public actor is exactly `https://bare-cedar-fog.561.group/actors/koios-news`.
This package does not project an actor at `koios.news/activitypub/actor`.

The CLI requires explicit private `ACTIVITYPUB_SQLITE_PATH`,
`ACTIVITYPUB_KEYS_PATH`, and `ACTIVITYPUB_INBOX_BEARER_TOKEN_FILE` paths. It
builds the durable SQLite KV store, queue, and verified-arrival custody from
the ActivityPub services package. Programmatic callers may instead
inject durable adapters. `createRetainedInbox()` remains a JSONL compatibility
and migration utility, not the live CLI custody path.

The package-local Cold Red Gate deployment boundary is in
[`content/deployments/cold-red-gate`](content/deployments/cold-red-gate/README.md).
Its systemd unit uses `StateDirectory=koios-news` and
`ACTIVITYPUB_SQLITE_PATH=%S/koios-news/activitypub.sqlite`, so SQLite is inside
the service's writable state sandbox while home remains read-only.

Before relying on the installed service for activation, verify the public
reverse-proxy/discovery contract from outside the local listener:

```sh
npm run smoke:public
```

The bounded 15-second, GET-only assay refuses redirects and verifies the exact
actor ID, advertised inbox, WebFinger subject, alias, and self link. It sends no
activity, bearer token, signature, or other mutation.
