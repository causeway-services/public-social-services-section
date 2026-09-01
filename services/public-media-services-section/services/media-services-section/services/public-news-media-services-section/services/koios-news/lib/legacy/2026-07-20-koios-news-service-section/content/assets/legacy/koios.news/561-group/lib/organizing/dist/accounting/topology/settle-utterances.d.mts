/**
 * accounting/topology/settle-utterances — fold a log of utterances into a settlement.
 *
 * The topology carriers (financial / market / ledger) each settle a *list* of
 * utterances, but relating's `induceRelation` settles ONE utterance and the
 * fixed-point readers (`fixedPoints` / `fixedPointReadings`) read a single
 * posited presheaf. This module is the multi-utterance fold those carriers need,
 * implemented as the canonical relating descent over a whole log — exactly the
 * `articulate → predicate → posit → settle` traversal that animating's `descend`
 * runs (see lib/animating/src/becoming/descending.mts): predicate every
 * articulated utterance, glue the cells + specializations into one predication
 * site, posit once, then read the settlement filtration and the fixed-point
 * readings off that single posited presheaf.
 *
 * No money, no charge, no free data enters here — only the value-free relational
 * skeleton (content/CLAUDE.md anti-fetishism rule). It is the one place the
 * topology carriers turn a log into a settled meme-topology.
 */
import { type MemeTopologyFixedPointReadings, type SettlementFiltration, type UtteranceCarrier } from "@emsenn/relating";
/** Settle a log of utterances into its settlement filtration (the ordinal closure). */
export declare function settleUtterances(utterances: readonly UtteranceCarrier[]): SettlementFiltration;
/** Read the knowledge-/truth-least fixed-point readings of a settled log of utterances. */
export declare function fixedPointReadingsOfUtterances(utterances: readonly UtteranceCarrier[]): MemeTopologyFixedPointReadings;
//# sourceMappingURL=settle-utterances.d.mts.map