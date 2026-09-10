/**
 * proving — knowing's syntactic face: finding a proof (Curry–Howard–Lambek).
 *
 * To KNOW a proposition is to hold a PROOF — a term of its type in @emsenn/relating's
 * CHL.Tm calculus, where *terms ARE proofs* (CurryHowardLambekQuartet). `find` is proof
 * SEARCH / type inhabitation: given a proposition (a `Ty`) and hypotheses (a context of
 * `Ty`), search the →/×/unit fragment for a CHL-core term that inhabits it, and CERTIFY
 * the result with relating's `hasTy` — the trusted verification floor. A found proof is
 * trustworthy because it type-checks, not because the search is.
 *
 * This is the syntactic dual of ./closing (the semantic face: forming the concept =
 * computing the settling closure). Wurm's theorem — concept lattices are complete
 * semantics for the Lambek calculus — makes the two faces one structure. The proof terms
 * `find` searches are the very CHL.Tm IR relating proves and evaluates.
 */
import { type Ty, type Tm, type Action } from "@emsenn/relating";
/**
 * Search for a proof of `goal` under the de-Bruijn hypothesis context `ctx`, fuel-bounded
 * (proof search in the implication/product/unit fragment is decidable; the fuel guards the
 * backward-chaining recursion). Returns a CHL-core proof term, or null if none is found.
 * Right-invertible introductions are applied eagerly; an atomic goal is met by eliminating
 * a hypothesis (projecting pairs, applying functions whose arguments are themselves proved).
 */
export declare function inhabit(ctx: readonly Ty[], goal: Ty, fuel?: number): Tm | null;
/** A found proof, certified by relating's `hasTy`: knowing the proposition. */
export interface ProofWitness {
    readonly kind: "knowing.proving.proof:witness";
    readonly proposition: Ty;
    readonly context: readonly Ty[];
    readonly proof: Tm;
}
/** No proof found: the proposition is not known (in this context, within the search bound). */
export interface ProofObstruction {
    readonly kind: "knowing.proving.proof-obstruction";
    readonly proposition: Ty;
    readonly context: readonly Ty[];
}
/** The judgment a proof search returns. */
export type ProofJudgment = ProofWitness | ProofObstruction;
/** Find a proof of `goal` under `context`: search the CHL.Tm calculus, then CERTIFY the
 *  result with `hasTy`. A witness is returned only when the proof genuinely type-checks. */
export declare function find(goal: Ty, context?: readonly Ty[]): ProofJudgment;
/**
 * find — proof search: a proposition in, a hasTy-certified proof out (or an obstruction).
 * Knowing a proposition IS finding its proof (Curry–Howard). The dual semantic reading —
 * forming the concept — is ./closing; by Wurm they are one structure.
 */
export declare const findAction: Action;
/** A worked propositional tautology for documentation/tests: `A → A` proved by `λx.x`. */
export declare const identityProposition: Ty;
//# sourceMappingURL=index.d.mts.map