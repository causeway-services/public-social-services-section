/**
 * The exponential as a closure operator — $!$ corresponds to bi-orthogonal
 * closure.
 *
 * In the ludics/behaviour reading carried by `@emsenn/game-topology`, behaviours
 * are the bi-orthogonal (perp-perp) closures of design-sets and the exponential
 * $!$ is realized as the closure operator: $!$ is idempotent, increasing, and
 * monotone — the defining laws of a closure on the lattice of behaviours, exactly
 * those satisfied by `biorthogonalClosure`. The corpus locates replicable
 * resources at the $!$-comonad ("ILL: replicable resources added via the $!$
 * comonad"); on the game side, promotion under $!$ is settling a design-set to
 * its bi-orthogonal behaviour.
 *
 * This module carries that correspondence AS DATA plus a JSDoc theorem. It does
 * not invoke `biorthogonalClosure` (which needs designs and a universe); it
 * exposes the named statement and `exponentialClosesTo`, a conceptual reference
 * to game-topology's closure, so downstream code can cite the identity without
 * recomputing it. Reduce/reuse/recycle: the closure already lives in
 * game-topology; we name it, we do not reimplement it.
 */
import { type Connective } from "./proposition.mjs";
/** The two closure laws the exponential is asserted to satisfy as an operator. */
export type ClosureLaw = "idempotent" | "increasing" | "monotone";
export declare const closureLaws: () => readonly ClosureLaw[];
/**
 * A typed statement of the exponential-as-closure correspondence. `exponential`
 * is the connective ($!$ or $?$); `closesVia` names the game-topology operator it
 * corresponds to; `laws` are the closure laws witnessed by that operator.
 */
export interface ExponentialClosureStatement {
    readonly kind: "game.logic.exponentialClosure.statement";
    readonly exponential: Connective;
    readonly closesVia: "biorthogonalClosure";
    readonly laws: readonly ClosureLaw[];
    readonly theorem: string;
}
/**
 * The exponential-as-closure statement for $!$ ("of course"): promotion under $!$
 * IS bi-orthogonal closure of a design-set to its behaviour.
 */
export declare function exponentialClosesTo(exponential?: Connective): ExponentialClosureStatement;
export declare function isExponentialClosureStatement(value: unknown): value is ExponentialClosureStatement;
//# sourceMappingURL=exponential.d.mts.map