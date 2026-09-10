/**
 * socialize/face — socializing's ACROSS / TRUTH local section over an inter-agent
 * membrane, the boundary face organizing (the bulk) reads instead of faking the across
 * face with a generic relating `descend`.
 *
 * organizing is a holographic BULK over three boundary FACES (socializing = across,
 * computing = inside, gaming = outside; dev/docs/notes/2026-06-21-bulk-over-faces-
 * local-section-threading.md). Each face is a LOCAL SECTION over that faculty's
 * inter-agent membrane, read on one of the three transverse agentive-triad bilattice
 * axes. socializing supplies the ACROSS face on the TRUTH axis (`≤_t` — which way the
 * collective leans; negation antitone): the across reading is the collective's settled
 * DIRECTION over the observer cover.
 *
 * Crucially this is socializing's OWN multi-observer reading, NOT a copy of organizing's
 * generic descend-then-section. The membrane is settled into socializing's Social Field
 * `V : O → Settlings_B` (the multi-observer system — `field.mts`), then its OWN
 * network-sheaf consensus is read off the converged `FieldSection` (`converge.mts` →
 * `consensus.mjs`'s `sheafCharges`, the bilattice-network-sheaf-consensus). The face's
 * thin cover/held/contested are projected off that field section's consensus
 * components and their opposition-H¹, not off a bare descent state:
 *
 *   cover     = the consensus components of the field section over the observer cover
 *               (each a glued common-ground cell of the collective)
 *   held      = the components whose pooled charge is a HELD truth direction
 *               (definite potential/active, or a stable held-contradiction that still
 *               glued) — the cells the collective settles
 *   contested = the components that pooled to `stable` — held truth contradictions
 *               (both witnesses, paraconsistent) — the across-face's contested cells
 *
 * The truth axis enters in how a claim becomes a charge: a denial/negation claim leans
 * `active` (negative, `≤_t`-down), an assertion leans `potential` (positive, `≤_t`-up),
 * so two observers asserting and denying the SAME subject become `opposed` on the truth
 * axis (negation antitone) — exactly the across-face direction reading. This is grounded
 * in the agentive-triad's truth axis (content/_archive predication-categories truth.md;
 * Avron twist-product) and socializing's own consensus module.
 *
 * Dependency: this is a LEAF over relating + the package's own modules. It does NOT
 * import @emsenn/organizing (the bulk). organizing imports THIS.
 */
import { type ChargeValueName, type UtteranceCarrier } from "@emsenn/relating";
import { type Field, type FieldSection } from "./field.mjs";
/** The axis this face reads — the agentive-triad TRUTH axis (`≤_t`, negation antitone). */
export declare const SOCIALIZING_FACE_AXIS: "truth";
/** The truth-axis FOUR census of the field section's consensus components, read as
 *  ADJUDICATION's disciplines (the receiving-dual reading the organizing bulk consolidates;
 *  content/_archive adjudication.md): the smallest bilattice FOUR's four canonical values —
 *  ⊥ told-nothing = held OPEN (silence ≠ denial, the partial-information discipline), t
 *  told-true = held for, f told-false = held against, ⊤ told-both = held CONTESTED (the
 *  conflict discipline, paraconsistent — kept live, not collapsed). The census partitions
 *  the cover; `held` = potential+active+stable, `contested` = stable. */
export interface SocialTruthBelnap {
    /** ⊥ held OPEN — no observer contributed a direction at this component (silence, not denial). */
    readonly absurd: number;
    /** t held FOR — the collective's pooled direction leans potential (≤_t-up / asserted). */
    readonly potential: number;
    /** f held AGAINST — the collective's pooled direction leans active (≤_t-down / denied). */
    readonly active: number;
    /** ⊤ held CONTESTED — components pooled to stable: both asserted and denied, kept live. */
    readonly stable: number;
}
/**
 * The BIGRADED COMMON-KNOWLEDGE reading the collective achieves — socializing's REAL
 * multi-observer work (now that the census/aggregate math is upstream in relating, the face
 * does this). Consensus does NOT produce one common-knowledge fixed point but TWO structurally
 * distinct ones (content/…/bigraded-diamond/…/consensus-achieves-bigraded-common-knowledge.md,
 * via the bigraded-common-knowledge theorem):
 *   - C^t — the value/direction the collective COMMONLY KNOWS it has decided (agreement-on-VALUE,
 *     the truth-axis fixed point = the H⁰ global section).
 *   - C^k — the witness the collective COMMONLY HOLDS (agreement-on-WITNESS, the knowledge-axis
 *     fixed point = the propagated accumulation).
 * They are GENERICALLY DISTINCT, and they diverge EXACTLY at the paraconsistent ⊤ cells (a
 * member that received both p and ¬p) — which is the bigraded contradiction row F^(⊤). So the
 * reading is PARAMETERIZED from relating's `bigradedCohomology`: when F^(⊤)=0 the bigrading
 * collapses and the two axes COINCIDE (full common knowledge on both); otherwise they diverge
 * (the split-brain / learner-lag regime). `agree` ⟺ the degenerate case the theorem isolates.
 */
export interface BigradedCommonKnowledge {
    /** whether C^t and C^k COINCIDE — the collective reaches common knowledge on both axes at once
     *  (no paraconsistent observer; the bigrading collapses, F^(⊤)=0). */
    readonly agree: boolean;
    /** the agreement-on-VALUE row F^(t): components the collective commonly knows a direction on. */
    readonly value: number;
    /** the cells where C^t and C^k DIVERGE — the held ⊤ contradictions F^(⊤) (a member told both),
     *  the substrate surface of split-brain / learner-lag. */
    readonly divergence: number;
}
/**
 * socializing's SWARM-coordination reading — its real swarm-intelligence work: socializing
 * is a STIGMERGIC multi-observer system. In stigmergy (Bonabeau–Dorigo–Theraulaz; ant
 * pheromone fields, drone swarms), agents coordinate INDIRECTLY through a shared environment
 * field — not by pairwise messaging — and this DECOUPLES the coordination cost (content/…/
 * swarm/swarm-intelligence/stigmergy/stigmergy-decouples-coordination-cost.md, proved): the
 * per-step cost is O(N + |L|) (linear in agents N + field size |L|), with NO O(N²) inter-agent
 * term, vs the orchestrated (pairwise / orchestrator) regime's O(N²). socializing's Social
 * Field IS that stigmergic trace field: observers deposit their charged memes into the shared
 * field and the consensus is read off the CONVERGED field section — never off O(N²) observer
 * pairs. That is why a swarm scales to millions of agents where orchestrated multi-agent LLM
 * systems saturate at ~4 (saturation-threshold). Here N = `observers`, |L| = the field's cover
 * cells; the reading exposes the linear stigmergic cost socializing pays and the quadratic
 * orchestrated cost it AVOIDS.
 */
export interface SwarmCoordination {
    /** coordination is STIGMERGIC — field-mediated (the Social Field is the shared trace field),
     *  not pairwise. True for socializing: consensus is read off the converged field section. */
    readonly stigmergic: boolean;
    /** the per-step STIGMERGIC cost O(N + |L|) = observers + field cover cells — linear, no O(N²) term. */
    readonly cost: number;
    /** the per-step ORCHESTRATED cost O(N²) = the N-choose-2 pairwise observer comparisons socializing
     *  AVOIDS by coordinating through the field (the decoupling: orchestratedCost ≥ cost, ≫ at scale). */
    readonly orchestratedCost: number;
}
/**
 * socializing's ACROSS / TRUTH local section over an inter-agent membrane. The thin
 * triple { cover, held, contested } is what organizing's `Face` contract requires
 * (integers ≥ 0); the thick fields expose the field section it was read from so the
 * across direction is inspectable.
 */
export interface SocializingFace {
    readonly kind: "socializing.face";
    readonly faculty: "socializing";
    readonly direction: "across";
    readonly axis: typeof SOCIALIZING_FACE_AXIS;
    /** cells of the local section over the observer cover — the consensus components. */
    readonly cover: number;
    /** cells the collective holds — components with a held truth direction. */
    readonly held: number;
    /** stable / held-contradiction cells — components pooled to `stable`. */
    readonly contested: number;
    /** observers admitted from the membrane (the observer category `O`'s objects). */
    readonly observers: number;
    /** the opposition-H¹: a cycle of opposed truth directions; 0 ⟺ the across face glues. */
    readonly obstruction: number;
    /** δ⁰ = 0 — the local sections glue with no coordination (which-way agreement). */
    readonly leans: boolean;
    /** socializing's collective LEAN DIRECTION on the truth order ≤_t (the ∨_t join over the
     *  consensus components, DUAL to the inside face's ≤_k accumulation, negation-ANTITONE): the
     *  scale-2 mirror of communicating's `lean`. `potential` the collective leans FOR, `active`
     *  leans AGAINST, `stable` polarized (told-both wins), `absurd` no lean. Where `leans` (the
     *  boolean) says WHETHER the field glues coordination-free, `lean` says which WAY it leans.
     *  Parameterized from relating's `truthAggregateOfCensus`. */
    readonly lean: ChargeValueName;
    /** the truth-axis FOUR census (adjudication's disciplines) of the consensus components —
     *  the thick reading the organizing bulk consolidates onto its Face. */
    readonly belnap: SocialTruthBelnap;
    /** socializing's REAL multi-observer work: the bigraded common-knowledge the collective
     *  achieves — whether agreement-on-value (C^t) and agreement-on-witness (C^k) coincide or
     *  diverge (parameterized from relating's bigraded cohomology over the census). */
    readonly commonKnowledge: BigradedCommonKnowledge;
    /** socializing's SWARM-coordination reading: the stigmergic (field-mediated) coordination
     *  and the cost decoupling — the linear O(N+|L|) cost it pays vs the O(N²) it avoids. */
    readonly coordination: SwarmCoordination;
    /** the converged field section the thin reading was projected from (thick). */
    readonly section: FieldSection;
}
/**
 * Settle a membrane (`readonly UtteranceCarrier[]`) into socializing's Social Field:
 * each distinct observer (an utterance's `token`) becomes an observer `o ∈ O` carrying,
 * as its local memes, the truth-charges of the claims it uttered (cell = the claim's
 * bare subject). The observer category `O` is taken maximally connected (every observer
 * compared with every other) so the across reading is the WHOLE collective's direction.
 */
export declare function membraneField(membrane: readonly UtteranceCarrier[]): Field;
/**
 * socializingFace — socializing's ACROSS / TRUTH local section over an inter-agent
 * membrane, for the organizing bulk to glue. Settles the membrane into socializing's
 * Social Field and reads the across direction off its OWN converged consensus section
 * (network-sheaf consensus over the observer cover), NOT a generic descend.
 *
 * The thin { cover, held, contested } the bulk requires is projected off the field
 * section's consensus components: cover = the components (cells of the local section),
 * held = the components holding a truth direction, contested = the components pooled to
 * `stable` (held contradictions). Total over membranes; the empty membrane is the empty
 * across face (all zero, ungrounded section).
 */
export declare function socializingFace(membrane: readonly UtteranceCarrier[]): SocializingFace;
//# sourceMappingURL=face.d.mts.map