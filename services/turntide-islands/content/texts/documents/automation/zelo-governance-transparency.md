---
title: "Zelo Governance Transparency"
date-created: 2026-08-29
status: proposed-requirement
---

# Zelo governance transparency

If Zelo supports Turntide Islands governance, the community must be able to
govern Zelo. Permissions alone do not make the bot a legitimate administrator,
memory, voter, or decision maker.

## Public office record

Zelo needs a versioned public record containing:

- its application identity and disclosed name;
- the human office responsible for it;
- its purpose and the communities it serves;
- the Discord events and data it can observe;
- the actions it can draft, perform, or never perform;
- its role permissions and why each is required;
- commands, reaction mappings, scheduled work, and external services;
- retention, privacy, logging, and incident behavior;
- release identifier, configuration digest, and last verified observation;
- shutdown, rollback, recovery, and appeal contacts.

Secrets remain private; secret names, public addresses, authority boundaries,
and verifiable configuration facts do not.

## Change governance

A proposed change should state the previous behavior, new behavior, affected
members and channels, authority, tests, live acceptance step, rollback, and
receipt. Zelo cannot use its own output as proof that the community authorized
the change.

## Memory and source behavior

Zelo must distinguish:

- a message visible in its current context;
- a durable source record it can cite;
- a proposal not yet accepted;
- a ratified decision;
- a live configuration observation;
- an inference.

When it lacks a governance record, it says so. It does not fill the gap with a
plausible history.

## Present gap

The current TTI code has no reaction-add gateway or emoji-to-role handler, so
Zelo cannot presently implement the established `#dock` and
`#channel-visas` reaction journey. Any future adapter must begin with a
read-only map of the existing messages, emojis, roles, and owning integration.

Historical provenance:
[1346529747450204190](https://discord.com/channels/1184863861065658419/1346511343573926010/1346529747450204190),
[1346548982863892501](https://discord.com/channels/1184863861065658419/1346511343573926010/1346548982863892501),
[1346549376989794385](https://discord.com/channels/1184863861065658419/1346511343573926010/1346549376989794385).

