/**
 * Formulas — the names of behaviours.
 *
 * In ludics, "a formula is the name of a behaviour, recovered as a coarsening
 * of the locative content rather than asserted as a prior given" (Girard 2001).
 * The slogan: rules of logic are an emergent stratum on top of the logic of
 * rules.  A formula here is therefore a named behaviour: a label paired with
 * the generating design-set whose bi-orthogonal closure is the behaviour it
 * names.
 */
import { type Design } from "../../index.mjs";
import { type BehaviourWitness } from "./behaviour.mjs";
export interface Formula {
    readonly kind: "game.formula";
    readonly name: string;
    readonly generators: readonly Design[];
}
export declare function formula(name: string, generators: readonly Design[]): Formula;
/** The behaviour a formula names, relative to a universe of designs. */
export declare function denotation(f: Formula, universe: readonly Design[]): BehaviourWitness;
/** Whether a design proves the formula — plays in the behaviour the formula names. */
export declare function proves(d: Design, f: Formula, universe: readonly Design[]): boolean;
export declare function isFormula(value: unknown): value is Formula;
//# sourceMappingURL=formula.d.mts.map