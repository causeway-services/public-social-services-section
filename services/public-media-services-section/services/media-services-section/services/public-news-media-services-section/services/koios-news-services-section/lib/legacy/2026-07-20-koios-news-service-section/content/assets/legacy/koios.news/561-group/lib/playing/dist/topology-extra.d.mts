/**
 * topology-extra — the remaining *-autonomous topology and the locative substrate.
 *
 * Rounds out playing's topology surface with the machinery the gaming body
 * implements but had not yet exposed: the **chronicle grain** (chronicles +
 * coherence — the plays-along-one-branch reading the Fax identity law references),
 * **internal completeness** (presentation-independence of B^⊥⊥), **locativity**
 * (delocation-invariance of orthogonality), **chronicle-convergence** (the
 * step-by-step dispute refining the global verdict), the **design knowledge order**
 * (≤_k on designs), and the **locative primitives** (delocate / superpose — the
 * action of the free monoid of loci on designs that builds the multiplicatives and
 * exponentials). See dev/docs/notes/2026-06-21-playing-as-star-autonomous-interaction.md.
 */
import { type Action } from "@emsenn/relating";
/** chronicles — the chronicles (Girard §4.7 plays) of a design: its root-to-leaf branches. */
export declare const chroniclesAction: Action;
/** view — the Hyland-Ong/Faggian-Hyland local-memory view of each chronicle. */
export declare const viewAction: Action;
/** innocent — same Proponent view implies the same next Proponent action. */
export declare const innocentAction: Action;
/** coherent — whether a design satisfies Girard's four coherence conditions (C1)–(C4). */
export declare const coherentAction: Action;
/** internal-completeness — do two generator-sets present the SAME behaviour (presentation-independence)? */
export declare const internalCompletenessAction: Action;
/** locativity — is orthogonality invariant under delocating BOTH designs by a prefix? */
export declare const locativityAction: Action;
/** chronicle-convergence — the step-by-step dispute, converging at the first Daimon. */
export declare const chronicleConvergenceAction: Action;
/** design-leq — the apex knowledge order ≤_k on designs (the order incarnation minimizes). */
export declare const designLeqAction: Action;
/** delocate — relocate a design under a prefix locus ξ (every committed locus ζ ↦ ξ·ζ). */
export declare const delocateAction: Action;
/** superpose — merge several designs, knowledge-joining any shared locus (disjoint = plain union). */
export declare const superposeAction: Action;
/** The topology-roundout + locative actions — aggregated into the package surface by actions.mts. */
export declare const topologyExtraActions: readonly Action[];
//# sourceMappingURL=topology-extra.d.mts.map