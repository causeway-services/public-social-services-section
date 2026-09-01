/**
 * reproducible-reasoning - research spike for RMN reasoning as a reproducible build.
 *
 * This module models the algebra only: an RMN reasoning term is rendered as an
 * organizing-owned Nix derivation, settled by Relating's deterministic evaluator,
 * and content-addressed by the normal form. It never shells out to real Nix.
 */
import { type FromSchema, type JsonRecord, type Tm } from "@emsenn/relating";
import { type NixDerivation, type NixStorePath, type NixWitness } from "./nix.mjs";
export declare const REPRODUCIBLE_REASONING_SPIKE_ASSUMPTION = "organizing/reproducible-reasoning renders an RMN reasoning term as a Nix-derivation-shaped artifact; it proves deterministic settling, not live agent cognition.";
export declare const ReproducibleReasoningBuildSchema: {
    readonly $id: "organizing/reproducible-reasoning/build";
    readonly title: "Reproducible reasoning build";
    readonly description: "A research-spike artifact rendering an RMN reasoning term as a content-addressed Nix derivation normal form.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "claim", "assumption", "derivation", "storePath", "contentAddress", "normalForm", "witnesses"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.reproducible-reasoning.build";
        };
        readonly claim: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly assumption: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly derivation: {
            readonly $ref: "organizing/nix/derivation";
        };
        readonly storePath: {
            readonly $ref: "organizing/nix/store-path";
        };
        readonly contentAddress: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly normalForm: {
            readonly $ref: "relating/term/tm";
        };
        readonly witnesses: {
            readonly type: "array";
            readonly items: {
                readonly $id: "organizing/nix/witness";
                readonly title: "Nix derivation witness";
                readonly description: "A witness-ledger row emitted while settling Nix/Guix derivations.";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["e", "a", "v", "t"];
                readonly properties: {
                    readonly e: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly a: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly v: {};
                    readonly t: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
};
export declare const ReproducibleReasoningRebuildSchema: {
    readonly $id: "organizing/reproducible-reasoning/rebuild";
    readonly title: "Reproducible reasoning rebuild report";
    readonly description: "A rebuild check that re-evaluates the derivation term and compares the expected content address with the settled normal form id.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "expectedContentAddress", "actualContentAddress", "ok", "storePath", "normalForm"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.reproducible-reasoning.rebuild";
        };
        readonly expectedContentAddress: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly actualContentAddress: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ok: {
            readonly type: "boolean";
        };
        readonly storePath: {
            readonly $ref: "organizing/nix/store-path";
        };
        readonly normalForm: {
            readonly $ref: "relating/term/tm";
        };
    };
};
export declare const reproducibleReasoningBuildCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.reproducible-reasoning.build";
    readonly claim: string;
    readonly witnesses: readonly {
        readonly e: string;
        readonly a: string;
        readonly v: unknown;
        readonly t: string;
    }[];
    readonly normalForm: unknown;
    readonly derivation: unknown;
    readonly storePath: unknown;
    readonly assumption: string;
    readonly contentAddress: string;
}>;
export declare const reproducibleReasoningRebuildCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.reproducible-reasoning.rebuild";
    readonly normalForm: unknown;
    readonly ok: boolean;
    readonly storePath: unknown;
    readonly expectedContentAddress: string;
    readonly actualContentAddress: string;
}>;
type ReproducibleReasoningBuildCarrierType = FromSchema<typeof ReproducibleReasoningBuildSchema>;
type ReproducibleReasoningRebuildCarrierType = FromSchema<typeof ReproducibleReasoningRebuildSchema>;
export type ReproducibleReasoningBuild = Omit<ReproducibleReasoningBuildCarrierType, "derivation" | "storePath" | "normalForm" | "witnesses"> & {
    readonly derivation: NixDerivation;
    readonly storePath: NixStorePath;
    readonly normalForm: Tm;
    readonly witnesses: readonly NixWitness[];
};
export type ReproducibleReasoningRebuild = Omit<ReproducibleReasoningRebuildCarrierType, "storePath" | "normalForm"> & {
    readonly storePath: NixStorePath;
    readonly normalForm: Tm;
};
export interface ReproducibleReasoningInput {
    readonly id: string;
    readonly name: string;
    readonly term: Tm;
    readonly claim?: string;
    readonly system?: string;
    readonly inputIds?: readonly string[];
    readonly env?: JsonRecord;
    readonly witnesses?: readonly NixWitness[];
}
/**
 * Render one RMN reasoning term as a content-addressed derivation artifact.
 *
 * The bridge is intentionally one-way in this spike: the RMN term is the
 * reasoning witness being rendered; the Nix-shaped derivation is the reproducible
 * build view of its settled normal form.
 */
export declare function reproducibleReasoning(input: ReproducibleReasoningInput): ReproducibleReasoningBuild;
/**
 * Rebuild an artifact by re-evaluating the carried derivation term and comparing
 * the expected store hash/content id with the newly settled normal form.
 */
export declare function rebuild(artifact: ReproducibleReasoningBuild): ReproducibleReasoningRebuild;
export {};
//# sourceMappingURL=reproducible-reasoning.d.mts.map