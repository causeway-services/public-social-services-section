/**
 * deciding — socializing's DECISION-RULE and META-GOVERNANCE capabilities: the modes by which a
 * collective settles a decision (consensus vs majority), the meta-stratification of governance
 * acts (Hart/Ostrom levels), the viability constraint (Ashby's requisite variety), and the
 * legitimacy bases of authority (Weber). These are the frame-neutral governing capabilities the
 * corpus catalogues; a polity chooses which to make primary, and the math carries each.
 *
 * Consumes relating's bilattice algebra (the truth-meet ∧_t is consensus itself); re-authors none.
 */
import { type ChargeValueName } from "@emsenn/relating";
/** The outcome of a collective decision rule over a populace's per-member alignment values. */
export interface Decision {
    /** the settled FOUR value of the decision. */
    readonly value: ChargeValueName;
    /** the decision SETTLED affirmatively (the rule fired). */
    readonly settled: boolean;
    /** members aligned FOR (`potential`). */
    readonly aligned: number;
    /** members in active DISSENT (`active`, f). */
    readonly dissent: number;
    /** members SILENT / unsettled (`absurd`, ⊥) — under consensus, silence is NOT consent. */
    readonly silent: number;
    /** members with CONTRADICTED alignment (`stable`, ⊤) — a breach of deliberative coherence. */
    readonly disputed: number;
}
/**
 * consensusClose — the consensus-governance decision rule (content/_archive
 * .../consensus-closure.md, the Haudenosaunee Grand Council pattern): the decision settles iff
 * EVERY member aligns affirmatively. Realized as the bilattice TRUTH MEET ∧_t over the alignment
 * values — NOT a cardinality count: it uses only the bilattice's primitive, so consensus is more
 * substrate-native than majority. Silence (⊥) blocks (⊥ ∧_t t = ⊥ — silence is not consent), active
 * dissent (f) blocks, and a contradicted alignment (⊤) registers as a coherence breach. The empty
 * populace settles vacuously (the ∧_t identity is t).
 */
export declare function consensusClose(alignments: readonly ChargeValueName[]): Decision;
/**
 * majorityClose — the majority-rule decision (the contrast capability): settles iff a strict
 * majority align FOR. Per consensus-closure.md this requires CARDINALITY reasoning (a count and an
 * n/2 threshold) — extra scaffolding the bilattice does not natively provide — and it COLLAPSES the
 * distinction between dissent and silence (both merely count as non-affirmative). Both rules are
 * admissible; they are cohomologically distinguishable (different settling paths to the same
 * decision). Silence here acquiesces (the structural difference from consensus).
 */
export declare function majorityClose(alignments: readonly ChargeValueName[]): Decision;
/** The Hart/Ostrom meta-stratification of governance acts — the level an act operates at. */
export declare const GOVERNANCE_LEVELS: readonly ["operational", "collective-choice", "constitutional"];
export type GovernanceLevel = typeof GOVERNANCE_LEVELS[number];
/**
 * governingLevel — the level whose acts REVISE a given level's apparatus (the stratification: a
 * level-(n+1) act effects becoming on level-n apparatus, so self-amendment lives one level up and
 * no infinite descent arises). Operational rules are revised by collective-choice acts;
 * collective-choice rules are revised by constitutional acts; the constitutional level is the top
 * (its own amendment is itself constitutional). Hart's primary/secondary-of-change/
 * secondary-of-recognition map onto the three.
 */
export declare function governingLevel(level: GovernanceLevel): GovernanceLevel;
/** Ashby's requisite-variety viability check over a governance. */
export interface RequisiteVariety {
    /** the variety (count of distinct acts) the controller can produce. */
    readonly controllerVariety: number;
    /** the variety of disturbances the environment can produce. */
    readonly disturbanceVariety: number;
    /** VIABLE iff controllerVariety ≥ disturbanceVariety (only variety can absorb variety). */
    readonly viable: boolean;
    /** the shortfall of controller variety below the disturbance variety (0 when viable). */
    readonly deficit: number;
}
/**
 * requisiteVariety — Ashby's Law (content/_archive .../what-is-the-theory-of-governance.md, the
 * requisite-variety constraint): for a governance to regulate an environment, the variety of its
 * acts must be at least the variety of disturbances. Only variety absorbs variety; a controller
 * with fewer distinct responses than the environment has disturbances cannot regulate it. This
 * selects the VIABLE subcategory of governances by a hard cardinality lower bound.
 */
export declare function requisiteVariety(controllerVariety: number, disturbanceVariety: number): RequisiteVariety;
/** Weber's three pure bases on which authority claims and receives legitimacy. */
export declare const AUTHORITY_BASES: readonly ["traditional", "charismatic", "rational-legal"];
export type AuthorityBasis = typeof AUTHORITY_BASES[number];
/**
 * routinize — Weber's routinization of charisma (content/_archive authority.md): charismatic
 * authority is structurally UNSTABLE and routinizes into a traditional or rational-legal basis;
 * traditional and rational-legal are already stable (they routinize to themselves). The reverse
 * (rational-legal → charismatic) is structurally hard and does not occur without rupture, so it is
 * not produced here. `toward` selects which stable basis charisma settles into (default rational-legal).
 */
export declare function routinize(basis: AuthorityBasis, toward?: "traditional" | "rational-legal"): AuthorityBasis;
//# sourceMappingURL=deciding.d.mts.map