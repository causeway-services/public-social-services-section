---
title: "Turntide Islands: Governance"
status: current
last-reviewed: 2026-08-20
---


This document states how Turntide Islands is governed, and the direction its governance is declared to grow toward. Claims about the future are marked as such; nothing below should be read as already built unless it is stated to already exist.

## 1. The settlement and its accountable identity

Turntide Islands is not a Discord server with a governance page attached to it. It is a settlement: a sovereign RMN membrane — `@causeway-services/turntide-islands-settlement`, in the enterprise's own package record — whose markets, offices, admissions, and public voices are built as typed admissions, typed refusals, content-addressed records, and witnessed writes. The Discord server is one surface this settlement speaks through, not the settlement itself.

"Accountable settlement: Turntide Islands" is the standing phrase this document formalizes. It appears already, verbatim, on the daily sky report's AI-disclosure line, and it names the load-bearing fact of this whole governance model: every office, every persona, every automated post has exactly one settlement that answers for it. Nothing here speaks for itself, and nothing here speaks for a person impersonating no one. When a member asks "who is responsible for this," the answer is always resolvable, and the answer is always Turntide Islands.

Governance here is not a charter written once and left to interpretation. It is a set of typed records — office specs, admission records, character records, evidence-tier fields — that the settlement's own machinery reads and enforces. A governance claim that isn't backed by a record of this kind is not yet a governance fact; it is, at most, a declared direction, and this document says which is which throughout.

## 2. Offices

### What an office is here

An office is not a job description and not a person. It is a normative form — what the enterprise's own office schema calls a body politic — that persists across incumbents and across vacancy. An office answers for a settled scope of work whether or not anyone or anything currently occupies it; who or what fills it is a separate, later fact, read off recognition and induction, never asserted by the office record itself. This is why no office record in this settlement carries a `holder` or `incumbent` field: an office that could assert its own occupant would be asserting a readout the record has no authority to make.

The clearest existing statement of this idea, from the diviner office one layer up the estate (the office cassia-lorne's daily reads answer to): the deontic profile "binds whoever or whatever synthesizes the read... rather than binding any one voice." Turntide Islands' own sky-desk office is built the same way: it is the office's own record, "never a number redrawn by hand or a reading invented when a contracted service returned an honest absence" — a claim about the office's standing obligation, independent of which model or process is presently discharging it.

### The deontic grammar

Every office's obligations are stated in one closed vocabulary, a Hohfeldian quartet the enterprise has renamed for its own use:

- **duty** — the office must do this; an act-level obligation.
- **liberty** — the office may do this; an act-level freedom, with no correlative claim on it from anyone else.
- **deontic-power** — a meta-level ability to alter act-level relations (for example, to withhold a scheduled post when an upstream exchange has been refused).
- **deontic-immunity** — a meta-level protection from having an act-level relation imposed on the office (for example, immunity from a consuming channel dictating how the office's own pipeline is written).

Each work an office governs gets exactly one of these four positions — never two, never none. This is a structural constraint, not a style rule: an office cannot simultaneously owe a thing and be at liberty about it. A record with no deontic profile at all was not derived from this grammar; it was invented. That is why every office record in this settlement is required to carry a `theory-basis` field naming what its structure was actually derived from — the schema itself calls an office "derived from how a session felt from the inside" the failure case this requirement exists to catch.

### Example: sky-desk

Turntide Islands' own `content/offices/` holds **sky-desk** as an office record. Its normative structure is stated as answering for whether the day's astrology and moon numbers reach `#sky-desk` — its own channel lane, never the differently-scoped `#weather-report` — as a precise infographic, and whether the accompanying prose reaches it alongside, "honestly reflecting whatever [the contracted services] actually returned... never a number redrawn by hand or a reading invented when a contracted service returned an honest absence."

Its deontic profile:

| Work | Position |
|---|---|
| daily-numbers-procurement | duty |
| daily-report-authorship | duty |
| daily-report-publication | duty |
| infographic-rendering-method | liberty |
| withhold-a-post-on-a-refused-exchange | deontic-power |
| resist-a-consuming-channel-writing-this-offices-own-pipeline-code | deontic-immunity |

Sky-desk's `unrealized` field records its own honest gaps rather than hiding them, declared exactly where the office's own record lives, in the same file that states its duties.

### Declared expansion: the four stewarding personas, and Zelo

Turntide Islands operates four stewarding personas — Tidewatcher, Vault Keeper, Harbor Master, and Admin Pinger — plus a fifth, differently-shaped actor, Zelo, that carries the settlement's autonomous/agentic side. All five exist as code: templated system prompts, remit and posture and human-boundary fields, and (for Zelo) a pure utility-scoring action loop. None of the five has an office record of its own in `content/offices/`.

The declared direction is to close that gap: give each of the four personas, and Zelo, an office record beside sky-desk, each with a deontic profile in the grammar above — liberties for what a persona may do, duties for what it must do, immunities for what it may refuse to have imposed on it. Each persona's `humanBoundary` field already states a refusal-of-resolution, not a refusal-of-topic — Tidewatcher may notice climate and culture signals but must not adjudicate panic, trauma, conflict, or political legitimacy; Harbor Master may shape onboarding and channel topology but must not moderate conflict or perform care; Admin Pinger may alert a human with observations but must not resolve the matter itself. These read naturally as deontic-immunities once formalized: an office record that cannot be induced, however it is prompted, into claiming the authority to resolve what only a human may resolve.

This is declared direction, not present fact: the four personas and Zelo are real, running code without yet being offices in the settlement's own governance sense.

### Declared expansion: Zelo receiving office records for public gates

A second, related direction: port the pattern already proven one layer up the estate, where cassia-lorne's diviner office has its deontic profile compiled directly to code — five programmatic gates that check every generated read against the office's stated duties before publication, with a withheld draft logged rather than discarded when a gate fails. Turntide Islands' own personas enforce their boundaries only at the prompt-instruction layer — the weaker of the two rigor levels the estate has working examples of. The declared direction is to graduate any persona output destined for a public lane to the stronger, gate-checked tier: grounding checks that trace every claim to a witnessed source field, boundary checks against the immunities above, and register checks — with Zelo's own materialist register (dread stated flat, treated as evidence, never smoothed over with forced positivity) as the register a gate for its lane would check against.

## 3. Characters

### The person/session distinction

Every character in this estate — anyone or anything that can be named and can act in a governed capacity — is recorded on one of two categorically disjoint kinds, per the character schema this settlement inherits: `person`, a real human being, and `session`, a role a language model steps into. Nothing downstream may blur these. A session character recorded as personnel would let a record hold the one distinction the whole roster exists to protect, so the schema keeps persons and session characters on disjoint rosters by construction, not by convention.

A character record is deliberately narrow: a name (what it is called, as it is said), a kind (`person` or `session`), and a disposition — the settled way it characteristically moves, recognizable across sessions. A role with no disposition, the schema says plainly, is a costume, not a character. Two things are deliberately absent from every character record: no `holds-offices` key, for the same reason offices carry no incumbent field — incumbency is a double settlement of recognition and induction, not something either party's own record gets to assert; and no `model` key, because which model animates a session character belongs to the act of animating, never to the role itself. An office persisting across whichever model presently discharges it, and a character record that never names its own backend, are the same design commitment stated twice.

### The disclosure policy

Turntide Islands runs two contradictory defaults. Its four lane personas are named and postured but carry no AI-disclosure line in their rendered system prompt. Its sky report is disclosed but nameless — every post carries the line "AI-generated interpretation of deterministic Divination data; accountable settlement: Turntide Islands," with no persona byline at all.

The settlement's declared policy resolves this to one rule: **every persona is named and disclosed.** The sky-desk disclosure line is the template, extended so that every persona's bio, and periodically its output, names both its constructed nature and the settlement accountable for it. This is not a legal formality. It is the deliberate anti-parasocial move for a settlement whose personas are meant to be legible as offices with voices — roles a model steps into, exactly as the character schema's own person/session distinction requires — never as friends, companions, or confidants standing in for one. A member should be able to respect a persona the way one respects a good lighthouse keeper: reliable, disclosed, and never mistaken for a relationship it isn't structured to hold.

## 4. Admissions

### How anything becomes active here

Nothing in Turntide Islands is active because it was coded, deployed, or announced. It is active because a typed admission record says so, and every admission record in this settlement is **fail-closed**: its default status is `not-admitted`, and it stays there until every evidence binding it names has actually been satisfied by a real, witnessed event — never by a configuration, a code path existing, or an assertion inside the record itself.

An admission record's shape is uniform across the settlement: a typed record naming what it admits (a product, an offering, a plan), the provider it depends on, an `evidenceBindings` map naming each fact the admission needs and currently holding `null` for every fact not yet witnessed, a `blockers` list stating in plain language what remains to be true, and — in the strongest examples — a `neverEvidence` field stating explicitly what does *not* count, so that no future reader can mistake code, configuration, or a synthetic receipt for the real thing.

### Worked example: the vault-payment activation record

`content/admissions/founding-knowledge-vault-payment-activation.json` is the clearest instance of this pattern in the settlement. Its status is `not-admitted`. Every one of its eight `evidenceBindings` — commercial terms, provider offering, provider subscription lifecycle, provider receipt delivery, Discord identity ingress, public origin control, witness-journal provider contract, Discord role territory — reads `null`. Its `blockers` list states exactly what would need to become true before the record could flip: leader-authorized tax and refund and dispute terms; a witnessed, non-synthetic operational admission following seven customer-observed tests for the exact subscription and its immutable service contracts; provider support for the real subscription-lifecycle webhook events; authenticated delivery of full receipts; an authenticated binding between the paying human and their Discord account; a public HTTPS origin; dedicated credentials; and a contracted witness-journal provider plus a dedicated Discord role.

Its `neverEvidence` field states the discipline directly: "Code, configuration, a Checkout Session, a Discord role, a reaction, or a synthetic receipt is not evidence of payment, revenue, profit, entitlement, or fulfillment." This is the settlement refusing, in a machine-readable record, to let its own outward presentation get ahead of what has actually happened. Read correctly, the eight blockers are the launch checklist: work through them in order, and the record's status changes because the world changed, never because the record was edited to say something more flattering.

## 5. Evidence tiers for practices

Where admissions govern whether a market or feature is active, a second typed vocabulary governs how much confidence a practice — a cottage adaptation technique the settlement's refinement loop surfaces — has actually earned. Every practice record carries one of five tiers, honestly stated and never claimed past what the evidence supports:

1. **conceived** — an AI agent has proposed the candidate practice from news and research; nothing has tested it yet.
2. **simulated** — the candidate has been screened in the cheap tier, against local climate data, energy and water and cost budgets, and hazard models.
3. **field-tested** — a human has implemented the practice in a real household or on real land, and a witnessed observation has come back.
4. **replicated** — the field trial has been repeated, independently, with results that hold up.
5. **established** — the practice has accumulated enough replicated, witnessed evidence to be treated as settled knowledge.

The standing house rule across every tier: a practice record honestly carries its current tier and never claims one it has not earned. This is the same fail-closed discipline the admissions layer enforces, applied to knowledge instead of to markets — and the same honest-records principle that already governs the rest of the settlement: every `not-admitted` record means exactly what it says, every empty admissions directory is empty because nothing has been admitted, and a missing data point is recorded as an honest absence, never quietly asserted as a zero result.

This evidence-tier machinery — the proof-of-adaptation design, the witness journal as its oracle, and the paid field-trial mechanism that funds the field-tested tier — is a declared design, worked out at length in the settlement's synthesis notes, not running code or typed schema. It is included here because it is the intended destination for the honest-records principle already governing the rest of this document.

## 6. Horizon: the DAO

This section describes direction, not current fact.

The settlement's stated case for a DAO is that it needs remarkably little new invention, because the governance vocabulary above is already native to how this settlement is built: offices with deontic profiles are roles and duties; admissions are the settlement's existing model for joining something without inherent obligation — an office one is *admitted to*, not bound by; the character roster's person/session distinction already keeps human and AI participants categorically distinct on one roster; and the settlement already has a sovereign identity a wallet could bind to.

Extended to a DAO, this same grammar would mean: offices — teacher, student, theorist, practitioner, and the four stewarding roles above — as admitted seats rather than as employment; "no inherent obligations" as the liberty and immunity half of the deontic grammar already in use, applied to human members instead of only to personas; and token governance weight as a further liberty or deontic-power a member's admission could carry, layered onto machinery that already refuses to let any record assert its own state — state here, as everywhere else in this settlement, would remain a readout of the substrate, never a self-assertion by whoever holds the tokens.

Custody hardening remains required before production or real-value DAO operation. It is not, however, a blanket bar on a bounded early alpha: [`content/admissions/early-alpha-configured-authority.json`](../../admissions/early-alpha-configured-authority.json) permits existing runtime-configured authority only for one receipted, replay-protected development-chain experiment against its exact allowlisted contracts, with a low native-spend cap, no token transfer, no deployment, and no tracked secret material. That admission neither creates a DAO nor changes any production, payment, token, treasury, or governance status.
