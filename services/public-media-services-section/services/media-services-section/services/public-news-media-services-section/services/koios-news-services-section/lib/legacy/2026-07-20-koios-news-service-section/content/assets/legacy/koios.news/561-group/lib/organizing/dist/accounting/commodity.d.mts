/**
 * organizing/accounting/commodity — the two-fold commodity as a charge over an
 * accounting society.
 *
 * Authority: `dev/docs/notes/2026-06-22-trading-as-settling-over-value-categories.md`
 * §4 stage 1 ("commodity = charge", `relating`): *"Marx's two-fold commodity:
 * use-value ⟂ exchange-value = the bilattice's two orders (`≤ₜ` quality / `≤ₖ`
 * evidence). A commodity is a charge over a society, not a thing."* And §1, the
 * anti-fetishism law that makes this package buildable here and nowhere else:
 *
 * > Commodity fetishism = the type error of reading a settled charge as free
 * > data on the carrier, instead of as the image of a predication among agents.
 *
 * The law is enforced *structurally*: there is no constructor that admits a
 * use-value or exchange-value as a passed-in value. Both charges are **derived**
 * — `induceFinancialTopology` settles the society's utterances into a meme
 * topology, and the two charges are read off its two sections:
 *
 *   - **use-value** is the *quality* order `≤ₜ` (Capital I.1: use-value is the
 *     useful, qualitative side — "the usefulness of a thing"). It is read from
 *     the **truth-least** section as the knowledge-join of the society's
 *     *holding* and *exposure* predications about this commodity: who actually
 *     holds it / is exposed to it is the qualitative, in-hand fact.
 *   - **exchange-value** is the *evidence* order `≤ₖ` (Capital I.1: exchange-value
 *     "appears as the quantitative relation… a relation constantly changing with
 *     time and place" — the social ratio, not a property of the thing). It is
 *     read from the **knowledge-least** section as the knowledge-join of the
 *     society's *transfer* and *denomination* predications about this commodity:
 *     the ratios of exchange and the unit it is reckoned in are the evidential,
 *     between-producers fact (the exchange-value note: *"ratios of exchange
 *     express relations among producers, not among things"*).
 *
 * The commodity's `symbol` is exactly the money grade: `@emsenn/relating/economy`'s
 * `Money = GradedRational` carries a `grade:string`, and that grade is this
 * `symbol`. The link is the identity `symbol ↦ commodityOf(money)` — no value is
 * imported, only the name of the general equivalent the commodity is reckoned in.
 * (The financial-topology readers below are the native organizing accounting
 * topology surface.)
 *
 * Carrier `$id`: `organizing/accounting/commodity` (bare descent path; the absolute URL is a
 * serve-time projection). Each verb is registered once as a relating `action` so
 * `induceBins` projects it to every transport, and every `run` return is gated by
 * `jsonResource`.
 */
import { type Action, type ChargeValue, type UtteranceCarrier } from "@emsenn/relating";
export type { UtteranceCarrier, ChargeValue };
/** The carrier `$id` of a commodity — a charge over a society, never free data. */
export declare const COMMODITY_ID = "organizing/accounting/commodity";
/** The `{ $ref }` slot the commodity morphisms (exchange, value, …) reference. */
export declare const commodityRef: Readonly<{
    readonly $ref: "organizing/accounting/commodity";
}>;
/**
 * The two-fold commodity (Marx, Capital I.1): one `symbol`, two charges.
 *
 * `useValueCharge` is the qualitative `≤ₜ` side (holding/exposure), `exchangeValueCharge`
 * the social-ratio `≤ₖ` side (transfer/denomination). Both are settled `ChargeValue`s
 * derived from a society of predications — the carrier holds no free value.
 */
export interface Commodity {
    readonly kind: "organizing.accounting.commodity";
    readonly symbol: string;
    readonly useValueCharge: ChargeValue;
    readonly exchangeValueCharge: ChargeValue;
}
/**
 * Derive a two-fold commodity from a society of financial utterances.
 *
 * Settles the society with `induceFinancialTopology`, then reads:
 *   - the **use-value** charge `≤ₜ` from the *truth-least* section as the join of
 *     the society's `holds-position` and `has-exposure-to` predications about the
 *     commodity (the qualitative, in-hand side);
 *   - the **exchange-value** charge `≤ₖ` from the *knowledge-least* section as the
 *     join of the `transferred-to` and `denominated-in` predications about the
 *     commodity (the social-ratio, between-producers side).
 *
 * Neither charge is admitted; both are images of predications among agents. A
 * commodity over the empty society is `absurd ⟂ absurd` — value is structurally
 * unrepresentable without a relation.
 */
export declare function commodity(symbol: string, society: readonly UtteranceCarrier[]): Commodity;
/** Read the use-value (`≤ₜ` quality) charge of a commodity. */
export declare function useValueOf(c: Commodity): ChargeValue;
/** Read the exchange-value (`≤ₖ` social-ratio) charge of a commodity. */
export declare function exchangeValueOf(c: Commodity): ChargeValue;
/**
 * commodity — derive a two-fold commodity from a `symbol|predicate` seed over a society.
 *
 * Domain: a `symbol|predicate` seed string (the symbol left of `|`; an optional
 * predicate hint right of it, recorded as a witness mark) × a `society` of
 * financial utterance carriers. Codomain: a commodity carrier.
 *
 * The use-value and exchange-value charges are DERIVED by settling the society
 * (anti-fetishism law §1) — never read from the input. The result is gated by
 * `jsonResource`.
 */
export declare const commodityAction: Action;
/** The commodity module's verbs (stage 1): the single two-fold derivation. */
export declare const commodityActions: readonly Action[];
//# sourceMappingURL=commodity.d.mts.map