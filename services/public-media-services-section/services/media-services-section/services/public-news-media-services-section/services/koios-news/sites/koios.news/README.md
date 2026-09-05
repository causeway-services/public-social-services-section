# Retired Koios News aggregate

This package is a tombstone and historical custody source. It is not a current
site server, newsroom, content-farm runner, scheduler, or deployment package.
Its package manifest exports only the tombstone, and its CLI exits with a
bounded refusal.

The historical TypeScript source, corpus, tests, and records remain in this
directory as migration evidence. They must not be executed as production
authority. Git history retains the former operational README and commands.

Current production custody belongs to the small package-local successors at
the Koios service-section root:

- `runtime-current` for read-only provider-topology admission;
- `services/editorial-publication-authority` for externally signed authority;
- `routine-publication-current` for one replay-safe offline candidate;
- `static-delivery-current` for deterministic public bytes;
- `cloudflare-release-current` for signed preview and release effects;
- `services/activitypub-retained-inbox-provider` for the retained actor and
  its Cold Red Gate deployment; and
- the root `koios-news-routine-operation` plus
  `schedule-delivery-activation-current` for the exact scheduled target.

Use the root [`README.md`](../../README.md) and
[`OPERATIONS.md`](../../OPERATIONS.md) for current verification and activation
instructions.

```sh
npm run check && npm test
node src/tombstone.mjs  # exits 2 by design
```
