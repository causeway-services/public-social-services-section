/**
 * integrity — the STRUCTURAL-cluster detectors of the californication note (§9, structural battery):
 * the audits that watch the EXIT and the coagulation of power. Per the note's Proposition 2 these are
 * INDEPENDENT of the affective battery and must be kept distinct — a polity can pass every audit here
 * and still be californicated. Nothing in this module reads the affective register; that is the point.
 *
 *   coagulationGuard  — the dual of the kyriarchy detector: flag an EMERGING dominator (before full
 *                       capture) and name the Clastrean antidotes (rotate / strip-power / secede / refuse).
 *   foreclosureWatch  — structural foreclosure: the coalition lattice loses its BOTTOM (the
 *                       belong-to-nothing standpoint) exactly when one agent holds EVERY capability;
 *                       then there is no position from which to refuse.
 *   racketIndex       — Camatte's organization-as-racket: self-amendment acts (collective-choice +
 *                       constitutional) outweighing mission acts (operational).
 *   vitalityReading   — non-convergence-as-vitality: distinguish a CALCIFIED polity (converged,
 *                       concentrated, exit closed) from a LIVE one (exit open, decentralized, or
 *                       perpetually unsettled).
 *   secede            — fission as a first-class healthy move: a bloc withdraws into its own Social
 *                       Field carrying its meme stalk (Clastres' fission, Hirschman's exit, omníčiye
 *                       consensus-by-withdrawal).
 *
 * Consumes the jural relations of ./govern.mts, the work-carrier levels of ./deciding.mts, the FCA
 * holdings of ./coalition.mts, and the Social Field of ./field.mts; re-derives none of them.
 */
import type { JuralRelation } from "./govern.mjs";
import type { GovernanceLevel } from "./deciding.mjs";
import type { CapabilityHolding } from "./coalition.mjs";
import type { Regime } from "./regime.mjs";
import { type Field } from "./field.mjs";
/** A watch for an emerging dominator and the antidotes that would break it before capture completes. */
export interface CoagulationGuard {
    readonly kind: "socializing.coagulation-guard";
    /** the agent with the largest dominion (distinct parties it holds power over), or "" if none. */
    readonly dominator: string;
    /** that agent's dominion — the count of distinct parties it holds power over. */
    readonly dominion: number;
    /** dominion / (|agents|−1) ∈ [0,1] — the share of the others one holder commands. */
    readonly concentration: number;
    /** the number of agents in the field. */
    readonly observers: number;
    /** power is COAGULATING: a single holder commands a strict majority of the others. */
    readonly coagulating: boolean;
    /** the structural antidotes that apply while coagulating (empty otherwise). */
    readonly antidotes: readonly string[];
}
/**
 * coagulationGuard — the dual of the kyriarchy classifier: rather than label a finished kyriarchy, it
 * flags power BEGINNING to coalesce (a holder commanding a strict majority of the others) and names the
 * Clastrean antidotes — rotate the dominator's offices, convert it to a Clastrean office (strip the
 * power, keep the duty), secede, or refuse the binding. The affirmative instrument of a
 * society-against-the-state.
 */
export declare function coagulationGuard(relations: readonly JuralRelation[]): CoagulationGuard;
/** A watch for whether the polity still has a standpoint of refusal (the coalition lattice's bottom). */
export interface ForeclosureWatch {
    readonly kind: "socializing.foreclosure-watch";
    readonly agents: number;
    readonly capabilities: number;
    /** the agent holding EVERY capability, if any — the monopolist that abolishes the belong-to-nothing
     *  standpoint (the FCA bottom concept acquires a non-empty extent). */
    readonly monopolist: string | null;
    /** the coalition lattice retains its BOTTOM — a position of belonging-to-nothing from which to refuse. */
    readonly exitBottomPresent: boolean;
    /** the exit is STRUCTURALLY foreclosed (a monopolist holds all capabilities; no standpoint of refusal).
     *  NOTE: this sees only STRUCTURAL foreclosure — affective foreclosure is invisible here by construction. */
    readonly foreclosed: boolean;
}
/**
 * foreclosureWatch — structural foreclosure of the exit. The coalition lattice keeps its bottom (the
 * belong-to-nothing standpoint from which a bloc may refuse) exactly while no single agent holds every
 * capability; a monopolist over all capabilities collapses that bottom into themselves, leaving no
 * position outside all mandates. This is only HALF the audit: the note's Proposition 2 shows the exit
 * can be affectively foreclosed while structurally wide open, and that half lives in the affective cluster.
 */
export declare function foreclosureWatch(holdings: readonly CapabilityHolding[]): ForeclosureWatch;
/** The racket reading over a governance's acts, classified by the level each operates at. */
export interface RacketIndex {
    readonly kind: "socializing.racket-index";
    readonly operational: number;
    readonly collectiveChoice: number;
    readonly constitutional: number;
    /** self-referential (apparatus-amending) acts = collective-choice + constitutional. */
    readonly selfReferential: number;
    readonly total: number;
    /** selfReferential / total ∈ [0,1] — how much of the organization's activity is about itself. */
    readonly ratio: number;
    /** the organization has become a RACKET: it spends more acts amending its own apparatus than on its
     *  mission (selfReferential > operational). */
    readonly racket: boolean;
}
/**
 * racketIndex — Camatte's organization-as-racket made measurable: classify a governance's acts by the
 * Hart/Ostrom level each operates at and compare apparatus-amending acts (collective-choice +
 * constitutional) against mission acts (operational). When the former outweigh the latter, the
 * organization has begun to exist for itself.
 */
export declare function racketIndex(actLevels: readonly GovernanceLevel[]): RacketIndex;
/** Whether a polity is alive (open, decentralized, or perpetually unsettled) or calcified. */
export interface VitalityReading {
    readonly kind: "socializing.vitality";
    readonly regime: Regime;
    readonly concentration: number;
    readonly exitOpen: boolean;
    /** the process is NON-CONVERGENT (transfinite-bounded or aperiodic) — perpetually unsettled. */
    readonly nonConvergent: boolean;
    /** the verdict: `alive` (exit open AND either non-convergent or decentralized), `calcified`
     *  (converged AND concentrated AND exit closed), or `settling` (in between). */
    readonly verdict: "alive" | "calcified" | "settling";
}
/**
 * vitalityReading — read whether a polity is alive or calcified, treating non-convergence as health.
 * A polity is `alive` when its exit is open and it is either perpetually unsettled (the aperiodic /
 * transfinite regime that never finishes becoming the defended Existent) or genuinely decentralized;
 * `calcified` when it has converged, concentrated power, AND closed the exit — the finished order the
 * next generation must take a hammer to. Composes the regime (from governanceConvergence), a
 * concentration measure (from coagulationGuard), and an exit flag (from foreclosureWatch).
 */
export declare function vitalityReading(regime: Regime, concentration: number, exitOpen: boolean): VitalityReading;
/** The result of a secession: the two Social Fields the original splits into, each carrying its members'
 *  stalks intact. */
export interface Secession {
    readonly kind: "socializing.secession";
    /** the field of the members who remained. */
    readonly remained: Field;
    /** the field of the members who seceded — their own observer category, their memes carried with them. */
    readonly seceded: Field;
}
/**
 * secede — fission as a FIRST-CLASS healthy operation, not a failure: the named agents withdraw from a
 * Social Field into their OWN field, carrying their meme stalk with them, and the remainder re-forms
 * without them. Each side gets a fresh, maximally-connected observer category over its own members and
 * an ungrounded section to be re-converged. The constructive counterpart to `refuse` (deny a binding) —
 * here you leave the polity entirely. The real "leave" arrow at the bottom of the coalition lattice.
 */
export declare function secede(field: Field, secedingNames: readonly string[]): Secession;
//# sourceMappingURL=integrity.d.mts.map