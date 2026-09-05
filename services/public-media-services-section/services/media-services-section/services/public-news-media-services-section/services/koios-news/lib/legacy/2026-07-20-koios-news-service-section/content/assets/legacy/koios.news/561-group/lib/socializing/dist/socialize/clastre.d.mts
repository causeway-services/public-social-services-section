/**
 * clastre — the SAVIOR–SLAVE / CLASTREAN dual (Result 1 of the californication note,
 * dev/docs/notes/2026-06-25-californication-as-a-governance-configuration.md).
 *
 * Pierre Clastres (Society Against the State, 1974) described offices engineered so coercive power
 * never separates out: prestige, oratorical duty, obligation of generosity — and NO command (the chief
 * who orders is ignored). A CLASTREAN office is duty-without-power as LIBERATION. Californication's
 * savior–slave subject has the SAME jural shape — total duty, no power — as DOMINATION. The whole
 * difference is one quantifier over the rest of the field: whether the correlative power is held
 * elsewhere.
 *
 *   Proposition 1. An agent bearing a duty over scope X with no power over X is
 *     - CLASTREAN     iff NO agent holds the power over X (the duty answers to no coercive capacity); or
 *     - SAVIOR–SLAVE  iff SOME OTHER agent holds the power over X (answerable for what it cannot control).
 *
 * Inspecting the agent alone cannot tell these apart — both are duty, no power. Only a search of the
 * field for the rehomed power distinguishes them. This consumes the jural substrate of ./govern.mts and
 * the office constructor of ./office.mts; it re-derives nothing.
 */
import { type DeonticEntry, type Office } from "./office.mjs";
import type { JuralRelation } from "./govern.mjs";
/** The valence of an agent's standing over a scope, per Proposition 1. */
export type DutyPowerValence = "empowered" | "clastrean" | "savior-slave" | "none";
/** The Result-1 reading: how an agent's duty/power over a scope is configured, and (if duty-without-power)
 *  whether it is the liberatory Clastrean form or the californicated savior–slave trap. */
export interface ValenceReading {
    readonly kind: "socializing.duty-power-valence";
    readonly agent: string;
    readonly scope: string;
    /** the classification: `empowered` (holds the power), `clastrean` (duty, and no one holds the power),
     *  `savior-slave` (duty, but another agent holds the power), `none` (bears no duty over the scope). */
    readonly valence: DutyPowerValence;
    /** the agent bears a held duty over the scope. */
    readonly bearsDuty: boolean;
    /** the agent holds a held power over the scope. */
    readonly holdsPower: boolean;
    /** some OTHER agent holds a held power over the scope — the rehomed coercive capacity. */
    readonly powerElsewhere: boolean;
}
/**
 * dutyPowerValence — classify an agent's configuration over a scope (Proposition 1). The savior–slave
 * verdict requires the field-wide search the proposition demands: it is `savior-slave` exactly when the
 * agent carries the duty-shaped half of an office while the power-shaped half is held by someone else,
 * and `clastrean` when that power is held by no one at all.
 */
export declare function dutyPowerValence(relations: readonly JuralRelation[], agent: string, scope: string): ValenceReading;
/**
 * clastreanOffice — construct an office that is all prestige, duty, privilege, and immunity and carries
 * NO coercive power (the Clastrean form: authority that cannot command). Rejects any `power`-kind entry:
 * a Clastrean office with a power is a contradiction in terms. The resulting incumbent, by Proposition 1,
 * is `clastrean` over its scopes precisely as long as no one else in the field holds the matching power —
 * which is the standing condition a `coagulationGuard` (forthcoming) would watch.
 */
export declare function clastreanOffice(name: string, profile: readonly DeonticEntry[]): Office;
/** A (agent, scope) duty classified as a savior–slave trap. */
export interface SaviorSlaveTrap {
    readonly agent: string;
    readonly scope: string;
}
/** A field-wide census of duty-without-power configurations — the structural, non-temporal sweep of
 *  Proposition 1 across every held duty. */
export interface SaviorSlaveCensus {
    readonly kind: "socializing.savior-slave-census";
    /** the number of held duties surveyed. */
    readonly duties: number;
    /** duties whose power is rehomed elsewhere — savior–slave traps. */
    readonly saviorSlave: number;
    /** duties whose power exists nowhere — Clastrean (liberatory). */
    readonly clastrean: number;
    /** duties whose bearer also holds the power. */
    readonly empowered: number;
    /** the located traps, by (agent, scope). */
    readonly traps: readonly SaviorSlaveTrap[];
}
/**
 * saviorSlaveCensus — sweep every held duty in the field and classify it by Proposition 1, counting
 * the savior–slave traps (answerable-without-power-while-power-is-held-elsewhere), the Clastrean duties
 * (answerable where no power exists), and the empowered. The structural half of the californication
 * audit's Result-1 reading — it needs no temporal data because the valence is a fact about the current
 * field, not about a process over time.
 */
export declare function saviorSlaveCensus(relations: readonly JuralRelation[]): SaviorSlaveCensus;
//# sourceMappingURL=clastre.d.mts.map