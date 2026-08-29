/**
 * carriers — socializing's single-source JSON-Schema carriers (relation-model notation), replacing
 * the former `*.schema.json` + `realize` codegen. Each `carrierFrom(schema)` registers a bare
 * package-rooted $id in relating's category and yields its type by `FromSchema<typeof schema>`.
 *
 * The CROSS-PACKAGE reused carriers — `agent` (animating), `meme`/`ChargeCarrier` (relating),
 * `channel` (communicating) — are kept as loose unknown slots (exactly what `realize`
 * emitted: it cannot resolve cross-package `$ref`s); `field.mts` refines them to the reused-carrier
 * runtime shape (`JsonRecord`). The carriers are referenced, never redefined here.
 */
import { type FromSchema } from "@emsenn/relating";
declare const memberSchema: {
    readonly type: "object";
    readonly description: "one observer o in O: an agent carrying its local memes (the valuation of its settling V(o)).";
    readonly required: readonly ["kind", "agent", "memes"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.member";
        };
        readonly agent: {
            readonly description: "the observer's agent (reused from animating; referenced, never redefined)";
        };
        readonly memes: {
            readonly type: "array";
            readonly items: {};
            readonly description: "the observer's local memes - the valuation of its settling V(o) (reused from relating)";
        };
    };
    readonly additionalProperties: false;
};
export type Member = FromSchema<typeof memberSchema>;
declare const translationSchema: {
    readonly type: "object";
    readonly description: "a translation settling-morphism alpha: source -> target in the observer category O - the directed perspective map V(alpha): V(source) -> V(target).";
    readonly required: readonly ["kind", "source", "target", "channel"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.translation";
        };
        readonly source: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly target: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly channel: {
            readonly description: "the medium the translation travels (reused from communicating)";
        };
        readonly basis: {
            readonly type: "string";
            readonly description: "the optional warrant for the <=_k refinement (the CommonGroundBasis lineage)";
        };
    };
    readonly additionalProperties: false;
};
export type Translation = FromSchema<typeof translationSchema>;
declare const commonGroundSchema: {
    readonly type: "object";
    readonly description: "the glued global section (the apex) and its obstruction, plus the regime stratification - two orthogonal axes (static opinion + dynamic regime).";
    readonly required: readonly ["kind", "glued", "obstruction", "coordinationFree", "regime", "regimeCoordinationFree", "federationDiscipline", "components"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.common-ground";
        };
        readonly glued: {
            readonly type: "boolean";
            readonly description: "obstruction=0: the observers' opinions glue into a global section (static consensus)";
        };
        readonly obstruction: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "H1 of the opposition subgraph (first Betti number) - the static opinion-disagreement";
        };
        readonly coordinationFree: {
            readonly type: "boolean";
            readonly description: "opinion axis: obstruction = 0 (the fixed opinions glue)";
        };
        readonly cohomology: {
            readonly description: "finite relating cohomology receipt for the opposition subgraph: H0/H1, vanishing judgment, and normalized RMN carrier";
        };
        readonly regime: {
            readonly enum: readonly ["strict", "scott-continuous", "transfinite-bounded", "aperiodic"];
            readonly description: "the joint (max-k) four-regime classification over the observers";
        };
        readonly regimeCoordinationFree: {
            readonly type: "boolean";
            readonly description: "dynamic axis: the CRDT merge is coordination-free BY REGIME (cohomological-CALM: true iff regime is strict or scott-continuous, k <= omega)";
        };
        readonly federationDiscipline: {
            readonly enum: readonly ["endpoint-state", "trajectory"];
            readonly description: "endpoint-state (strict/scott) or trajectory (transfinite-bounded/aperiodic) - what a merge/exchange must ship to preserve the H1 invariant";
        };
        readonly closureOrdinal: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the settling depth k - gossip-merge rounds to quiesce to v-infinity; written by settle, absent on an unsettled snapshot";
        };
        readonly components: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["members", "pooled", "common"];
                readonly properties: {
                    readonly members: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                        };
                    };
                    readonly pooled: {
                        readonly description: "knowledge-join (the CRDT join_k merge fixpoint over the component) - a ChargeCarrier (reused)";
                    };
                    readonly common: {
                        readonly description: "knowledge-meet (the consensus limit over the component) - a ChargeCarrier (reused)";
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type CommonGround = FromSchema<typeof commonGroundSchema>;
export declare const SocialFieldSchema: {
    readonly $id: "socializing/social-field";
    readonly type: "object";
    readonly title: "SocialField";
    readonly description: "The primary carrier socializing works over - its core morphisms transform it (SocialField -> SocialField); readings project it into derived carriers. A MULTI-OBSERVER SYSTEM: a functor V: O -> Settlings_B assigning each observer a settling over a shared base. Consensus is the limit lim_O V(o) (knowledge-meet); disagreement is its cohomological obstruction H1(O, V). The richer structure lives off-diagonal, in the translations among distinct observers. $id is the bare package-rooted path.";
    readonly required: readonly ["kind", "members", "base", "section"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.social-field";
        };
        readonly members: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly description: "one observer o in O: an agent carrying its local memes (the valuation of its settling V(o)).";
                readonly required: readonly ["kind", "agent", "memes"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "socializing.member";
                    };
                    readonly agent: {
                        readonly description: "the observer's agent (reused from animating; referenced, never redefined)";
                    };
                    readonly memes: {
                        readonly type: "array";
                        readonly items: {};
                        readonly description: "the observer's local memes - the valuation of its settling V(o) (reused from relating)";
                    };
                };
                readonly additionalProperties: false;
            };
            readonly description: "the sheaf of agents-with-local-memes (the observers o in O)";
        };
        readonly base: {
            readonly type: "object";
            readonly description: "the social base = the OBSERVER CATEGORY O: objects are the members (by index), non-identity morphisms the directed translations. A base with no translations is a DISCRETE O (the degenerate diagonal case).";
            readonly required: readonly ["kind", "translations"];
            readonly properties: {
                readonly kind: {
                    readonly const: "socializing.social-base";
                };
                readonly translations: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly description: "a translation settling-morphism alpha: source -> target in the observer category O - the directed perspective map V(alpha): V(source) -> V(target).";
                        readonly required: readonly ["kind", "source", "target", "channel"];
                        readonly properties: {
                            readonly kind: {
                                readonly const: "socializing.translation";
                            };
                            readonly source: {
                                readonly type: "integer";
                                readonly minimum: 0;
                            };
                            readonly target: {
                                readonly type: "integer";
                                readonly minimum: 0;
                            };
                            readonly channel: {
                                readonly description: "the medium the translation travels (reused from communicating)";
                            };
                            readonly basis: {
                                readonly type: "string";
                                readonly description: "the optional warrant for the <=_k refinement (the CommonGroundBasis lineage)";
                            };
                        };
                        readonly additionalProperties: false;
                    };
                };
            };
            readonly additionalProperties: false;
        };
        readonly section: {
            readonly type: "object";
            readonly description: "the glued global section (the apex) and its obstruction, plus the regime stratification - two orthogonal axes (static opinion + dynamic regime).";
            readonly required: readonly ["kind", "glued", "obstruction", "coordinationFree", "regime", "regimeCoordinationFree", "federationDiscipline", "components"];
            readonly properties: {
                readonly kind: {
                    readonly const: "socializing.common-ground";
                };
                readonly glued: {
                    readonly type: "boolean";
                    readonly description: "obstruction=0: the observers' opinions glue into a global section (static consensus)";
                };
                readonly obstruction: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "H1 of the opposition subgraph (first Betti number) - the static opinion-disagreement";
                };
                readonly coordinationFree: {
                    readonly type: "boolean";
                    readonly description: "opinion axis: obstruction = 0 (the fixed opinions glue)";
                };
                readonly cohomology: {
                    readonly description: "finite relating cohomology receipt for the opposition subgraph: H0/H1, vanishing judgment, and normalized RMN carrier";
                };
                readonly regime: {
                    readonly enum: readonly ["strict", "scott-continuous", "transfinite-bounded", "aperiodic"];
                    readonly description: "the joint (max-k) four-regime classification over the observers";
                };
                readonly regimeCoordinationFree: {
                    readonly type: "boolean";
                    readonly description: "dynamic axis: the CRDT merge is coordination-free BY REGIME (cohomological-CALM: true iff regime is strict or scott-continuous, k <= omega)";
                };
                readonly federationDiscipline: {
                    readonly enum: readonly ["endpoint-state", "trajectory"];
                    readonly description: "endpoint-state (strict/scott) or trajectory (transfinite-bounded/aperiodic) - what a merge/exchange must ship to preserve the H1 invariant";
                };
                readonly closureOrdinal: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "the settling depth k - gossip-merge rounds to quiesce to v-infinity; written by settle, absent on an unsettled snapshot";
                };
                readonly components: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["members", "pooled", "common"];
                        readonly properties: {
                            readonly members: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "integer";
                                };
                            };
                            readonly pooled: {
                                readonly description: "knowledge-join (the CRDT join_k merge fixpoint over the component) - a ChargeCarrier (reused)";
                            };
                            readonly common: {
                                readonly description: "knowledge-meet (the consensus limit over the component) - a ChargeCarrier (reused)";
                            };
                        };
                        readonly additionalProperties: false;
                    };
                };
            };
            readonly additionalProperties: false;
        };
    };
    readonly additionalProperties: false;
};
export declare const socialFieldCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.social-field";
    readonly members: readonly {
        readonly kind: "socializing.member";
        readonly agent: unknown;
        readonly memes: readonly unknown[];
    }[];
    readonly base: {
        readonly kind: "socializing.social-base";
        readonly translations: readonly {
            readonly kind: "socializing.translation";
            readonly source: number;
            readonly target: number;
            readonly channel: unknown;
            readonly basis?: string;
        }[];
    };
    readonly section: {
        readonly kind: "socializing.common-ground";
        readonly glued: boolean;
        readonly obstruction: number;
        readonly coordinationFree: boolean;
        readonly regime: "strict" | "scott-continuous" | "transfinite-bounded" | "aperiodic";
        readonly regimeCoordinationFree: boolean;
        readonly federationDiscipline: "endpoint-state" | "trajectory";
        readonly components: readonly {
            readonly members: readonly number[];
            readonly pooled: unknown;
            readonly common: unknown;
        }[];
        readonly cohomology?: unknown;
        readonly closureOrdinal?: number;
    };
}>;
export type SocialField = FromSchema<typeof SocialFieldSchema>;
export declare const AssertionDisagreementsSchema: {
    readonly $id: "socializing/assertion-disagreements";
    readonly type: "object";
    readonly title: "AssertionDisagreements";
    readonly description: "A derived read over a social field's observer-local assertion memes. Disagreements are never admitted as denials: they are derived when contrary predicates are both held over the same subject/object across one or more observers (settled top stable). $id is the bare package-rooted path.";
    readonly required: readonly ["kind", "disagreements"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.assertion-disagreements";
        };
        readonly disagreements: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["subject", "predicate", "contrary", "object", "observers", "contraryObservers", "value"];
                readonly properties: {
                    readonly subject: {};
                    readonly predicate: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly contrary: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly object: {};
                    readonly observers: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                    };
                    readonly contraryObservers: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                    };
                    readonly value: {
                        readonly const: "stable";
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export declare const assertionDisagreementsCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.assertion-disagreements";
    readonly disagreements: readonly {
        readonly object: unknown;
        readonly subject: unknown;
        readonly predicate: string;
        readonly contrary: string;
        readonly observers: readonly number[];
        readonly contraryObservers: readonly number[];
        readonly value: "stable";
    }[];
}>;
export type AssertionDisagreements = FromSchema<typeof AssertionDisagreementsSchema>;
export {};
//# sourceMappingURL=carriers.d.mts.map