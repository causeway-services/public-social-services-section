/**
 * face — playing's OUTSIDE local section over an agent membrane, read on the
 * EVIDENCE axis ⟨a₊, a₋⟩.
 *
 * In the bulk-over-faces relation (dev/docs/notes/2026-06-21-bulk-over-faces-
 * local-section-threading.md), animating is a holographic *bulk* over three
 * boundary *faces*; playing is the **outside** face. Each face is a local section
 * over the agent's membrane (a `readonly UtteranceCarrier[]` log), read on one of
 * the three transverse bilattice axes (the agentive triad, Avron's twist-product
 * representation). Playing reads the **evidence** axis: the paired ⟨a₊, a₋⟩
 * for/against record (content/…/four-bilattice/content/evidence/evidence.md — "the
 * value of an assertion is a *pair* of independently tracked sides, never
 * collapsed into a single signed scalar"; negation interchanges the sides
 * `∼⟨a₊,a₋⟩ = ⟨a₋,a₊⟩`; the distinguishing value ⊤ = ⟨1,1⟩ is *contradiction held
 * as a state*).
 *
 * Crucially this is **playing's own ludics reading**, not animating's generic
 * descend-then-section-count. playing's characteristic carrier is the **Design** —
 * "a partial valuation $v_𝔇 : E×E ⇀ L^⋈$" of the locus tree into the bilattice
 * charge (the ludics correspondence theorem). The for/against pair is precisely
 * Player/Opponent polarity (structuring/polarity: positive ↔ told-true ↔
 * Proponent/Player, negative ↔ told-false ↔ Opponent). So playing reads the
 * membrane into its OWN Design — one charged locus per settled cell — and reads
 * the local section off the *design's loci and their committed polarity*:
 *
 *   - cover     = the design's loci (each settled cell is one charged locus of the
 *                 design's locus tree)
 *   - held      = loci committing a definite SIDE of the evidence pair —
 *                 `chargePolarity ≠ null`, i.e. Proponent (a₊, positive evidence)
 *                 or Opponent (a₋, negative evidence): the for/against record the
 *                 design actually holds
 *   - contested = Daimon (†) loci — charge `stable` = ⊤ = ⟨1,1⟩ = told-both: the
 *                 held contradiction the evidence twist product reads at ⟨a₊,a₋⟩ =
 *                 ⟨1,1⟩ (positive AND negative evidence held at once, never
 *                 propagated as ex falso)
 *
 * The bulk (animating) glues this against communicating (truth) and knowing
 * (knowledge) by the replica Mayer–Vietoris in its `gluing` node. This module
 * never imports `@emsenn/animating`; the dependency runs bulk → faces, and playing
 * is a leaf over relating (it runs the relating descent directly, not via the
 * bulk's `descend`).
 */
import { type UtteranceCarrier } from "@emsenn/relating";
import { type Design } from "./ludics.mjs";
/** The agentive-triad bilattice axis playing's face reads. */
export type EvidenceAxis = "evidence";
/**
 * The evidence-axis Belnap census of the design's loci, read on the twist-product
 * FOUR (content/…/four-bilattice.md: the four values are told-nothing ⊥ = ⟨0,0⟩,
 * told-true t = ⟨1,0⟩, told-false f = ⟨0,1⟩, told-both ⊤ = ⟨1,1⟩). Playing reads
 * the evidence pair ⟨a₊, a₋⟩ off its Design's committed loci: Proponent loci hold
 * positive evidence (a₊, told-true), Opponent loci hold negative evidence (a₋,
 * told-false), Daimon (†) loci hold told-both ⊤. Told-nothing ⊥ never appears in a
 * design's support — `design` drops the absurd region, exactly as ludics drops the
 * undefined region — so `absurd` is always 0. This is the uniform four-valued
 * census the sibling faces (communicating/truth, knowing/knowledge) also expose, so
 * the bulk (animating) can consolidate each transverse axis's FOUR reading.
 */
export interface EvidenceBelnap {
    /** told-nothing ⊥ = ⟨0,0⟩ — absent from a design's support (ludics drops it); always 0. */
    readonly absurd: number;
    /** told-true t = ⟨1,0⟩ — Proponent loci: positive evidence a₊ (≡ `forCount`). */
    readonly potential: number;
    /** told-false f = ⟨0,1⟩ — Opponent loci: negative evidence a₋ (≡ `againstCount`). */
    readonly active: number;
    /** told-both ⊤ = ⟨1,1⟩ — Daimon (†) loci: the held contradiction (≡ `daimonCount`). */
    readonly stable: number;
}
/**
 * Playing's outside local section over a membrane, read on the evidence axis. The
 * thin trio `{ cover, held, contested }` is what the bulk consumes; the axis-thick
 * fields expose the ludics geometry the trio is read from — the Player/Opponent
 * split (`forCount`/`againstCount` = the ⟨a₊, a₋⟩ pair) and the Daimon give-ups
 * (`daimonCount`) that make this an *evidence* reading off a real Design rather
 * than a flat descend count.
 */
export interface PlayingFace {
    readonly kind: "playing.face";
    /** the sibling faculty supplying this face of animating's agent boundary. */
    readonly faculty: "playing";
    /** where playing acts relative to the agent's boundary. */
    readonly direction: "outside";
    /** the agentive-triad axis: the ⟨a₊, a₋⟩ for/against twist product. */
    readonly axis: EvidenceAxis;
    /** cells of the local section = the design's loci (its charged support). */
    readonly cover: number;
    /** loci committing a definite side: Proponent (a₊) or Opponent (a₋). */
    readonly held: number;
    /** held contradictions: Daimon (†) loci — charge `stable` = ⊤ = ⟨1,1⟩. */
    readonly contested: number;
    /** a₊: loci the design holds with positive (Proponent / for) polarity. */
    readonly forCount: number;
    /** a₋: loci the design holds with negative (Opponent / against) polarity. */
    readonly againstCount: number;
    /** Daimon (†) loci — the give-ups, told-both ⊤; equals `contested`. */
    readonly daimonCount: number;
    /** the evidence-axis FOUR census of the design's loci (the uniform four-valued
     *  reading the bulk consolidates): ⊥ told-nothing / t told-true (a₊) / f told-false
     *  (a₋) / ⊤ told-both (†). */
    readonly belnap: EvidenceBelnap;
    /** the Design playing built from the membrane (its own outside reading). */
    readonly design: Design;
}
/**
 * playingFace — playing's OWN outside/evidence local section over an agent
 * membrane, the face animating (the bulk) consumes instead of faking it with a
 * generic relating descend. The membrane is settled (the relating descent, run
 * directly — playing is a leaf over relating, never importing the bulk) and read
 * into playing's own **Design**: one charged locus per settled cell. The evidence
 * twist product is then read off the design's loci by their committed polarity:
 *
 *   cover     = the design's loci (its charged support)
 *   held      = loci committing a definite side — Proponent (a₊) or Opponent (a₋)
 *   contested = Daimon (†) loci — charge ⊤ = ⟨1,1⟩, the held contradiction
 *
 * The thick `forCount`/`againstCount` is the ⟨a₊, a₋⟩ pair the design holds;
 * `design` is the carrier it was read from. An empty membrane yields the empty
 * design and the zero section. This is playing's reading — the Design's loci and
 * Player/Opponent polarity — not a relabelled generic descend.
 */
export declare function playingFace(membrane: readonly UtteranceCarrier[]): PlayingFace;
//# sourceMappingURL=face.d.mts.map