/**
 * organizing — the social gluing node: organizing's apex.
 *
 * organizing is the social-scale reading of `governing`: the settling of an open
 * plurality of agents into one bounded, law-bearing collective. It is the Gen-2
 * (inter-agent) lift of @emsenn/animating's holographic node — but NOT a mere
 * re-skin of it. The off-diagonal carries structure the diagonal cannot, and this
 * module realizes it:
 *
 *   - The gluing is a CROSS-ARENA Mayer–Vietoris over a cover of constituents
 *     (`crossArena`). On the diagonal the cover is one agent's three faces — they
 *     cannot contest, so they glue coordination-free. Off the diagonal the cover is
 *     MANY agents, so disagreement appears — but by the corpus's cross-arena MV
 *     (cross-arena-mayer-vietoris.md) disagreement-pairs live in ker(δ) and are
 *     TOLERATED (recorded ⊤, adjudicated locally), contributing NO obstruction; the
 *     genuine obstruction is `federationOnly` = coker(diff), content no single
 *     constituent can express. So a society can be glued yet deeply contested.
 *   - `adjudicate` is the gluing act — "the receiving dual of speaking" (the corpus's
 *     act of governing) — which RECEIVES many constituent sections and decomposes
 *     their merge. This is the genuinely off-diagonal act: one agent's own faces have
 *     no adjudication sibling. By Arrow/Gibbard–Satterthwaite (social-choice.md) the
 *     consensus cost it reports can be IRREDUCIBLE — the off-diagonal is the home of
 *     coordination impossibility, which the always-gluing diagonal never meets.
 *   - the four SOCIAL-DESCENT readings mirror animating's four regime readings —
 *     `socialBecoming` → `relating` → `community` → `institution` (the intrinsic
 *     settled order). The organization is the interior bulk; `socialFactor` is the
 *     per-face act-factorization.
 *   - `assemble` makes the spiral concrete: real @emsenn/animating agents re-enter as
 *     the literal constituents of the cross-arena cover.
 *   - `federate` realizes federation = PARALLEL COMPOSITION ‖ (federation-is-parallel-
 *     composition.md): it ‖-composes constituent societies, with shared members as
 *     nominal-set NAME-PASSING (FSym(𝔸)) overlap, and reads the cross-arena MV.
 *
 * The agent base and the descent substrate are reused wholesale from
 * @emsenn/animating; the three faces are threaded, not absorbed. See
 * dev/docs/notes/2026-06-21-animating-organizing-exact-mirror.md.
 */
import { type JsonValue, type UtteranceCarrier } from "@emsenn/relating";
import { type Agent, type DescentState } from "@emsenn/animating";
import type { Organization } from "./schemas.mjs";
import type { Telos } from "./schemas.mjs";
import type { Adjudication } from "./schemas.mjs";
import type { Face } from "./schemas.mjs";
import type { Relating } from "./schemas.mjs";
import type { Community } from "./schemas.mjs";
import type { SocialBecoming } from "./schemas.mjs";
import type { Institution } from "./schemas.mjs";
import type { SocialFactorization } from "./schemas.mjs";
import type { Federation } from "./schemas.mjs";
import type { SocialProjection } from "./schemas.mjs";
import { type OrganizationSymmetry, type OrganizationStance, type Governance, type OrganizationCohesion } from "./carriers.mjs";
/** The faces of the social boundary, in canonical order: across, inside, outside. */
declare const FACULTIES: readonly ["socializing", "computing", "gaming"];
type Faculty = (typeof FACULTIES)[number];
/** A three-faced social boundary input: an inter-agent membrane seed per face. */
export interface SocialBoundary {
    readonly socializing?: JsonValue;
    readonly computing?: JsonValue;
    readonly gaming?: JsonValue;
}
/** Options for building an organization: its identity. */
export interface OrganizationOptions {
    readonly identity?: string;
}
/** One constituent arena of a social cover: a named agent/society and its membrane. */
export interface Constituent {
    readonly name: string;
    readonly utterances: readonly UtteranceCarrier[];
}
/** The cross-arena Mayer–Vietoris decomposition of a cover into the three corpus
 *  classes (cross-arena-mayer-vietoris.md): `shared` overlap-kernel (agreements that
 *  lift free), `contested` disagreement-pairs on overlaps (ker(δ) — tolerated, no
 *  obstruction), and `federationOnly` = coker(diff) (the H¹ obstructions the merge
 *  introduces that no single constituent carries — the genuine federation-level
 *  obstruction). `nameMobility` counts members shared across ≥2 constituents (the
 *  name-passing overlap).
 *
 *  `federationOnly` is computed EXACTLY from the proved settling-cohomology
 *  (`readFirstCohomologyOfSettlementFiltration`): the merged settlement's H¹ generators
 *  (non-Scott / limit-stage firings) whose cell is not an H¹ generator of any
 *  constituent. This respects the corpus's reading that disagreement is NOT an
 *  obstruction: a finite ⊤-conflict settles at a FINITE stage (not a limit-stage
 *  firing) so it never appears as an H¹ generator (it lives in ker(δ)); only a
 *  genuinely non-Scott-continuous composition contributes federation-only H¹. */
export interface CrossArena {
    readonly shared: number;
    readonly contested: number;
    readonly federationOnly: number;
    readonly nameMobility: number;
}
export declare function crossArena(constituents: readonly Constituent[]): CrossArena;
/**
 * The COLLECTIVE's structural robustness, read through the substrate graph Laplacian
 * (`@emsenn/relating` analysis.laplacian). This CONSOLIDATES onto the organizing bulk the
 * consensus-robustness capability its faces expose (socializing's `spectralConsensus`, computing's
 * `spectralSociety`), lifted to the off-diagonal CONSTITUENT cover: constituents are the vertices, and
 * two are joined when they SHARE settled cells and COHERE on every shared cell (no cross-arena
 * contradiction). Then `blocs` = the connected-component count H⁰ (independent collective blocs,
 * isolated constituents counted), and `collectiveTrees` = the Matrix-Tree spanning-tree count — the
 * collective's COHESION ROBUSTNESS: `0` the collective fragments, `1` a single fragile thread of shared
 * agreement, `> 1` redundant agreement paths (resilient to losing a constituent's overlaps). The
 * federation-only H¹ obstruction (`crossArena`) is unchanged; this reads the coordination-free skeleton
 * that survives it.
 */
export interface CollectiveRobustness {
    readonly kind: "organizing.collective-robustness";
    readonly constituents: number;
    readonly blocs: number;
    readonly cohesive: boolean;
    readonly collectiveTrees: number;
    readonly robust: boolean;
    readonly fragile: boolean;
    /** CONSENSUS EQUILIBRIUM: whether the merged collective's settlement is HARMONIC — its first
     *  settling-cohomology H¹ VANISHES (no non-Scott / limit-stage firing across the whole cover),
     *  computed EXACTLY from the proved `readFirstCohomologyOfSettlementFiltration`. By the proven
     *  `harmonic ⟺ H¹ = 0` bridge (ker L ≅ independent Čech H⁰, LawvereHarmonicCohomology), this is the
     *  collective at coordination-free equilibrium — DISTINCT from the structural `robust`/`fragile`
     *  reading: the cover can be robustly connected yet still carry an H¹ obstruction (not at equilibrium). */
    readonly atEquilibrium: boolean;
    /** derivable cohesion: the EXACT/gradient flows of the constituent agreement graph `rank(L) = V − C`. */
    readonly derivable: number;
    /** irreducible cohesion cycles: the HARMONIC flows `β₁ = E − V + C` — the redundant cross-constituent
     *  agreement loops (the H¹ of the constituent agreement graph) that make the collective robust beyond
     *  a spanning tree. */
    readonly irreducible: number;
}
export declare function collectiveRobustness(constituents: readonly Constituent[]): CollectiveRobustness;
/** Read one social face from its inter-agent membrane: the sibling faculty's OWN
 *  local-section reading on its axis, re-typed into organizing's Face. */
export declare function faceOfMembrane(faculty: Faculty, membrane: readonly UtteranceCarrier[]): Face;
/** Read one social face off a settled descent state: the sibling faculty's OWN
 *  local-section reading over that state's inter-agent membrane (no generic
 *  descend-then-count). */
export declare function faceOf(faculty: Faculty, state: DescentState): Face;
/** Settle one faculty's inter-agent membrane seed into its boundary face by calling
 *  that faculty's real face reading. An empty seed yields the empty face. */
export declare function face(faculty: Faculty, seed: JsonValue | undefined): Face;
/** Settle the union of all faces' inter-agent membranes into the SOCIAL descent —
 *  the one settled state the society's collective readings all project. At least one
 *  face must carry content. */
export declare function socialUnion(input: SocialBoundary, verb: string): DescentState;
/** Read the social BECOMING (stage 1): the re-entered individuals posed as a
 *  plurality in pure social potential. Gen-2 mirror of animating's `animate`. */
export declare function socialBecomingOf(state: DescentState, scale?: SocialBecoming["scale"]): SocialBecoming;
/** Read the social DOING (stage 2): relating — the directed bonds among agents. */
export declare function relatingOf(state: DescentState): Relating;
/** Read the social WORKING (stage 3): community — the shared field (transindividual). The
 *  held-contradiction `contested` is the FULL ⊤ substrate the transindividual field records
 *  (within-constituent ⊕ cross-arena overlap; cross-arena-mayer-vietoris.md), consolidated
 *  from the constituent faces' involution-aware census — not recomputed off the all-positive
 *  descent (which applies no negation, so reads every cell potential and never records ⊤). */
export declare function communityOf(state: DescentState, faces: readonly Face[], constituents: readonly Constituent[]): Community;
/** Read the social GOVERNING (stage 4): the institution — the intrinsic settled
 *  order (single-filtration H¹). Gen-2 mirror of animating's `individuate`. */
export declare function instituteOf(state: DescentState): Institution;
/** social-becoming — the stage-1 social-descent reading over a boundary. */
export declare function socialBecoming(input: SocialBoundary): SocialBecoming;
/** relating — the social doing reading over a boundary: the bonds among agents. */
export declare function relate(input: SocialBoundary): Relating;
/** community — the social working reading over a boundary: the shared field. The
 *  held-contradiction ⊤ is consolidated from the boundary's own constituent faces (the
 *  involution-aware census), so a transindividual field that holds p and ¬p records it. */
export declare function community(input: SocialBoundary): Community;
/** institute — the stage-4 social-governing reading over a boundary: the settled order. */
export declare function institute(input: SocialBoundary): Institution;
/**
 * socialSymmetryOf — the organization's SYMMETRY reading: the FSym(𝔸) structure of its
 * membership (the social-scale lift of gaming's arena symmetry groupoid Ẽ). Members are
 * partitioned into ROLES by structural equivalence (same for/against predicate commitments);
 * `interchangeable`/`roles` are the symmetry GROUPOID (members one could permute), `mobile` is
 * the name-PASSING `nameMobility` (entity-mobility across constituents) — the two distinct
 * FSym(𝔸) phenomena (federation-is-parallel-composition.md). `arenaUniform` CONSOLIDATES the
 * gaming (outside/evidence) face's own arena symmetry, which the bulk otherwise discards.
 */
export declare function socialSymmetryOf(state: DescentState, constituents: readonly Constituent[], gamingMembrane: readonly UtteranceCarrier[]): OrganizationSymmetry;
/** socialSymmetry — the organization's FSym(𝔸) membership symmetry over a boundary: which
 *  members are interchangeable (structural equivalence), which are mobile (name-passing), and
 *  the gaming face's arena symmetry it consolidates. */
export declare function socialSymmetry(input: SocialBoundary): OrganizationSymmetry;
/** socialStance — the organization's collective STANCE over a boundary: which way the society
 *  leans on the truth order ≤_t, CONSOLIDATED from the socializing (across/truth) face's `lean`
 *  (the ∨_t truth-aggregate, negation-antitone). The Gen-2 lift of the agent's `stance`; the bulk
 *  no longer discards the socializing face's lean direction. An empty across face is uncommitted. */
export declare function socialStance(input: SocialBoundary): OrganizationStance;
/**
 * cohesion — the organization's structural balance, read at TWO nested strengths off the society's
 * SENTIMENT network (likes/trusts = +, dislikes/distrusts = − ties off the socializing membrane):
 *
 *  - `balanced` — Cartwright–Harary 1956 structural balance, the SAME signed-graph Z₂/H¹ obstruction
 *    knowing's `contextuality` reads (union–find with PARITY): balanced ⟺ the society splits into ≤2
 *    antagonistic factions. This is the agent's `coherence` (Heider balance) lifted flat to scale-2.
 *  - `clusterable` — Davis 1967 CLUSTERABILITY, the proper scale-2 GENERALIZATION: the society
 *    partitions into k internally-positive COALITIONS (the connected components of the POSITIVE
 *    subgraph) with hostility only BETWEEN them — equivalently no negative tie falls inside a
 *    coalition (no cycle with exactly one negative edge). RICHER than balance: a TRIPOLAR polity
 *    (three mutually-hostile blocs) is clusterable yet NOT 2-balanced — the multipolar coalition
 *    structure a single agent's belief graph never needs (so `cohesion` is a genuine scale-2
 *    enrichment of `coherence`, per the bulk-over-faces RICHNESS principle, not a mirror).
 *
 * `balanced ⟹ clusterable`; `frustration ≤ dissonance` always. `factions` is the coalition count
 * (positive-subgraph components), ALWAYS computed — agreeing with the Cartwright–Harary camp count on
 * balanced networks and generalizing it on clusterable-but-unbalanced ones.
 */
export declare function cohesion(input: SocialBoundary): OrganizationCohesion;
/** The three governance dimensions: a membrane seed per dimension (any omitted). `preferences`
 *  are `voter|X>Y` ballots (deciding), `knowledge` is an `agent|claim` log (knowing), `dominance`
 *  is `winner|loser` outcomes (competing). */
export interface GovernanceInput {
    readonly preferences?: JsonValue;
    readonly knowledge?: JsonValue;
    readonly dominance?: JsonValue;
}
/**
 * governance — the CAPSTONE consolidation: organizing reads its three faculties' impossibility-
 * escapes at once. socializing's `aggregatePreferences` (Arrow/Condorcet), computing's
 * `eventualConsistency` (FLP/CALM), and gaming's `reachability` (best-response cycles) are the SAME
 * escape — the monotone ≤_k settling has no non-trivial periodic orbit, so it converges coordination-
 * free and cycle-free, holding conflict as ⊤. `governable` is the unified guarantee (acyclic ∧
 * coordination-free ∧ reachable); `irreducible` is the total ⊤-core the three classical theorems are
 * really about. An omitted dimension contributes its trivial (no-conflict) escape.
 */
export declare function governance(input: GovernanceInput): Governance;
/**
 * socialFactor — the social-scale per-face act-factorization, the Gen-2 mirror of
 * animating's `factor` and the RECEIVING dual of it (adjudication, the receiving dual
 * of speaking; content/_archive adjudication.md). It factors ONE Gen-2 face's act into
 * locution/illocution/perlocution, CONSOLIDATED from the sibling faculty's OWN face
 * reading (socializing's field consensus / computing's society relay / gaming's arena),
 * no longer FAKED with a generic descend section. The Austin/Searle three layers read
 * dually (the receiving funnel): LOCUTION = the cover RECEIVED — the membrane's
 * contributions selected into the cover (receiving dual of cell-selection); ILLOCUTION =
 * the charges HELD — the distinct charged cells held across agents (the face's `cover`);
 * PERLOCUTION = the record CONVERGED — the cells that monotonically settled into the
 * standing record (the face's `held`, the uptake the collective converges on). `belnap`
 * is the face's OWN axis-typed FOUR census (adjudication's disciplines: held-open/for/
 * against/contested), computing's knowledge-names mapped to canonical by FACE_READING.
 * The genuinely RICHER off-diagonal content of "the receiving dual" still lives in
 * `crossArena`/`adjudicate` (the multi-constituent Mayer–Vietoris); this is the per-face
 * local reading. The axis map is PROVISIONAL (session synthesis; see the design note).
 */
export declare function socialFactor(faculty: Faculty, state: DescentState): SocialFactorization;
/** The adjudication over a cover — the receiving dual of speaking read as the
 *  cross-arena Mayer–Vietoris: `contested` disagreement (ker(δ), tolerated), `open`
 *  absence, `monotone` accumulation, and `federationOnly` = coker(diff) (the genuine
 *  obstruction; `cohomologyRank` is its rank, possibly Arrow-irreducible). */
export declare function adjudicationOf(state: DescentState, constituents: readonly Constituent[]): Adjudication;
/** Options for declaring a telos: who declares it, the predicate it orients toward,
 *  the charge it strives for, and the operations-loop cycles already advanced over it. */
export interface TelosOptions {
    readonly declaredBy?: string;
    readonly predicate?: string;
    readonly charge?: Telos["charge"];
    readonly advanced?: number;
}
/**
 * buildTelos — the organization's telos: the Gen-2 lift of the animating agent's
 * `goal` as its APERIODIC DUAL, not a satisfiable target. Where `buildGoal` derives a
 * finite, satisfiable goal (charge defaulting to `potential`, with a `satisfied`
 * test that halts on arrival), a telos is pinned to the aperiodic regime (κ ≥ ω₁) and
 * is structurally never satisfied — its non-arrival is the only reason the operations
 * loop runs forever ("the means change; the function does not"). So it carries no
 * `satisfied` boolean (a category error here) but a monotone `advanced` count: the
 * Scott-continuous operations-loop cycles are fibers over this aperiodic base, each
 * advancing the settling one step without reaching it. `predicate` defaults to the
 * social union's dominant unsatisfied concern (the collective's standing concern);
 * `declaredBy` keeps it auditable (an undeclared telos is malformed).
 * `goal : telos :: finite : aperiodic :: arrival : direction`.
 */
export declare function buildTelos(state: DescentState, options?: TelosOptions): Telos;
/**
 * organize — the social gluing over a three-faced boundary. The cross-arena cover is
 * the non-empty faces; the organization is glued from them (federationOnly = 0 ⟺
 * coherent), with disagreement on overlaps tolerated.
 */
export declare function organize(input: SocialBoundary, options?: OrganizationOptions): Organization;
/**
 * assemble — the concrete spiral: a plurality of real @emsenn/animating agents glued
 * into one collective, each agent a LITERAL constituent of the cross-arena cover. So
 * an animating agent is a member of organizing's social base, and the gluing is the
 * genuine multi-constituent Mayer–Vietoris over the agents (not a single merge):
 * agents agreeing on a concern lift it coordination-free, disagreement is tolerated,
 * and the federation-only content (concerns that exist only collectively) is the
 * obstruction. The re-entry is the ACROSS leg — relating, "the act one self directs
 * toward another" (relating.md) — so it populates the socializing face; the interior
 * (computing) and exterior (gaming) Gen-2 faces are mounted by their own siblings.
 */
export declare function assemble(agents: readonly Agent[], options?: OrganizationOptions): Organization;
/**
 * reseed — the settled organization ("settled below, open above") re-poses its
 * institution as the next-scale relating node. Byte-for-byte with animating's
 * `identity|individuated`, this emits `identity|institution`; the full witnessed
 * membrane remains on `organization.membrane` for federation composition.
 */
export declare function reseed(organization: Organization): SocialBecoming;
/** adjudicate — the gluing act over a boundary, standalone: the cross-arena
 *  Mayer–Vietoris decomposition (contested tolerated / federationOnly obstruction). */
export declare function adjudicate(input: SocialBoundary): Adjudication;
/** The corpus's coordination-cost reading carried on the projection. */
export type Coordination = Organization["coordination"];
/** project — restrict the organization (the bulk) to its three social boundary views. */
export declare function project(organization: Organization): SocialProjection;
/**
 * federate — the next scale up, realized as the corpus's PARALLEL COMPOSITION ‖
 * (federation-is-parallel-composition.md): ‖-compose a plurality of constituent
 * societies (given as their social boundaries) into one federation. Entity-mobility
 * — a member belonging to more than one constituent — is nominal-set name-passing
 * (`nameMobility`). The federated cohomology decomposes by the cross-arena
 * Mayer–Vietoris: `shared` lifts free, `contested` is tolerated (ker δ), and
 * `federationOnly` (coker diff) is the genuine federation obligation; `glued` is
 * federationOnly = 0, possibly Arrow-irreducible when not. This is genuinely richer
 * than the diagonal — one agent has no ‖ and no name-permutation symmetry.
 */
export type FederationInput = SocialBoundary | Organization;
export declare function federate(covers: readonly FederationInput[]): Federation;
export type { Organization } from "./schemas.mjs";
export type { Telos } from "./schemas.mjs";
export type { Adjudication } from "./schemas.mjs";
export type { Face } from "./schemas.mjs";
export type { Relating } from "./schemas.mjs";
export type { Community } from "./schemas.mjs";
export type { SocialBecoming } from "./schemas.mjs";
export type { Institution } from "./schemas.mjs";
export type { SocialFactorization } from "./schemas.mjs";
export type { Federation } from "./schemas.mjs";
export type { SocialProjection } from "./schemas.mjs";
//# sourceMappingURL=organizing.d.mts.map