---
title: "Plural Identity, Characters, Personas, and Masks"
date-created: 2026-08-29
status: researched
roadmap-horizon: R2
provenance:
  - "Morgan Sennhauser request, 2026-08-29"
  - "PluralKit official documentation, reviewed 2026-08-29"
---

# Plural Identity, Characters, Personas, and Masks

## Idea

Build an upstream identity-expression and attribution capability that lets TTI
meet the useful features of PluralKit while serving a broader theory and
practice of characters, personas, masks, delegated offices, plural human
systems, and disclosed agent voices.

This is socially important functionality, not merely roleplay cosmetics.
People need context-sensitive ways to name who is speaking, decide what is
public, preserve continuity, and remain accountable without flattening every
form of mediated identity into one account profile.

## Baseline to meet

PluralKit currently provides:

- systems shared by one or more Discord accounts;
- member profiles with names, descriptions, pronouns, colors, avatars, and
  server-specific presentation;
- tag-triggered webhook proxying and several optional autoproxy modes;
- edit, delete, reproxy, lookup, and ping operations for proxied messages;
- switch/front logging, history, and aggregate front-time views;
- many-to-many member groups;
- per-field system and member privacy;
- import/export and a versioned REST API;
- moderation lookup from a proxied message to the concrete Discord account.

These are product requirements, not implementation instructions. PluralKit
uses webhook deletion-and-reposting, which changes how ordinary Discord
moderation works and therefore requires an explicit attribution path.

## What TTI should do better

1. **Separate the concepts.** A plural human member, authored character,
   contextual mask, delegated office, roleplay persona, bot persona, and agent
   session may relate, but they are not synonyms.
2. **Context-local consent and disclosure.** Users decide which fields and
   relations are visible in which community. Constructed/agent voices remain
   named and disclosed. Human plurality is never marked as AI performance.
3. **Accountability without public exposure.** Public messages show the chosen
   speaker. Authorized moderation can resolve the concrete account through a
   bounded audit record without publishing that link to everyone.
4. **Portable, reversible custody.** Export is complete, deletion is effective,
   server-local overrides do not corrupt the canonical record, and no operator
   owns the only usable copy of a person's identity data.
5. **Provenance and corrections.** Proxy, edit, reproxy, and deletion operations
   retain the minimum attribution needed for authorship and moderation while
   respecting declared retention and erasure policies.
6. **Multi-surface core.** Discord is the first adapter. The core model should
   also serve ActivityPub, games/MUDs, community publishing, and agent systems.
7. **No engagement exploitation.** Switch history, activity counts, and
   identity metadata are not a profiling or monetization feed.

## Existing upstream material

Useful but distinct local work already exists:

- `engineering-services-section/.../apps/playing/src/persona.mts` models masks,
  performance reconstruction, persona/shadow, and role distance.
- `engineering-services-section/.../apps/playing/src/character-agent.mts`
  models executable agent characters and identity coherence/drift.
- `engineering-services-section/.../apps/playing/src/session-character.mts`
  reconstructs per-session agent characters.
- `science-services-section/.../divination-services-section/lib/schemas/character.schema.json`
  distinguishes person and session records and forbids model identity from
  masquerading as character identity.
- the shared Discord REST transport and TTI Discord platform provide message,
  role, moderation, interaction, and audit primitives.

None of these currently provides a plural-system/member model, proxy parser,
webhook execution, switch ledger, per-field visibility resolver, portable
export, or proxied-message attribution chain.

## Proposed upstream architecture

### Identity and attribution core — Engineering

- actor/account/system/member/character/mask/persona/office/session types;
- explicit ownership, delegation, membership, and presentation relations;
- profile fields with global and context-local values;
- field-level visibility and authorized-purpose checks;
- proxy-pattern parsing with collision and ambiguity refusal;
- switch/front ledger as optional, consented data;
- proxied-message attribution, edit, reproxy, deletion, and erasure records;
- portable import/export and versioned API contracts.

### Discord adapter — Engineering

- webhook creation/execution and channel capability checks;
- attachment, reply, thread, mention, and accessibility preservation;
- safe source deletion only after successful proxy creation;
- rate limits, idempotency, retries, and rollback;
- moderator lookup and block/allow configuration;
- compatibility tests with AutoMod and common community bots.

### Theory — Science

- distinctions among human plurality, character, persona, mask, office, and
  session;
- mediated identity, social legibility, context collapse, attribution,
  disclosure, autonomy, and plural-community research;
- evaluation of webhook proxying's effects on moderation and participation.

### TTI product and operations

- public privacy and moderation promises;
- enabled features and server-specific presentation defaults;
- staff attribution/appeal runbooks and incident response;
- member research and consent for any pilot.

## First experiment

Build a non-posting local prototype that:

1. creates one system with two members and two context-local masks;
2. parses explicit proxy tags and refuses an ambiguous collision;
3. produces a proposed Discord webhook message without sending it;
4. resolves the public speaker projection separately from the private
   moderator attribution projection;
5. exports the complete user-owned record and proves deletion removes it;
6. records no switch history unless the user explicitly enables it.

Do not pilot proxying in the live TTI Discord until moderation attribution,
privacy defaults, export/deletion, consent language, and rollback all pass.

## Evidence required for admission

- reviewed domain vocabulary with plural-community participation;
- threat model covering impersonation, outing, stalking, proxy abuse, webhook
  compromise, and moderator misuse;
- property tests for attribution, visibility, deletion, and proxy ambiguity;
- complete export/import round trip;
- Discord sandbox evidence for edit/delete/reproxy and moderation lookup;
- a consented, reversible TTI pilot with explicit human moderators.

## Sources

- PluralKit overview and proxy mechanism: https://pluralkit.me/
- PluralKit user guide: https://pluralkit.me/guide/
- PluralKit moderation guidance: https://pluralkit.me/staff/moderation/
- PluralKit privacy policy: https://pluralkit.me/privacy/
- PluralKit API reference: https://pluralkit.me/api/
