/**
 * writing/datalog — knowing's reflective query surface over EAVT witnesses.
 *
 * EAVT rows are the extensional relation. Rules do not author another store; they
 * settle derived query facts to the least fixed point over the existing witness
 * ledger rows.
 */
import { type FromSchema } from "@emsenn/relating";
import { type EAVT, type EAVTRecord, type JsonValue } from "@emsenn/relating/writing";
export declare const EAVT_RELATION = "eavt";
export declare const datalogVariableSchema: {
    readonly $id: "knowing/writing/datalog/variable";
    readonly title: "DatalogVariable";
    readonly type: "object";
    readonly required: readonly ["kind", "name"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.datalog.variable";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export declare const datalogVariableCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.datalog.variable";
    readonly name: string;
}>;
export type DatalogVariable = FromSchema<typeof datalogVariableSchema>;
export declare const datalogAtomSchema: {
    readonly $id: "knowing/writing/datalog/atom";
    readonly title: "DatalogAtom";
    readonly type: "object";
    readonly required: readonly ["predicate", "terms"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly predicate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly terms: {
            readonly type: "array";
            readonly items: {
                readonly anyOf: readonly [{
                    readonly $id: "knowing/writing/datalog/variable";
                    readonly title: "DatalogVariable";
                    readonly type: "object";
                    readonly required: readonly ["kind", "name"];
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly kind: {
                            readonly const: "knowing.datalog.variable";
                        };
                        readonly name: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                }, {
                    readonly anyOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "number";
                    }, {
                        readonly type: "integer";
                    }, {
                        readonly type: "boolean";
                    }, {
                        readonly type: "null";
                    }, {
                        readonly type: "array";
                    }, {
                        readonly type: "object";
                    }];
                }];
            };
        };
    };
};
export declare const datalogAtomCarrier: import("@emsenn/relating").Carrier<{
    readonly predicate: string;
    readonly terms: readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | {
        readonly kind: "knowing.datalog.variable";
        readonly name: string;
    } | null)[];
}>;
type DatalogAtomCarrier = FromSchema<typeof datalogAtomSchema>;
export type DatalogTerm = DatalogVariable | JsonValue;
export type DatalogAtom = Omit<DatalogAtomCarrier, "terms"> & {
    readonly terms: readonly DatalogTerm[];
};
export declare const datalogRuleSchema: {
    readonly $id: "knowing/writing/datalog/rule";
    readonly title: "DatalogRule";
    readonly type: "object";
    readonly required: readonly ["head", "body"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly head: {
            readonly $id: "knowing/writing/datalog/atom";
            readonly title: "DatalogAtom";
            readonly type: "object";
            readonly required: readonly ["predicate", "terms"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly predicate: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly terms: {
                    readonly type: "array";
                    readonly items: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/datalog/variable";
                            readonly title: "DatalogVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.datalog.variable";
                                };
                                readonly name: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                        }, {
                            readonly anyOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "number";
                            }, {
                                readonly type: "integer";
                            }, {
                                readonly type: "boolean";
                            }, {
                                readonly type: "null";
                            }, {
                                readonly type: "array";
                            }, {
                                readonly type: "object";
                            }];
                        }];
                    };
                };
            };
        };
        readonly body: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/writing/datalog/atom";
                readonly title: "DatalogAtom";
                readonly type: "object";
                readonly required: readonly ["predicate", "terms"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly predicate: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly terms: {
                        readonly type: "array";
                        readonly items: {
                            readonly anyOf: readonly [{
                                readonly $id: "knowing/writing/datalog/variable";
                                readonly title: "DatalogVariable";
                                readonly type: "object";
                                readonly required: readonly ["kind", "name"];
                                readonly additionalProperties: false;
                                readonly properties: {
                                    readonly kind: {
                                        readonly const: "knowing.datalog.variable";
                                    };
                                    readonly name: {
                                        readonly type: "string";
                                        readonly minLength: 1;
                                    };
                                };
                            }, {
                                readonly anyOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "number";
                                }, {
                                    readonly type: "integer";
                                }, {
                                    readonly type: "boolean";
                                }, {
                                    readonly type: "null";
                                }, {
                                    readonly type: "array";
                                }, {
                                    readonly type: "object";
                                }];
                            }];
                        };
                    };
                };
            };
        };
    };
};
export declare const datalogRuleCarrier: import("@emsenn/relating").Carrier<{
    readonly body: readonly {
        readonly predicate: string;
        readonly terms: readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.datalog.variable";
            readonly name: string;
        } | null)[];
    }[];
    readonly head: {
        readonly predicate: string;
        readonly terms: readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.datalog.variable";
            readonly name: string;
        } | null)[];
    };
}>;
type DatalogRuleCarrier = FromSchema<typeof datalogRuleSchema>;
export type DatalogRule = Omit<DatalogRuleCarrier, "head" | "body"> & {
    readonly head: DatalogAtom;
    readonly body: readonly DatalogAtom[];
};
export declare const datalogQuerySchema: {
    readonly $id: "knowing/writing/datalog/query";
    readonly title: "DatalogQuery";
    readonly type: "object";
    readonly required: readonly ["kind", "rules", "find"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.datalog.query";
        };
        readonly rules: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/writing/datalog/rule";
                readonly title: "DatalogRule";
                readonly type: "object";
                readonly required: readonly ["head", "body"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly head: {
                        readonly $id: "knowing/writing/datalog/atom";
                        readonly title: "DatalogAtom";
                        readonly type: "object";
                        readonly required: readonly ["predicate", "terms"];
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly predicate: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly terms: {
                                readonly type: "array";
                                readonly items: {
                                    readonly anyOf: readonly [{
                                        readonly $id: "knowing/writing/datalog/variable";
                                        readonly title: "DatalogVariable";
                                        readonly type: "object";
                                        readonly required: readonly ["kind", "name"];
                                        readonly additionalProperties: false;
                                        readonly properties: {
                                            readonly kind: {
                                                readonly const: "knowing.datalog.variable";
                                            };
                                            readonly name: {
                                                readonly type: "string";
                                                readonly minLength: 1;
                                            };
                                        };
                                    }, {
                                        readonly anyOf: readonly [{
                                            readonly type: "string";
                                        }, {
                                            readonly type: "number";
                                        }, {
                                            readonly type: "integer";
                                        }, {
                                            readonly type: "boolean";
                                        }, {
                                            readonly type: "null";
                                        }, {
                                            readonly type: "array";
                                        }, {
                                            readonly type: "object";
                                        }];
                                    }];
                                };
                            };
                        };
                    };
                    readonly body: {
                        readonly type: "array";
                        readonly items: {
                            readonly $id: "knowing/writing/datalog/atom";
                            readonly title: "DatalogAtom";
                            readonly type: "object";
                            readonly required: readonly ["predicate", "terms"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly predicate: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                                readonly terms: {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly anyOf: readonly [{
                                            readonly $id: "knowing/writing/datalog/variable";
                                            readonly title: "DatalogVariable";
                                            readonly type: "object";
                                            readonly required: readonly ["kind", "name"];
                                            readonly additionalProperties: false;
                                            readonly properties: {
                                                readonly kind: {
                                                    readonly const: "knowing.datalog.variable";
                                                };
                                                readonly name: {
                                                    readonly type: "string";
                                                    readonly minLength: 1;
                                                };
                                            };
                                        }, {
                                            readonly anyOf: readonly [{
                                                readonly type: "string";
                                            }, {
                                                readonly type: "number";
                                            }, {
                                                readonly type: "integer";
                                            }, {
                                                readonly type: "boolean";
                                            }, {
                                                readonly type: "null";
                                            }, {
                                                readonly type: "array";
                                            }, {
                                                readonly type: "object";
                                            }];
                                        }];
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
        readonly find: {
            readonly $id: "knowing/writing/datalog/atom";
            readonly title: "DatalogAtom";
            readonly type: "object";
            readonly required: readonly ["predicate", "terms"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly predicate: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly terms: {
                    readonly type: "array";
                    readonly items: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/datalog/variable";
                            readonly title: "DatalogVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.datalog.variable";
                                };
                                readonly name: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                        }, {
                            readonly anyOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "number";
                            }, {
                                readonly type: "integer";
                            }, {
                                readonly type: "boolean";
                            }, {
                                readonly type: "null";
                            }, {
                                readonly type: "array";
                            }, {
                                readonly type: "object";
                            }];
                        }];
                    };
                };
            };
        };
    };
};
export declare const datalogQueryCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.datalog.query";
    readonly find: {
        readonly predicate: string;
        readonly terms: readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.datalog.variable";
            readonly name: string;
        } | null)[];
    };
    readonly rules: readonly {
        readonly body: readonly {
            readonly predicate: string;
            readonly terms: readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | {
                readonly kind: "knowing.datalog.variable";
                readonly name: string;
            } | null)[];
        }[];
        readonly head: {
            readonly predicate: string;
            readonly terms: readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | {
                readonly kind: "knowing.datalog.variable";
                readonly name: string;
            } | null)[];
        };
    }[];
}>;
type DatalogQueryCarrier = FromSchema<typeof datalogQuerySchema>;
export type DatalogQuery = Omit<DatalogQueryCarrier, "rules" | "find"> & {
    readonly rules: readonly DatalogRule[];
    readonly find: DatalogAtom;
};
export declare const datalogRelationSchema: {
    readonly $id: "knowing/writing/datalog/relation";
    readonly title: "DatalogRelation";
    readonly type: "object";
    readonly required: readonly ["predicate", "tuples"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly predicate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly tuples: {
            readonly type: "array";
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly anyOf: readonly [{
                        readonly type: "string";
                    }, {
                        readonly type: "number";
                    }, {
                        readonly type: "integer";
                    }, {
                        readonly type: "boolean";
                    }, {
                        readonly type: "null";
                    }, {
                        readonly type: "array";
                    }, {
                        readonly type: "object";
                    }];
                };
            };
        };
    };
};
export declare const datalogRelationCarrier: import("@emsenn/relating").Carrier<{
    readonly predicate: string;
    readonly tuples: readonly (readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | null)[])[];
}>;
export type DatalogTuple = readonly JsonValue[];
export type DatalogRelation = Omit<FromSchema<typeof datalogRelationSchema>, "tuples"> & {
    readonly tuples: readonly DatalogTuple[];
};
export declare const datalogEvaluationSchema: {
    readonly $id: "knowing/writing/datalog/evaluation";
    readonly title: "DatalogEvaluation";
    readonly type: "object";
    readonly required: readonly ["kind", "settled", "iterations", "relations", "answer"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.datalog.evaluation";
        };
        readonly settled: {
            readonly const: true;
        };
        readonly iterations: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly relations: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/writing/datalog/relation";
                readonly title: "DatalogRelation";
                readonly type: "object";
                readonly required: readonly ["predicate", "tuples"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly predicate: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly tuples: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "array";
                            readonly items: {
                                readonly anyOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "number";
                                }, {
                                    readonly type: "integer";
                                }, {
                                    readonly type: "boolean";
                                }, {
                                    readonly type: "null";
                                }, {
                                    readonly type: "array";
                                }, {
                                    readonly type: "object";
                                }];
                            };
                        };
                    };
                };
            };
        };
        readonly answer: {
            readonly $id: "knowing/writing/datalog/relation";
            readonly title: "DatalogRelation";
            readonly type: "object";
            readonly required: readonly ["predicate", "tuples"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly predicate: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly tuples: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "array";
                        readonly items: {
                            readonly anyOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "number";
                            }, {
                                readonly type: "integer";
                            }, {
                                readonly type: "boolean";
                            }, {
                                readonly type: "null";
                            }, {
                                readonly type: "array";
                            }, {
                                readonly type: "object";
                            }];
                        };
                    };
                };
            };
        };
    };
};
export declare const datalogEvaluationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.datalog.evaluation";
    readonly settled: true;
    readonly relations: readonly {
        readonly predicate: string;
        readonly tuples: readonly (readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | null)[])[];
    }[];
    readonly iterations: number;
    readonly answer: {
        readonly predicate: string;
        readonly tuples: readonly (readonly (string | number | boolean | Record<string, unknown> | readonly unknown[] | null)[])[];
    };
}>;
type DatalogEvaluationCarrier = FromSchema<typeof datalogEvaluationSchema>;
export type DatalogEvaluation = Omit<DatalogEvaluationCarrier, "relations" | "answer"> & {
    readonly relations: readonly DatalogRelation[];
    readonly answer: DatalogRelation;
};
export declare function variable(name: string): DatalogVariable;
export declare function isVariable(term: DatalogTerm): term is DatalogVariable;
export declare function evaluateDatalog(rows: readonly (EAVT | EAVTRecord)[], query: DatalogQuery): DatalogEvaluation;
export {};
//# sourceMappingURL=index.d.mts.map