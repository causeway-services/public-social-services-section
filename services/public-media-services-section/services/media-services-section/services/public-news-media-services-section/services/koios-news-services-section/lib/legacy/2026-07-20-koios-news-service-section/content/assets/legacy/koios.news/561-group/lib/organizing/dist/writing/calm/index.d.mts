/**
 * writing/calm - the CALM theorem read over organizing federation.
 *
 * CALM (Consistency As Logical Monotonicity) gives the external theorem joint:
 * coordination-free iff monotone. In this package that is not a new ontology.
 * The federation witness is still organizing's cross-arena Mayer-Vietoris
 * decomposition, and ActivityPub still reaches it through `federateActivities`.
 */
import { type FromSchema } from "@emsenn/relating";
import type { Activity } from "@emsenn/animating";
import { type Federation, type SocialBoundary } from "../../organizing.mjs";
export declare const calmReadingSchema: {
    readonly $id: "organizing/writing/calm/reading";
    readonly title: "CalmReading";
    readonly description: "A CALM theorem reading of organizing federation: coordination-free iff monotone. The witness is the existing federation decomposition: shared lifts, contested top-introducing overlap, and federationOnly non-Scott H1 obstruction.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "theorem", "operation", "monotone", "coordination", "witness"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.writing.calm.reading";
        };
        readonly theorem: {
            readonly const: "CALM";
        };
        readonly operation: {
            readonly const: "federate";
        };
        readonly monotone: {
            readonly type: "boolean";
            readonly description: "true exactly when the federation introduces no contested top and no federation-only non-Scott H1 obstruction";
        };
        readonly coordination: {
            readonly enum: readonly ["coordination-free", "consensus-required"];
            readonly description: "CALM classification: coordination-free iff monotone, consensus-required otherwise";
        };
        readonly witness: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["shared", "contested", "federationOnly"];
            readonly properties: {
                readonly shared: {
                    readonly description: "agreement that lifts through the federation without coordination";
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly contested: {
                    readonly description: "top-introducing overlap: disagreement held as contested rather than agreement-only accumulation";
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly federationOnly: {
                    readonly description: "non-Scott H1 obstruction introduced by the federation rather than any constituent alone";
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
};
export type CalmReading = FromSchema<typeof calmReadingSchema>;
export declare const calmReadingCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.writing.calm.reading";
    readonly monotone: boolean;
    readonly coordination: "coordination-free" | "consensus-required";
    readonly witness: {
        readonly contested: number;
        readonly federationOnly: number;
        readonly shared: number;
    };
    readonly theorem: "CALM";
    readonly operation: "federate";
}>;
/**
 * readCalmFederation - classify an existing organizing federation by CALM.
 *
 * Monotone here means agreement-only accumulation: no contested top introduced
 * across an overlap and no federation-only non-Scott H1 step.
 */
export declare function readCalmFederation(federation: Federation): CalmReading;
/**
 * readCalmCovers - classify organizing's own federation operation by CALM.
 *
 * The covers are passed straight through `federate`; this helper exists so CALM is
 * mounted on the public organizing operation rather than a parallel merge.
 */
export declare function readCalmCovers(covers: readonly SocialBoundary[]): CalmReading;
/**
 * readCalmActivities - ActivityPub-backed CALM reading.
 *
 * This is the WMAP/S2S path: Activities become camp membranes through
 * `federateActivities`, then the resulting federation is classified by CALM.
 */
export declare function readCalmActivities(campActivities: readonly (readonly Activity[])[]): CalmReading;
//# sourceMappingURL=index.d.mts.map