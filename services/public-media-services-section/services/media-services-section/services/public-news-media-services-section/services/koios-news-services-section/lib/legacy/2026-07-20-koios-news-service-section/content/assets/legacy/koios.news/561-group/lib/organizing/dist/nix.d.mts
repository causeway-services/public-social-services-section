import { type FromSchema, type JsonRecord, type Tm } from "@emsenn/relating";
export declare const NIX_NO_REAL_BINARY_ASSUMPTION = "organizing/nix models derivation algebra over RMN terms; it does not invoke a real nix or guix binary.";
export declare const NixWitnessSchema: {
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
export declare const NixDerivationSchema: {
    readonly $id: "organizing/nix/derivation";
    readonly title: "Nix derivation";
    readonly description: "A Nix/Guix derivation as a settled RMN term: deterministic evaluation reaches the normal form whose content address names the store path.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "id", "name", "system", "term", "inputIds", "env"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.nix.derivation";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly system: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly term: {
            readonly $ref: "relating/term/tm";
        };
        readonly inputIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly env: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
export declare const NixStorePathSchema: {
    readonly $id: "organizing/nix/store-path";
    readonly title: "Nix store path";
    readonly description: "A content-addressed store path projected from a settled derivation normal form. The `$id` is the term content id.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "$id", "derivationId", "name", "hash", "path", "normalForm"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.nix.store-path";
        };
        readonly $id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly derivationId: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly hash: {
            readonly type: "string";
            readonly minLength: 64;
        };
        readonly path: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly normalForm: {
            readonly $ref: "relating/term/tm";
        };
    };
};
export declare const NixClosureSchema: {
    readonly $id: "organizing/nix/closure";
    readonly title: "Nix closure";
    readonly description: "The transitive settled dependency set of a root derivation, with store paths and witness-ledger rows.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "root", "storePaths", "witnesses"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.nix.closure";
        };
        readonly root: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly storePaths: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "organizing/nix/store-path";
            };
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
export declare const nixWitnessCarrier: import("@emsenn/relating").Carrier<{
    readonly e: string;
    readonly a: string;
    readonly v: unknown;
    readonly t: string;
}>;
export declare const nixDerivationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.nix.derivation";
    readonly id: string;
    readonly term: unknown;
    readonly name: string;
    readonly env: Record<string, unknown>;
    readonly system: string;
    readonly inputIds: readonly string[];
}>;
export declare const nixStorePathCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.nix.store-path";
    readonly path: string;
    readonly name: string;
    readonly normalForm: unknown;
    readonly $id: string;
    readonly derivationId: string;
    readonly hash: string;
}>;
export declare const nixClosureCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.nix.closure";
    readonly witnesses: readonly {
        readonly e: string;
        readonly a: string;
        readonly v: unknown;
        readonly t: string;
    }[];
    readonly root: string;
    readonly storePaths: readonly unknown[];
}>;
type NixDerivationCarrierType = FromSchema<typeof NixDerivationSchema>;
type NixStorePathCarrierType = FromSchema<typeof NixStorePathSchema>;
type NixClosureCarrierType = FromSchema<typeof NixClosureSchema>;
export type NixWitness = FromSchema<typeof NixWitnessSchema>;
export type NixDerivation = Omit<NixDerivationCarrierType, "term" | "env" | "inputIds"> & {
    readonly term: Tm;
    readonly env: JsonRecord;
    readonly inputIds: readonly string[];
};
export type NixStorePath = Omit<NixStorePathCarrierType, "normalForm"> & {
    readonly normalForm: Tm;
};
export type NixClosure = Omit<NixClosureCarrierType, "storePaths" | "witnesses"> & {
    readonly storePaths: readonly NixStorePath[];
    readonly witnesses: readonly NixWitness[];
};
export interface NixDerivationInput {
    readonly id: string;
    readonly name: string;
    readonly term: Tm;
    readonly system?: string;
    readonly inputIds?: readonly string[];
    readonly env?: JsonRecord;
}
export interface SettledDerivation {
    readonly derivation: NixDerivation;
    readonly normalForm: Tm;
    readonly storePath: NixStorePath;
    readonly witnesses: readonly NixWitness[];
}
export declare function nixDerivation(input: NixDerivationInput): NixDerivation;
export declare function settleDerivation(input: NixDerivationInput | NixDerivation): SettledDerivation;
export declare function evaluateDerivation(input: NixDerivationInput | NixDerivation): NixStorePath;
export declare function termContentId(term: Tm): string;
export declare function storePathFromTerm(term: Tm, derivation: Pick<NixDerivation, "id" | "name">): NixStorePath;
export declare function closureOf(root: NixDerivationInput | NixDerivation, derivations: readonly (NixDerivationInput | NixDerivation)[]): NixClosure;
export {};
//# sourceMappingURL=nix.d.mts.map