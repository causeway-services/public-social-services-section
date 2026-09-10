import type { Design } from "./structuring/concurrent-game/with-symmetry/ludicizing/design.mjs";
import { type Discipline } from "./discipline.mjs";
/** The skillful-work quartet — the four closure-positions a skill's work can hold. */
export declare const SKILLFUL_WORK: readonly ["inquiry", "procedure", "derivation", "process"];
export type ClosurePosition = typeof SKILLFUL_WORK[number];
/** The nucleus a closure-position belongs to: σ (MEANING — inquiry/derivation) or Δ (EXECUTION —
 *  procedure/process). */
export declare function nucleus(position: ClosurePosition): "meaning" | "execution";
/** The phase a closure-position holds: `opening` (inquiry/procedure — the question/the method) or
 *  `settled` (derivation/process — the proof/the run). */
export declare function phase(position: ClosurePosition): "opening" | "settled";
/** A skill — a named, typed, reusable design with a closure-position in the skillful-work quartet. */
export interface Skill {
    readonly kind: "playing.skill";
    readonly name: string;
    /** the reusable strategy the skill deploys. */
    readonly design: Design;
    /** the skillful-work quartet position (σ/Δ nucleus × phase). */
    readonly closurePosition: ClosurePosition;
}
/** Constitute a skill from a name, its reusable design, and its closure-position. */
export declare function skill(name: string, design: Design, closurePosition: ClosurePosition): Skill;
/** The mastery of a skill within a discipline. */
export interface Mastery {
    readonly kind: "playing.mastery";
    /** the skill's design is MATERIAL in the discipline — incarnated, no ballast (no wasted commitment). */
    readonly material: boolean;
    /** the skill's design is ADMITTED — its play counts within the discipline's behaviour. */
    readonly admitted: boolean;
    /** MASTERED — material AND admitted: the skill is honed and counts in the practice. */
    readonly mastered: boolean;
}
/**
 * mastery — read whether a skill is mastered within a discipline: its design must be MATERIAL there
 * (equal to its own incarnation against the discipline's plays — no ballast, the hallmark of a honed
 * skill) and ADMITTED (lie in the discipline's behaviour — count as a play of the practice). This is the
 * substrate form of "becoming better = quiescence": a skill matures by going material, not by accreting.
 */
export declare function mastery(s: Skill, within: Discipline): Mastery;
/**
 * composes — whether two skills CHAIN: the output of one meets the input of the other at the cut (their
 * designs are orthogonal — the interaction converges to the Daimon). A skill repertoire is the graph of
 * which skills compose into which.
 */
export declare function composes(left: Skill, right: Skill): boolean;
//# sourceMappingURL=skill.d.mts.map