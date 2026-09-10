import { type Design } from "./design.mjs";
import { type Locus } from "./locus.mjs";
/**
 * `faxResponder(B)` — the flat-valuation **copycat responder** at a behaviour: the
 * superposition of the Daimon (⊤) responses over the behaviour's material core
 * (`incarnation`). It commits ⊤ at every locus any incarnated member of B visits, so
 * it **converges with (accepts) every member of B** — i.e. it lies in `B^⊥`. This is
 * the convergence shadow of the reactive Fax at the valuation grain. (At the chronicle
 * grain it sharpens into the full η-expanded copycat; see `faxIdentity`.)
 */
export declare function faxResponder(set: readonly Design[], universe: readonly Design[]): Design;
export interface FaxResponderWitness {
    readonly kind: "game.identity.fax-responder:witness";
    /** The responder design (⊤ over the behaviour's visited loci). */
    readonly responder: Design;
    /** The loci it commits ⊤ at — the behaviour's material interface. */
    readonly interface: readonly Locus[];
    /** It converges with (accepts) every member of the behaviour's incarnation. */
    readonly acceptsAll: true;
}
export interface FaxResponderObstruction {
    readonly kind: "game.identity.fax-responder-obstruction";
    readonly responder: Design;
    /** A member the responder fails to converge with (e.g. an empty-support member). */
    readonly rejected: Design;
}
export type FaxResponderJudgment = FaxResponderWitness | FaxResponderObstruction;
/**
 * Witness that `faxResponder(B)` accepts every member of B (lies in `B^⊥`): the
 * copycat-convergence law at the valuation grain. The witness records the responder
 * and its interface loci; an obstruction names a member it cannot meet (a member with
 * empty support, which no design can converge with).
 */
export declare function faxResponderJudgment(set: readonly Design[], universe: readonly Design[]): FaxResponderJudgment;
export interface FaxIdentityStatement {
    readonly kind: "game.identity.fax.statement";
    readonly theorem: string;
}
/**
 * The categorical-identity law for Fax, carried as data with its grain made explicit.
 * Naming the theorem the way `cutElimination` names the Hauptsatz: the engine (cut =
 * `interact` gated by convergence) lives in `proving/computational-ludics`; this states
 * what Fax IS and where it lives.
 */
export declare function faxIdentity(): FaxIdentityStatement;
export declare function isFaxResponderWitness(value: unknown): value is FaxResponderWitness;
//# sourceMappingURL=identity.d.mts.map