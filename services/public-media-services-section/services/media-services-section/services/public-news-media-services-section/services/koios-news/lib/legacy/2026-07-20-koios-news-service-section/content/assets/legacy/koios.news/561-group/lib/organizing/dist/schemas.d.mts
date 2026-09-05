/**
 * schemas - lifted organizing carrier schemas.
 *
 * Generated mechanically from the checked-in *.schema.json proof trees during the
 * FromSchema migration. The schema literal is now the source: FromSchema infers
 * the type and carrierFrom registers the same $id for runtime validation.
 */
import { type FromSchema } from "@emsenn/relating";
export declare const accountingBalance: {
    readonly $id: "organizing/accounting-balance";
    readonly title: "AccountingBalance";
    readonly description: "The exact per-commodity conservation read of one accounting transaction. Residuals are decimal integer rational amounts; an elided posting can be inferred when the nonzero residual is confined to one commodity.";
    readonly type: "object";
    readonly required: readonly ["kind", "balanced", "residual", "residualExact", "inferredPostingIndex", "inferredAmount"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.accounting.balance";
        };
        readonly balanced: {
            readonly type: "boolean";
        };
        readonly residual: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/Amount";
            };
        };
        readonly residualExact: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly inferredPostingIndex: {
            readonly oneOf: readonly [{
                readonly type: "integer";
                readonly minimum: 0;
            }, {
                readonly type: "null";
            }];
        };
        readonly inferredAmount: {
            readonly oneOf: readonly [{
                readonly $ref: "#/$defs/Amount";
            }, {
                readonly type: "null";
            }];
        };
    };
    readonly $defs: {
        readonly Amount: {
            readonly type: "object";
            readonly required: readonly ["num", "den", "commodity"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly num: {
                    readonly type: "string";
                    readonly pattern: "^-?[0-9]+$";
                };
                readonly den: {
                    readonly type: "string";
                    readonly pattern: "^[1-9][0-9]*$";
                };
                readonly commodity: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
};
export type AccountingBalance = FromSchema<typeof accountingBalance>;
export declare const accountingBalanceCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.accounting.balance";
    readonly balanced: boolean;
    readonly residual: readonly {
        readonly num: string;
        readonly den: string;
        readonly commodity: string;
    }[];
    readonly residualExact: readonly string[];
    readonly inferredPostingIndex: number | null;
    readonly inferredAmount: {
        readonly num: string;
        readonly den: string;
        readonly commodity: string;
    } | null;
}>;
export declare const accountingEntry: {
    readonly $id: "organizing/accounting-entry";
    readonly title: "AccountingEntry";
    readonly description: "A JSON-safe accounting record admitted at organizing's record-state boundary. Exact amounts carry decimal integer strings for numerator and denominator; arithmetic and balance residuals belong to the exact-number layer, while this carrier is normalized to finite relating utterances.";
    readonly oneOf: readonly [{
        readonly $ref: "#/$defs/Transaction";
    }, {
        readonly $ref: "#/$defs/Directive";
    }, {
        readonly $ref: "#/$defs/Malformed";
    }];
    readonly $defs: {
        readonly Json: {};
        readonly Source: {
            readonly type: "object";
            readonly required: readonly ["file", "line"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly file: {
                    readonly type: readonly ["string", "null"];
                };
                readonly line: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly Amount: {
            readonly type: "object";
            readonly required: readonly ["num", "den", "commodity"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly num: {
                    readonly type: "string";
                    readonly pattern: "^-?[0-9]+$";
                };
                readonly den: {
                    readonly type: "string";
                    readonly pattern: "^[1-9][0-9]*$";
                };
                readonly commodity: {
                    readonly type: "string";
                };
            };
        };
        readonly Cost: {
            readonly type: "object";
            readonly required: readonly ["kind", "amount"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly enum: readonly ["per-unit", "total"];
                };
                readonly amount: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Amount";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly date: {
                    readonly type: "string";
                };
                readonly label: {
                    readonly type: "string";
                };
            };
        };
        readonly Price: {
            readonly type: "object";
            readonly required: readonly ["kind", "amount"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly enum: readonly ["@", "@@"];
                };
                readonly amount: {
                    readonly $ref: "#/$defs/Amount";
                };
            };
        };
        readonly BalanceAssertion: {
            readonly type: "object";
            readonly required: readonly ["amount"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly amount: {
                    readonly $ref: "#/$defs/Amount";
                };
                readonly sole: {
                    readonly type: "boolean";
                };
            };
        };
        readonly Posting: {
            readonly type: "object";
            readonly required: readonly ["account", "amount", "cost", "price", "balanceAssertion", "meta"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly account: {
                    readonly type: "string";
                };
                readonly amount: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Amount";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly cost: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Cost";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly price: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Price";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly balanceAssertion: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/BalanceAssertion";
                    }, {
                        readonly type: "null";
                    }];
                };
                readonly meta: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly $ref: "#/$defs/Json";
                    };
                };
            };
        };
        readonly Transaction: {
            readonly type: "object";
            readonly required: readonly ["date", "time", "flag", "payee", "narration", "postings", "tags", "links", "meta", "code", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly id: {
                    readonly type: readonly ["string", "null"];
                };
                readonly date: {
                    readonly type: "string";
                };
                readonly time: {
                    readonly type: readonly ["string", "null"];
                };
                readonly flag: {
                    readonly type: readonly ["string", "null"];
                };
                readonly payee: {
                    readonly type: readonly ["string", "null"];
                };
                readonly narration: {
                    readonly type: "string";
                };
                readonly postings: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "#/$defs/Posting";
                    };
                };
                readonly tags: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly links: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly meta: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly $ref: "#/$defs/Json";
                    };
                };
                readonly code: {
                    readonly type: readonly ["string", "null"];
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly OpenDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "account", "commodities", "booking", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "open";
                };
                readonly date: {
                    readonly type: readonly ["string", "null"];
                };
                readonly account: {
                    readonly type: "string";
                };
                readonly commodities: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly booking: {
                    readonly type: readonly ["string", "null"];
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly CloseDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "account", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "close";
                };
                readonly date: {
                    readonly type: "string";
                };
                readonly account: {
                    readonly type: "string";
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly CommodityDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "symbol", "precision", "meta", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "commodity";
                };
                readonly date: {
                    readonly type: readonly ["string", "null"];
                };
                readonly symbol: {
                    readonly type: "string";
                };
                readonly precision: {
                    readonly type: readonly ["integer", "null"];
                    readonly minimum: 0;
                };
                readonly meta: {
                    readonly type: "object";
                    readonly additionalProperties: {
                        readonly $ref: "#/$defs/Json";
                    };
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly PriceDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "commodity", "amount", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "price";
                };
                readonly date: {
                    readonly type: "string";
                };
                readonly commodity: {
                    readonly type: "string";
                };
                readonly amount: {
                    readonly $ref: "#/$defs/Amount";
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly PadDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "account", "padAccount", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "pad";
                };
                readonly date: {
                    readonly type: "string";
                };
                readonly account: {
                    readonly type: "string";
                };
                readonly padAccount: {
                    readonly type: "string";
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly BalanceDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "account", "amount", "tolerance", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "balance";
                };
                readonly date: {
                    readonly type: "string";
                };
                readonly account: {
                    readonly type: "string";
                };
                readonly amount: {
                    readonly $ref: "#/$defs/Amount";
                };
                readonly tolerance: {
                    readonly type: readonly ["string", "null"];
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly OptionDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "key", "value", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "option";
                };
                readonly date: {
                    readonly type: "null";
                };
                readonly key: {
                    readonly type: readonly ["string", "null"];
                };
                readonly value: {
                    readonly type: readonly ["string", "null"];
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly IncludeDirective: {
            readonly type: "object";
            readonly required: readonly ["directive", "date", "path", "resolved", "error", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly directive: {
                    readonly const: "include";
                };
                readonly date: {
                    readonly type: "null";
                };
                readonly path: {
                    readonly type: readonly ["string", "null"];
                };
                readonly resolved: {
                    readonly type: "boolean";
                };
                readonly error: {
                    readonly type: readonly ["string", "null"];
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
        readonly Directive: {
            readonly oneOf: readonly [{
                readonly $ref: "#/$defs/OpenDirective";
            }, {
                readonly $ref: "#/$defs/CloseDirective";
            }, {
                readonly $ref: "#/$defs/CommodityDirective";
            }, {
                readonly $ref: "#/$defs/PriceDirective";
            }, {
                readonly $ref: "#/$defs/PadDirective";
            }, {
                readonly $ref: "#/$defs/BalanceDirective";
            }, {
                readonly $ref: "#/$defs/OptionDirective";
            }, {
                readonly $ref: "#/$defs/IncludeDirective";
            }];
        };
        readonly Malformed: {
            readonly type: "object";
            readonly required: readonly ["kind", "raw", "reason", "source"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "malformed";
                };
                readonly raw: {
                    readonly type: "string";
                };
                readonly reason: {
                    readonly type: "string";
                };
                readonly source: {
                    readonly oneOf: readonly [{
                        readonly $ref: "#/$defs/Source";
                    }, {
                        readonly type: "null";
                    }];
                };
            };
        };
    };
};
export type AccountingEntry = FromSchema<typeof accountingEntry>;
export declare const accountingEntryCarrier: import("@emsenn/relating").Carrier<{
    readonly meta: Record<string, unknown>;
    readonly date: string;
    readonly time: string | null;
    readonly flag: string | null;
    readonly payee: string | null;
    readonly narration: string;
    readonly postings: readonly {
        readonly amount: {
            readonly num: string;
            readonly den: string;
            readonly commodity: string;
        } | null;
        readonly account: string;
        readonly cost: {
            readonly kind: "per-unit" | "total";
            readonly amount: {
                readonly num: string;
                readonly den: string;
                readonly commodity: string;
            } | null;
            readonly date?: string;
            readonly label?: string;
        } | null;
        readonly price: {
            readonly kind: "@" | "@@";
            readonly amount: {
                readonly num: string;
                readonly den: string;
                readonly commodity: string;
            };
        } | null;
        readonly balanceAssertion: {
            readonly amount: {
                readonly num: string;
                readonly den: string;
                readonly commodity: string;
            };
            readonly sole?: boolean;
        } | null;
        readonly meta: Record<string, unknown>;
    }[];
    readonly tags: readonly string[];
    readonly links: readonly string[];
    readonly code: string | null;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly id?: string | null;
} | {
    readonly account: string;
    readonly date: string | null;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "open";
    readonly commodities: readonly string[];
    readonly booking: string | null;
} | {
    readonly account: string;
    readonly date: string;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "close";
} | {
    readonly symbol: string;
    readonly meta: Record<string, unknown>;
    readonly date: string | null;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "commodity";
    readonly precision: number | null;
} | {
    readonly commodity: string;
    readonly amount: {
        readonly num: string;
        readonly den: string;
        readonly commodity: string;
    };
    readonly date: string;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "price";
} | {
    readonly account: string;
    readonly date: string;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "pad";
    readonly padAccount: string;
} | {
    readonly amount: {
        readonly num: string;
        readonly den: string;
        readonly commodity: string;
    };
    readonly account: string;
    readonly date: string;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "balance";
    readonly tolerance: string | null;
} | {
    readonly date: null;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "option";
    readonly key: string | null;
    readonly value: string | null;
} | {
    readonly date: null;
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly directive: "include";
    readonly path: string | null;
    readonly resolved: boolean;
    readonly error: string | null;
} | {
    readonly kind: "malformed";
    readonly source: {
        readonly file: string | null;
        readonly line: number;
    } | null;
    readonly raw: string;
    readonly reason: string;
}>;
export declare const accountingUtterances: {
    readonly $id: "organizing/accounting-utterances";
    readonly title: "AccountingUtterances";
    readonly description: "The finite relating-utterance projection of an accounting entry or journal. Each utterance states one organizing.accounting.* relation; settling, balance arithmetic, and financial ledger reads are downstream.";
    readonly type: "object";
    readonly required: readonly ["kind", "utterances"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.accounting.utterances";
        };
        readonly utterances: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/UtteranceCarrier";
            };
        };
    };
    readonly $defs: {
        readonly Mark: {
            readonly type: "object";
            readonly required: readonly ["kind", "value"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.mark";
                };
                readonly value: {};
            };
        };
        readonly Token: {
            readonly type: "object";
            readonly required: readonly ["kind", "hand", "mark"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.token";
                };
                readonly hand: {
                    readonly const: "left";
                };
                readonly mark: {
                    readonly $ref: "#/$defs/Mark";
                };
            };
        };
        readonly Claim: {
            readonly type: "object";
            readonly required: readonly ["kind", "hand", "mark"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.claim";
                };
                readonly hand: {
                    readonly const: "right";
                };
                readonly mark: {
                    readonly $ref: "#/$defs/Mark";
                };
            };
        };
        readonly UtteranceCarrier: {
            readonly type: "object";
            readonly required: readonly ["kind", "token", "claim"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.carrier";
                };
                readonly token: {
                    readonly $ref: "#/$defs/Token";
                };
                readonly claim: {
                    readonly $ref: "#/$defs/Claim";
                };
            };
        };
    };
};
export type AccountingUtterances = FromSchema<typeof accountingUtterances>;
export declare const accountingUtterancesCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.accounting.utterances";
    readonly utterances: readonly {
        readonly kind: "utterance.carrier";
        readonly token: {
            readonly kind: "utterance.token";
            readonly hand: "left";
            readonly mark: {
                readonly kind: "utterance.mark";
                readonly value: unknown;
            };
        };
        readonly claim: {
            readonly kind: "utterance.claim";
            readonly hand: "right";
            readonly mark: {
                readonly kind: "utterance.mark";
                readonly value: unknown;
            };
        };
    }[];
}>;
export declare const adjudication: {
    readonly $id: "organizing/adjudication";
    readonly title: "Adjudication";
    readonly description: "The gluing ACT of organizing — the corpus's act of governing, 'the receiving dual of speaking' (adjudication.md): it holds and settles the charges that MANY agents' acts produce, forming a single state of the record from accumulating, possibly conflicting, possibly partial sources. This is the genuinely off-diagonal act: one agent's own three faces cannot contest (they glue coordination-free), so speaking has no adjudication sibling on the diagonal; distinct agents DO contest, so forming one record off the diagonal requires this receiving dual. Its content is the corpus's CROSS-ARENA Mayer–Vietoris decomposition over the cover of agents (cross-arena-mayer-vietoris.md): adjudication RECEIVES many constituent sections and decomposes their merge into agreement (lifts free), disagreement (tolerated), and federation-only content (the genuine obstruction). The three disciplines (adjudication.md): `contested` = conflict held as stable (Belnap-paraconsistent, NOT collapsed) — and crucially, by cross-arena MV these disagreement-pairs live in ker(δ), so they are TOLERATED and adjudicated locally, contributing NO federation-level H¹; `open` = partial held as absurd (silence ≠ denial); `monotone` = accumulation converging 'without requiring every source to coordinate' (Mayer–Vietoris coordination-free merge / CRDT). The genuine gluing obstruction is `federationOnly` = coker(diff): overlap-content that NO single constituent can express, the only content the federation-level apparatus is invoked for; `cohomologyRank` is its rank, the consensus cost (glued ⟺ rank 0). Note: by Arrow/Gibbard–Satterthwaite (social-choice.md, why-multi-agent-coordination-is-hard.md) this cost can be IRREDUCIBLE — no aggregation rule removes it — so non-zero here may be a structural impossibility, not merely 'more consensus needed'. $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-animating-organizing-exact-mirror.md and content/_archive adjudication.md / cross-arena-mayer-vietoris.md / social-choice.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "contested", "open", "monotone", "federationOnly", "cohomologyRank"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.adjudication";
        };
        readonly contested: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "conflicts held as stable (Belnap-paraconsistent): contradictory contributions across agents, marked not collapsed. By cross-arena Mayer–Vietoris these disagreement-pairs live in ker(δ) — TOLERATED, adjudicated within each constituent, contributing NO federation-level obstruction; a society can be fully glued yet deeply contested";
        };
        readonly open: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "cells held as absurd: where nothing has been contributed, the state is open, not false (silence ≠ denial)";
        };
        readonly monotone: {
            readonly const: true;
            readonly description: "accumulation is monotone: the state grows as contributions arrive, converging without requiring every source to coordinate (the CRDT / coordination-free-merge discipline)";
        };
        readonly federationOnly: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the genuine gluing obstruction (coker(diff) in cross-arena Mayer–Vietoris), computed EXACTLY from the proved settling-cohomology: the count of degree-1 cohomology generators (non-Scott / limit-stage firings) of the merged settlement whose cell carries no constituent's own H¹ generator — the obstruction the parallel composition itself introduces. Distinct from `contested`: a finite ⊤-disagreement settles at a finite stage (never a limit-stage firing), so it is NOT counted here — it lives in ker(δ); only genuinely non-Scott-continuous composition obligates the federation";
        };
        readonly cohomologyRank: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the rank of the federation-only obstruction (= H¹ over the social cover, since disagreement lives in ker(δ) and H≥2=0); the adjudication / consensus cost (glued ⟺ rank 0). By Arrow/Gibbard–Satterthwaite this may be IRREDUCIBLE";
        };
    };
};
export type Adjudication = FromSchema<typeof adjudication>;
export declare const adjudicationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.adjudication";
    readonly open: number;
    readonly contested: number;
    readonly monotone: true;
    readonly federationOnly: number;
    readonly cohomologyRank: number;
}>;
export declare const community: {
    readonly $id: "organizing/community";
    readonly title: "Community";
    readonly description: "Stage 3 (working) of the SOCIAL descent — the shared field among individuals. The corpus (`individual.md`, `relating.md`): accumulated `relating` among individuals builds `community`, the shared social field, which in turn settles into the institution/collective (the social governing, = the organization). It is the social-scale analogue of working (acting made shared and ongoing on a common field). Simondon's **transindividual** names it: the collective is NOT a mere aggregate of pre-formed individuals nor a fusion of them, but the relation in which individuals are further individuated together — so `transindividual` is true by construction. `field` counts the shared-field cells the accumulated relating holds; `members` the distinct agents sharing it; `contested` the cells where members disagree (held stable, not collapsed). $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-organizing-as-social-scale-governing.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "scale", "stage", "face", "epistemic", "field", "members", "contested", "transindividual"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.community";
        };
        readonly scale: {
            readonly const: "social";
        };
        readonly stage: {
            readonly const: "working";
        };
        readonly face: {
            readonly const: "agentic";
        };
        readonly epistemic: {
            readonly const: "belief";
            readonly description: "the epistemic moment of stage 3 (Gen-2 mirror of animating/working): belief — the shared field held in common";
        };
        readonly field: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of cells in the shared social field the accumulated relating holds";
        };
        readonly members: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct agents sharing the field";
        };
        readonly contested: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of shared-field cells where members disagree — held stable (contested), not collapsed";
        };
        readonly transindividual: {
            readonly const: true;
            readonly description: "Simondon: the collective is not an aggregate but the relation in which individuals are further individuated together";
        };
    };
};
export type Community = FromSchema<typeof community>;
export declare const communityCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.community";
    readonly contested: number;
    readonly scale: "social";
    readonly stage: "working";
    readonly face: "agentic";
    readonly epistemic: "belief";
    readonly field: number;
    readonly members: number;
    readonly transindividual: true;
}>;
export declare const face: {
    readonly $id: "organizing/face";
    readonly title: "Face";
    readonly description: "One boundary face of organizing's three-faced social boundary — one element of the social cover U = socializing ∪ computing ∪ gaming. organizing is the Gen-2 (inter-agent) lift of animating: a holographic bulk whose boundary is the disjoint union of three typed interfaces, the Gen-2 sibling faculties socializing (inter-agent communicating, ACROSS — convention, common ground, language-as-institution), computing (inter-agent knowing, INSIDE — distributed/repeatable cognition), and gaming (inter-agent playing, OUTSIDE — concurrent games among agents, CGS multi-player). A face is a cover element carrying the LOCAL SECTION settled over that faculty's inter-agent membrane log (`held` cells, of which `contested` read stable / held-contradiction). The organization (the interior bulk) is the global section glued from the three local sections; whether they glue is the adjudication / Mayer–Vietoris obstruction H¹(U). A face is how the organization is SEEN from one side; organizing provides the face carrier, the sibling faculty supplies its content when mounted (threaded, not absorbed). $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-organizing-as-social-scale-governing.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "faculty", "direction", "axis", "cover", "held", "contested", "belnap", "obstruction", "aggregate"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.face";
        };
        readonly faculty: {
            readonly enum: readonly ["socializing", "computing", "gaming"];
            readonly description: "the Gen-2 sibling faculty this face is the boundary interface of";
        };
        readonly direction: {
            readonly enum: readonly ["across", "inside", "outside"];
            readonly description: "where the faculty acts relative to the organization's boundary: socializing across, computing inside, gaming outside";
        };
        readonly axis: {
            readonly enum: readonly ["truth", "knowledge", "evidence"];
            readonly description: "the agentive-triad bilattice axis this face reads — the universal three transverse axes (Avron twist-product): socializing reads TRUTH (≤_t, which way the collective leans; negation antitone), computing reads KNOWLEDGE (≤_k, how much is settled; monotone accumulation), gaming reads EVIDENCE (the paired ⟨a₊,a₋⟩ for/against). The face↔axis correspondence is the agentive triad read at the social boundary (provisional downstream theory). See dev/docs/notes/2026-06-21-bulk-over-faces-local-section-threading.md";
        };
        readonly cover: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the cells of the local section over this face's cover";
        };
        readonly held: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of cells the local section holds on this face = belnap non-absurd";
        };
        readonly contested: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of stable cells — held contradictions on this face's cover = belnap.stable";
        };
        readonly belnap: {
            readonly $ref: "#/$defs/Belnap";
        };
        readonly obstruction: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the WITHIN-face gluing obstruction H¹ over this face's own cover — the disagreement among its local-section pieces that fails to assemble coordination-free (content/…/settling-cohomology.md: H⁰ is the section realized, H¹ the obstruction to gluing; H¹=0 ⟺ the section settles, the CRDT/CALM coordination-free convergence). Each face reads it off its OWN structure: socializing the opposition-H¹ (a cycle of opposed truth directions among observers), computing the contested concerns (the society's per-concern disagreements relayed to ⊤), gaming the for/against CONFLICT edges of its arena. This is the per-face coherence the organization needs BEFORE the cross-face adjudication (the bulk's H¹ over the social cover); the organization coheres coordination-free iff every face's obstruction is 0 AND the three faces agree across overlaps. 0 ⟺ this face integrates without adjudication.";
        };
        readonly aggregate: {
            readonly enum: readonly ["absurd", "potential", "active", "stable"];
            readonly description: "the face's collective standing: the KNOWLEDGE-order join (∨_k) over its whole cover — the single value the converged record settles to. ADJUDICATION's ACCUMULATION discipline (content/_archive adjudication.md: the state grows monotonically as contributions arrive, converging without requiring sources to coordinate; content/…/join.md: 'the fixed point settling reaches is a join', the LUB of the graded chain; content/…/knowledge-order.md: ≤_k accumulates, top ⊤=told-both). Closed form over the FOUR census: ⊤ stable if any cell is stable OR both held-for (potential) and held-against (active) are present (potential ∨_k active = ⊤); else the lone present side; else ⊥ absurd. computing's reading equals its OWN member-join `aggregate` by associativity of ∨_k.";
        };
    };
    readonly $defs: {
        readonly Belnap: {
            readonly type: "object";
            readonly required: readonly ["absurd", "potential", "active", "stable"];
            readonly additionalProperties: false;
            readonly description: "the per-cell FOUR census of this face's local section ON ITS AGENTIVE-TRIAD AXIS, read as ADJUDICATION's disciplines (the RECEIVING-dual of the personal-scale producing census on animating/face; content/_archive adjudication.md). The Gen-2 sibling faculty's OWN four-valued reading the organizing bulk consolidates, not a generic descend — socializing reads the truth DIRECTION of each consensus component, computing the ≤_k STANDING relayed across the society, gaming the evidence PAIR off its arena. The four canonical Belnap values carry adjudication's disciplines: ⊥ told-nothing = held OPEN (the partial-information discipline: silence ≠ denial), t told-true = held FOR, f told-false = held AGAINST, ⊤ told-both = held CONTESTED (the conflict discipline: paraconsistent, kept live not collapsed). The third discipline — monotone accumulation — is not a Belnap value; it is the converged record itself. `held` = potential+active+stable, `contested` = stable. See dev/docs/notes/2026-06-21-bulk-over-faces-local-section-threading.md.";
            readonly properties: {
                readonly absurd: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "⊥ held OPEN: nothing contributed at this cell on this axis (silence ≠ denial — adjudication's partial-information discipline)";
                };
                readonly potential: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "t held FOR: the for-side only — leaning for / a₊ / accumulated-for / verified on this axis";
                };
                readonly active: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "f held AGAINST: the against-side only — leaning against / a₋ / accumulated-against / refuted on this axis";
                };
                readonly stable: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "⊤ held CONTESTED: both sides present — a held contradiction kept live (adjudication's conflict discipline, paraconsistent)";
                };
            };
        };
    };
};
export type Face = FromSchema<typeof face>;
export declare const faceCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.face";
    readonly contested: number;
    readonly faculty: "socializing" | "computing" | "gaming";
    readonly direction: "across" | "inside" | "outside";
    readonly axis: "truth" | "knowledge" | "evidence";
    readonly cover: number;
    readonly held: number;
    readonly belnap: {
        readonly absurd: number;
        readonly potential: number;
        readonly active: number;
        readonly stable: number;
    };
    readonly obstruction: number;
    readonly aggregate: "absurd" | "potential" | "active" | "stable";
}>;
export declare const federation: {
    readonly $id: "organizing/federation";
    readonly title: "Federation";
    readonly description: "The next scale up the agency spiral: a plurality of constituent societies composed into one federation. The corpus makes this exact (federation-is-parallel-composition.md): federation IS parallel composition `‖` in CGS (the *-autonomous category of concurrent games with symmetry); entity-mobility across constituents — a member who belongs to two polities — is nominal-set NAME-PASSING under FSym(𝔸)-equivariance. This is genuinely RICHER than the diagonal: one agent has no parallel-composition and no name-permutation symmetry; a federation is a monoidal product of arenas with a symmetry action. Its cohomology decomposes by the CROSS-ARENA Mayer–Vietoris sequence (cross-arena-mayer-vietoris.md) into three classes: `shared` (overlap-kernel, ker(diff) — agreements that lift to the federation coordination-free), `contested` (disagreement-pairs on overlaps, ker(δ) — TOLERATED, recorded as ⊤, adjudicated within each constituent, contributing NO federation H¹), and `federationOnly` (coker(diff) — content no single constituent can express, the genuine federation-level obligation). With H≥2=0 (coordination-cohomologically-bounded-by-h1) all content lives in H⁰/H¹. `nameMobility` counts the members shared across ≥2 constituents (the name-passing overlap). `glued` is federationOnly = 0 (the constituents cohere coordination-free); by Arrow/Gibbard–Satterthwaite the cost can be irreducible. $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-animating-organizing-exact-mirror.md and content/_archive federation-is-parallel-composition.md / cross-arena-mayer-vietoris.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "monoidal", "constituents", "members", "nameMobility", "shared", "contested", "federationOnly", "glued", "coordination"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.federation";
        };
        readonly monoidal: {
            readonly const: "parallel-composition";
            readonly description: "federation is the monoidal product ‖ of arenas in CGS (federation-is-parallel-composition.md), not an external coordination protocol layered on top";
        };
        readonly constituents: {
            readonly type: "integer";
            readonly minimum: 1;
            readonly description: "count of constituent societies composed in parallel";
        };
        readonly members: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct members across the whole federation (the union of constituent social bases)";
        };
        readonly nameMobility: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of members shared across ≥2 constituents — the nominal-set name-passing overlap (FSym(𝔸)-equivariant entity-mobility: a member belonging to more than one constituent)";
        };
        readonly shared: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "overlap-kernel content (ker(diff)): cells multiple constituents hold in AGREEMENT — they lift to the federation coordination-free";
        };
        readonly contested: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "disagreement-pairs on overlaps (ker(δ)): cells multiple constituents hold with conflicting charge — TOLERATED (recorded ⊤, adjudicated within each constituent), contributing NO federation-level obstruction";
        };
        readonly federationOnly: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the genuine federation obstruction (coker(diff)), computed EXACTLY from the proved settling-cohomology: the degree-1 cohomology generators (non-Scott / limit-stage firings) the parallel composition introduces that no single constituent carries. A finite ⊤-disagreement settles at a finite stage and is NOT counted (ker δ); only non-Scott-continuous composition obligates the federation";
        };
        readonly glued: {
            readonly type: "boolean";
            readonly description: "whether the constituents cohere into one federation coordination-free: federationOnly = 0 (H¹ over the cross-arena cover vanishes). Independent of `contested` — a federation tolerates large inter-constituent disagreement structurally";
        };
        readonly coordination: {
            readonly enum: readonly ["coordination-free", "consensus-required"];
            readonly description: "the cross-arena Mayer–Vietoris reading: coordination-free (federationOnly=0) or a merge requiring the federation-level apparatus (federationOnly>0, possibly Arrow-irreducible)";
        };
    };
};
export type Federation = FromSchema<typeof federation>;
export declare const federationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.federation";
    readonly contested: number;
    readonly federationOnly: number;
    readonly members: number;
    readonly monoidal: "parallel-composition";
    readonly constituents: number;
    readonly nameMobility: number;
    readonly shared: number;
    readonly glued: boolean;
    readonly coordination: "coordination-free" | "consensus-required";
}>;
export declare const institution: {
    readonly $id: "organizing/institution";
    readonly title: "Institution";
    readonly description: "Stage 4 of the SOCIAL descent — the settled social order, generated WITHIN community: the corpus's `governing` read socially. The corpus (`governing.md`, `individual.md`): accumulated relating builds community (the shared field), which 'settles in turn into the institution or collective' — 'the settling of an open plurality into a bounded, law-bearing order' (Ostrom, Hobbes). It is the Gen-2 mirror of animating/governing (the glued individual sheaf): where governing settles ONE shared field to its fixed point (the individual), the institution settles the SOCIAL shared field — the plurality of agents — to its fixed point (the collective). `glued` is whether that plurality coheres into one body (H¹ = 0 over the social cover, by the replica Mayer–Vietoris theorem); `cohomologyRank` is the adjudication / consensus cost (`glued` ⟺ rank 0); `field` counts the settled social field's cells. The institution is the settled order the organization (the interior bulk) IS, read at its knowledge-least section — distinct from `adjudication`, the proper ACT that forms it (governing.md: 'its proper acts are adjudication and knowledge'). $id is the bare package-rooted descent path. See dev/docs/notes/2026-06-21-organizing-as-social-scale-governing.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "scale", "stage", "face", "epistemic", "settled", "glued", "cohomologyRank", "field"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.institution";
        };
        readonly scale: {
            readonly const: "social";
        };
        readonly stage: {
            readonly const: "governing";
        };
        readonly face: {
            readonly const: "individual";
        };
        readonly epistemic: {
            readonly const: "knowledge";
        };
        readonly settled: {
            readonly const: true;
            readonly description: "the social settlement reached a fixed point — the plurality comes to rest as one order";
        };
        readonly glued: {
            readonly type: "boolean";
            readonly description: "whether the plurality of agents glues into one body: H¹ = 0 over the social cover, no inter-agent disagreement left contested at a coincident cell";
        };
        readonly cohomologyRank: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the first-cohomology rank of the social settlement; the adjudication / consensus cost (`glued` is exactly `cohomologyRank === 0`)";
        };
        readonly field: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of cells in the settled social field the institution bounds";
        };
    };
};
export type Institution = FromSchema<typeof institution>;
export declare const institutionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.institution";
    readonly cohomologyRank: number;
    readonly scale: "social";
    readonly stage: "governing";
    readonly face: "individual";
    readonly epistemic: "knowledge";
    readonly field: number;
    readonly glued: boolean;
    readonly settled: true;
}>;
export declare const institutionMembrane: {
    readonly $id: "organizing/institution/membrane";
    readonly title: "InstitutionMembrane";
    readonly description: "The re-seedable membrane of a settled organization: the institution exposed as a first-class relating node plus the witnessed social boundary it settled from. `node` is byte-shaped like animating.reseed (`identity|individuated`), here `identity|institution`; it is the scale-3 name that can pass through FSym name-mobility. `seed` is the institution boundary membrane the federation can admit without a caller re-supplying the original cover. `witnesses` are RWIL/EAVT rows witnessing the node and each membrane line.";
    readonly type: "object";
    readonly required: readonly ["kind", "identity", "node", "seed", "witnesses"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.institution.membrane";
        };
        readonly identity: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly node: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly seed: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly witnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["e", "a", "v", "t"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly e: {};
                    readonly a: {};
                    readonly v: {};
                    readonly t: {};
                };
            };
        };
    };
};
export type InstitutionMembrane = FromSchema<typeof institutionMembrane>;
export declare const institutionMembraneCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.institution.membrane";
    readonly identity: string;
    readonly node: string;
    readonly seed: readonly string[];
    readonly witnesses: readonly {
        readonly e: unknown;
        readonly a: unknown;
        readonly v: unknown;
        readonly t: unknown;
    }[];
}>;
export declare const officeEligibilityDecision: {
    readonly $id: "organizing/office-eligibility-decision";
    readonly title: "OfficeEligibilityDecision";
    readonly description: "The organizing read of office-conferred authority eligibility. `eligible` is true exactly when both capability and authority residuals vanish.";
    readonly type: "object";
    readonly required: readonly ["kind", "eligible", "status", "gap", "missingCapabilities", "missingAuthorities"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.office-eligibility-decision";
        };
        readonly eligible: {
            readonly type: "boolean";
        };
        readonly status: {
            readonly enum: readonly ["potential", "active"];
        };
        readonly gap: {
            readonly enum: readonly ["none", "capability", "authority", "both"];
        };
        readonly missingCapabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly missingAuthorities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
export type OfficeEligibilityDecision = FromSchema<typeof officeEligibilityDecision>;
export declare const officeEligibilityDecisionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.office-eligibility-decision";
    readonly eligible: boolean;
    readonly status: "potential" | "active";
    readonly gap: "none" | "capability" | "authority" | "both";
    readonly missingCapabilities: readonly string[];
    readonly missingAuthorities: readonly string[];
}>;
export declare const officeEligibilityRequest: {
    readonly $id: "organizing/office-eligibility-request";
    readonly title: "OfficeEligibilityRequest";
    readonly description: "A social-scale governing request: an agent's capabilities plus the authorities conferred by an office are checked against capability and authority requirements. This is organizing's office/authority face of the old dispatch algebra.";
    readonly type: "object";
    readonly required: readonly ["kind", "capabilities", "officeAuthorities", "requiresCapabilities", "requiresAuthorities"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.office-eligibility-request";
        };
        readonly capabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly officeAuthorities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly requiresCapabilities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly requiresAuthorities: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
    };
};
export type OfficeEligibilityRequest = FromSchema<typeof officeEligibilityRequest>;
export declare const officeEligibilityRequestCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.office-eligibility-request";
    readonly capabilities: readonly string[];
    readonly officeAuthorities: readonly string[];
    readonly requiresCapabilities: readonly string[];
    readonly requiresAuthorities: readonly string[];
}>;
export declare const organization: {
    readonly $id: "organizing/organization";
    readonly title: "Organization";
    readonly description: "The interior bulk of organizing's social boundary: the organization (community / institution / polity) — the global section glued from a sheaf of agents over a social base. organizing is the social-scale reading of `governing` (the settling of an open plurality of agents into one bounded, law-bearing collective — Hobbes' 'how a multitude becomes one body able to act and endure', Ostrom's commons) and the Gen-2 lift of the animating agent: where animating glues three faculty-faces into one agent, organizing glues many agents into one organization (the two are 'two faces of one fixed point'). The organization is never a domain or codomain — you see it only through its three social `faces` (socializing/computing/gaming) and the holographic `project`. `glued` is the gluing condition, read by the cross-arena Mayer–Vietoris over the cover of constituent agents: the genuine obstruction is federation-only content (coker(diff)), NOT inter-agent disagreement (which lives in ker(δ) and is tolerated). `adjudication` is the corpus's act of governing — the receiving dual of speaking — the off-diagonal gluing that one agent's own faces never need. `institution` is the intrinsic settled order (the stage-4 reading); `adjudication` is its proper act. The organization is `settledBelow` and `openAbove`: settled as one body, open to compose into the next scale (`federate`, federation = parallel composition ‖). $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-animating-organizing-exact-mirror.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "identity", "members", "faces", "glued", "coordination", "institution", "membrane", "adjudication", "settledBelow", "openAbove", "milieu"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.organization";
        };
        readonly identity: {
            readonly type: "string";
            readonly description: "the organization's name — the collective it individuates as";
        };
        readonly members: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct agents (terms) in the social base the organization is glued from";
        };
        readonly faces: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "organizing/face";
            };
            readonly description: "the three social boundary faces (socializing, computing, gaming) the organization is the glued bulk of — its only visible surfaces";
        };
        readonly glued: {
            readonly type: "boolean";
            readonly description: "whether the plurality of agents coheres into one body, read by the cross-arena Mayer–Vietoris over the cover of constituents (= adjudication.federationOnly is 0). CRUCIALLY this is NOT broken by inter-agent disagreement: disagreement-pairs live in ker(δ) and are tolerated (adjudicated locally); only federation-only content (coker(diff)) obstructs. So an organization can be glued yet deeply contested";
        };
        readonly coordination: {
            readonly enum: readonly ["coordination-free", "consensus-required"];
            readonly description: "the cross-arena Mayer–Vietoris reading: coordination-free (no federation-only content) or a merge requiring adjudication/consensus — which by Arrow/Gibbard–Satterthwaite may be irreducible";
        };
        readonly institution: {
            readonly $ref: "organizing/institution";
            readonly description: "the settled social order (stage-4 social-governing carrier) the organization IS, by reference — the Gen-2 mirror of the agent's `governing` reference; the institution is the intrinsic settled order (single-filtration H¹), `adjudication` is its proper act (the cross-arena gluing over the constituents). They answer different questions, so may differ";
        };
        readonly membrane: {
            readonly $ref: "organizing/institution/membrane";
            readonly description: "the institution boundary exposed as a first-class re-seedable node, so federation can admit Organization carriers directly";
        };
        readonly adjudication: {
            readonly $ref: "organizing/adjudication";
        };
        readonly settledBelow: {
            readonly const: true;
            readonly description: "the organization is settled as one body — its social descent has reached a fixed point";
        };
        readonly openAbove: {
            readonly const: true;
            readonly description: "the organization carries unspent potential: it re-seeds the next-scale descent (institution → federation)";
        };
        readonly milieu: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the associated milieu (Simondon) at the social scale: the count of social-field cells not yet at the knowledge-top (not stable) — the residual collective potential the settled organization carries. `openAbove` is true exactly because this residue is non-trivial; a collective is never exhausted by its institution, so it can compose into a federation. The Gen-2 mirror of the agent's `milieu`.";
        };
        readonly telos: {
            readonly $ref: "organizing/organization/telos";
            readonly description: "the collective's reason-for-running — the aperiodic function it is open-above toward. The Gen-2 lift of the agent's `goal`; an organization without a declared telos is open-above toward nothing named. Optional for now (the principled end-state is required — an undeclared telos is malformed — but it lands optional so existing constructions keep settling); the constructor derives a default telos from the social union's dominant unsatisfied concern";
        };
    };
};
export type Organization = FromSchema<typeof organization>;
export declare const organizationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.organization";
    readonly members: number;
    readonly glued: boolean;
    readonly coordination: "coordination-free" | "consensus-required";
    readonly identity: string;
    readonly faces: readonly unknown[];
    readonly institution: unknown;
    readonly membrane: unknown;
    readonly adjudication: unknown;
    readonly settledBelow: true;
    readonly openAbove: true;
    readonly milieu: number;
    readonly telos?: unknown;
}>;
export declare const projection: {
    readonly $id: "organizing/projection";
    readonly title: "SocialProjection";
    readonly description: "The holographic boundary projection of an organization: its three social boundary faces (socializing/computing/gaming) keyed by faculty, with the coordination reading. organizing is the Gen-2 (inter-agent) lift of animating's holographic node — the organization (the interior bulk) is never returned directly; you see it ONLY through this projection onto its three faces, exactly as a holographic bulk is reconstructed from its boundary. `project` restricts the organization to these three views; each face is the local section settled over that faculty's inter-agent membrane (the sibling faculty's OWN reading, re-typed). `glued` and `coordination` carry the cross-arena Mayer–Vietoris gluing verdict the bulk reached (coordination-free iff there is no federation-only obstruction). $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-animating-organizing-exact-mirror.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "identity", "glued", "coordination", "socializing", "computing", "gaming"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.projection";
        };
        readonly identity: {
            readonly type: "string";
            readonly description: "the projected organization's name — the collective it individuates as";
        };
        readonly glued: {
            readonly type: "boolean";
            readonly description: "whether the plurality coheres into one body (the cross-arena Mayer–Vietoris verdict the bulk reached: federation-only content is 0), carried onto the boundary so the gluing condition is visible without the bulk";
        };
        readonly coordination: {
            readonly enum: readonly ["coordination-free", "consensus-required"];
            readonly description: "the coordination cost the bulk read: coordination-free (no federation-only content) or consensus-required (a merge demanding adjudication, possibly Arrow-irreducible)";
        };
        readonly socializing: {
            readonly $ref: "organizing/face";
            readonly description: "the ACROSS face — the socializing (inter-agent communicating) local section over the social cover, read on the truth axis";
        };
        readonly computing: {
            readonly $ref: "organizing/face";
            readonly description: "the INSIDE face — the computing (inter-agent knowing) local section over the social cover, read on the knowledge axis";
        };
        readonly gaming: {
            readonly $ref: "organizing/face";
            readonly description: "the OUTSIDE face — the gaming (inter-agent playing) local section over the social cover, read on the evidence axis";
        };
    };
};
export type SocialProjection = FromSchema<typeof projection>;
export declare const projectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.projection";
    readonly socializing: unknown;
    readonly computing: unknown;
    readonly gaming: unknown;
    readonly glued: boolean;
    readonly coordination: "coordination-free" | "consensus-required";
    readonly identity: string;
}>;
export declare const relating: {
    readonly $id: "organizing/relating";
    readonly title: "Relating";
    readonly description: "Stage 2 (doing) of the SOCIAL descent — the re-entered individual's act among other selves. The corpus (`individual.md`, `relating.md`) runs the same four-fold descent one scale up: the settled individual re-poses (social becoming), then `relating` is its social DOING — 'the act one self directs toward another' (Buber's I–Thou, Lévinas's face-to-face) — which leaves the BOND (friendship/kinship/contract). It is the social-scale analogue of speaking (the act that feeds the whole social descent). `bonds` counts the directed relations among agents the social membrane articulates; `agents` counts the distinct selves they run between. This is the agential face at the social scale. $id is the bare package-rooted path. See dev/docs/notes/2026-06-21-organizing-as-social-scale-governing.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "scale", "stage", "face", "epistemic", "bonds", "agents"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.relating";
        };
        readonly scale: {
            readonly const: "social";
        };
        readonly stage: {
            readonly const: "doing";
        };
        readonly face: {
            readonly const: "agential";
        };
        readonly epistemic: {
            readonly const: "judgement";
            readonly description: "the epistemic moment of stage 2 (Gen-2 mirror of animating/doing): judgement — the directed deed between selves";
        };
        readonly bonds: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of directed relations among agents the social membrane articulates — the bonds relating leaves behind";
        };
        readonly agents: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct selves the relating runs between (the social base)";
        };
    };
};
export type Relating = FromSchema<typeof relating>;
export declare const relatingCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.relating";
    readonly scale: "social";
    readonly stage: "doing";
    readonly face: "agential";
    readonly epistemic: "judgement";
    readonly bonds: number;
    readonly agents: number;
}>;
export declare const socialBecoming: {
    readonly $id: "organizing/social-becoming";
    readonly title: "SocialBecoming";
    readonly description: "Stage 1 of the SOCIAL descent — the re-entered individual posed as a someone among other selves. The corpus (`individual.md`) runs the same four-fold descent one scale up and names its first moment exactly: 'becoming — the individual re-posed as a someone at the social scale'. Simondon supplies the mechanism: the individuated being is never exhausted by its individuation; it carries a charge of pre-individual potential — its associated milieu — that drives further individuation, now AMONG OTHER SELVES. So a social-becoming is the agency seed of the social descent: the plurality of settled individuals re-posed, in pure social potential, nothing yet related, shared, or settled into a collective. It is the Gen-2 mirror of animating/becoming, and it is also the carrier the spiral re-enters at the next scale (`federate` re-poses a settled organization as a `scale: \"federation\"` social-becoming) — one self-similar carrier recurring up the agency scales. `seed` records the re-posed members (rendered `member|individuated` labels — exactly what animating's `reseed` emits per agent, so the spiral composes literally); `members` counts the distinct selves; the carrier is `openAbove` by construction. $id is the bare package-rooted descent path. See dev/docs/notes/2026-06-21-organizing-as-social-scale-governing.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "scale", "stage", "face", "epistemic", "seed", "members", "openAbove"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.social-becoming";
        };
        readonly scale: {
            readonly enum: readonly ["social", "federation"];
            readonly description: "the scale this becoming seeds: `social` (the individual re-posed among other agents) or `federation` (a settled organization re-posed among other organizations) — the same self-similar carrier one rung up";
        };
        readonly stage: {
            readonly const: "becoming";
        };
        readonly face: {
            readonly const: "animate";
        };
        readonly epistemic: {
            readonly const: "question";
        };
        readonly seed: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
            readonly description: "the inter-agent membrane the social seed articulates, rendered as `subject|predicate` labels (the social-scale analogue of animating/becoming's seed); when the members are re-posed settled individuals these read `member|individuated` — exactly what animating's `reseed` emits, so the spiral composes literally";
        };
        readonly members: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct selves re-posed into the social descent (the social base in pure potential)";
        };
        readonly openAbove: {
            readonly const: true;
            readonly description: "the social seed is pure potential — nothing has settled below it yet; the collective is not yet formed";
        };
    };
};
export type SocialBecoming = FromSchema<typeof socialBecoming>;
export declare const socialBecomingCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.social-becoming";
    readonly scale: "social" | "federation";
    readonly stage: "becoming";
    readonly face: "animate";
    readonly epistemic: "question";
    readonly members: number;
    readonly seed: readonly string[];
    readonly openAbove: true;
}>;
export declare const socialFactorization: {
    readonly $id: "organizing/social-factorization";
    readonly title: "SocialFactorization";
    readonly description: "The social-scale ACT-FACTORIZATION of one Gen-2 face's act — the Gen-2 mirror of animating/becoming/doing/factorization, and the RECEIVING dual of it. Where the personal-scale factorization reads SPEAKING (a producing act: locution selects a cell, illocution posits a charge, perlocution closes) over communicating/knowing/playing, this reads ADJUDICATION (the receiving dual of speaking — the corpus's act of governing) over socializing/computing/gaming. The corpus (`adjudication.md`): adjudication 'holds and settles the charges that many acts produce, forming a single state of the record from accumulating, possibly conflicting, possibly partial sources.' The Austin/Searle three layers are preserved (the corpus: doing-acts factor through the same locution/illocution/perlocution shape, the middle layer differing) and read here dually — locution = the cover RECEIVED (which cells the inter-agent membrane contributes), illocution = the charges HELD (what is asserted across agents, contested or for/against), perlocution = the record CONVERGED (the monotone settled section many contributions accumulate into). `belnap` is the four-fold Belnap classification of the held charges (absurd = open/silence, potential/active = held for/against, stable = held contested). `faculty` names which Gen-2 face acts; `axis` is the agentive-triad bilattice axis it works — socializing↔truth, computing↔knowledge, gaming↔evidence — a PROVISIONAL correspondence mirroring the Gen-1 triad (an open question in the corpus). $id is the bare package-rooted descent path. See dev/docs/notes/2026-06-21-organizing-as-social-scale-governing.md and content/_archive adjudication.md / agentive-triad notes.";
    readonly type: "object";
    readonly required: readonly ["kind", "faculty", "axis", "dual", "locution", "illocution", "perlocution", "belnap"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.social-factorization";
        };
        readonly faculty: {
            readonly enum: readonly ["socializing", "computing", "gaming"];
            readonly description: "which Gen-2 boundary face's act is factored";
        };
        readonly axis: {
            readonly enum: readonly ["truth", "knowledge", "evidence"];
            readonly description: "the agentive-triad bilattice axis the faculty works (PROVISIONAL, mirroring Gen-1): socializing↔truth, computing↔knowledge, gaming↔evidence";
        };
        readonly dual: {
            readonly const: "receiving";
            readonly description: "the polarity of the act: at the social (Gen-2) scale the act is RECEIVING — adjudication holds the charges many agents' acts produce (the corpus, adjudication.md: 'the receiving dual of speaking'). Its producing dual is speaking at the personal scale (animating/becoming/doing/factorization, dual: producing). PROVISIONAL (session synthesis, not settled corpus): that 'the receiving dual is needed only off the diagonal — distinct agents contest while one agent's own faces glue coordination-free' is a checkable claim; and the genuinely off-diagonal receiving structure is realized NOT in these per-face counts (which parallel the producing case) but in the multi-constituent cross-arena Mayer–Vietoris of organizing/adjudication and organizing/federation.";
        };
        readonly locution: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the cover RECEIVED (receiving dual of cell-selection): the count of predication-base cells |Φ| the inter-agent membrane contributes";
        };
        readonly illocution: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the charges HELD (receiving dual of the positing): the count of cells with an asserted (non-absurd) charge across agents";
        };
        readonly perlocution: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the record CONVERGED (receiving dual of the closure): the count of cells in the settled fixed-point section the contributions accumulate into (monotone)";
        };
        readonly belnap: {
            readonly $ref: "#/$defs/Belnap";
        };
    };
    readonly $defs: {
        readonly Belnap: {
            readonly type: "object";
            readonly required: readonly ["absurd", "potential", "active", "stable"];
            readonly additionalProperties: false;
            readonly description: "the four-fold Belnap classification of the held charges in the settled record — the bilattice's four slot-presence values. Two of adjudication's three disciplines land here (conflict → stable/contested, partial → absurd/open) plus the for/against split (potential/active); the third discipline, monotone accumulation, is not a Belnap value — it is carried by the converged `perlocution`";
            readonly properties: {
                readonly absurd: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "knowledge-bottom: held OPEN — nothing contributed at this cell (silence ≠ denial)";
                };
                readonly potential: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "truth-present only: held for (a contribution asserting the cell)";
                };
                readonly active: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "falsity-present only: held against (a contribution denying the cell)";
                };
                readonly stable: {
                    readonly type: "integer";
                    readonly minimum: 0;
                    readonly description: "knowledge-top: held CONTESTED — conflicting contributions kept live, Belnap-paraconsistent, not collapsed";
                };
            };
        };
    };
};
export type SocialFactorization = FromSchema<typeof socialFactorization>;
export declare const socialFactorizationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.social-factorization";
    readonly faculty: "socializing" | "computing" | "gaming";
    readonly axis: "truth" | "knowledge" | "evidence";
    readonly belnap: {
        readonly absurd: number;
        readonly potential: number;
        readonly active: number;
        readonly stable: number;
    };
    readonly dual: "receiving";
    readonly locution: number;
    readonly illocution: number;
    readonly perlocution: number;
}>;
export declare const telos: {
    readonly $id: "organizing/organization/telos";
    readonly title: "Telos";
    readonly description: "The organization's telos — the function-as-aperiodic-settling the collective is oriented toward and the reason its operations loop runs forever. The Gen-2 lift of the animating agent's `goal`, but NOT a satisfiable target: a goal lives in the finite regime and halts on arrival; a telos is pinned to the APERIODIC regime (κ ≥ ω₁) and is structurally never satisfied — its non-arrival is what keeps the institution alive ('the means change, the function does not'). The Scott-continuous operations-loop cycles (managing-operations) are fibers over this aperiodic base: each cycle ADVANCES the telos's settling by one step without reaching it. Per the propaganda topology's discipline, a telos is DECLARED, first-class, and auditable — an undeclared telos is malformed. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "predicate", "charge", "regime", "satisfiable", "declaredBy", "advanced"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.organization.telos";
        };
        readonly predicate: {
            readonly type: "string";
            readonly description: "the function the collective is oriented toward — the predicate its perpetual settling aims at (mirrors goal.predicate)";
        };
        readonly charge: {
            readonly enum: readonly ["absurd", "potential", "active", "stable"];
            readonly description: "the bilattice standing the telos orients its settling toward (the relating charge bedrock; mirrors goal.charge)";
        };
        readonly regime: {
            readonly const: "aperiodic";
            readonly description: "pinned to the aperiodic regime (κ ≥ ω₁): a telos that could halt is a goal, not a telos. This is the structural distinction the whole carrier turns on";
        };
        readonly satisfiable: {
            readonly const: false;
            readonly description: "the aperiodic dual of goal.satisfied — a telos is structurally NEVER satisfied; its non-arrival is what keeps the operations loop running. A boolean `satisfied` would be a category error here";
        };
        readonly declaredBy: {
            readonly type: "string";
            readonly description: "who declared this telos — the agent/office that posed it. Required: per the propaganda topology, a telos is declared and auditable, never hidden; an undeclared telos is malformed";
        };
        readonly advanced: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the monotone count of operations-loop cycles whose Scott-continuous settling has ADVANCED the telos's aperiodic settling toward (never to) its attractor — the fibers fired so far over the aperiodic base. Replaces goal's boolean `satisfied` with the ≤_k-monotone progress measure the aperiodic regime demands";
        };
    };
};
export type Telos = FromSchema<typeof telos>;
export declare const telosCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.organization.telos";
    readonly predicate: string;
    readonly charge: "absurd" | "potential" | "active" | "stable";
    readonly regime: "aperiodic";
    readonly satisfiable: false;
    readonly declaredBy: string;
    readonly advanced: number;
}>;
export declare const workRecord: {
    readonly $id: "organizing/work-record";
    readonly title: "OrganizingWorkRecord";
    readonly description: "The schema anchor for organizing.work.* carriers: work facts, agents, tasks, items, assignments, projects, and reports as relating-backed record-state. Rich relating subcarriers are preserved as objects because their law is owned by @emsenn/relating.";
    readonly type: "object";
    readonly required: readonly ["kind", "term", "carrier", "facts"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly enum: readonly ["organizing.work.agent", "organizing.work.task", "organizing.work.item", "organizing.work.assignment", "organizing.work.project", "organizing.work.report"];
        };
        readonly term: {
            readonly $ref: "#/$defs/Token";
        };
        readonly capabilities: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/Token";
            };
        };
        readonly goals: {
            readonly $ref: "#/$defs/CellSet";
        };
        readonly initial: {
            readonly $ref: "#/$defs/CellSet";
        };
        readonly task: {
            readonly type: "object";
        };
        readonly work: {
            readonly oneOf: readonly [{
                readonly type: "object";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "object";
                };
            }];
        };
        readonly office: {
            readonly $ref: "#/$defs/Token";
        };
        readonly assignee: {
            readonly type: "object";
        };
        readonly duties: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/Token";
            };
        };
        readonly assignments: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly offices: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "#/$defs/Token";
            };
        };
        readonly charge: {
            readonly type: "object";
        };
        readonly at: {};
        readonly evidence: {
            readonly type: "array";
            readonly items: {};
        };
        readonly carrier: {
            readonly $ref: "#/$defs/UtteranceCarrier";
        };
        readonly facts: {
            readonly $ref: "#/$defs/CellSet";
        };
    };
    readonly $defs: {
        readonly Mark: {
            readonly type: "object";
            readonly required: readonly ["kind", "value"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.mark";
                };
                readonly value: {};
            };
        };
        readonly Token: {
            readonly type: "object";
            readonly required: readonly ["kind", "hand", "mark"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.token";
                };
                readonly hand: {
                    readonly const: "left";
                };
                readonly mark: {
                    readonly $ref: "#/$defs/Mark";
                };
            };
        };
        readonly Claim: {
            readonly type: "object";
            readonly required: readonly ["kind", "hand", "mark"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.claim";
                };
                readonly hand: {
                    readonly const: "right";
                };
                readonly mark: {
                    readonly $ref: "#/$defs/Mark";
                };
            };
        };
        readonly Predicate: {
            readonly type: "object";
            readonly required: readonly ["kind", "claim"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "predication.predicate";
                };
                readonly claim: {
                    readonly $ref: "#/$defs/Claim";
                };
            };
        };
        readonly UtteranceCarrier: {
            readonly type: "object";
            readonly required: readonly ["kind", "token", "claim"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "utterance.carrier";
                };
                readonly token: {
                    readonly $ref: "#/$defs/Token";
                };
                readonly claim: {
                    readonly $ref: "#/$defs/Claim";
                };
            };
        };
        readonly Cell: {
            readonly type: "object";
            readonly required: readonly ["subject", "predicate", "object"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly subject: {
                    readonly $ref: "#/$defs/Token";
                };
                readonly predicate: {
                    readonly $ref: "#/$defs/Predicate";
                };
                readonly object: {
                    readonly $ref: "#/$defs/Token";
                };
            };
        };
        readonly CellSet: {
            readonly type: "object";
            readonly required: readonly ["kind", "cells"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "predication.cellSet";
                };
                readonly cells: {
                    readonly type: "array";
                    readonly items: {
                        readonly $ref: "#/$defs/Cell";
                    };
                };
            };
        };
    };
};
export type OrganizingWorkRecord = FromSchema<typeof workRecord>;
export declare const workRecordCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.work.agent" | "organizing.work.task" | "organizing.work.item" | "organizing.work.assignment" | "organizing.work.project" | "organizing.work.report";
    readonly term: {
        readonly kind: "utterance.token";
        readonly hand: "left";
        readonly mark: {
            readonly kind: "utterance.mark";
            readonly value: unknown;
        };
    };
    readonly carrier: {
        readonly kind: "utterance.carrier";
        readonly token: {
            readonly kind: "utterance.token";
            readonly hand: "left";
            readonly mark: {
                readonly kind: "utterance.mark";
                readonly value: unknown;
            };
        };
        readonly claim: {
            readonly kind: "utterance.claim";
            readonly hand: "right";
            readonly mark: {
                readonly kind: "utterance.mark";
                readonly value: unknown;
            };
        };
    };
    readonly facts: {
        readonly kind: "predication.cellSet";
        readonly cells: readonly {
            readonly object: {
                readonly kind: "utterance.token";
                readonly hand: "left";
                readonly mark: {
                    readonly kind: "utterance.mark";
                    readonly value: unknown;
                };
            };
            readonly predicate: {
                readonly kind: "predication.predicate";
                readonly claim: {
                    readonly kind: "utterance.claim";
                    readonly hand: "right";
                    readonly mark: {
                        readonly kind: "utterance.mark";
                        readonly value: unknown;
                    };
                };
            };
            readonly subject: {
                readonly kind: "utterance.token";
                readonly hand: "left";
                readonly mark: {
                    readonly kind: "utterance.mark";
                    readonly value: unknown;
                };
            };
        }[];
    };
    readonly at?: unknown;
    readonly evidence?: readonly unknown[];
    readonly capabilities?: readonly {
        readonly kind: "utterance.token";
        readonly hand: "left";
        readonly mark: {
            readonly kind: "utterance.mark";
            readonly value: unknown;
        };
    }[];
    readonly charge?: Record<string, unknown>;
    readonly goals?: {
        readonly kind: "predication.cellSet";
        readonly cells: readonly {
            readonly object: {
                readonly kind: "utterance.token";
                readonly hand: "left";
                readonly mark: {
                    readonly kind: "utterance.mark";
                    readonly value: unknown;
                };
            };
            readonly predicate: {
                readonly kind: "predication.predicate";
                readonly claim: {
                    readonly kind: "utterance.claim";
                    readonly hand: "right";
                    readonly mark: {
                        readonly kind: "utterance.mark";
                        readonly value: unknown;
                    };
                };
            };
            readonly subject: {
                readonly kind: "utterance.token";
                readonly hand: "left";
                readonly mark: {
                    readonly kind: "utterance.mark";
                    readonly value: unknown;
                };
            };
        }[];
    };
    readonly initial?: {
        readonly kind: "predication.cellSet";
        readonly cells: readonly {
            readonly object: {
                readonly kind: "utterance.token";
                readonly hand: "left";
                readonly mark: {
                    readonly kind: "utterance.mark";
                    readonly value: unknown;
                };
            };
            readonly predicate: {
                readonly kind: "predication.predicate";
                readonly claim: {
                    readonly kind: "utterance.claim";
                    readonly hand: "right";
                    readonly mark: {
                        readonly kind: "utterance.mark";
                        readonly value: unknown;
                    };
                };
            };
            readonly subject: {
                readonly kind: "utterance.token";
                readonly hand: "left";
                readonly mark: {
                    readonly kind: "utterance.mark";
                    readonly value: unknown;
                };
            };
        }[];
    };
    readonly task?: Record<string, unknown>;
    readonly work?: Record<string, unknown> | readonly Record<string, unknown>[];
    readonly office?: {
        readonly kind: "utterance.token";
        readonly hand: "left";
        readonly mark: {
            readonly kind: "utterance.mark";
            readonly value: unknown;
        };
    };
    readonly assignee?: Record<string, unknown>;
    readonly duties?: readonly {
        readonly kind: "utterance.token";
        readonly hand: "left";
        readonly mark: {
            readonly kind: "utterance.mark";
            readonly value: unknown;
        };
    }[];
    readonly assignments?: readonly Record<string, unknown>[];
    readonly offices?: readonly {
        readonly kind: "utterance.token";
        readonly hand: "left";
        readonly mark: {
            readonly kind: "utterance.mark";
            readonly value: unknown;
        };
    }[];
}>;
export type Amount = FromSchema<typeof accountingEntry["$defs"]["Amount"], typeof accountingEntry>;
export type Posting = FromSchema<typeof accountingEntry["$defs"]["Posting"], typeof accountingEntry>;
export type Transaction = FromSchema<typeof accountingEntry["$defs"]["Transaction"], typeof accountingEntry>;
//# sourceMappingURL=schemas.d.mts.map