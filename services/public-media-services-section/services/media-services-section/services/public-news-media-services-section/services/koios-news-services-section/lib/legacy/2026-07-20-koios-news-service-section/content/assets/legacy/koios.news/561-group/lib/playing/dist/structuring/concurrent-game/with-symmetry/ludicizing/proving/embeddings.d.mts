/**
 * The four embeddings that make $\mathbf{CGS}$ THE theory of computing.
 *
 * Corpus (concurrent-game-category journal, "Four full sub-$*$-autonomous-
 * categories"; the typed-theory-of-computing theorem): four established
 * traditions embed as full, pairwise-distinct sub-$*$-autonomous-categories of
 * $\mathbf{CGS}$, jointly spanning the typed theory of computing. This module
 * names each as a data-carrying functor into $\mathbf{CGS}$, with the object-map
 * realized where tractable:
 *
 *   1. Hyland-Ong sequential ($\mathbf{CGS}_{\mathrm{HO}}$): innocent /
 *      deterministic strategies on alternating, well-bracketed, trivial-symmetry
 *      arenas — the SEQUENTIAL fragment, PCF-fully-abstract (Hyland-Ong 1996/2000;
 *      Abramsky-Jagadeesan-Malacaria 2000). [hyland2000]
 *   2. Dialectica-via-$F$ ($F(\mathbf{Dial}(\mathbf{Eff}))$): objects $(U, X,
 *      \alpha)$ with $U$ = P-events, $X$ = O-events; trivial causality, all-pairs
 *      intra-polarity conflict, trivial symmetry — the CONCURRENT COMPUTABLE
 *      fragment (Hyland 2002; de Paiva 1989). The object-map is the reused
 *      `dialecticaObjectToArena`. [depaiva1989]
 *   3. AGMOS nominal ($\mathbf{CGS}_{\mathrm{AGMOS}}$): $\mathrm{FSym}(\mathbb{A})$-
 *      symmetric arenas — strategy equivalence becomes nominal equivariance /
 *      finite support; the symmetry groupoid (already game-algebra's `Arena`
 *      machinery) IS the embedding's content (Abramsky-Ghica-Murawski-Ong-Stark
 *      2004). [abramsky2004]
 *   4. Caires-Pfenning session-typed ($\mathbf{CGS}_{\mathrm{CLL}}$): session
 *      types as CLL propositions, cut = communication = strategy composition
 *      (Caires-Pfenning 2010; Wadler 2012). The object-map is the existing
 *      `propositionOfSession`. [caires2010]
 *
 * Each embedding is recorded as a frozen carrier naming its source theory, its
 * $\mathbf{CGS}$ sub-category, the structural constraint that cuts it out, and its
 * full-abstraction / faithfulness theorem; the two whose object-map is tractable
 * additionally expose a realizing function (reused, not reinvented).
 *
 * Reference castellan2014 (Castellan-Clairambault-Winskel 2014, "Symmetry in
 * Concurrent Games") for the ambient $\mathbf{CGS}$ these all land in.
 */
import { type Proposition } from "./proposition.mjs";
import { type SessionType } from "./session.mjs";
/** The four sub-$*$-autonomous-categories of $\mathbf{CGS}$, by name. */
export type EmbeddingName = "hylandOng" | "dialectica" | "nominal" | "cairesPfenning";
export declare const embeddingNames: () => readonly EmbeddingName[];
/**
 * A named embedding $E \to \mathbf{CGS}$ recorded as data: the source theory, the
 * $\mathbf{CGS}$ sub-category it carves out, the structural constraint defining
 * that sub-category, the citation, and the full-abstraction / faithfulness
 * theorem it realizes.
 */
export interface Embedding {
    readonly kind: "game.logic.embedding";
    readonly name: EmbeddingName;
    /** The source theory being embedded. */
    readonly source: string;
    /** The full sub-$*$-autonomous-category of $\mathbf{CGS}$ that is the image. */
    readonly subcategory: string;
    /** The structural constraint that cuts the sub-category out of $\mathbf{CGS}$. */
    readonly constraint: string;
    /** The bibliographic corpus key. */
    readonly citation: string;
    /** The full-abstraction or full-faithfulness theorem realized by the embedding. */
    readonly theorem: string;
}
/**
 * The Hyland-Ong embedding: sequential typed computation as innocent /
 * deterministic strategies on alternating, well-bracketed, trivial-symmetry
 * arenas. The object-map (PCF types → arenas) is not realized here — it needs the
 * full arena-former for alternating game types — so this is the data carrier
 * only; the constraint NAMES the alternating fragment.
 */
export declare const hylandOng: () => Embedding;
/**
 * The Dialectica embedding $F : \mathbf{Dial}(\mathbf{Eff}) \to \mathbf{CGS}$. The
 * source-side Dialectica object algebra lives in `dialectica.mts`; the realized
 * object-map into a CGS arena is the multi-agent (arena-with-symmetry) face, which
 * belongs to @emsenn/gaming-experimental, so playing carries only the named
 * embedding carrier (its source, constraint, citation, and theorem).
 */
export declare const dialectica: () => Embedding;
/**
 * The AGMOS nominal embedding: nominal computation ($\nu$-calculus) as equivariant
 * strategies on $\mathrm{FSym}(\mathbb{A})$-symmetric arenas. The defining feature
 * is the NON-TRIVIAL symmetry groupoid — already game-algebra's `Arena.symmetry`;
 * the embedding reuses arena symmetry rather than minting nominal machinery. No
 * separate object-map is realized (it requires the full $\mathrm{FSym}(\mathbb{A})$
 * groupoid former); the constraint names the equivariance condition.
 */
export declare const nominal: () => Embedding;
/**
 * The Caires-Pfenning embedding: session-typed concurrency as CLL propositions
 * and proofs. Its object-map IS realized via the existing `propositionOfSession`
 * (the CLL-fragment object-map already in `session.mts`): a session type maps to
 * its CLL proposition, the syntactic name of a $\mathbf{CGS}_{\mathrm{CLL}}$
 * behaviour.
 */
export declare const cairesPfenning: () => Embedding;
/**
 * The object-map of the Caires-Pfenning embedding: a session type to the CLL
 * proposition naming its $\mathbf{CGS}_{\mathrm{CLL}}$ behaviour. Reuses the
 * existing `propositionOfSession` — the embedding does not reimplement the map.
 */
export declare const cairesPfenningEmbed: (session: SessionType) => Proposition;
/** All four embeddings, in canonical order. */
export declare const embeddings: () => readonly Embedding[];
/** Look up an embedding carrier by name. */
export declare function embeddingByName(name: EmbeddingName): Embedding;
export declare function isEmbeddingName(value: unknown): value is EmbeddingName;
export declare function isEmbedding(value: unknown): value is Embedding;
//# sourceMappingURL=embeddings.d.mts.map