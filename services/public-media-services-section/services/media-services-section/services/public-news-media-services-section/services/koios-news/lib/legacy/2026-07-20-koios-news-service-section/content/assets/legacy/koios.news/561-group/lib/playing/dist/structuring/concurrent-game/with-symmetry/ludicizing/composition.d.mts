/**
 * Composition — the REAL ludics cut / Hyland–Ong strategy composition at the
 * chronicle/play grain, and the copycat **Fax** identity, making behaviours a
 * genuine category (objects = behaviours, morphisms = designs `A ⊸ B`,
 * composition = `cut`, identity = `fax`).
 *
 * ## Why the shadow cut is not the category, and what fixes it
 *
 * `proving/computational-ludics.mts::cut` = `interact` (pointwise
 * `joinKnowledgeValue` over the UNION of supports) gated by convergence. That is
 * a *closure operator on valuations*, not a categorical composition:
 *
 *   1. **No hiding.** `interact` keeps the union of both supports, so
 *      `cut(Fax_B, d)` carries Fax's interface loci `d` never had — it cannot
 *      equal `d`. Categorical composition must HIDE the cut interface B.
 *   2. **Symmetric join is not directed copy.** `joinKnowledgeValue` is
 *      commutative/idempotent; it cannot *transport* an Opponent move on one
 *      address to a Player move on a dual address — the copy the identity needs.
 *
 * The note `2026-06-21-playing-as-star-autonomous-interaction.md` (§"honest
 * boundary", finding #1) states this and defers the real engine. THIS MODULE is
 * that engine. The minimal extra structure the law required:
 *
 *   (a) a **cut-interface address convention** (`DOMAIN_SIDE` = `0·…` = the A
 *       side of `A ⊸ B`, `CODOMAIN_SIDE` = `1·…` = the B side) — purely a
 *       `delocate` convention, no new primitive;
 *   (b) a **chronicle-level normalization that runs the dispute on the shared B,
 *       TRANSPORTS the copy across it, and DELETES the interface actions** from
 *       the surviving plays. The corpus license for hiding-at-an-interface is
 *       `federation-is-parallel-composition.md`: composition over a shared
 *       sub-arena = parallel composition followed by a closure that forgets the
 *       shared interface.
 *
 * No law is weakened. The shadow cut stays the orthogonality / normal-form
 * engine (CLAUDE.md: normalization is capability-preserving — the closure
 * capability stays live, the category capability is added beside it).
 */
import { type Action, type Chronicle, type Design, type Locus } from "../../index.mjs";
/**
 * The A side (domain) of a composable design `A ⊸ B` — addresses delocated under
 * `0·…`. The B side (codomain) lives under `1·1·…` (`CODOMAIN_SIDE`).
 *
 * The two prefixes have DIFFERENT lengths, and that is load-bearing. Locus
 * parity is depth parity (`parityPolarity`: even depth = positive, odd =
 * negative). In a linear arrow `A ⊸ B` the domain is `A^⊥` — polarity-reversed —
 * while the codomain is B as-is. For a copycat `Fax_B : B ⊸ B` (= `B^⊥ ⅋ B`) the
 * domain copy therefore carries the POLARITY-DUAL of each B-move and the codomain
 * copy carries it as-is. To stay coherent (polarity = locus parity) each side's
 * prefix must restore that:
 *   • codomain prefix `1·1·…` is EVEN-length ⇒ preserves parity ⇒ as-is content
 *     is coherent;
 *   • domain prefix `0·…` is ODD-length ⇒ flips parity ⇒ the dual content is
 *     coherent.
 * Both are disjoint sub-addresses (head `0` vs `1`), exactly as `superpose`
 * requires — still purely a `delocate` convention, no new primitive.
 */
export declare const DOMAIN_SIDE: Locus;
/** The B side (codomain) of a composable design `A ⊸ B` — addresses delocated under `1·1·…`. */
export declare const CODOMAIN_SIDE: Locus;
/**
 * Restrict a design to the loci under a side prefix, then strip the prefix (the
 * inverse of `delocate(d, side)`): `incarnation.mts::restrictTo` followed by
 * dropping the leading address components. The empty prefix is the identity.
 */
export declare function project(d: Design, side: Locus): Design;
/** The cut interface between `f:A⊸B` and `g:B⊸C`: f's B (codomain side) and g's B (domain side), both side-less. */
export declare function cutInterface(f: Design, g: Design): {
    readonly fB: Design;
    readonly gB: Design;
};
export interface PlayStep {
    readonly kind: "game.composition.play-step";
    readonly action: Action;
    /** True iff this step occurred on the cut interface B (omitted from `visible`). */
    readonly hidden: boolean;
}
export interface ComposedPlay {
    readonly kind: "game.composition.play";
    /** The surviving chronicle — B hidden; A re-addressed to `0·…`, C transported to `1·…`. */
    readonly visible: Chronicle;
    /** The full trace including hidden B-moves (witness data). */
    readonly internal: readonly PlayStep[];
    /** The B-dispute reached a Daimon (the cut is defined on this play). */
    readonly converged: boolean;
}
/**
 * The converging composed plays of `f:A⊸B` and `g:B⊸C` — one per
 * (chronicle of f, chronicle of g) pair whose B-dispute converges. f's B is its
 * codomain side (`1·…`), g's B its domain side (`0·…`); they are matched by
 * stripped B-address and required dual per shared B-locus (non-dual ⇒ the pair is
 * stuck and discarded — that is the cut's partiality). The dispute converges at a
 * Daimon collision on B. The visible play keeps f's A side (`0·…`), TRANSPORTS
 * g's C side (`1·…`), and HIDES every B-move.
 */
export declare function composeChronicles(f: Design, g: Design): readonly ComposedPlay[];
/**
 * The REAL cut / HO-composition of `f:A⊸B` and `g:B⊸C` — a design `A⊸C`.
 * Composition is the dispute on the shared interface B, hidden; the surviving
 * A/C plays are reassembled (a design IS the union of its chronicles). Partial:
 * the empty design when no play converges. `f`'s codomain side and `g`'s domain
 * side must be the same behaviour B with DUAL polarities; §2 checks this per
 * B-locus and discards non-dual pairs, so a mismatched B yields no composition.
 *
 * SUPERSEDES `proving/computational-ludics::cut` as the categorical composition;
 * that symmetric-join cut remains the orthogonality / normal-form engine.
 */
export declare function cut(f: Design, g: Design): Design;
/**
 * The copycat identity `Fax_B : B ⊸ B`. For each interface locus ξ of B, Fax
 * mirrors the move across its two B-copies: the codomain copy `1·1·ξ` carries the
 * move as-is, the domain copy `0·0·ξ` carries its polarity-dual, both with the
 * SAME ramification (η-expansion — the whole subtree is copied). Both side
 * prefixes are even-length, so the copies land with their original polarity and
 * the design is coherent (checked by `isCoherentFax`). When `cut(fax_B, d)` runs
 * the §3 dispute, d's moves find their dual echo in Fax, the B-dispute converges,
 * and the surviving visible play is d re-emitted on the codomain copy — interface
 * hidden, copy verbatim.
 */
export declare function fax(b: readonly Design[], universe: readonly Design[]): Design;
/** Observational equality `d ≃ e`: equal as material designs (`designLeq` both ways). */
export declare function observationallyEqual(d: Design, e: Design): boolean;
export interface IdentityLawWitness {
    readonly kind: "game.composition.identity:witness";
    readonly side: "left" | "right";
}
export interface IdentityLawObstruction {
    readonly kind: "game.composition.identity-obstruction";
    readonly side: "left" | "right";
    readonly member: Design;
    readonly composite: Design;
    readonly reason: string;
}
export type IdentityLawJudgment = IdentityLawWitness | IdentityLawObstruction;
/**
 * Left identity `cut(Fax_B, d) ≃ d` for each material member `d ∈ B`. The member
 * is presented as its counter-play `d^⊥` on Fax's domain interface (`0·…`); cut
 * glues Fax's codomain B (`1·1·…`) to it, the dispute converges, TRANSPORTS the
 * copy (dualized back) onto the codomain side, hides the interface, and the
 * codomain projection recovers d on its own (side-less) addresses.
 */
export declare function leftIdentityJudgment(b: readonly Design[], universe: readonly Design[]): IdentityLawJudgment;
/**
 * Right identity `cut(d, Fax_B) ≃ d`. The member is presented on the domain side
 * (`0·…`) as a B-valued play (`d : B ⊸ 1`); cut against Fax (`g`) transports the
 * copy onto the codomain side, recovering d.
 */
export declare function rightIdentityJudgment(b: readonly Design[], universe: readonly Design[]): IdentityLawJudgment;
export interface AssociativityWitness {
    readonly kind: "game.composition.associativity:witness";
    readonly composite: Design;
}
export interface AssociativityObstruction {
    readonly kind: "game.composition.associativity-obstruction";
    readonly left: Design;
    readonly right: Design;
    readonly reason: string;
}
export type AssociativityJudgment = AssociativityWitness | AssociativityObstruction;
/**
 * Associativity `cut(cut(f,g),h) ≃ cut(f, cut(g,h))`. Holds because hiding is
 * confluent: each cut deletes one interface, and the disputes on disjoint
 * sub-addresses (0/1-side disjointness = `delocation.mts::superpose`'s
 * disjoint-prefix non-collision) are order-independent.
 */
export declare function associativityJudgment(f: Design, g: Design, h: Design): AssociativityJudgment;
export declare const isLeftIdentity: (b: readonly Design[], universe: readonly Design[]) => boolean;
export declare const isRightIdentity: (b: readonly Design[], universe: readonly Design[]) => boolean;
export declare const isAssociative: (f: Design, g: Design, h: Design) => boolean;
/** Whether the built `Fax_B` is a coherent design (the η-expanded copycat must be). */
export declare const isCoherentFax: (b: readonly Design[], universe: readonly Design[]) => boolean;
//# sourceMappingURL=composition.d.mts.map