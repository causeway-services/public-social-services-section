/**
 * federate-graded - contradiction-aware federation over coherent RWIL readings.
 *
 * This is the bridge where held top and graded H1 meet: sources contribute
 * protocol-local collections, each cell is admitted as a Reading over one RWIL
 * witness, disagreement is retained as a bilattice top, and only nonzero-H1
 * residue is routed into Raft.
 */
import { type ChargeCarrier, type FromSchema, type JsonValue } from "@emsenn/relating";
import { type CoherenceReport } from "@emsenn/relating/ledger";
import type { Federation } from "./schemas.mjs";
import type { CalmReading } from "./writing/calm/index.mjs";
import { type CalmRaftFrontier, type RaftAppendResult, type RaftLeadership, type RaftLog } from "./writing/raft/index.mjs";
declare const federatedCellSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cell", "value", "witness"];
    readonly properties: {
        readonly cell: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly value: {};
        readonly witness: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly polarity: {
            readonly enum: readonly ["assert", "deny"];
        };
    };
};
export declare const federateGradedSourceSchema: {
    readonly $id: "organizing/federate-graded/source";
    readonly title: "FederateGradedSource";
    readonly description: "One protocol source admitted into contradiction-aware federation. Its cells are protocol-local readings of RWIL witnesses.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "protocol", "collection"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly protocol: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly collection: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["cell", "value", "witness"];
                readonly properties: {
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly polarity: {
                        readonly enum: readonly ["assert", "deny"];
                    };
                };
            };
        };
    };
};
export type FederateGradedSource = Omit<FromSchema<typeof federateGradedSourceSchema>, "collection"> & {
    readonly collection: readonly FederateGradedCell[];
};
export type FederateGradedCell = Omit<FromSchema<typeof federatedCellSchema>, "value" | "polarity"> & {
    readonly value: JsonValue;
    readonly polarity?: "assert" | "deny";
};
export declare const federateGradedSourceCarrier: import("@emsenn/relating").Carrier<{
    readonly id: string;
    readonly protocol: string;
    readonly collection: readonly {
        readonly value: unknown;
        readonly cell: string;
        readonly witness: string;
        readonly polarity?: "assert" | "deny";
    }[];
}>;
declare const sourceStatementSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
    readonly properties: {
        readonly source: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly protocol: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly cell: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly value: {};
        readonly polarity: {
            readonly enum: readonly ["assert", "deny"];
        };
        readonly witness: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
declare const sharedCellSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cell", "value", "witnesses", "statements"];
    readonly properties: {
        readonly cell: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly value: {};
        readonly witnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly statements: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
                readonly properties: {
                    readonly source: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly protocol: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly polarity: {
                        readonly enum: readonly ["assert", "deny"];
                    };
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
};
declare const contestedCellSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cell", "standing", "topCharge", "truthWitnesses", "falsityWitnesses", "statements", "calm"];
    readonly properties: {
        readonly cell: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly standing: {
            readonly const: "stable";
        };
        readonly topCharge: {};
        readonly truthWitnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly falsityWitnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly statements: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
                readonly properties: {
                    readonly source: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly protocol: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly polarity: {
                        readonly enum: readonly ["assert", "deny"];
                    };
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly calm: {
            readonly const: "coordination-free";
        };
    };
};
declare const needsCoordinationCellSchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["cell", "standing", "topCharge", "truthWitnesses", "falsityWitnesses", "statements", "h1", "raftCommand"];
    readonly properties: {
        readonly cell: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly standing: {
            readonly const: "stable";
        };
        readonly topCharge: {};
        readonly truthWitnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly falsityWitnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly statements: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
                readonly properties: {
                    readonly source: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly protocol: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly polarity: {
                        readonly enum: readonly ["assert", "deny"];
                    };
                    readonly witness: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
        readonly h1: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly raftCommand: {};
    };
};
export declare const gradedConsensusSchema: {
    readonly $id: "organizing/federate-graded/consensus";
    readonly title: "GradedConsensus";
    readonly description: "Contradiction-aware federation report: shared cells, top-held contested cells, and the nonzero-H1 residue routed through Raft.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "sources", "federation", "mergedActivities", "coherence", "shared", "contested", "needsCoordination", "h1", "calm", "raft", "decomposition"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.federate-graded.consensus";
        };
        readonly sources: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly federation: {};
        readonly mergedActivities: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly coherence: {
            readonly type: "array";
            readonly items: {};
        };
        readonly shared: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["cell", "value", "witnesses", "statements"];
                readonly properties: {
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly value: {};
                    readonly witnesses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly statements: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
                            readonly properties: {
                                readonly source: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly protocol: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly cell: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly value: {};
                                readonly polarity: {
                                    readonly enum: readonly ["assert", "deny"];
                                };
                                readonly witness: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly contested: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["cell", "standing", "topCharge", "truthWitnesses", "falsityWitnesses", "statements", "calm"];
                readonly properties: {
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly standing: {
                        readonly const: "stable";
                    };
                    readonly topCharge: {};
                    readonly truthWitnesses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly falsityWitnesses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly statements: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
                            readonly properties: {
                                readonly source: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly protocol: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly cell: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly value: {};
                                readonly polarity: {
                                    readonly enum: readonly ["assert", "deny"];
                                };
                                readonly witness: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                        };
                    };
                    readonly calm: {
                        readonly const: "coordination-free";
                    };
                };
            };
        };
        readonly needsCoordination: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["cell", "standing", "topCharge", "truthWitnesses", "falsityWitnesses", "statements", "h1", "raftCommand"];
                readonly properties: {
                    readonly cell: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly standing: {
                        readonly const: "stable";
                    };
                    readonly topCharge: {};
                    readonly truthWitnesses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly falsityWitnesses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly statements: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly additionalProperties: false;
                            readonly required: readonly ["source", "protocol", "cell", "value", "polarity", "witness"];
                            readonly properties: {
                                readonly source: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly protocol: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly cell: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly value: {};
                                readonly polarity: {
                                    readonly enum: readonly ["assert", "deny"];
                                };
                                readonly witness: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                        };
                    };
                    readonly h1: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                    readonly raftCommand: {};
                };
            };
        };
        readonly h1: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["rank", "cells", "cohomology"];
            readonly properties: {
                readonly rank: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly cells: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly cohomology: {
                    readonly description: "normalized relating cohomology receipt for the nonzero cover H1 residue";
                };
            };
        };
        readonly calm: {};
        readonly raft: {};
        readonly decomposition: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["exhaustive", "disjoint", "shared", "contested", "needsCoordination"];
            readonly properties: {
                readonly exhaustive: {
                    readonly type: "boolean";
                };
                readonly disjoint: {
                    readonly type: "boolean";
                };
                readonly shared: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly contested: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly needsCoordination: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
};
export type FederateGradedStatement = Omit<FromSchema<typeof sourceStatementSchema>, "value"> & {
    readonly value: JsonValue;
};
export type SharedGradedCell = Omit<FromSchema<typeof sharedCellSchema>, "value" | "statements"> & {
    readonly value: JsonValue;
    readonly statements: readonly FederateGradedStatement[];
};
export type ContestedGradedCell = Omit<FromSchema<typeof contestedCellSchema>, "topCharge" | "statements"> & {
    readonly topCharge: ChargeCarrier;
    readonly statements: readonly FederateGradedStatement[];
};
export type NeedsCoordinationCell = Omit<FromSchema<typeof needsCoordinationCellSchema>, "topCharge" | "statements" | "raftCommand"> & {
    readonly topCharge: ChargeCarrier;
    readonly statements: readonly FederateGradedStatement[];
    readonly raftCommand: JsonValue;
};
export type GradedConsensus = Omit<FromSchema<typeof gradedConsensusSchema>, "federation" | "coherence" | "shared" | "contested" | "needsCoordination" | "calm" | "raft"> & {
    readonly federation: Federation;
    readonly coherence: readonly CoherenceReport[];
    readonly shared: readonly SharedGradedCell[];
    readonly contested: readonly ContestedGradedCell[];
    readonly needsCoordination: readonly NeedsCoordinationCell[];
    readonly calm: CalmReading;
    readonly raft: {
        readonly frontier: CalmRaftFrontier;
        readonly log: RaftLog;
        readonly append?: RaftAppendResult;
    };
};
export declare const gradedConsensusCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.federate-graded.consensus";
    readonly contested: readonly {
        readonly cell: string;
        readonly standing: "stable";
        readonly statements: readonly {
            readonly source: string;
            readonly value: unknown;
            readonly cell: string;
            readonly witness: string;
            readonly protocol: string;
            readonly polarity: "assert" | "deny";
        }[];
        readonly topCharge: unknown;
        readonly truthWitnesses: readonly string[];
        readonly falsityWitnesses: readonly string[];
        readonly calm: "coordination-free";
    }[];
    readonly shared: readonly {
        readonly value: unknown;
        readonly witnesses: readonly string[];
        readonly cell: string;
        readonly statements: readonly {
            readonly source: string;
            readonly value: unknown;
            readonly cell: string;
            readonly witness: string;
            readonly protocol: string;
            readonly polarity: "assert" | "deny";
        }[];
    }[];
    readonly federation: unknown;
    readonly coherence: readonly unknown[];
    readonly raft: unknown;
    readonly calm: unknown;
    readonly h1: {
        readonly cells: readonly string[];
        readonly rank: number;
        readonly cohomology: unknown;
    };
    readonly sources: readonly string[];
    readonly mergedActivities: number;
    readonly needsCoordination: readonly {
        readonly cell: string;
        readonly standing: "stable";
        readonly statements: readonly {
            readonly source: string;
            readonly value: unknown;
            readonly cell: string;
            readonly witness: string;
            readonly protocol: string;
            readonly polarity: "assert" | "deny";
        }[];
        readonly topCharge: unknown;
        readonly truthWitnesses: readonly string[];
        readonly falsityWitnesses: readonly string[];
        readonly h1: number;
        readonly raftCommand: unknown;
    }[];
    readonly decomposition: {
        readonly contested: number;
        readonly shared: number;
        readonly needsCoordination: number;
        readonly exhaustive: boolean;
        readonly disjoint: boolean;
    };
}>;
export interface FederateGradedOptions {
    readonly cluster?: string;
    readonly leadership?: RaftLeadership;
    readonly log?: RaftLog;
}
/**
 * federateGraded - hold cross-source contradiction and grade the consensus cost.
 *
 * Agreement enters `shared`; H1-vanishing disagreement enters `contested` as held
 * top with both witness sides retained; nonzero H1 disagreement enters
 * `needsCoordination` and is the only payload sent through Raft.
 */
export declare function federateGraded(sources: readonly FederateGradedSource[], options?: FederateGradedOptions): GradedConsensus;
export {};
//# sourceMappingURL=federate-graded.d.mts.map