---
title: "Turntide Islands Community Roadmap"
date-created: 2026-08-29
date-updated: 2026-08-29
status: active
owner: Turntide Islands
---


Turntide Islands is a climate-adaptation community: a place where people can
find one another, make sense of climate breakdown without compulsory optimism,
develop practical responses, test them, and preserve what they learn. Discord
is the present social venue, not the archive of record and not the whole
product.

This is the operating roadmap. An implementation, passing test, live setting,
and successful member journey are different states. The roadmap calls a
capability complete only after the relevant member journey has worked live and
left bounded evidence.

## Product thesis

The community should create a refinement loop:

1. Signals, questions, jokes, observations, and lived problems enter through
   understandable social channels.
2. People and disclosed stewarding software route and develop them without
   replacing human judgment or care.
3. Useful work is rescued into a searchable, attributed knowledge commons.
4. Research and simulation turn knowledge into candidate practices.
5. Members test practices in real places, return evidence, and improve the next
   cycle.

The long horizon is proof of adaptation: verified adaptive work rather than
engagement, posting volume, or capital held. The near horizon is more ordinary:
make joining, participating, hosting, learning, disagreeing, and leaving work
well for real people.

## Current operating baseline

The authoritative machine-readable status is
`operations-services-section/.../turntide-islands-community-operations-service/data/capability-matrix.json`.
As of 2026-08-29:

- The public site, permanent Discord invitation, established channel
  architecture, direct-mention steward, community help, rules, private
  reporting, and narrow native anti-raid protections are live. Discord native
  onboarding is enabled but is not a live accepted member journey: its current
  prompt competes with the established `#dock` reaction → `#channel-visas`
  path and contains dangling channel references. It must be observed and
  reconciled before it is presented as onboarding capability.
- Self-service preference roles, scheduled-event lifecycle, newcomer welcome,
  milestones, opt-in re-engagement, aggregate community health, and feedback
  disposition exist as tested software but still require live member-journey
  acceptance.
- Searchable community knowledge, a sustained programming calendar, and
  reliability evidence across a meaningful uptime window remain incomplete.

## The twelve community capabilities

| Capability | Product outcome | Acceptance evidence |
| --- | --- | --- |
| Public join | A visitor understands the purpose and can join without payment or a wallet. | External site and invite checks plus one consented newcomer journey. |
| Native onboarding | A newcomer chooses useful interests and reaches a first conversation quickly. | Prompt selection, channel assignment, and first participation receipt. |
| Channel architecture | Members can find entry, conversation, projects, events, support, governance, archives, and staff boundaries. | Permission sweep and representative member navigation test. |
| Roles and permissions | Roles are legible, reversible, least-authority, and audited. | Automated hierarchy/permission report plus safe test mutation. |
| Moderation | Rules, reports, triage, proportional action, records, and appeals work without bot adjudication. | Synthetic report through human disposition and appeal exercise. |
| Self-service preferences | Members can add and remove allowed interests and notifications themselves. | Live add/list/remove cycle with prohibited-role refusal. |
| Member lifecycle | Welcome, introductions, milestones, and re-engagement are humane and non-spammy. | Once-only welcome and explicitly opted-in re-engagement receipts. |
| Events | Members can propose, schedule, RSVP, receive reviewed reminders, attend, and close out gatherings. | One complete scheduled-event lifecycle. |
| Programming | Useful prompts, workshops, office hours, projects, and showcases recur with named human owners. | Four-week calendar completion and member feedback. |
| Searchable knowledge | Members can retrieve FAQs, resources, decisions, and attributed summaries across time. | Live query with provenance and access-control checks. |
| Health and feedback | The community learns from activation, return participation, breadth, workload, and member requests. | Privacy-safe 28-day measure and published feedback dispositions. |
| Reliable operations | Releases are tested, observable, backed up, restartable, reversible, and secure. | Uptime window, alert drill, restore drill, rollback, and command checks. |

## Roadmap horizon R1: a community people can actually use

Target: close the everyday community loop before adding speculative economics.

- Deploy and live-test self-service interest and notification roles.
- Create and close out the first recurring Open Harbor event with a human host.
- Activate once-only newcomer welcomes and an introductions pathway.
- Add `/feedback` with pseudonymous private triage and public dispositions only
  when appropriate.
- Publish a four-week programming calendar: Open Harbor, Question Quarry,
  Project Dock, and Field Notes.
- Provide search over rules, FAQs, public decisions, event notes, and the public
  knowledge vault with source links.
- Run permission, restart, rollback, alert, and restore exercises.

R1 is complete only when all twelve capability rows have live evidence; source
code alone is insufficient.

## Roadmap horizon R2: identity, character, persona, and masks

TTI should meet the useful feature surface demonstrated by PluralKit while
building a more general upstream capability:

- human-owned systems and members; profiles; server-local names and avatars;
  groups; proxy tags; explicit proxying; edit/delete/reproxy; optional
  autoproxy modes; switches and front history; per-field privacy; export; API;
  and moderator attribution to the concrete Discord account;
- a neutral vocabulary that distinguishes a human plural member, an authored
  character, a social mask, a delegated office, and an AI/session persona;
- context-local disclosure and consent, portable data, reversible deletion,
  attribution receipts, impersonation defenses, abuse-rate controls, and public
  privacy defaults chosen by the user rather than the platform;
- adapters for Discord first, with a core usable by ActivityPub, games/MUDs,
  agent systems, and other community surfaces.

The reusable identity/attribution/privacy core and Discord adapter belong in
Engineering. Character, plurality, persona, mask, and mediated-identity theory
belongs in Science. TTI-specific choices and public promises belong here.
Deployment and moderation runbooks belong in Operations.

## Roadmap horizon R3: the adaptation refinement loop

- Route admitted signals and member questions into relevant theory and practice
  conversations without flooding channels.
- Make chat-to-vault rescue a deliberate, consent-aware workflow with
  attribution and corrections.
- Operate enrichment agents outside Discord to cross-link, verify, summarize,
  and propose practices without importing private lanes.
- Grade practices through explicit evidence states: conceived, simulated,
  field-tested, replicated, and established.
- Run consented paid field trials only after safety, legal, custody, and public
  terms are actually ready.
- Explore the Mirror Archipelago as a real cooperative adaptation game whose
  state is derived from witnessed work rather than cosmetic engagement points.

## Operating metrics

The executive dashboard is small on purpose:

- newcomer onboarding completion;
- first meaningful participation after onboarding;
- returning participation over 28 days;
- participation breadth, not raw message volume;
- event proposals, RSVPs, attendance, and closeouts;
- unanswered questions and time to a human response;
- moderator time, open reports, resolution time, and appeals;
- feedback acknowledgement and closure;
- knowledge queries answered with provenance;
- release health, restart count, alert recovery, restore age, and rollback time.

Public reporting suppresses small cohorts. Private operations should not retain
message bodies or raw member identities merely to calculate community health.

## Product benchmarks

- Carl-bot-class expectations set the utility baseline: roles, moderation,
  automations, logs, events, member lifecycle, configuration, and reliability.
- PluralKit sets a serious identity-expression baseline: systems, members,
  webhook proxying, switches, groups, privacy, export/API, and moderator
  attribution.
- TTI beats neither by accumulating commands. It beats them only if these
  capabilities become coherent parts of a climate-adaptation community and if
  reusable upstream services become safer, more portable, more inspectable,
  and more respectful of human plurality.

## Zelo: community-automation product roadmap

Zelo is TTI's Carl-class Discord community-automation product, not the name of
every reusable Discord library. Its public office/configuration record is
`content/offices/zelo.json`. Zelo composes reusable upstream Discord transport,
observation, policy, receipt, and identity capabilities; those services must
remain available to other applications.

The member-facing sequence is deliberately first:

1. Preserve and observe the incumbent `#dock` → verification reaction →
   `#channel-visas` journey without replacing its current automation.
2. Operate Zelo in a read-only/shadow mode against reviewed configuration and
   bounded observations.
3. Admit one reversible reaction-role integration only after an exact mapping,
   current owner, role hierarchy, rollback, and consented member journey are
   evidenced.
4. Add moderation, programming, knowledge routing, and governance assistance
   in similarly bounded slices, each with a human authority and recovery path.

The canonical capability-by-capability backlog, Carl evidence, owner/layer,
acceptance test, and privacy boundary live in
`operations-services-section/.../turntide-islands-community-operations-service/data/carl-parity-advantage-matrix.json`.
Its status is authoritative over this narrative: source-only policy code or a
shadow slice is not live member-journey acceptance.

## Idea intake and promotion

Research ideas live in
`content/texts/documents/articles/research-articles/ideas/`. Every idea records
its provenance, affected roadmap horizon, likely canonical owner, risks, and
the evidence that would promote it.

An idea moves through: `captured` → `researched` → `proposed` → `admitted` →
`building` → `live-evidenced`, or to `declined` with a reason. Transcript mining
may capture an idea; it may not silently turn old brainstorming into a current
commitment.

## Source documents

- `content/text/documents/working-notes/2026-08-20-turntide-islands-synthesis.md`
- `content/text/documents/whitepapers/2026-08-20-proof-of-adaptation-draft.md`
- `content/text/documents/governance.md`
- `content/configurations/discord-native-onboarding.json`
- `operations-services-section/.../turntide-islands-community-operations-service/data/capability-matrix.json`
