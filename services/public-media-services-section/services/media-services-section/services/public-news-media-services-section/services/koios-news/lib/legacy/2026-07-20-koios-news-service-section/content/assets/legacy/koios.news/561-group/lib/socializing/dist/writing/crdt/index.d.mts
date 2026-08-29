/**
 * writing/crdt — socializing's merge made into an interoperable state-CRDT.
 *
 * A CRDT is not a second ontology here. Its semilattice join is exactly the
 * knowledge-order join `joinKnowledge` from relating, lifted from one charge to
 * a replicated JSON state: cells with the same key accumulate evidence by
 * `∨_k`; distinct cells commute by map union. The multi-value register below is
 * the register-shaped projection of that state. Concurrent disagreement is not
 * resolved by a clock winner; both writes remain present and the register's
 * charge rises to `stable` (⊤, told-both).
 */
import { type ChargeCarrier, type ChargeValueName, type FromSchema, type JsonValue } from "@emsenn/relating";
declare const writeSchema: {
    readonly type: "object";
    readonly description: "one causally-addressed MV-register write, kept as a witness rather than collapsed by a clock";
    readonly required: readonly ["dot", "replica", "value", "standing", "witness"];
    readonly properties: {
        readonly dot: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly replica: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly value: {};
        readonly standing: {
            readonly enum: readonly ["potential", "active", "stable", "absurd"];
        };
        readonly witness: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
    readonly additionalProperties: false;
};
export type MultiValueRegisterWrite = FromSchema<typeof writeSchema>;
declare const stateCellSchema: {
    readonly type: "object";
    readonly description: "one join-semilattice cell: key-addressed knowledge standing plus optional register writes";
    readonly required: readonly ["key", "charge"];
    readonly properties: {
        readonly key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly charge: {
            readonly description: "a relating ChargeCarrier; referenced, never redefined";
        };
        readonly writes: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly description: "one causally-addressed MV-register write, kept as a witness rather than collapsed by a clock";
                readonly required: readonly ["dot", "replica", "value", "standing", "witness"];
                readonly properties: {
                    readonly dot: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly replica: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly standing: {
                        readonly enum: readonly ["potential", "active", "stable", "absurd"];
                    };
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type StateCrdtCell = Omit<FromSchema<typeof stateCellSchema>, "charge" | "writes"> & {
    readonly charge: ChargeCarrier;
    readonly writes?: readonly MultiValueRegisterWrite[];
};
export declare const StateCrdtSchema: {
    readonly $id: "socializing/writing/crdt/state";
    readonly title: "StateCrdt";
    readonly description: "A state-based CRDT carrier whose merge is the pointwise <=_k join from relating. Cells are keyed replicated-state entries; their charge is a reused ChargeCarrier, so merge is joinKnowledge and no parallel lattice is introduced.";
    readonly type: "object";
    readonly required: readonly ["kind", "cells"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.crdt.state";
        };
        readonly cells: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly description: "one join-semilattice cell: key-addressed knowledge standing plus optional register writes";
                readonly required: readonly ["key", "charge"];
                readonly properties: {
                    readonly key: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly charge: {
                        readonly description: "a relating ChargeCarrier; referenced, never redefined";
                    };
                    readonly writes: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly description: "one causally-addressed MV-register write, kept as a witness rather than collapsed by a clock";
                            readonly required: readonly ["dot", "replica", "value", "standing", "witness"];
                            readonly properties: {
                                readonly dot: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly replica: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly value: {};
                                readonly standing: {
                                    readonly enum: readonly ["potential", "active", "stable", "absurd"];
                                };
                                readonly witness: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                            readonly additionalProperties: false;
                        };
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type StateCrdt = Omit<FromSchema<typeof StateCrdtSchema>, "cells"> & {
    readonly cells: readonly StateCrdtCell[];
};
export declare const stateCrdtCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.crdt.state";
    readonly cells: readonly {
        readonly charge: unknown;
        readonly key: string;
        readonly writes?: readonly {
            readonly value: unknown;
            readonly standing: "stable" | "absurd" | "potential" | "active";
            readonly dot: string;
            readonly replica: string;
            readonly witness: string;
        }[];
    }[];
}>;
export declare const MultiValueRegisterSchema: {
    readonly $id: "socializing/writing/crdt/mv-register";
    readonly title: "MultiValueRegister";
    readonly description: "A multi-value register as a state-CRDT projection: concurrent writes are retained as witnesses, and the register's standing is the <=_k join of their standings. Conflicts therefore settle to stable/top instead of last-writer-wins.";
    readonly type: "object";
    readonly required: readonly ["kind", "key", "charge", "writes"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.crdt.mv-register";
        };
        readonly key: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly charge: {
            readonly description: "a relating ChargeCarrier; the register's accumulated <=_k standing";
        };
        readonly writes: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly description: "one causally-addressed MV-register write, kept as a witness rather than collapsed by a clock";
                readonly required: readonly ["dot", "replica", "value", "standing", "witness"];
                readonly properties: {
                    readonly dot: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly replica: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly standing: {
                        readonly enum: readonly ["potential", "active", "stable", "absurd"];
                    };
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type MultiValueRegister = Omit<FromSchema<typeof MultiValueRegisterSchema>, "charge" | "writes"> & {
    readonly charge: ChargeCarrier;
    readonly writes: readonly MultiValueRegisterWrite[];
};
export declare const multiValueRegisterCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.crdt.mv-register";
    readonly charge: unknown;
    readonly key: string;
    readonly writes: readonly {
        readonly value: unknown;
        readonly standing: "stable" | "absurd" | "potential" | "active";
        readonly dot: string;
        readonly replica: string;
        readonly witness: string;
    }[];
}>;
/** The knowledge-order bottom for a fresh replicated state. */
export declare function emptyCrdtState(): StateCrdt;
/** Build a state-CRDT cell, admitting the charge carrier through relating's own surface. */
export declare function crdtCell(key: string, standing: ChargeValueName, witness: string): StateCrdtCell;
/** Build a state-CRDT snapshot from cells; equal keys are immediately joined. */
export declare function crdtState(cells?: readonly StateCrdtCell[]): StateCrdt;
/**
 * Merge two state-CRDT snapshots by pointwise `joinKnowledge`.
 *
 * The returned normal form is sorted by key. Because each key folds with
 * relating's idempotent/commutative/associative knowledge join, the state merge
 * inherits those semilattice laws.
 */
export declare function mergeCrdtStates(left: StateCrdt, right: StateCrdt): StateCrdt;
/** A one-write MV-register replica. The write standing is explicit so callers can
 *  represent opposing concurrent claims without encoding that opposition as time. */
export declare function mvRegister(key: string, replica: string, value: JsonValue, options?: {
    readonly standing?: ChargeValueName;
    readonly witness?: string;
}): MultiValueRegister;
/** Merge MV-register replicas by lifting them into the state-CRDT join. */
export declare function mergeMultiValueRegisters(left: MultiValueRegister, right: MultiValueRegister): MultiValueRegister;
/** The register's current bilattice standing name. */
export declare function multiValueRegisterStanding(register: MultiValueRegister): ChargeValueName;
/** The value-level join, exposed for callers/tests that need the algebra witness. */
export declare function joinCrdtStanding(left: ChargeValueName, right: ChargeValueName): ChargeValueName;
export {};
//# sourceMappingURL=index.d.mts.map