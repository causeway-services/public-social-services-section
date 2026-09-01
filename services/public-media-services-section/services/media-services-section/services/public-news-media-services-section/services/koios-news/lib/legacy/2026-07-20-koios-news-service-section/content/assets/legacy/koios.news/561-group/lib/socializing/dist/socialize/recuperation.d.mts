import type { Field } from "./field.mjs";
import type { Restoration } from "./office.mjs";
import type { JuralRelation } from "./govern.mjs";
/** A recorded settling trajectory — the monotone family (v_τ) of field stages across the gossip-merge
 *  rounds, the first-class temporal object the affective readings work over. */
export interface SettlingTrajectory {
    readonly kind: "socializing.settling-trajectory";
    /** the field at each settling stage; `stages[0]` is the input, `stages[κ]` the quiescent limit v∞. */
    readonly stages: readonly Field[];
    /** the settling depth κ — the number of rounds that changed the field (the closure ordinal). */
    readonly closureOrdinal: number;
}
/** Record the natural settling trajectory of a field (the monotone ∨_k gossip family). */
export declare function settlingTrajectory(field: Field): SettlingTrajectory;
/** Build a trajectory from an explicit sequence of field stages — e.g. a history that interleaves
 *  governance INTERVENTIONS between settling rounds (the case where recuperation can actually occur,
 *  since the natural settling alone is monotone and never discharges). */
export declare function trajectoryFromStages(stages: readonly Field[]): SettlingTrajectory;
/** The number of CONTESTED cells in a field: cells whose ∨_k aggregate over the observers' charges is
 *  ⊤ stable (told-both). The held-contradiction surface of the field at one stage. */
export declare function contestedCells(field: Field): number;
/** The affective-recuperation reading over a settling trajectory. */
export interface RecuperationIndex {
    readonly kind: "socializing.recuperation-index";
    /** the number of consecutive-stage transitions inspected. */
    readonly rounds: number;
    /** contestation removed by DISCHARGE (a ⊤-drop with membership intact — managed mood). */
    readonly discharged: number;
    /** contestation removed by ORGANIZATION (a ⊤-drop coincident with a membership drop — a secession/exit). */
    readonly organized: number;
    /** discharged / (discharged + organized) ∈ [0,1] — how much removed contestation was managed away
     *  rather than organized into exit. 0 when nothing was removed (e.g. a purely monotone natural settling). */
    readonly index: number;
    /** RECUPERATED: more contestation was discharged than organized — the affective exit is being closed. */
    readonly recuperated: boolean;
    /** the contested-cell count at the final stage. */
    readonly finalContested: number;
    /** FORCED CONVERGENCE (Result 3): the trajectory reached lower contestation than it began with, and
     *  did so chiefly by discharge — consensus achieved by affect-management, not by agreement. */
    readonly forcedConvergence: boolean;
}
/**
 * affectiveRecuperationIndex — measure, along a settling trajectory, the rate at which live contestation
 * (⊤) is DISCHARGED as managed mood versus ORGANIZED into exit. Because the natural settling is
 * ≤_k-monotone, every contestation drop is an anti-monotone intervention; a drop with membership intact
 * is a managed discharge, a drop coincident with a membership loss is an organized secession. A trajectory
 * whose contestation falls below its starting level chiefly by discharge is in forced convergence — the
 * note's Result 3, consensus reached by affect-management rather than agreement.
 */
export declare function affectiveRecuperationIndex(trajectory: SettlingTrajectory): RecuperationIndex;
/** The feedback-containment reading over a trajectory. */
export interface RecursiveGovernance {
    readonly kind: "socializing.recursive-governance";
    /** the number of CONTAINMENT events: a stage where contestation rose and a later stage discharged it
     *  back down (a disturbance absorbed by re-tuning rather than by structural change). */
    readonly absorptions: number;
    /** the system is a FEEDBACK CONTAINER: disturbances are met by discharge, returning it to quiet
     *  without structural change (contestation ends at or below where it began, driven by discharge). */
    readonly contained: boolean;
}
/**
 * recursiveGovernance — read whether a polity governs by CONTAINMENT: meeting each disturbance (a rise
 * in contestation) with a discharge that re-tunes the subjects back to quiet, rather than letting the
 * disturbance force a structural change. The cybernetic feedback loop as governance — the mechanism that
 * keeps a system in a bounded, coordination-free regime by absorbing exactly the excess that would
 * otherwise keep it alive and unsettled.
 */
export declare function recursiveGovernance(trajectory: SettlingTrajectory): RecursiveGovernance;
/** The harm-governance reading over a restoration and the surrounding field. */
export interface HarmGovernance {
    readonly kind: "socializing.harm-governance";
    /** the response is reparative (the restoration aims at reintegration). */
    readonly reparative: boolean;
    /** the offender is ALSO subjected to a held surveillance/pre-emptive power — care turned to control. */
    readonly surveillance: boolean;
    /** the mode: `reparative` (care) or `risk-management` (care curdled into surveillance/pre-emption). */
    readonly mode: "reparative" | "risk-management";
}
/**
 * harmGovernance — detect care curdling into risk-management. A restoration is reparative by construction
 * (it aims at reintegration, not punishment); it becomes harm-governance when the same offender is also
 * placed under a held surveillance/pre-emptive power — the reparative gesture shadowed by control, the
 * worked example of californication's inversion of care.
 */
export declare function harmGovernance(restoration: Restoration, relations: readonly JuralRelation[]): HarmGovernance;
//# sourceMappingURL=recuperation.d.mts.map