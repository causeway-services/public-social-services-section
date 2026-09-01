/**
 * face — knowing's INSIDE boundary face, read on the KNOWLEDGE axis (≤_k).
 *
 * animating (the scale-1 holographic bulk — ONE agent over its own three faculty
 * faces) is reconstructed from three boundary faces: communicating (across / truth),
 * knowing (inside / knowledge), playing (outside / evidence). Each face is a LOCAL
 * SECTION over the agent's membrane (a `readonly UtteranceCarrier[]` log), read on its
 * agentive-triad axis; the bulk glues the three by the (coordination-free) replica
 * Mayer–Vietoris in animating's `glue`/`project`. The dependency runs BULK → FACES:
 * this module must NEVER import @emsenn/animating — knowing is a LEAF over relating
 * (the agent's own self cannot contest, so scale-1 gluing is always H¹=0). See
 * dev/docs/notes/2026-06-21-bulk-over-faces-local-section-threading.md.
 *
 * knowing reads the INSIDE face on the KNOWLEDGE axis (≤_k): "how much has been settled,
 * independently of which way the evidence points; accumulation is monotone, and its top
 * is 'told both', the join of the for-only and against-only values" (content/_archive …
 * predication-categories/concepts/knowledge.md). This is knowing's OWN reading — its
 * comonad on Meme working ≤_k, the cognizing surface (`foldSection`/`standingOf`/`joinK`),
 * NOT a generic relating descend-then-section: the membrane's utterances are each ABSORBED
 * as a learned increment (a meme charged on the ≤_k axis — for ↦ potential / truth side,
 * against ↦ active / falsity side, the `absorb` convention), and the comonad's held
 * CONTEXT C(Meme) is folded by the knowledge order — coincident cells joined by
 * `joinKnowledge` (the ≤_k climb). "The depth IS the memory": the inside face is exactly
 * that accumulated held section over the membrane's cells:
 *
 *   cover     = the distinct cells of the held section (the comonad's context grain)
 *   held      = cells accumulated ABOVE the ≤_k bottom ⊥ (standing ≠ absurd) — the
 *               agent settled SOMETHING (for or against) about the cell; the memory depth
 *   contested = cells that reached the ≤_k TOP ⊤ "told both" (standing = stable) — a held
 *               contradiction, where the membrane witnessed BOTH for and against the cell
 *
 * The thick reading additionally carries the folded `aggregate` ≤_k standing over EVERY
 * cell (the whole section's collective knowledge), the section `depth` (settled cells),
 * and the per-cell knowledge-axis Belnap census on FOUR, so the reading is genuinely
 * knowing's comonad accumulation — not a generic descend.
 */
import { type UtteranceCarrier } from "@emsenn/relating";
/** A FOUR knowledge-order standing (the ≤_k lattice: ⊥ absurd … ⊤ stable). */
type Standing = "absurd" | "active" | "potential" | "stable";
/** The knowledge-axis Belnap census of the held section's per-cell ≤_k standings (FOUR). */
export interface KnowledgeBelnap {
    /** absurd ⊥ — the ≤_k bottom; nothing was settled about the cell (never counted, sections drop ⊥ cells). */
    readonly absurd: number;
    /** potential — for-evidence accumulated (the section holds the cell). */
    readonly potential: number;
    /** active — against-evidence accumulated (the section holds against the cell). */
    readonly active: number;
    /** stable ⊤ — the ≤_k top, "told both"; for AND against accumulated (a held contradiction). */
    readonly stable: number;
}
/**
 * The knowing face: the INSIDE local section of animating's agent boundary, read on the
 * knowledge axis (≤_k) over the membrane's cell cover. The thin half (`cover`/`held`/
 * `contested`) is exactly animating's `Face` contract; the thick half carries the folded
 * `aggregate` ≤_k standing over all cells, the section `depth` (settled cells = the
 * memory), and the per-cell Belnap census, so the reading is genuinely knowing's comonad
 * accumulation — not a generic descend-then-section.
 */
export interface KnowingFace {
    readonly kind: "knowing.face";
    readonly faculty: "knowing";
    readonly direction: "inside";
    readonly axis: "knowledge";
    /** the held section's distinct cells — the cells of this local section over the cover. */
    readonly cover: number;
    /** cells accumulated above the ≤_k bottom ⊥ (standing ≠ absurd) — the settled memory. */
    readonly held: number;
    /** cells at the ≤_k top ⊤ ("told both") — held contradictions on this face. */
    readonly contested: number;
    /** the section depth: how many cells are settled (≡ held) — "the depth is the memory". */
    readonly depth: number;
    /** the membrane's collective ≤_k knowledge: the join (joinK) over EVERY cell's standing. */
    readonly aggregate: Standing;
    /** the knowledge-axis Belnap census of the per-cell folded standings. */
    readonly belnap: KnowledgeBelnap;
    /** knowing's REAL comonad work: the SETTLING REGIME of the knowledge orbit — INTELLIGENCE,
     *  the closure-orbit class, the general faculty of which REFLECT/RUMINATE are two values
     *  (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md, the gauge faculty). `reflects` ⟺
     *  the reflexive orbit SETTLES to its ≤_k fixpoint (the *known* — strict-finite/Scott regime);
     *  ¬reflects ⟺ it RUMINATES (the aperiodic κ≥ω₁ orbit that oscillates without resolution). */
    readonly regime: KnowingRegime;
}
/** The settling-regime reading of a knowledge orbit (knowing's intelligence/gauge faculty). */
export interface KnowingRegime {
    /** the closure-orbit class: strict-finite (settled at ⊤/⊥), scott-continuous (one-sided,
     *  settles at ω), or aperiodic (reflexive-unsettled — the never-converging rumination orbit). */
    readonly regime: "strict-finite" | "scott-continuous" | "aperiodic";
    /** whether the orbit settles to a ≤_k fixpoint — REFLECTING (true) vs RUMINATING (false). */
    readonly reflects: boolean;
}
export declare function knowingFace(membrane: readonly UtteranceCarrier[]): KnowingFace;
export {};
//# sourceMappingURL=face.d.mts.map