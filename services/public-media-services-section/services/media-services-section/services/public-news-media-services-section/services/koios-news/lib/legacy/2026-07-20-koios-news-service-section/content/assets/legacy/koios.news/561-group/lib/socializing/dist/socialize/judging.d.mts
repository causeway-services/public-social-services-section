/**
 * judging — socializing's JUDGMENT AGGREGATION: the discursive dilemma (the doctrinal paradox) and
 * its principled escape, the logical sibling of `preference.mts`'s Arrow/Condorcet escape.
 *
 * A collective of judges, each individually CONSISTENT, can aggregate to a COLLECTIVELY INCONSISTENT
 * judgment set: a court where a majority affirms each premise (p, q) yet a majority denies the legally
 * implied conclusion (r ⟺ p ∧ q). List–Pettit prove this is not a fluke — no aggregation rule
 * satisfies universal domain + collective rationality + systematicity + anonymity (the judgment-
 * aggregation impossibility, the logical analogue of Arrow). Premise-based and conclusion-based
 * aggregation genuinely diverge.
 *
 * The corpus escape is the SAME move that dissolved Condorcet (feedback: scale-2 ≠ scale-1; use a
 * hard layer-1 capability): aggregate each proposition along the bilattice KNOWLEDGE order ≤_k. A
 * proposition the judges SPLIT on settles to ⊤ (told-both — held paraconsistently) rather than being
 * forced to a truth value that manufactures collective inconsistency. RELAX collective rationality
 * (admit ⊤/incomplete judgment sets — Dietrich–List's exit) and the impossibility lifts: the bench
 * holds the contested premise open instead of pretending the court speaks with one incoherent voice.
 *
 * Consumes relating's bilattice value algebra (∨_k aggregation, the truth-order connectives ∧_t/∨_t);
 * re-authors none of it.
 */
import { type ChargeValueName } from "@emsenn/relating";
/** A logical agenda: premises connected to a conclusion by a truth-functional connective. The
 *  conclusion is legally/logically equivalent to the connective applied to the premises (r ⟺ p∧q). */
export interface Agenda {
    readonly premises: readonly string[];
    readonly conclusion: string;
    readonly connective: "and" | "or";
}
/** One judge's view: a FOUR value on each proposition of the agenda (`potential` yes / `active` no /
 *  `absurd` abstain / `stable` internally conflicted). */
export interface Judge {
    readonly name: string;
    readonly views: Readonly<Record<string, ChargeValueName>>;
}
/** The result of aggregating a bench's judgments over an agenda. */
export interface JudgmentVerdict {
    readonly kind: "socializing.judgment";
    /** proposition-wise MAJORITY collective (the classical rule that produces the dilemma). */
    readonly majority: Readonly<Record<string, ChargeValueName>>;
    /** the BILATTICE collective FOUR value on each proposition, aggregated along ≤_k (∨_k join over
     *  judges) — the paraconsistent rule: a split settles to ⊤ rather than a forced majority value. */
    readonly collective: Readonly<Record<string, ChargeValueName>>;
    /** the conclusion DERIVED from the MAJORITY-aggregated premises (premise-based aggregation). */
    readonly premiseBased: ChargeValueName;
    /** the conclusion under proposition-wise MAJORITY directly (conclusion-based aggregation). */
    readonly conclusionBased: ChargeValueName;
    /** the DOCTRINAL PARADOX: under majority rule, premise-based and conclusion-based conclusions
     *  diverge — the bench is collectively inconsistent though each judge is consistent. */
    readonly doctrinalParadox: boolean;
    /** propositions the bench SPLIT on — aggregated to ⊤ under ≤_k (held paraconsistently). The
     *  collective rationality the bilattice relaxes: these are held open, not forced. */
    readonly contested: readonly string[];
    /** the bilattice DISSOLVES the paradox: under ≤_k the premise-based and conclusion-based readings
     *  no longer diverge (the split is held at ⊤ on both sides rather than forced to clash). */
    readonly dissolvedByBilattice: boolean;
    /** every judge is INDIVIDUALLY rational (their conclusion matches the connective of their premises).
     *  The dilemma is exactly that individual rationality does not lift to the collective. */
    readonly individuallyRational: boolean;
}
/**
 * judgmentAggregate — aggregate a bench's judgments over a logically-connected agenda, exposing the
 * discursive dilemma (premise-based vs conclusion-based divergence) and the bilattice escape (split
 * propositions held at ⊤ rather than forced). The collective judgment set is computed by the ∨_k
 * join per proposition; the conclusion is read both ways; the paradox is flagged when they differ.
 */
export declare function judgmentAggregate(bench: readonly Judge[], agenda: Agenda): JudgmentVerdict;
//# sourceMappingURL=judging.d.mts.map