---
title: "Proof of Adaptation: A Whitepaper for Turntide Islands"
date: 2026-08-20
status: draft-for-leader-review
author: "Turntide Islands campaign (561 Group), drafted by Claude for Morgan Sennhauser"
---

# Proof of Adaptation

*A whitepaper for Turntide Islands*

## Abstract

Household and neighborhood-scale climate adaptation is knowledge work that currently has no market. What a rain garden does to a flood, what a shade structure does to a heat week, what a cistern does to a dry spring — this information exists, when it exists at all, scattered across forum threads, prepper Discords, extension bulletins, and individual memory, almost never in a form anyone else can verify or build on. Turntide Islands is a settlement built to close that gap: a community that runs an explicit knowledge-refinement loop — signal in, discussion, vault, enrichment, sharpened practice, back to signal — and mints a token, **proof of adaptation**, against the verified output of that loop rather than against computation spent or capital already held. This paper describes the system as designed: the refinement loop and its witnessed-record trust substrate, the evidence-tier ladder that lets a practice's claims scale with its proof, the market machinery that keeps a fail-closed default whenever a claim cannot be checked, the revenue lanes that fund field trials, and the game layer — the Mirror Archipelago — that turns testing adaptive practices into something people do because it is compelling, not only because it pays.

## The problem

Adaptation knowledge — what actually works, at the scale of a household, a block, a watershed, under a specific and worsening local hazard profile — is fragmented, unverified, and unfunded.

**Fragmented**, because it lives in the wrong containers. A useful answer to "does a swale actually reduce basement flooding on clay soil in a 2-inch rain event" might exist in a Reddit thread, a county extension PDF from 2011, a homesteading Discord's pinned message, or nowhere at all — written by someone who tried it and never told anyone. There is no shared, growing, cross-referenced record. Every household re-derives what the last one already learned.

**Unverified**, because almost none of the existing containers distinguish a claim someone believes from a claim someone measured. "This worked for me" and "this is what the regional climate models project" and "someone on a forum said this" all read the same in a scroll of chat messages or blog posts. Nothing marks a claim's evidentiary standing, and nothing prevents a claim from inflating its own confidence over time as it gets repeated.

**Unfunded**, because nobody pays for it. Agricultural extension services once ran a research-station-to-county-agent-to-farmer-trial-to-data-return loop for exactly this kind of local, empirical, practice-level knowledge — and that institutional infrastructure has been hollowed out for decades while the need for adaptive, small-scale, hyperlocal practice knowledge has only grown. The commercial alternative — B2B risk-briefing products sold to insurers and employers — solves a related but different problem (pricing exposure) and carries a live risk of doing real harm: hyperlocal risk data can as easily be used to price poor neighborhoods out of coverage as to help a household adapt. Nobody has built the missing middle: a market that pays households and land stewards for producing verified, replicable, local adaptation knowledge, on terms that keep the resulting corpus a commons rather than a proprietary feed sold over their heads.

Turntide Islands exists to build that missing middle, and it is building it as a settlement — a community whose knowledge production is instrumented, admission-gated, and machine-checkable from the start, rather than an accretion of chat history someone tries to clean up later.

## The system

### The refinement loop

The design spine of Turntide Islands is a single loop, run socially: **news lands in intake channels; bots route items from intake into the theory-discussion channel matched to their topic; discussion output is rescued into a knowledge vault with provenance intact; out-of-Discord agents then work the vault — cross-linking claims, checking them against sources, producing briefings — and the enriched vault upgrades the community's practices (guides, checklists, build plans, drills), which sharpen the questions the community brings to the next news cycle.**

This is a Monitor-Analyze-Plan-Execute-Knowledge (MAPE-K) control loop, instantiated as a community rather than as a single autonomous system. Monitor is signal ingest — news and research entering the settlement through typed intake. Analyze is the theory-discussion layer, humans and personas working together. Plan and Execute are the practices the loop produces: guides, checklists, build plans, field drills. Knowledge is the vault — durable, agent-searchable, exportable, the archive of record that Discord chat itself is never allowed to become. The loop does not run once; each pass through it changes what the community knows how to ask next.

Three pieces of this loop exist in some working form (signal ingest, a draft-review lifecycle for candidate signals, an early triage layer). Three more pieces are designed: the routing layer that matches an intake item to its theory channel automatically; a systematic rescue path that treats chat-to-vault promotion as a first-class, provenance-carrying flow rather than an occasional manual act; and the out-of-Discord enrichment agents that read the vault, cross-link it, test its claims against sources, and write practice documents back into it.

### Witnessed records as the trust substrate

Every claim this system produces or acts on is backed by a witnessed record: a content-addressed, typed write with an explicit source, an explicit author (human or disclosed AI), and an explicit refusal path when evidence is insufficient. The house rule that governs this substrate is stated plainly and enforced structurally, not just by convention: **a missing data point is never asserted as a zero result.** When a source returns an honest absence, the record says less, or says nothing — it does not pad, guess, or restyle the gap into a claim.

This matters more than it might sound like it should, because it is the property that makes the rest of the system possible. A token that pays for verified adaptive work is only as good as the verification underneath it; a market that claims to be fail-closed is only fail-closed if its refusals are real. Turntide Islands' underlying settlement architecture — its knowledge vault, its contributor market, its union media, its steward-inference layer — is built throughout on typed admissions, typed refusals, and circuits that are machine-checkable maps of exactly how far each value path is from actually closing. A market circuit here does not compute "revenue path closed: true" by assertion; it computes that value only when every cell on the path has actually passed, and computes an honest `null` otherwise.

### Fail-closed market machinery

The practical consequence for anyone transacting with Turntide Islands — a member paying for entitlement, a counterparty buying a data feed, a field-trial participant claiming a bounty — is that the system defaults to refusing rather than to guessing. An unverifiable claim does not get rounded up to "probably fine." A checkout that cannot confirm a webhook fired does not grant access on good faith. A practice that has not been field-tested is never presented as though it has been. This is slower than the alternative and it is the entire reason the resulting corpus, and the token backed by it, will be worth anything to anyone downstream.

The same machinery gates counterparties, not just claims. Turntide's markets are admission-gated by construction: a buyer is admitted or refused against a published check, not silently allowed in because they had a payment method. This resolves what would otherwise be an unavoidable tension for a B2B intelligence lane — hyperlocal risk data is exactly the kind of product an insurer could use to price a poor neighborhood out of coverage, which is not adaptation, it is the extractive adaptation-economy this project exists in opposition to. The admission gate turns that ethical line into a checkable market boundary: watershed councils, mutual-aid networks, libraries, tribal governments, co-ops, and municipal resilience offices are plausibly admissible counterparties; an actuarial retreat-pricing desk writes its own refusal against the same published check. No invented exception list is required — the gate is the policy.

## Proof of adaptation

The token names its own backing. Proof-of-work proves joules wasted; proof-of-stake proves capital already held. **Proof of adaptation proves verified adaptive work performed** — a token minted only against evidence that a specific practice was actually implemented and measured, by a specific participant, in a specific place.

### The evidence-tier ladder

Every practice record in the vault carries an explicit, honestly-held evidence tier, and nothing is permitted to claim a tier it has not earned:

1. **Conceived** — an agent or a member has proposed the practice, drawing on news, research, or prior results. No testing has occurred.
2. **Simulated** — the practice has been screened against local climate data, energy and water budgets, cost, and hazard models in the low-joule simulation tier. It has survived that screen; it has not yet touched the world.
3. **Field-tested** — a paid field trial has been run: a real household or plot, a witnessed protocol, structured before/after observation.
4. **Replicated** — independent trials, run by different participants, in comparable conditions, have converged on comparable results.
5. **Established** — the practice has enough independently replicated field evidence to be treated as a settled recommendation, still open to revision if new conditions contradict it.

A practice record's tier is a readout of its evidence, never a self-assertion — the same discipline the settlement applies to every other kind of state it tracks. A corpus that quietly inflates its own tiers would be worthless both to members deciding what to try and to any downstream buyer of the aggregate findings; the tier ladder is the mechanism that keeps the whole knowledge base worth paying for.

### The witness-journal oracle

The token needs an oracle it can trust, and the design answer is the witness journal: a content-addressed record of the field trial itself — protocol followed, observations recorded, photo and sensor evidence attached, before/after measurements, and a typed refusal wherever the evidence was insufficient rather than a filled-in blank. This is the same honest-skip discipline the rest of the settlement runs on, applied to the specific, high-stakes case of "did this actually work." Participant reputation, itself derived from prior witnessed trial quality rather than self-reported, weights how much a new submission from that participant is trusted before independent replication catches up.

This pattern is not invented from nothing. It is a deliberate reinvention, at internet scale and with cryptographic witnessing, of a lineage that already exists: agricultural extension services ran a research-station-to-county-agent-to-farmer-trial-to-data-return loop for most of the twentieth century; Regen Network pays for verified ecological state changes; DeSci projects run data bounties against scientific claims; carbon markets have spent two decades building (and repeatedly failing, then rebuilding) monitoring-reporting-verification infrastructure for exactly this kind of "did the real-world thing actually happen" question. Turntide Islands is not claiming novelty in the concept of paying for verified field evidence. It is claiming novelty in doing so as native settlement infrastructure — witnessed records, typed refusals, and admission-gated markets — rather than as a bolt-on audit process layered over an otherwise-unverified system.

### EROEI as the allocator

The design's governing objective is adaptation-return-on-energy-invested, borrowed deliberately from EROEI thinking in energy systems. Imagination and experimentation cost energy. The system pushes the expensive part — search across many candidate practices — into the cheap simulation tier, so that the costly, irreversible joules of an actual human field trial are spent only on candidates that have already survived a low-cost screen. Hazard screening lives in simulation for the same reason twice over: it is nearly free there, and an injury in the field is a catastrophic energy loss that also, and this is the point that matters most, returns no usable data. The token market is the mechanism that allocates the finite field-trial budget across the candidate frontier that survives simulation — bounties go to the highest-expected-return trials, not to whichever candidate got proposed first or loudest.

Two constraints keep this defensible rather than merely aspirational, argued here on engineering grounds rather than purely ethical ones. First, the token stays **work-shaped**: earned for completed, witnessed trials and data quality; spendable on vault access, group-buy discounts, cohort seats, and governance weight over the next trial slate. It is never marketed as an investment, because that framing difference is most of what determines U.S. securities exposure for a token like this, and because a token pitched as an investment attracts people optimizing for the token's price rather than for verified adaptive work — precisely the failure mode the whole design exists to avoid. Second, the evidence-tier discipline above is not decoration; it is the thing that makes the resulting data worth paying for at all, by anyone, including the community itself.

## The Mirror Archipelago

Paying people to run field trials is the mechanism. Making the testing into something people actually want to do is a further move, and the design for it already exists: not gamification stickers pasted onto chores, but a genuine massively-multiplayer game whose state is projected from real, witnessed adaptation records.

The settlement already owns a deterministic world engine — fizzos — built around immutable assertion traces, four-valued (true/false/both/neither) evidence handling, and restricted per-player perception, exactly the primitives a trustworthy shared world needs. Run a mirror world on that engine in which the islands are literal: each member community, parcel, block, or watershed is an island in the archipelago, and the mirror's state is projected from the witness journal. Install a real rain garden, and the map everyone plays on changes. The climate-signals feed that already drives the refinement loop becomes the mirror's weather system — when a drought shows up in reality, it shows up in the game.

Play maps onto adaptation work directly rather than allegorically. A guild is a mutual-aid pod. A raid is a weekend group-build, with party formation and role assignment drawn from the settlement's own office system as its class system, and loot that is tokens, reputation, and the greywater system a party actually installed. The seed exchange is the trading post; the group-buy is the guild bank; the bounty board is the quest log. Seasonal content can branch from real climate-model ensembles — this season the mirror runs the dry-spring ensemble member, and the community rehearses that specific future in play before any of it has happened in the world outside the game.

A dungeon-master layer sits between the loop's enrichment agents and the players: the same agents that screen candidate practices in simulation turn the screened survivors into quests — framing, difficulty, party-size requirements, hazard notes — so a member can run a candidate practice inside the mirror before spending real joules on it in a yard. Quest completion in reality returns witnessed evidence to the journal; the evidence mints proof-of-adaptation tokens; the vault and the map both update on the same write. The dungeon-master's voice stays flat and honest — no invented flavor text standing in for missing data, the same honest-skip rule applied to lore as to everything else this settlement records.

None of this is TTI-specific by design. A fizzos world projected from witnessed records and live signals is a general service; any settlement with witnessed state could run its own mirror. Turntide Islands is meant to be the first island chain, not the sole owner of the engine underneath it.

## The economy

Turntide Islands' revenue architecture is a stack of lanes, most of which map onto machinery the settlement's markets already provide rather than requiring new invention: a free mission tier for reach; recurring memberships in the roughly $5–25/month range for vault access, briefings, and community participation; higher-ticket episodic offerings — cohorts, certifications, structured office hours; transaction fees on pooled group-buys; and a premium recurring signals-intelligence tier priced closer to $49–199/month, sold on the strength of witnessed, content-addressed "we saw it first" timestamps that a competitor without the same witnessing infrastructure cannot fake. Layered above the member-facing lanes sits the admission-gated B2B tier described above — resilience data and programs sold to institutions that can pass the published admission check.

These lanes exist to fund something specific: the trial treasury. Field trials cost real money and real risk of harm to run responsibly, and the settlement's own signals and intelligence lanes are the natural funding source for them — the people paying for early, verified access to climate signal are, in effect, funding the people testing what to do about it. That is not a metaphor about virtue; it is a literal allocation: subscription and B2B revenue capitalizes the treasury that pays field-trial bounties in proof-of-adaptation tokens, and the evidence those trials produce is what makes the subscription and B2B products worth paying for in the first place. The loop closes on itself economically the same way it closes on itself epistemically.

The token itself, again, stays deliberately work-shaped rather than speculative: minted against completed, witnessed trials; spent on vault access, group-buy discounts, cohort seats, tool-library time, and governance weight over the next trial slate. It is explicitly not sold as an investment, not marketed on expected appreciation, and not designed around scarcity mechanics that would reward holding it over using it. This is a legal boundary as much as a design one, and the settlement treats it as load-bearing rather than as a caveat appended after the fact.

## Governance

Turntide Islands governs itself using vocabulary its settlement architecture already speaks natively, rather than importing DAO tooling wholesale: offices with published deontic profiles (what a role may do, must do, and may refuse), admissions (joining a role without incurring obligations beyond what that role's profile states), dispatches (task hand-offs between offices), and a roster that categorically distinguishes human members from AI personas rather than blurring the two. A DAO built on this vocabulary extends it to humans the same way it already governs offices and personas: teacher, student, theorist, and practitioner become office records with the same liberties, duties, and immunities structure the persona layer already uses, and governance weight over the trial slate — who decides which candidate practices get funded next — becomes one more admission-gated, machine-checkable process rather than an off-ledger vote of convenience.

This paper does not attempt to specify that structure in full; a companion governance document treats offices, admissions, and the DAO's design in the detail the topic deserves, and this section exists only to place proof of adaptation correctly inside it: the token carries governance weight over the trial slate, that weight is earned through witnessed work rather than purchased, and the sovereign wallet is not treated as carrying production or real value until its custody is hardened. A separate early-alpha admission may use existing configured authority for one low-cap, receipted, replay-protected development-chain experiment only; it does not circulate a token, form a DAO, or authorize a treasury or production action.

## Related work

Turntide Islands' proof-of-adaptation design sits in a specific lineage rather than inventing the underlying pattern from nothing.

**Agricultural extension services** ran the closest historical analogue for most of the twentieth century: a research station develops candidate practices, a county agent carries them to farmers, farmers run trials on real land, and results flow back to refine the next round of recommendations. That institutional infrastructure has eroded substantially even as the need for exactly this kind of local, empirical, practice-level knowledge has grown under a destabilizing climate. Proof of adaptation is, structurally, an attempt to rebuild that loop at internet scale, with cryptographic witnessing standing in for institutional trust in the county agent.

**Regen Network** pioneers paying for verified ecological state changes on public infrastructure, and its work on what counts as verifiable ecological evidence, and how to price it, is directly relevant to how Turntide Islands should specify its own evidence tiers and oracle design.

**Decentralized science (DeSci)** projects have built various data-bounty and verified-contribution mechanisms for scientific claims outside traditional institutional gatekeeping; the closest overlap is in how these projects handle reputation, replication, and the specific problem of paying for a claim's verification rather than only for its production.

**Carbon-market monitoring, reporting, and verification (MRV)** infrastructure is the cautionary tale as much as the precedent: two decades of carbon-offset MRV have repeatedly discovered how easy it is for a verification market to quietly degrade into rubber-stamping, and how much of the resulting damage traces back to unwitnessed or under-witnessed claims being treated as though they were audited. The evidence-tier ladder and the fail-closed default in Turntide Islands' market machinery are designed, in part, as a direct response to that failure mode: better an honest `null` than a false `verified`.
