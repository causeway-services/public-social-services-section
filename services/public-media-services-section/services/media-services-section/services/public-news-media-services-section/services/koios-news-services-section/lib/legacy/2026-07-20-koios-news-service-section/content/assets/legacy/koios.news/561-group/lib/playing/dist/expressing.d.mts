/**
 * expressing — playing morphisms expressed as typed total CHL proof terms.
 *
 * These are not JSON helpers with a fancy hat on: they are the playing proofs
 * whose carrier-level computation is expressible by the current product,
 * fold, conditional, coincidence, and bilattice-charge constructors in
 * `@emsenn/relating/notating`. When a playing operation seems to need
 * a new primitive, first factor it through these constructors; only genuine
 * non-structural operations should extend the evaluator.
 */
import { type Tm } from "@emsenn/relating/notating";
/** `design`: `{ entries: [{ locus, act }] } -> `{ entries: [{ locus, charge }] }`.
 *
 * The `none` act is the absent/absurd value, so it is not emitted into the
 * partial design support. This matches the runtime `designFromActs` path.
 */
export declare const designTerm: Tm;
/** `dualize`: pointwise bilattice negation on a Design's charge valuation. */
export declare const dualizeTerm: Tm;
/** `interact`: the ludics cut report, composed as pointwise knowledge-join. */
export declare const interactTerm: Tm;
export declare const playingTerms: Readonly<{
    readonly design: Tm;
    readonly dualize: Tm;
    readonly interact: Tm;
}>;
//# sourceMappingURL=expressing.d.mts.map