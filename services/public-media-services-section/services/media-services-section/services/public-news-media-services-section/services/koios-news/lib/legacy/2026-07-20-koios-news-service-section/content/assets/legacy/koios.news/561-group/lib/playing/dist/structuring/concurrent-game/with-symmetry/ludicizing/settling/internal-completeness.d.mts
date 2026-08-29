/**
 * Internal completeness and the connectives on behaviours (Girard 2001 §15).
 *
 * The behaviour note (corpus, ludics/library/behaviour, "Theorem: internal
 * completeness (Girard 2001 §15)") proves that every behaviour
 * $\mathbf{B}$ has an *internal* presentation — a description of its designs
 * given purely in terms of the behaviour's own action-structure, *without*
 * reference to the external bi-orthogonal closure $(-)^{\perp\perp}$ or the dual
 * designs.  Its predication-fiber image (same note, "Corollary") is the lemma
 * that the closure-rule system $\mathcal{S}_\mathbf{B}$ is *presentation-
 * independent*: two equivalent presentations define the same closure operator,
 * hence the same behaviour.  Internal completeness says the internal and the
 * external presentations coincide: $\mathbf{B} = \mathbf{B}^{\perp\perp}$ is
 * presentation-independent.
 *
 * Operationally (this is the testable shadow): two generator-sets present the
 * *same* behaviour iff their bi-orthogonal closures are equal as design-sets.
 * That is the witness-side declaration that a behaviour is determined without
 * appeal to an external observer — exactly the cultural-ludic image-condition
 * (I1) "voluntary closure-system commitment" (behaviour note, final theorem).
 *
 * The linear-logic connectives (behaviour note, "Definition (Girard 2001 §7)")
 * lift from designs to behaviours and are realized HERE — every one reuses the
 * Galois machinery of `behaviour.mjs` (`orthogonalOf` / `biorthogonalClosure` /
 * `generatedBehaviour`), and `interact` of game-algebra as the synchronous
 * design-composition $\star$ (= the fiber-side fusion $\odot$ = the knowledge
 * join, behaviour note "Tensor"):
 *
 *   - negation   $\mathbf{B}^\perp$            = the orthogonal,
 *   - with       $\mathbf{B}_1 \mathbin{\&} \mathbf{B}_2$  = the meet (intersection of closed sets),
 *   - plus       $\mathbf{B}_1 \oplus \mathbf{B}_2$       = closure of the union (de Morgan dual of &),
 *   - tensor     $\mathbf{B}_1 \otimes \mathbf{B}_2$      = closure of $\{\mathfrak{D}_1 \star \mathfrak{D}_2\}$,
 *   - par        $\mathbf{B}_1 \invamp \mathbf{B}_2$      = $(\mathbf{B}_1^\perp \otimes \mathbf{B}_2^\perp)^\perp$,
 *   - lollipop   $\mathbf{B}_1 \multimap \mathbf{B}_2$    = $\mathbf{B}_1^\perp \invamp \mathbf{B}_2$.
 *
 * Nothing here reinvents the closure: each connective configures the existing
 * bi-orthogonal Galois closure, matching the behaviour note's slogan that
 * connectives "are well-defined on behaviours and produce behaviours."
 */
import { type Design } from "../../index.mjs";
import { type BehaviourWitness } from "./behaviour.mjs";
/**
 * Linear negation $\mathbf{B}^\perp$ (behaviour note, "Definition (Girard 2001
 * §7)", "Linear negation").  The orthogonal of the behaviour's carrier at the
 * dual base — reuses `orthogonalOf`, packaged as a first-class behaviour.
 */
export declare function negateBehaviour(carrier: readonly Design[], universe: readonly Design[]): BehaviourWitness;
/**
 * Additive conjunction $\mathbf{B}_1 \mathbin{\&} \mathbf{B}_2$ (behaviour note,
 * "Additive conjunction"): the meet in the behaviour lattice — the intersection
 * of the two carriers.  Meets are inherited from $\mathcal{P}(\mathrm{Des})$
 * (behaviour note, "Theorem: behaviours form a complete lattice"), so the
 * intersection of two closed sets is already closed and needs no re-closing.
 */
export declare function withBehaviour(b1: readonly Design[], b2: readonly Design[]): BehaviourWitness;
/**
 * Additive disjunction $\mathbf{B}_1 \oplus \mathbf{B}_2 := (\mathbf{B}_1^\perp
 * \mathbin{\&} \mathbf{B}_2^\perp)^\perp$ (behaviour note, "Additive
 * disjunction").  Joins in the behaviour lattice are the bi-orthogonal closure
 * of the union (same note, "the join is the bi-orthogonal closure of their
 * union"), which is exactly that de Morgan dual — so we close the union.
 */
export declare function plusBehaviour(b1: readonly Design[], b2: readonly Design[], universe: readonly Design[]): BehaviourWitness;
/**
 * Multiplicative conjunction $\mathbf{B}_1 \otimes \mathbf{B}_2$ (behaviour
 * note, "Tensor"): the bi-orthogonal closure of the designs $\mathfrak{D}_1
 * \star \mathfrak{D}_2$ where $\star$ is the synchronous design-composition.
 * By the corpus the composition $\star$ IS `interact` (the knowledge join =
 * the fiber-side fusion $\odot$, interaction note + behaviour note "Tensor").
 */
export declare function tensorBehaviour(b1: readonly Design[], b2: readonly Design[], universe: readonly Design[]): BehaviourWitness;
/**
 * Multiplicative disjunction $\mathbf{B}_1 \invamp \mathbf{B}_2 :=
 * (\mathbf{B}_1^\perp \otimes \mathbf{B}_2^\perp)^\perp$ (behaviour note,
 * "Par" — the de Morgan dual of tensor).
 */
export declare function parBehaviour(b1: readonly Design[], b2: readonly Design[], universe: readonly Design[]): BehaviourWitness;
/**
 * Linear implication $\mathbf{B}_1 \multimap \mathbf{B}_2 := \mathbf{B}_1^\perp
 * \invamp \mathbf{B}_2$ (behaviour note, "Linear implication", "Equivalently,
 * $\mathbf{B}_1^\perp \invamp \mathbf{B}_2$").
 */
export declare function lollipopBehaviour(b1: readonly Design[], b2: readonly Design[], universe: readonly Design[]): BehaviourWitness;
export interface InternalCompletenessWitness {
    readonly kind: "game.internal-completeness:witness";
    /** The common behaviour the two presentations name. */
    readonly carrier: readonly Design[];
}
export interface InternalCompletenessObstruction {
    readonly kind: "game.internal-completeness-obstruction";
    readonly closureLeft: readonly Design[];
    readonly closureRight: readonly Design[];
    /** A design in one closure but not the other — the presentation-dependence witness. */
    readonly differing: Design;
    readonly reason: string;
}
export type InternalCompletenessJudgment = InternalCompletenessWitness | InternalCompletenessObstruction;
/**
 * Internal completeness as presentation-independence (behaviour note,
 * "Corollary (predication-fiber image)"): two generator-sets present the *same*
 * behaviour iff their bi-orthogonal closures coincide.  This is the operational
 * form of "$\mathbf{B} = \mathbf{B}^{\perp\perp}$ is presentation-independent":
 * the behaviour is determined internally, without an external choice of
 * presentation.  Witness carries the common closed carrier; obstruction carries
 * a design that distinguishes the two closures.
 */
export declare function internalCompletenessJudgment(gens1: readonly Design[], gens2: readonly Design[], universe: readonly Design[]): InternalCompletenessJudgment;
/**
 * Whether two generator-sets present the same behaviour — the bi-orthogonal
 * closure is presentation-independent on them (internal completeness holds).
 */
export declare const presentsSameBehaviour: (gens1: readonly Design[], gens2: readonly Design[], universe: readonly Design[]) => boolean;
/**
 * Internal completeness for a single presentation: a generator-set is its own
 * behaviour's internal presentation iff closing it once is idempotent — the
 * standard $\mathbf{B}^{\perp\perp\perp\perp} = \mathbf{B}^{\perp\perp}$ fixed
 * point of the Galois closure (behaviour note, "Bi-orthogonal closure",
 * idempotence).  Always a witness; surfaced as a judgment for uniformity.
 */
export declare function internalCompleteness(gens: readonly Design[], universe: readonly Design[]): InternalCompletenessJudgment;
//# sourceMappingURL=internal-completeness.d.mts.map