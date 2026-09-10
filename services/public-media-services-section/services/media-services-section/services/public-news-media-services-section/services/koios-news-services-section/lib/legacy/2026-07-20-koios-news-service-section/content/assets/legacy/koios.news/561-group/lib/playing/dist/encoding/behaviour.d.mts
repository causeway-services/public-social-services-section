/**
 * Behaviour-carrier codec — bi-orthogonal closures of design-sets.
 *
 * A behaviour witness packages the carrier of a bi-orthogonally closed
 * ($\mathbf{B} = \mathbf{B}^{\perp\perp}$) set of designs — a Galois closure on
 * the lattice of design-sets under orthogonality.  The witness carrier has no
 * hidden invariant beyond being a list of designs, so we serialize the list and
 * reconstruct the frozen `BehaviourWitness` literal directly (its `kind`
 * discriminant fixed); we do *not* recompute the closure on decode, which would
 * not reproduce an arbitrary serialized carrier.
 */
import type { BehaviourWitness } from "../structuring/concurrent-game/with-symmetry/ludicizing/settling/index.mjs";
import type { Json } from "./json.mjs";
/** Encode a behaviour witness to `{carrier: [design, ...]}`. */
export declare function encodeBehaviour(value: BehaviourWitness): Json;
/** Decode `{carrier: [design, ...]}` back to a frozen `BehaviourWitness`. */
export declare function decodeBehaviour(json: unknown): BehaviourWitness;
//# sourceMappingURL=behaviour.d.mts.map