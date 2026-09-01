/**
 * govern — socializing's GOVERNANCE reading: the Hohfeldian jural relation, the
 * governance-act thesis, and the kyriarchist ↔ swarm ↔ consensus discipline, all read
 * off the inter-observer structure of the Social Field.
 *
 * Governance is SCALE-2-NATIVE. The corpus's governance thesis (content/_archive
 * lakotaean-governance/questions/what-is-the-theory-of-governance.md) anchors a process
 * π as a governance act iff it jointly satisfies ATTRIBUTION (π is done by a collective C,
 * not a lone member), BINDING (π produces/modifies a normative constraint on a member),
 * and BECOMING (π transitions C's state). All three are scale-2: a collective, a member
 * bound within it, the collective's transition. socializing is the home of C — the
 * observer category O over the Social Field — so the governance act lives here, not in
 * communicating (which carries only the within-agent BINDING illocution: its `illocute`
 * `declaration` force is the constitutive "X counts as Y" speech act, the single-agent
 * binding primitive this reading lifts).
 *
 * Operativity is the bilattice INFORMATION MEET ⊗_k of the three FOUR-valued settlements
 * (the thesis: "operativity = ⊗_k of attribution, binding, becoming"), not a Boolean
 * conjunction — so a gap (⊥, unsettled) is distinguished from a contradiction (⊤,
 * contested), exactly the Belnap-Dunn distinction the corpus's FOUR-enrichment isolates.
 *
 * BINDING is carried by the HOHFELDIAN jural relation (content/_archive
 * .../predicated-governance/objects/jural-relation.md): a directed correlative relation
 * between an active holder and a passive party — claim/duty, privilege/no-right,
 * power/liability, immunity/disability. The correlative `correlate` is the swap of
 * active/passive (the predicate-converse, self-adjoint in both bilattice orders so the
 * standing is preserved) composed with the kind-rename (a predicate-specialization); it
 * is not a new generator. A jural relation is genuinely OFF-DIAGONAL — it relates two
 * distinct observers — so it is socializing's structure, never communicating's.
 *
 * DISCIPLINE is the frame-neutral classification the corpus insists on (content/_archive
 * .../non-hohfeldian-governance-traditions.md: "the math discriminates patterns by their
 * cohomology but does not privilege any"). The Hohfeldian eightfold is one structural
 * option among several; kyriarchist (κύριος-ruler) hierarchy, distributed swarm/rotation,
 * and thick consensus are discriminated by the shape of the power-relation graph over O:
 *   - kyriarchist — power CONCENTRATES: a single dominator holds power over a strict
 *     majority of the other observers AND bears no correlative accountability duty (the
 *     No-Invisible-Power charter rule: "every power has a corresponding duty"). The
 *     dominator face of liberal-ontologizing-as-kyriarchist-governance.
 *   - swarm — power is DISTRIBUTED (no dominator) or ROTATIONAL (the power graph cycles,
 *     authority returns): the stigmergic, field-mediated regime socializing's face reads
 *     as O(N+|L|)-cheap (see ./face.mts SwarmCoordination).
 *   - consensus — no position-altering powers at all; authority is the undirected thick
 *     agreement the network-sheaf consensus already reads (see ./consensus.mts).
 *
 * This consumes relating's bilattice charge algebra (∨_k, ⊗_k, FOUR) and socializing's
 * own observer structure; it re-authors none of it.
 */
import { type Action, type ChargeValueName, type JsonRecord, type UtteranceCarrier } from "@emsenn/relating";
import { type CollectivePreference, type PreferencePair } from "./preference.mjs";
/** The Hohfeldian eightfold — the four ADVANTAGE positions and their four correlatives.
 *  claim/duty, privilege/no-right, power/liability, immunity/disability (jural-relation.md). */
export declare const JURAL_KINDS: readonly ["claim", "duty", "privilege", "no-right", "power", "liability", "immunity", "disability"];
export type JuralKind = typeof JURAL_KINDS[number];
/** The correlative of a Hohfeldian kind (power ↔ liability, duty ↔ claim, …). Involutive. */
export declare function correlativeKind(kind: JuralKind): JuralKind;
/**
 * A single Hohfeldian jural relation between two observers: a directed correlative
 * normative relation, FOUR-valued in its existence (jural-relation.md "Bilattice values on
 * jural-relation cells": t asserted, f denied, ⊥ no information, ⊤ contradictory).
 */
export interface JuralRelation {
    /** the Hohfeldian kind (claim/duty/privilege/no-right/power/liability/immunity/disability). */
    readonly kind: JuralKind;
    /** the agent in the ACTIVE position (the power-wielder, duty-bearer, privilege/immunity-holder). */
    readonly active: string;
    /** the agent in the PASSIVE (correlative) position. */
    readonly passive: string;
    /** the action / substrate operation the relation regards (Hohfeld's scope-action X). */
    readonly scope: string;
    /** the FOUR-valued standing of the relation's EXISTENCE: `potential` asserted (t),
     *  `active` denied (f), `stable` contradicted (⊤ — both asserted and denied), `absurd`
     *  no information (⊥). */
    readonly standing: ChargeValueName;
}
/**
 * The CORRELATIVE of a jural relation: swap active and passive parties (the
 * predicate-converse — self-adjoint in both bilattice orders, so the standing is
 * preserved) and rename the kind to its correlative (a predicate-specialization). Per
 * jural-relation.md this factors through existing predicate-category generators; it is not
 * a new generator. Involutive: `correlate(correlate(r))` is `r`.
 */
export declare function correlate(relation: JuralRelation): JuralRelation;
/** The governance DISCIPLINE — which structural tooling the polity makes primary, read off
 *  the power-relation graph over O. Frame-neutral: discriminated by graph shape, not privileged. */
export type GovernanceDiscipline = "kyriarchist" | "swarm" | "consensus" | "ungoverned";
/**
 * socializing's GOVERNANCE reading over an inter-agent membrane — the governance act
 * thesis (attribution ⊗_k binding ⊗_k becoming) plus the discipline classification.
 */
export interface Governance {
    readonly kind: "socializing.governance";
    /** |O| — the distinct observers named as an active holder or passive party of some relation. */
    readonly observers: number;
    /** the canonical jural relations (one per (kind, active, passive, scope) cell, standing pooled ∨_k). */
    readonly relations: readonly JuralRelation[];
    /** the correlative dual of each relation (the passive-side view of the same jural fact). */
    readonly correlatives: readonly JuralRelation[];
    /** the number of held `power`-kind relations (potential or contradicted) — the position-altering capacity. */
    readonly powers: number;
    /** the DOMINION of the strongest holder: the count of distinct parties one observer holds power over. */
    readonly dominion: number;
    /** dominion / (|O|−1) ∈ [0,1] — the share of the other observers a single holder dominates (0 for |O|≤1). */
    readonly concentration: number;
    /** held power relations whose holder bears NO correlative accountability duty (the
     *  No-Invisible-Power rule: "every power has a corresponding duty"). The unaccountable powers. */
    readonly accountabilityGap: number;
    /** the power graph has a directed CYCLE — authority RETURNS (rotational/recurrent-practice authority). */
    readonly rotational: boolean;
    /** the H¹ obstruction of the binding-disagreement graph over O (network-sheaf consensus on the
     *  observers' pooled jural standing) — a cycle of holders who assert vs deny bindings; 0 ⟺ glues. */
    readonly obstruction: number;
    /** held jural cells that pooled to ⊤ stable — contradictory bindings (both asserted and denied). */
    readonly contested: number;
    /** the discipline the power-relation graph realizes. */
    readonly discipline: GovernanceDiscipline;
    /** ATTRIBUTION settlement ∈ FOUR: is the act done by a COLLECTIVE? `potential` iff ≥2 observers
     *  (a plurality, not the agentive singleton); `absurd` iff none. */
    readonly attribution: ChargeValueName;
    /** BINDING settlement ∈ FOUR: the ∨_k aggregate over the relations' standings — what the
     *  collective binds. `absurd` if nothing is bound, `stable` if a binding is contradicted. */
    readonly binding: ChargeValueName;
    /** BECOMING settlement ∈ FOUR: can the collective TRANSITION? `potential` iff the bindings are
     *  coherent and glue (relations exist, no contested cell, obstruction 0); `absurd` (a ⊥ gap) iff
     *  there is nothing to transition OR a contradiction/obstruction blocks the transition from
     *  settling — so the ⊗_k meet drops operativity to a gap exactly when the becoming has not settled. */
    readonly becoming: ChargeValueName;
    /** OPERATIVITY = attribution ⊗_k binding ⊗_k becoming — the information-meet of the three
     *  settlements (the governance thesis). `potential` operative, `absurd` a gap (some part unsettled),
     *  `stable` contested, `active` refused. */
    readonly operativity: ChargeValueName;
}
/** The proof receipt attached to each market-settled cell. */
export interface MarketConsensusProof {
    readonly spreadH1Zero: boolean;
    readonly noArbitrageIffH1Zero: boolean;
    readonly coherentConsensusIffH1Zero: boolean;
    readonly noArbitrageIffCoherentConsensus: boolean;
}
/** One preference cell settled as a market: equilibrium price, H1 spread, and decision. */
export interface MarketDecisionCell {
    readonly a: string;
    readonly b: string;
    readonly aggregateStanding: ChargeValueName;
    readonly aggregateWinner: PreferencePair["winner"];
    readonly equilibrium: JsonRecord;
    readonly pooled: JsonRecord;
    readonly decision: PreferencePair["winner"] | "contested";
    readonly spreadH1: number;
    readonly coordinationCost: number;
    readonly noArbitrage: boolean;
    readonly coherentConsensus: boolean;
    readonly contestedCell: boolean;
    readonly proof: MarketConsensusProof;
}
/** A governance decision settled by the price/no-arbitrage/H1 market reading. */
export interface MarketSettledGovernance {
    readonly kind: "socializing.market-governance";
    readonly preference: CollectivePreference;
    readonly cells: readonly MarketDecisionCell[];
    readonly decided: number;
    readonly contested: number;
    readonly coordinationCost: number;
    readonly noArbitrage: boolean;
    readonly coherentConsensus: boolean;
}
/**
 * governance — read a society's GOVERNANCE off an inter-agent membrane of Hohfeldian jural
 * claims (each `holder|kind>passive>scope`). Pools each (kind, active, passive, scope) cell's
 * standing along ≤_k (a denied + asserted cell settling to ⊤ contested), reads the governance
 * act thesis (attribution ⊗_k binding ⊗_k becoming), and classifies the discipline by the
 * shape of the power-relation graph over the observers.
 */
export declare function governance(membrane: readonly UtteranceCarrier[]): Governance;
/**
 * decideByMarket - futarchic governance over pairwise preferences.
 *
 * The ordinary aggregate-preferences reading supplies the preference cells. Each cell is
 * then re-read as a market: voters are venues, their pairwise stance is a priced meme,
 * priceConsensus computes the martingale fixed point, and the residual spread-H1 is the
 * explicit coordination cost of that cell. The local proof receipt is the built law:
 * no-arbitrage iff H1 = 0 iff coherent consensus.
 */
export declare function decideByMarket(membrane: readonly UtteranceCarrier[]): MarketSettledGovernance;
/** govern — the governance reading: read a society's Hohfeldian jural relations, the governance
 *  act thesis, and the discipline (kyriarchist/swarm/consensus) off an inter-agent membrane. */
export declare const governAction: Action;
/** decide-by-market - aggregate preferences, then settle each cell by no-arbitrage price consensus. */
export declare const decideByMarketAction: Action;
//# sourceMappingURL=govern.d.mts.map