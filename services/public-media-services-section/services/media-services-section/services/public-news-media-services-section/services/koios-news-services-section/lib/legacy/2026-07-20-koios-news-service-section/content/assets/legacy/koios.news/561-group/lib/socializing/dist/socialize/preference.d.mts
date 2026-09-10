/**
 * preference — socializing's COLLECTIVE-PREFERENCE aggregation: the corpus's escape from
 * ARROW'S IMPOSSIBILITY THEOREM and the CONDORCET PARADOX, built on a layer-1 capability.
 *
 * Layer-2 (socializing = communicating among many) inherits a famous impossibility: Arrow
 * (arrows-impossibility.md) proves no social-welfare function aggregating individual orderings
 * into a COMPLETE TRANSITIVE collective ordering can satisfy universal-domain + Pareto + IIA +
 * non-dictatorship. The sharpest face of it is the CONDORCET PARADOX: majority rule over the
 * classic profile (A≻B≻C, B≻C≻A, C≻A≻B) yields the INTRANSITIVE CYCLE A≻B≻C≻A.
 *
 * A Condorcet cycle is EXACTLY a non-trivial PERIODIC ORBIT in the social preference relation —
 * and the corpus PROVES (closure-monad-no-non-trivial-periodic-orbits.md, the layer-1 capability
 * behind knowing's `attract`) that the monotone + inflationary + idempotent ≤_k settling has NO
 * non-trivial periodic orbits. So aggregating preferences by the BILATTICE ≤_k JOIN cannot
 * produce a Condorcet cycle: a pair the members SPLIT on settles to ⊤ (told-both — INCOMPARABLE,
 * held paraconsistently by the negation involution) rather than being forced into a direction
 * that closes a cycle. This is the principled Arrow escape Arrow's own framework rules out by
 * assumption — RELAX COMPLETENESS of the collective order (allow ⊤/incomparable pairs; cf. Sen's
 * quasi-transitive / acyclic social choice) — keeping universal-domain, Pareto, IIA, transitivity
 * (acyclicity), AND non-dictatorship. The price is honest: where members genuinely conflict, the
 * society holds ⊤ instead of manufacturing a spurious winner.
 */
import { type Action, type ChargeValueName, type UtteranceCarrier } from "@emsenn/relating";
/** One settled pair of the social preference: the two alternatives (canonical order a < b), the
 *  ≤_k-aggregated standing on the canonical direction a≻b, and the directed verdict. */
export interface PreferencePair {
    /** the lexicographically-lesser alternative (the canonical "a" of the pair). */
    readonly a: string;
    /** the lexicographically-greater alternative (the canonical "b"). */
    readonly b: string;
    /** the ≤_k aggregate over members' votes on the pair, on the canonical direction a≻b:
     *  `potential` the society holds a≻b, `active` holds b≻a, `stable` ⊤ told-both (the members
     *  SPLIT — INCOMPARABLE, held paraconsistently), `absurd` no one ranked the pair. */
    readonly standing: ChargeValueName;
    /** the directed verdict: "a" (a beats b), "b" (b beats a), or "incomparable" (⊤ — the split
     *  the bilattice holds open instead of closing a cycle). */
    readonly winner: "a" | "b" | "incomparable";
}
/** socializing's collective-preference reading — a PARTIAL social order, Condorcet-cycle-free. */
export interface CollectivePreference {
    readonly kind: "socializing.collective-preference";
    /** the alternatives ranked across the membrane. */
    readonly alternatives: readonly string[];
    /** every pair members ranked, with its ≤_k-aggregated standing and directed verdict. */
    readonly pairs: readonly PreferencePair[];
    /** pairs DECIDED a clean direction (the society agrees which way it leans). */
    readonly decided: number;
    /** pairs held ⊤ INCOMPARABLE — the members split; the would-be Condorcet edges the bilattice
     *  refuses to orient. The price of acyclicity (dropped completeness), paid honestly. */
    readonly contested: number;
    /** the social preference is ACYCLIC — no Condorcet cycle. GUARANTEED by the no-non-trivial-
     *  periodic-orbit theorem (a cycle IS a periodic orbit; the monotone ≤_k settling has none).
     *  Verified here over the decided edges, not assumed. */
    readonly acyclic: boolean;
    /** a COMPLETE total order — every pair decided (no ⊤). When false, the order is PARTIAL: the
     *  completeness Arrow demands (and that forces the impossibility) is exactly what is relaxed. */
    readonly complete: boolean;
    /** whether resolving every contested pair by MAJORITY rule WOULD close a directed cycle — i.e.
     *  whether this profile is a genuine Condorcet paradox. When `majorityCyclic && acyclic`, the
     *  bilattice's ⊤-holding DISSOLVED a real paradox majority rule would have produced. */
    readonly majorityCyclic: boolean;
}
/**
 * aggregatePreferences — settle a society's pairwise preferences into a PARTIAL social order by
 * the ≤_k bilattice join, Condorcet-cycle-free. Each membrane line `voter|X>Y` is a vote X≻Y;
 * per unordered pair {a,b} (canonical a<b) the votes pool along ≤_k (a≻b ↦ potential, b≻a ↦
 * active) so a split pair settles to ⊤ (incomparable) rather than a cycle-closing direction. The
 * decided edges are verified acyclic; `majorityCyclic` records whether majority rule WOULD have
 * produced a paradox the ⊤-holding avoided.
 */
export declare function aggregatePreferences(membrane: readonly UtteranceCarrier[]): CollectivePreference;
/** aggregate — the collective-preference reading: aggregate pairwise votes into a partial,
 *  Condorcet-cycle-free social order (the corpus's Arrow escape via the no-periodic-orbit theorem). */
export declare const aggregateAction: Action;
//# sourceMappingURL=preference.d.mts.map