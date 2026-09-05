# Turntide Islands: established community model and big plans

Status: working organizational note

Recorded: 2026-08-29

Authority for established claims: the administrator-supplied welcome message and the live guild structure observed on 2026-08-29

## What Turntide Islands is

Turntide Islands is a virtual community for responding, rather than merely reacting, to climate weirding and the compound crises around it, including catabolic collapse. People gather to share knowledge and develop practices and communities grounded in an honest acceptance of those conditions.

The community's established social expectations are care, curiosity, and respect. Spam, scams, and doxxing are prohibited. Discord Terms of Service violations can result in a mute.

Turntide Islands is not a blank Discord server awaiting a generic community template. Its existing people, channel names, categories, welcome text, roles, and practices are prior community decisions and evidence of developed norms. Software must begin by observing and preserving those decisions.

## Established entry and participation model

The established welcome journey is reaction-gated:

1. A new arrival reads the welcome message in `#dock`.
2. They react with the designated emoji to enter the community.
3. They use `#channel-visas` to select topical communities through emoji reactions and self-assigned roles.
4. Those roles expose or organize the relevant community spaces.

This is not currently a Zelo capability. The TTI Discord platform has no Discord reaction-add gateway handler and no emoji-to-role assignment path. Existing server machinery remains authoritative until it is identified and safely interoperated with. Zelo must not silently replace it.

## Established governance model

Turntide Islands presents itself as a decentralized autonomous organization using polycentric participatory consensus:

- proposals are discussed openly;
- quorum-based votes determine outcomes;
- governance actions are intended to be permanently recorded on-chain;
- topical areas follow the same discussion → quorum vote → recorded decision pattern;
- emsenn presently administers the organization and implements documented governance decisions;
- automation may eventually perform technical administrative actions;
- future participation may be recognized with tokens that influence governance weight.

These are first-class product and organizational requirements. The exact Colony, chain, wallet, contracts, assets, and presently recorded decisions are not yet identified in this repository note. A credential-safe EVM wallet and on-chain investigation must resolve them before the software makes stronger DAO claims or performs DAO operations.

Administrator-authored governance discussion from March 2025 adds historical
specificity: it described a `TTIDAO` token, a treasury, a distinct fund whose
fees could flow to that treasury, and Hive as a proposed immutable decision
record. Those messages establish authored architecture and intent, not current
chain state or proof that any proposal was ratified. See
`2026-08-29-governance-discussion-source-ledger.md`.

The credential-safe 2026-08-29 EVM investigation did not recover a matching
TTIDAO, Colony, treasury, or fund from the available wallet material. Its
bounded negative result and the identifiers still required are first-class
state in `content/governance/dao-registry.json`, with a narrative boundary in
`content/texts/documents/governance/dao-evidence-status.md`.

## What the present guild structure says

The live structure expresses a real archipelago rather than one undifferentiated chat:

- **Harbor** contains arrival and self-selection through `#dock` and `#channel-visas`.
- **General** provides shared announcements, gathering, solidarity, questions, media, and workshop space.
- **Chatter** contains many topical islands, including academic, AI, analysis, blockchain, cooking, economy, Emacs, gardening, praxis, silicon, stocks, and trading.
- **Location**, **cultural**, and **school** provide place-, culture-, and practice-specific spaces.
- **Governance** separates questions, discussion, proposals, actions, announcements, and moderation records.
- **Knowledge Vault** separates serious threading, briefings, archival work, and receipts.

This topology should be treated as an artifact of community intention. Any future change needs a stated community purpose, a reversible migration, and evidence that it preserves the established journey.

## Big plans

The coherent long-range direction is a climate-adaptation community operating system whose public website, Discord, governance, knowledge work, and accountable automation reinforce one another.

1. **A recognizable member journey.** The website explains the project, invites participation, and prepares people for the established `#dock` → reaction → `#channel-visas` journey.
2. **Community-owned governance.** Discussion, proposals, quorum, decisions, implementation, and on-chain receipts form one legible lifecycle.
3. **The DAO as architecture, not decoration.** Wallets, Colony or equivalent organization records, contracts, permissions, and assets become first-class public state with secrets kept outside the public corpus.
4. **Topical polycenters.** Each island can cultivate its own people, practices, programming, and proposals while sharing a common constitutional and accountability layer.
5. **Knowledge commons.** The Knowledge Vault turns community work into curated notes, research, briefings, archives, and receipts with attribution and provenance.
6. **Adaptation practice.** Programming helps members learn, organize, and conduct useful climate-adaptation projects, then records outcomes rather than only announcing intentions.
7. **Careful identity plurality.** Upstream work on characters, personas, masks, plurality, and proxying should allow people to participate contextually without confusing moderation attribution or consent.
8. **Useful automation under human authority.** Zelo can assist with onboarding, roles, moderation intake, programming, knowledge routing, and governance administration, but each action needs explicit authority, observability, and a human recovery path.
9. **Public proof of work.** The website should publish the mission, how to join, governance state, programs, selected knowledge, and verified community outcomes without exposing private Discord conversation.
10. **Research-informed community design.** The science of Discord and online communities belongs in sciences services and should continuously inform, but not overwrite, the practices of this particular community.
11. **Interoperable community software.** TTI should meet and exceed mature bot capabilities such as reaction roles, moderation, automations, and PluralKit-style identity support through composable, tested services instead of a monolith.
12. **Durable institutional memory.** Current state, decisions, roadmaps, operational receipts, and research remain distinct and discoverable so later maintainers can tell what exists, what was decided, and what is only proposed.

## Immediate debt and sequencing

Before further live Discord changes:

1. preserve a current read-only guild snapshot under `data/state/`;
2. identify which bot or Discord feature currently implements the welcome reaction and channel visas;
3. identify the TTI DAO from credential-derived public wallet addresses and on-chain evidence without exposing private keys;
4. map actual server norms and role/channel relationships;
5. design reaction onboarding as an adapter that can be tested against the established messages and roles;
6. propose live changes separately, with a rollback artifact and administrator review.

The current snapshot records what Discord returns now. It is evidence, not a declaration that every current setting is intended or that changes made earlier on 2026-08-29 were correct.
