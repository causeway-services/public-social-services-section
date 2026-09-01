/**
 * cognizing/expressing — CHL terms for the meme-comonad cognizing morphisms.
 *
 * These terms express knowing's five pure meme→meme cognizing morphisms in
 * Relation Model Notation, using the RMN grammar and JSON bridge from
 * `@emsenn/relating`. No knowing-specific term primitive is introduced here —
 * every construction is a composition of the product, fold, conditional,
 * coincidence, and bilattice-charge constructors already in the evaluator.
 */
import { type Tm } from "@emsenn/relating";
/**
 * cognize: identity on the meme carrier.
 * joinKnowledge(c, c) = c (idempotent join) — the epsilon of the comonad is id.
 */
export declare const cognizerCognize: Tm;
/**
 * forget: reset the meme's charge to the ≤_k bottom (absurd), cell preserved.
 */
export declare const cognizerForget: Tm;
/**
 * doubt: the dual-comonad descent Cl* — descend ≤_k one step.
 * stable (both present) → potential (preserve truth evidence); all else → absurd.
 */
export declare const cognizerDoubt: Tm;
/**
 * reflect: the comonad comultiplication (delta) — convergent reflexive orbit.
 * Nests the prior meme as the cell's object via token(mark(prior)); charge preserved.
 */
export declare const cognizerReflect: Tm;
/**
 * ruminate: the divergent reflexive orbit — settling that fails to settle.
 * Prior meme as BOTH subject and object; charge reset to witnessed-potential on each pass.
 */
export declare const cognizerRuminate: Tm;
export declare const cognizingTerms: Readonly<{
    readonly cognize: Tm;
    readonly forget: Tm;
    readonly doubt: Tm;
    readonly reflect: Tm;
    readonly ruminate: Tm;
}>;
//# sourceMappingURL=expressing.d.mts.map