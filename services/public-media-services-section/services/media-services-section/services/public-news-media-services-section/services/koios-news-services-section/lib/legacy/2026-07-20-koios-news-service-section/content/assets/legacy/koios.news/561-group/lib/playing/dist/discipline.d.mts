import type { Design } from "./structuring/concurrent-game/with-symmetry/ludicizing/design.mjs";
/** A membership key for a design — its committed loci and charges, order-independent. */
export declare const designKey: (d: Design) => string;
/** A discipline — a named practice, realized as a behaviour over a universe of plays. */
export interface Discipline {
    readonly kind: "playing.discipline";
    /** the practice's name (the working domain). */
    readonly name: string;
    /** the behaviour B = generators^⊥⊥ — the plays that count in the practice. */
    readonly behaviour: readonly Design[];
    /** the size of the behaviour. */
    readonly size: number;
    /** the exemplary plays the practice is generated from (kept so mastery can read incarnation against it). */
    readonly generators: readonly Design[];
    /** the ambient universe the closure is taken within. */
    readonly universe: readonly Design[];
}
/**
 * discipline — constitute a named practice as the bi-orthogonal closure of its exemplary plays: the
 * magic-circle'd set of plays that count within it. `generators` are the practice's exemplars;
 * `universe` is the ambient design set.
 */
export declare function discipline(name: string, generators: readonly Design[], universe: readonly Design[]): Discipline;
/** Whether a design is admitted to the discipline — its play counts within the practice (it lies in the
 *  behaviour). The ludic form of "this character practices this discipline". */
export declare function admits(d: Discipline, design: Design): boolean;
//# sourceMappingURL=discipline.d.mts.map