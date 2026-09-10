/**
 * Chronicles — Girard 2001 §4.7 plays-along-one-branch of a design.
 *
 * The chronicle note (corpus, ludics/chronicle, "Definition (Girard 2001
 * §4.7)") defines a **chronicle** of a design as a maximal alternating,
 * justified sequence of actions along one unit-step strict $\preceq$-chain of
 * loci — one *branch* of the design's play, equivalently one focused path, and
 * (Faggian–Hyland 2002) one Hyland–Ong *play*.  A design is the union of its
 * chronicles; its chronicle-tree's root-to-leaf paths ARE its chronicles.
 *
 * We read chronicles off the EXISTING valuation `Design` of `design.mjs` (no
 * new design datatype).  By the action note's uniqueness theorem ("the
 * action-realization of a design's partial valuation is unique") the actions of
 * a `Design` are determined: at each supported locus $\xi$ the variety is
 * `charge → type` and the ramification is $I = \{\,i : \xi \cdot i \in
 * \mathrm{support}\,\}$.  Justification/visibility reuse the locus `prefixes`
 * order; the `Design` stores no base locus, so roots are the $\sqsubseteq$-
 * minimal support loci.
 *
 * The validity judgment realizes the four chronicle conditions (Ch1)–(Ch4):
 * unit-step child chain, polarity alternation, ramification respect, and
 * maximality (end at a Daimon or at an empty ramification).
 */
import { type Action } from "./action.mjs";
import { type Locus } from "./locus.mjs";
import { type Design } from "./design.mjs";
/** A chronicle — an ordered sequence of actions along one $\preceq$-chain. */
export interface Chronicle {
    readonly kind: "game.chronicle";
    readonly actions: readonly Action[];
}
export declare function chronicle(actions?: readonly Action[]): Chronicle;
export declare function isChronicle(value: unknown): value is Chronicle;
/**
 * The action realized at a locus by a design (action note, uniqueness theorem),
 * or `null` if the locus is outside the support ($\bot$ = no action).  The
 * ramification is the set of immediate children the design also supports.
 */
export declare function designAction(d: Design, xi: Locus): Action | null;
/**
 * The set of actions of a design — its support, read as actions (action note,
 * uniqueness theorem).  Each supported locus contributes exactly one action.
 */
export declare function designActions(d: Design): readonly Action[];
/**
 * The base loci of a design — the $\sqsubseteq$-minimal support loci (the
 * `Design` carrier stores no base locus, so we derive the roots of its
 * chronicle-forest).
 */
export declare function designRoots(d: Design): readonly Locus[];
/**
 * The chronicles of a design (chronicle note, "Lemma. The chronicle-tree of
 * $\mathfrak{D}$ has its set of root-to-leaf paths in bijection with
 * $\mathrm{Chr}(\mathfrak{D})$").  Walks each root-to-leaf path of the
 * design's chronicle-forest, following the ramification opened at each step.
 */
export declare function designChronicles(d: Design): readonly Chronicle[];
export interface ChronicleWitness {
    readonly kind: "game.chronicle.valid:witness";
    readonly chronicle: Chronicle;
}
export interface ChronicleObstruction {
    readonly kind: "game.chronicle.valid-obstruction";
    readonly chronicle: Chronicle;
    readonly reason: string;
}
export type ChronicleJudgment = ChronicleWitness | ChronicleObstruction;
/**
 * Witness/obstruction for chronicle validity (chronicle note, "Definition
 * (Girard 2001 §4.7)"):
 *   (Ch1) unit-step strict $\preceq$-chain (each next locus an immediate child);
 *   (Ch2) polarity strictly alternates;
 *   (Ch3) ramification respect — next index lies in the previous ramification;
 *   (Ch4) maximality — ends at a Daimon or at an empty ramification (a leaf).
 * Linearity is automatic: a chronicle visits each locus once along its chain.
 */
export declare function chronicleJudgment(c: Chronicle): ChronicleJudgment;
export declare const isValidChronicle: (c: Chronicle) => boolean;
/**
 * Assemble a `Design` from a set of actions (chronicle note, "a design is the
 * union of its chronicles"; design note, the backward map of the realization
 * bijection).  This RETURNS the existing valuation `Design` — it does not
 * introduce a new carrier; the action variety at each locus becomes that
 * locus's `DesignAct` charge.  Distinct named to avoid shadowing the existing
 * `designFromActs`.
 */
export declare function designFromActionSet(actions: readonly Action[]): Design;
/** Round-trip helper: rebuild a `Design` from a single chronicle's actions. */
export declare const designFromChronicle: (c: Chronicle) => Design;
export interface DesignCoherenceWitness {
    readonly kind: "game.design.coherence:witness";
    readonly design: Design;
}
export interface DesignCoherenceObstruction {
    readonly kind: "game.design.coherence-obstruction";
    readonly design: Design;
    /** Which of the four conditions failed: alternation / linearity / focusing / rootedness. */
    readonly condition: "alternation" | "linearity" | "focusing" | "rootedness";
    readonly reason: string;
}
export type DesignCoherenceJudgment = DesignCoherenceWitness | DesignCoherenceObstruction;
/**
 * Witness/obstruction for the four Girard design coherence conditions
 * (design note, "Definition (Girard 2001 §4.3)", (C1)–(C4)):
 *
 *   (C1) **Alternation** — actions strictly alternate polarity along each
 *        $\preceq$-chain; equivalently each action's polarity respects its
 *        locus parity (a Belnap-class chain $t \to f \to t \to \cdots$).
 *   (C2) **Linearity** — each locus carries at most one action (automatic for
 *        the valuation `Design`, since `designCharge` is a function — checked
 *        here for completeness).
 *   (C3) **Focusing** — once a positive action opens children at $\xi^+$, those
 *        children carry actions; a positive action's ramification is realized
 *        (no opened-but-empty child branches that strand the focus).
 *   (C4) **Rootedness** — the design's $\sqsubseteq$-minimal support locus
 *        carries an action (the support is non-empty and has a unique root, or
 *        every root is itself a committed action).
 *
 * Because `designChronicles` builds root-to-leaf paths from a coherent design,
 * the invariant "every chronicle of a coherent design is valid" is self-
 * policing: feed a `coherence:witness` design and every `designChronicles`
 * output passes `chronicleJudgment`.
 */
export declare function designCoherenceJudgment(d: Design): DesignCoherenceJudgment;
export declare const isCoherentDesign: (d: Design) => boolean;
//# sourceMappingURL=chronicle.d.mts.map