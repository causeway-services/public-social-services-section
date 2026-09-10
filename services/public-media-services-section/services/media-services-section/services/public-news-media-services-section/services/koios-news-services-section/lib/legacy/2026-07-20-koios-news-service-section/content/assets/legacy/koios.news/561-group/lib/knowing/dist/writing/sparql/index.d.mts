/**
 * writing/sparql — SPARQL/RDF as knowing's QUERY projection over RWIL.
 *
 * A Basic Graph Pattern is a conjunction of witnessed RDF-ish triples. RWIL
 * already stores those as EAVT witnesses, and knowing already evaluates
 * conjunction through Datalog. This module only maps the SPARQL query shapes
 * onto that evaluator; it does not introduce a parser or a second store.
 */
import { type FromSchema } from "@emsenn/relating";
import { type WitnessStore } from "@emsenn/relating/ledger";
import { type EAVT, type EAVTRecord, type JsonValue } from "@emsenn/relating/writing";
import { type DatalogEvaluation } from "../datalog/index.mjs";
export declare const chronicleLedgerQuerySchema: {
    readonly $id: "knowing/writing/sparql/chronicle-ledger-query";
    readonly title: "ChronicleLedgerQuery";
    readonly description: "A SPARQL BGP query over a hub chronicle ledger: the rows stay EAVT and the query lowers through knowing's Datalog evaluator.";
    readonly type: "object";
    readonly required: readonly ["kind", "rows", "query"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.sparql.chronicle-ledger-query";
        };
        readonly rows: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["e", "a", "v", "t"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly e: {
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
                    readonly a: {
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
                    readonly v: {
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
                    readonly t: {
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
        readonly query: {
            readonly $ref: "knowing/writing/sparql/query";
        };
    };
};
type ChronicleLedgerQueryCarrier = FromSchema<typeof chronicleLedgerQuerySchema>;
export type ChronicleLedgerQuery = Omit<ChronicleLedgerQueryCarrier, "rows" | "query"> & {
    readonly rows: readonly EAVTRecord[];
    readonly query: SparqlQuery;
};
export declare const chronicleLedgerQueryCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.sparql.chronicle-ledger-query";
    readonly rows: readonly {
        readonly t: string | number | boolean | Record<string, unknown> | readonly unknown[] | null;
        readonly a: string | number | boolean | Record<string, unknown> | readonly unknown[] | null;
        readonly e: string | number | boolean | Record<string, unknown> | readonly unknown[] | null;
        readonly v: string | number | boolean | Record<string, unknown> | readonly unknown[] | null;
    }[];
    readonly query: unknown;
}>;
export declare const HUB_ASSIGNMENT_PREDICATE: "hub.assignment";
export declare const HUB_SESSION_MASK_PREDICATE: "hub.session.mask";
export declare const sparqlVariableSchema: {
    readonly $id: "knowing/writing/sparql/variable";
    readonly title: "SparqlVariable";
    readonly type: "object";
    readonly required: readonly ["kind", "name"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.sparql.variable";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export declare const sparqlVariableCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.sparql.variable";
    readonly name: string;
}>;
export type SparqlVariable = FromSchema<typeof sparqlVariableSchema>;
export type SparqlTerm = SparqlVariable | JsonValue;
export declare const sparqlTriplePatternSchema: {
    readonly $id: "knowing/writing/sparql/triple-pattern";
    readonly title: "SparqlTriplePattern";
    readonly type: "object";
    readonly required: readonly ["s", "p", "o"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly s: {
            readonly anyOf: readonly [{
                readonly $id: "knowing/writing/sparql/variable";
                readonly title: "SparqlVariable";
                readonly type: "object";
                readonly required: readonly ["kind", "name"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly kind: {
                        readonly const: "knowing.sparql.variable";
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
        readonly p: {
            readonly anyOf: readonly [{
                readonly $id: "knowing/writing/sparql/variable";
                readonly title: "SparqlVariable";
                readonly type: "object";
                readonly required: readonly ["kind", "name"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly kind: {
                        readonly const: "knowing.sparql.variable";
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
        readonly o: {
            readonly anyOf: readonly [{
                readonly $id: "knowing/writing/sparql/variable";
                readonly title: "SparqlVariable";
                readonly type: "object";
                readonly required: readonly ["kind", "name"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly kind: {
                        readonly const: "knowing.sparql.variable";
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
export declare const sparqlTriplePatternCarrier: import("@emsenn/relating").Carrier<{
    readonly s: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
        readonly kind: "knowing.sparql.variable";
        readonly name: string;
    } | null;
    readonly p: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
        readonly kind: "knowing.sparql.variable";
        readonly name: string;
    } | null;
    readonly o: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
        readonly kind: "knowing.sparql.variable";
        readonly name: string;
    } | null;
}>;
type SparqlTriplePatternCarrier = FromSchema<typeof sparqlTriplePatternSchema>;
export type SparqlTriplePattern = Omit<SparqlTriplePatternCarrier, "s" | "p" | "o"> & {
    readonly s: SparqlTerm;
    readonly p: SparqlTerm;
    readonly o: SparqlTerm;
};
export declare const sparqlQuerySchema: {
    readonly $id: "knowing/writing/sparql/query";
    readonly title: "SparqlQuery";
    readonly type: "object";
    readonly required: readonly ["kind", "type", "where"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.sparql.query";
        };
        readonly type: {
            readonly enum: readonly ["select", "ask", "construct"];
        };
        readonly where: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/writing/sparql/triple-pattern";
                readonly title: "SparqlTriplePattern";
                readonly type: "object";
                readonly required: readonly ["s", "p", "o"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly s: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
                    readonly p: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
                    readonly o: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
        readonly select: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly construct: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/writing/sparql/triple-pattern";
                readonly title: "SparqlTriplePattern";
                readonly type: "object";
                readonly required: readonly ["s", "p", "o"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly s: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
                    readonly p: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
                    readonly o: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
export declare const sparqlQueryCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.sparql.query";
    readonly type: "select" | "ask" | "construct";
    readonly where: readonly {
        readonly s: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
        readonly p: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
        readonly o: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
    }[];
    readonly select?: readonly string[];
    readonly construct?: readonly {
        readonly s: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
        readonly p: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
        readonly o: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
    }[];
}>;
type SparqlQueryCarrier = FromSchema<typeof sparqlQuerySchema>;
export type SparqlQuery = Omit<SparqlQueryCarrier, "where" | "construct"> & {
    readonly where: readonly SparqlTriplePattern[];
    readonly construct?: readonly SparqlTriplePattern[];
};
export declare const sparqlResultSchema: {
    readonly $id: "knowing/writing/sparql/result";
    readonly title: "SparqlResult";
    readonly type: "object";
    readonly required: readonly ["kind", "type", "variables", "bindings", "ask", "triples", "turtle", "datalog"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.sparql.result";
        };
        readonly type: {
            readonly enum: readonly ["select", "ask", "construct"];
        };
        readonly variables: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly bindings: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly ask: {
            readonly type: "boolean";
        };
        readonly triples: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/writing/sparql/triple-pattern";
                readonly title: "SparqlTriplePattern";
                readonly type: "object";
                readonly required: readonly ["s", "p", "o"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly s: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
                    readonly p: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
                    readonly o: {
                        readonly anyOf: readonly [{
                            readonly $id: "knowing/writing/sparql/variable";
                            readonly title: "SparqlVariable";
                            readonly type: "object";
                            readonly required: readonly ["kind", "name"];
                            readonly additionalProperties: false;
                            readonly properties: {
                                readonly kind: {
                                    readonly const: "knowing.sparql.variable";
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
        readonly turtle: {
            readonly type: "string";
        };
        readonly datalog: {
            readonly type: "object";
        };
    };
};
export declare const sparqlResultCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.sparql.result";
    readonly variables: readonly string[];
    readonly type: "select" | "ask" | "construct";
    readonly bindings: readonly Record<string, unknown>[];
    readonly ask: boolean;
    readonly triples: readonly {
        readonly s: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
        readonly p: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
        readonly o: string | number | boolean | Record<string, unknown> | readonly unknown[] | {
            readonly kind: "knowing.sparql.variable";
            readonly name: string;
        } | null;
    }[];
    readonly turtle: string;
    readonly datalog: Record<string, unknown>;
}>;
type SparqlResultCarrier = FromSchema<typeof sparqlResultSchema>;
export type SparqlBinding = Readonly<Record<string, JsonValue>>;
export type SparqlResult = Omit<SparqlResultCarrier, "bindings" | "triples"> & {
    readonly bindings: readonly SparqlBinding[];
    readonly triples: readonly RdfTriple[];
    readonly datalog: DatalogEvaluation;
};
export type RdfTriple = Readonly<{
    readonly s: JsonValue;
    readonly p: JsonValue;
    readonly o: JsonValue;
}>;
export declare function sparqlVariable(name: string): SparqlVariable;
export declare function isSparqlVariable(term: SparqlTerm): term is SparqlVariable;
export declare function triplePattern(s: SparqlTerm, p: SparqlTerm, o: SparqlTerm): SparqlTriplePattern;
export declare function evaluateSparql(rows: readonly (EAVT | EAVTRecord)[], query: SparqlQuery): SparqlResult;
export declare function evaluateSparqlFromWitnessLog(store: WitnessStore, feed: string, query: SparqlQuery): SparqlResult;
/** Evaluate a carried hub chronicle query by reusing the SPARQL-to-Datalog projection. */
export declare function evaluateChronicleLedgerQuery(input: ChronicleLedgerQuery): SparqlResult;
/** Query sessions currently witnessed as assigned to a package/path. */
export declare function sessionsAssignedToQuery(packagePath: string): SparqlQuery;
/** Query masks published by one session actor. */
export declare function masksOfSessionQuery(session: string): SparqlQuery;
export declare function triplesToTurtle(triples: readonly RdfTriple[]): string;
export declare function triplesFromEavt(rows: readonly (EAVT | EAVTRecord)[]): readonly RdfTriple[];
export {};
//# sourceMappingURL=index.d.mts.map