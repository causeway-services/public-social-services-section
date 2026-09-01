/**
 * writing/mesh-liveness — SWIM + HyParView/Plumtree as socializing's mesh-liveness
 * layer beneath federation.
 *
 * This is a protocol model, not a network stack: no sockets, timers, encryption, or
 * process membership daemon are implemented here. The module admits protocol observations
 * as relating carriers, joins membership views through the existing socializing CRDT
 * surface, and projects epidemic dissemination through socializing.broadcast.
 */
import { type ChargeCarrier, type FromSchema, type JsonRecord } from "@emsenn/relating";
import type { Field } from "../../socialize/field.mjs";
import { type StateCrdt } from "../crdt/index.mjs";
export declare const MESH_LIVENESS_PROTOCOLS: readonly ["swim", "hyparview", "plumtree"];
export type MeshLivenessProtocol = typeof MESH_LIVENESS_PROTOCOLS[number];
export declare const LIVENESS_STATES: readonly ["alive", "suspect", "dead"];
export type LivenessState = typeof LIVENESS_STATES[number];
export declare const MeshLivenessObservationSchema: {
    readonly $id: "socializing/writing/mesh-liveness/observation";
    readonly title: "MeshLivenessObservation";
    readonly description: "One SWIM-family membership observation: alive/suspect/dead as a charged witness over a member at a round and incarnation.";
    readonly type: "object";
    readonly required: readonly ["kind", "member", "status", "protocol", "observer", "round", "incarnation", "charge", "witness"];
    readonly properties: {
        readonly charge: {
            readonly description: "a relating ChargeCarrier; the <=_k liveness witness";
        };
        readonly witness: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly member: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly status: {
            readonly enum: readonly ["alive", "suspect", "dead"];
        };
        readonly protocol: {
            readonly enum: readonly ["swim", "hyparview", "plumtree"];
        };
        readonly observer: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly round: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly incarnation: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly kind: {
            readonly const: "socializing.mesh-liveness.observation";
        };
    };
    readonly additionalProperties: false;
};
export type MeshLivenessObservation = Omit<FromSchema<typeof MeshLivenessObservationSchema>, "charge"> & {
    readonly charge: ChargeCarrier;
};
export declare const meshLivenessObservationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.mesh-liveness.observation";
    readonly charge: unknown;
    readonly member: string;
    readonly observer: string;
    readonly status: "alive" | "suspect" | "dead";
    readonly witness: string;
    readonly protocol: "swim" | "hyparview" | "plumtree";
    readonly round: number;
    readonly incarnation: number;
}>;
export declare const MembershipViewSchema: {
    readonly $id: "socializing/writing/mesh-liveness/membership-view";
    readonly title: "MembershipView";
    readonly description: "A peer's membership view as a state-CRDT: each member key accumulates SWIM observations by socializing.merge's <=_k join.";
    readonly type: "object";
    readonly required: readonly ["kind", "observer", "round", "state"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.mesh-liveness.membership-view";
        };
        readonly observer: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly round: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly state: {
            readonly description: "a socializing StateCrdt carrier; membership cells are joined with mergeCrdtStates";
        };
    };
    readonly additionalProperties: false;
};
export type MembershipView = Omit<FromSchema<typeof MembershipViewSchema>, "state"> & {
    readonly state: StateCrdt;
};
export declare const membershipViewCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.mesh-liveness.membership-view";
    readonly observer: string;
    readonly state: unknown;
    readonly round: number;
}>;
export declare const HyParViewOverlaySchema: {
    readonly $id: "socializing/writing/mesh-liveness/hyparview-overlay";
    readonly title: "HyParViewOverlay";
    readonly description: "A deterministic HyParView reading: active peers form eager gossip links; passive peers are lazy repair candidates.";
    readonly type: "object";
    readonly required: readonly ["kind", "self", "active", "passive"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.mesh-liveness.hyparview-overlay";
        };
        readonly self: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly active: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly passive: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
    readonly additionalProperties: false;
};
export type HyParViewOverlay = FromSchema<typeof HyParViewOverlaySchema>;
export declare const hyParViewOverlayCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.mesh-liveness.hyparview-overlay";
    readonly active: readonly string[];
    readonly passive: readonly string[];
    readonly self: string;
}>;
export declare const PlumtreeGossipPlanSchema: {
    readonly $id: "socializing/writing/mesh-liveness/plumtree-plan";
    readonly title: "PlumtreeGossipPlan";
    readonly description: "A Plumtree reading over a HyParView overlay: eager push on active links, lazy repair adverts on passive links.";
    readonly type: "object";
    readonly required: readonly ["kind", "messageId", "root", "eager", "lazy"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.mesh-liveness.plumtree-plan";
        };
        readonly messageId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly root: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly eager: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly lazy: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
    readonly additionalProperties: false;
};
export type PlumtreeGossipPlan = FromSchema<typeof PlumtreeGossipPlanSchema>;
export declare const plumtreeGossipPlanCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.mesh-liveness.plumtree-plan";
    readonly messageId: string;
    readonly root: string;
    readonly eager: readonly string[];
    readonly lazy: readonly string[];
}>;
export type LivenessReading = {
    readonly member: string;
    readonly status: LivenessState;
    readonly incarnation: number;
    readonly round: number;
    readonly charge: ChargeCarrier;
    readonly accumulatedCharge: ChargeCarrier;
    readonly witnesses: readonly string[];
};
export declare function livenessCharge(status: LivenessState, witness: string): ChargeCarrier;
export declare function meshLivenessObservation(input: {
    readonly member: string;
    readonly status: LivenessState;
    readonly observer: string;
    readonly round: number;
    readonly incarnation?: number;
    readonly protocol?: MeshLivenessProtocol;
    readonly witness?: string;
}): MeshLivenessObservation;
export declare function membershipView(observer: string, observations?: readonly MeshLivenessObservation[], round?: number): MembershipView;
export declare function mergeMembershipViews(left: MembershipView, right: MembershipView): MembershipView;
export declare function livenessOf(view: MembershipView, member: string): LivenessReading | null;
export declare function membershipTable(view: MembershipView): readonly LivenessReading[];
export declare function swimRound(view: MembershipView, options: {
    readonly observer: string;
    readonly round: number;
    readonly members?: readonly string[];
    readonly responsive?: readonly string[];
    readonly suspicionRounds?: number;
}): MembershipView;
export declare function failureComplete(view: MembershipView, member: string): boolean;
export declare function hyParViewOverlay(self: string, members: readonly string[], options?: {
    readonly activeFanout?: number;
    readonly passiveFanout?: number;
}): HyParViewOverlay;
export declare function plumtreeGossipPlan(overlay: HyParViewOverlay, messageId: string): PlumtreeGossipPlan;
export declare function membershipViewMeme(view: MembershipView, witness?: string): JsonRecord;
export declare function broadcastMembershipView(field: Field, options: {
    readonly from: number;
    readonly to?: number;
    readonly view: MembershipView;
    readonly witness?: string;
}): Field;
export declare function sameMembershipView(left: MembershipView, right: MembershipView): boolean;
export declare function livenessStatusName(reading: LivenessReading): string;
//# sourceMappingURL=index.d.mts.map