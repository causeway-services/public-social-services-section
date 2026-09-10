/**
 * actions — organizing's registered operations, each a cocone leg over the relating
 * boundary. `induceBins` over this list (in the scripts) assembles the discovery
 * apex from which CLI/OpenAPI/MCP/web are projected by the one relating dispatcher;
 * this package invents no second transport.
 *
 * The surface is the social gluing node: `organize` (the apex: three social faces →
 * the organization), `adjudicate` (the gluing act standalone), `face` (one faculty →
 * local section), `project` (the organization → its three boundary views), and
 * `federate` (the spiral re-seed to the next scale).
 */
import { type Action } from "@emsenn/relating";
import { capitalActions } from "./accounting/capital.mjs";
import { commodityActions } from "./accounting/commodity.mjs";
import { exchangeActions } from "./accounting/exchange.mjs";
import { strategyActions } from "./accounting/strategy.mjs";
import { valueActions } from "./accounting/value.mjs";
export { capitalActions, commodityActions, exchangeActions, strategyActions, valueActions };
/** organize — the apex: three social faces → the interior organization (global section). */
export declare const organizeAction: Action;
/** social-becoming — the stage-1 social-descent reading: the individuals re-posed. */
export declare const socialBecomingAction: Action;
/** relating — the social DOING reading: the directed bonds among agents. */
export declare const relatingAction: Action;
/** community — the social WORKING reading: the shared field (Simondon's transindividual). */
export declare const communityAction: Action;
/** institute — the stage-4 social-governing reading: the settled social order. */
export declare const instituteAction: Action;
/** symmetrize — the organization's FSym(𝔸) membership symmetry: interchangeable roles
 *  (structural equivalence) vs mobile names (name-passing), consolidating gaming's arena Ẽ. */
export declare const symmetrizeAction: Action;
/** stance — the organization's collective LEAN on the truth order ≤_t, consolidated from the
 *  socializing (across/truth) face (the Gen-2 lift of the agent's stance). */
export declare const stanceAction: Action;
/** cohesion — the organization's structural balance (Cartwright–Harary factions), the scale-2
 *  lift of the agent's coherence: is the society's sentiment network balanced or factionally frustrated? */
export declare const cohesionAction: Action;
/** govern — the capstone consolidation: read all three faculties' impossibility-escapes at once. */
export declare const governAction: Action;
/** verification-tournament — run organizing's organization/theatre signal through gaming's claim/refutation game. */
export declare const verificationTournamentAction: Action;
/** social-factor — the social-scale act-factorization: the receiving dual of speaking. */
export declare const socialFactorAction: Action;
/** assemble — the concrete spiral: real animating agents → one organization. */
export declare const assembleAction: Action;
/** adjudicate — the gluing act standalone: the one record-state many contributions form. */
export declare const adjudicateAction: Action;
/** face — settle one faculty's inter-agent membrane into its boundary face. */
export declare const faceAction: Action;
/** project — restrict the organization to its three social boundary views (holographic). */
export declare const projectAction: Action;
/** reseed — re-pose a settled organization as a federation-scale institution node. */
export declare const reseedAction: Action;
/** federate — the next scale up: parallel-compose constituent societies into a federation. */
export declare const federateAction: Action;
/** The package's actions — the source `induceBins` reads. The social gluing node
 *  (organize/adjudicate/assemble/project) is the apex; the four social-descent
 *  readings (social-becoming → relating → community → institution) and the social
 *  act-factorization are the substrate surface; federate is the spiral re-seed. */
/** office-eligibility - read office-conferred authority plus agent capabilities against requirements. */
export declare const officeEligibilityAction: Action;
/** accounting-utterances - project accounting entries to finite relating utterances. */
export declare const accountingUtterancesAction: Action;
/** accounting-balance - judge one transaction's exact per-commodity conservation. */
export declare const accountingBalanceAction: Action;
/** organize-directory - read a directory as organizing's governed substrate. */
export declare const organizeDirectoryAction: Action;
/** jupyter-notebook - project an organizing notebook input to a real nbformat document. */
export declare const jupyterNotebookAction: Action;
/** jupyter-run-cells - settle a sequence of code cells into a notebook witness ledger. */
export declare const jupyterRunCellsAction: Action;
/** jupyter-default-views - emit the default organizing notebook/data artifact bundle. */
export declare const jupyterDefaultViewsAction: Action;
export declare const actions: readonly Action[];
//# sourceMappingURL=actions.d.mts.map