/**
 * cockpit-coordination — make the live MASH cockpit coordinate over its OWN
 * bridges.
 *
 * The cockpit already runs on RWIL witnesses (the hook-event ledger), capability
 * claims ("workspace:X held by agent S until T"), and federated peer disagreement
 * (`claimed-locus-overlap`). Today the running hook loop reports those overlaps as
 * a flat list; nobody holds the contradiction, and nothing tells the operator how
 * much of a multi-agent collision is irreducible. This module is the additive
 * bridge that lets the cockpit coordinate over the moat instead, WITHOUT touching
 * the live hook surface in `theatre.mts`.
 *
 * Two wirings, both on the relating kernel:
 *
 *  1. ACCOUNTABLE CAPABILITY CLAIM. A held write-capability is an accountable
 *     transaction over one RWIL witness: it is `authorized` (the work-locus
 *     `Capability` actually grants the claimed path), `witnessed` (the claim is a
 *     single EAVT row through the coherence kernel's `Reading`), and `queryable`
 *     (`accountableClaim` answers authorized ∧ witnessed in one shot). When two
 *     sessions claim the same path, the contest does not silently pick a winner:
 *     it is held as bilattice top (⊤) with both holders retained.
 *
 *  2. CONTRADICTION-AWARE COORDINATION. When peers disagree about a cell/path,
 *     coordination runs through `federateGraded`: each session is a federation
 *     source, each claimed path a cell. A monotone disagreement lifts
 *     coordination-free (held ⊤, no Raft round); a non-monotone one routes only
 *     its irreducible H1 residue to consensus. Everything else lifts for free.
 *
 * Nothing here mutates the hook loop. The cockpit CAN call `coordinateCockpitClaims`
 * over the same `OrganizingTheatreActiveWorkLocusClaim[]` the live signal already
 * produces, and the operator can switch the live surface over deliberately.
 */
import { type ChargeCarrier, type FromSchema, type JsonValue } from "@emsenn/relating";
import { type CoherenceReport, type Reading, type RWILWitness } from "@emsenn/relating/ledger";
import type { Capability } from "@emsenn/animating";
import { type FederateGradedSource, type GradedConsensus } from "./federate-graded.mjs";
import type { OrganizingTheatreActiveWorkLocusClaim } from "./theatre.mjs";
/**
 * The one EAVT row that IS the held capability claim. Entity = the claimed path,
 * value = who holds it under which capability until when. This is the shared
 * pivot every reading round-trips through.
 */
export declare function claimWitness(claim: OrganizingTheatreActiveWorkLocusClaim, path: string): RWILWitness;
export interface HeldCapabilityWire {
    readonly kind: "organizing.cockpit.held-capability";
    readonly path: string;
    readonly session: string;
    readonly harness: string;
    readonly claimId: string;
    readonly capability: string;
    readonly grants: string;
    readonly holder: string;
    readonly reason: string | null;
    readonly expiresAt: string | null;
    readonly at: string | null;
    readonly event: string | null;
}
/**
 * The held write-capability read as a coherence-kernel `Reading`: the claim row
 * and the held-capability wire are the same object under two codes, exactly like
 * `outbox ≅ log`. This is what makes the claim QUERYABLE — it is a real RWIL
 * reading, not an ad-hoc record.
 */
export declare const heldCapabilityReading: Reading<HeldCapabilityWire>;
/**
 * Authority gate: does the held `Capability` actually grant the claimed path?
 *
 * Work-locus capabilities are granted as `workspace:<path>|<path>...` (see
 * `organizingTheatreWorkLocusCapabilityGrant`). A claim over `path` is authorized
 * iff the capability's grant string names that path (or a prefix of it).
 */
export declare function capabilityGrantsPath(capability: Capability, path: string): boolean;
declare const accountableClaimSchema: {
    readonly $id: "organizing/cockpit/accountable-claim";
    readonly title: "CockpitAccountableClaim";
    readonly description: "A held workspace write-capability read as an accountable transaction: authorized (capability grants the path), witnessed (one RWIL row), and queryable. A contested path is held as bilattice top, never silently won.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "path", "query", "witness", "authorized", "witnessed", "accountable", "legs", "standing", "holders", "coherence"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.cockpit.accountable-claim";
        };
        readonly path: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly query: {
            readonly const: "authorized and witnessed";
        };
        readonly witness: {};
        readonly authorized: {
            readonly type: "boolean";
        };
        readonly witnessed: {
            readonly type: "boolean";
        };
        readonly accountable: {
            readonly type: "boolean";
        };
        readonly legs: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["authorized", "witnessed"];
            readonly properties: {
                readonly authorized: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly witnessed: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
        readonly standing: {
            readonly enum: readonly ["sole", "contested"];
        };
        readonly contestCharge: {};
        readonly truthHolders: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly falsityHolders: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly holders: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["session", "harness", "claimId", "capability", "witness", "authorized"];
                readonly properties: {
                    readonly session: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly harness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly claimId: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly capability: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly authorized: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly coherence: {
            readonly type: "array";
            readonly items: {};
        };
    };
};
export interface AccountableClaimHolder {
    readonly session: string;
    readonly harness: string;
    readonly claimId: string;
    readonly capability: string;
    readonly witness: string;
    readonly authorized: boolean;
}
export type AccountableClaim = Omit<FromSchema<typeof accountableClaimSchema>, "witness" | "contestCharge" | "holders" | "coherence"> & {
    readonly witness: JsonValue;
    readonly contestCharge?: ChargeCarrier;
    readonly truthHolders?: readonly string[];
    readonly falsityHolders?: readonly string[];
    readonly holders: readonly AccountableClaimHolder[];
    readonly coherence: readonly CoherenceReport[];
};
export declare const accountableClaimCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.cockpit.accountable-claim";
    readonly path: string;
    readonly witness: unknown;
    readonly coherence: readonly unknown[];
    readonly standing: "contested" | "sole";
    readonly authorized: boolean;
    readonly accountable: boolean;
    readonly legs: {
        readonly authorized: string;
        readonly witnessed: string;
    };
    readonly query: "authorized and witnessed";
    readonly witnessed: boolean;
    readonly holders: readonly {
        readonly capability: string;
        readonly witness: string;
        readonly session: string;
        readonly authorized: boolean;
        readonly harness: string;
        readonly claimId: string;
    }[];
    readonly contestCharge?: unknown;
    readonly truthHolders?: readonly string[];
    readonly falsityHolders?: readonly string[];
}>;
/**
 * accountableClaim — read one claimed path's held capabilities as an accountable
 * transaction. `authorized ∧ witnessed` is one query; a contested path (more than
 * one holder) is held as ⊤, not resolved to a winner.
 */
export declare function accountableClaim(path: string, claims: readonly OrganizingTheatreActiveWorkLocusClaim[]): AccountableClaim;
/**
 * Project the cockpit's active work-locus claims into `federateGraded` sources:
 * one source per session, one cell per claimed path. A path claimed by a single
 * session is agreement (shared); a path claimed by two sessions is disagreement,
 * routed through contradiction-aware federation. The value carried per cell is the
 * claim's INTENT (`reason`) — the shared vocabulary over which competing intents
 * form the source-to-stance cover cycle whose H1 is the coordination residue.
 */
export declare function cockpitFederationSources(claims: readonly OrganizingTheatreActiveWorkLocusClaim[]): readonly FederateGradedSource[];
export interface CoordinateCockpitClaimsOptions {
    readonly cluster?: string;
}
declare const cockpitCoordinationSchema: {
    readonly $id: "organizing/cockpit/coordination";
    readonly title: "CockpitCoordination";
    readonly description: "The cockpit's claim field coordinated over its own bridges: per-path accountable claims (held capability as authorized ∧ witnessed transaction, contested paths as bilattice top) plus the contradiction-aware federation of competing claims (monotone overlaps coordination-free, only the H1 residue routed to consensus).";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "claims", "federation"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.cockpit.coordination";
        };
        readonly claims: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "organizing/cockpit/accountable-claim";
            };
        };
        readonly federation: {};
    };
};
export type CockpitCoordination = Omit<FromSchema<typeof cockpitCoordinationSchema>, "claims" | "federation"> & {
    readonly claims: readonly AccountableClaim[];
    readonly federation: GradedConsensus | null;
};
export declare const cockpitCoordinationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.cockpit.coordination";
    readonly federation: unknown;
    readonly claims: readonly unknown[];
}>;
/**
 * coordinateCockpitClaims — the additive bridge the live cockpit CAN switch to.
 *
 * Wiring 1: each claimed path becomes an accountable claim (held capability as
 * authorized ∧ witnessed, contests held as ⊤).
 *
 * Wiring 2: all competing claims are routed through `federateGraded`, so a
 * monotone collision lifts coordination-free while only the non-monotone H1
 * residue reaches consensus.
 *
 * This does not touch the running hook loop; it is a pure reading over the same
 * `OrganizingTheatreActiveWorkLocusClaim[]` the live signal already produces.
 */
export declare function coordinateCockpitClaims(claims: readonly OrganizingTheatreActiveWorkLocusClaim[], options?: CoordinateCockpitClaimsOptions): CockpitCoordination;
export {};
//# sourceMappingURL=cockpit-coordination.d.mts.map