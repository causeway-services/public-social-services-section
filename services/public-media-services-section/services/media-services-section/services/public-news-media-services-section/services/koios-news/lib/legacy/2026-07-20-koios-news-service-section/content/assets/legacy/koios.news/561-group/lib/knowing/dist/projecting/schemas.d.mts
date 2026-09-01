import { type FromSchema } from "@emsenn/relating";
export declare const ordinalProjectionSchema: {
    readonly $id: "knowing/researching/ordinal";
    readonly title: "OrdinalProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "finiteDepth"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly type: "string";
        };
        readonly finiteDepth: {
            readonly type: readonly ["number", "null"];
        };
    };
};
export declare const ordinalProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: string;
    readonly finiteDepth: number | null;
}>;
export type OrdinalProjection = FromSchema<typeof ordinalProjectionSchema>;
export declare const incrementProjectionSchema: {
    readonly $id: "knowing/researching/increment";
    readonly title: "IncrementProjection";
    readonly type: "object";
    readonly required: readonly ["stage", "ordinal", "addedCells"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly stage: {
            readonly type: "string";
        };
        readonly ordinal: {
            readonly $id: "knowing/researching/ordinal";
            readonly title: "OrdinalProjection";
            readonly type: "object";
            readonly required: readonly ["kind", "finiteDepth"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                };
                readonly finiteDepth: {
                    readonly type: readonly ["number", "null"];
                };
            };
        };
        readonly addedCells: {
            readonly type: "integer";
            readonly minimum: 0;
        };
    };
};
export declare const incrementProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly stage: string;
    readonly ordinal: {
        readonly kind: string;
        readonly finiteDepth: number | null;
    };
    readonly addedCells: number;
}>;
export type IncrementProjection = FromSchema<typeof incrementProjectionSchema>;
export declare const cellProjectionSchema: {
    readonly $id: "knowing/researching/cell";
    readonly title: "CellProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "settled", "depth", "firstCohomologyRank", "stages"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.wire.cell";
        };
        readonly settled: {
            readonly const: true;
        };
        readonly depth: {
            readonly $id: "knowing/researching/ordinal";
            readonly title: "OrdinalProjection";
            readonly type: "object";
            readonly required: readonly ["kind", "finiteDepth"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly type: "string";
                };
                readonly finiteDepth: {
                    readonly type: readonly ["number", "null"];
                };
            };
        };
        readonly firstCohomologyRank: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly stages: {
            readonly type: "integer";
            readonly minimum: 0;
        };
    };
};
export declare const cellProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.wire.cell";
    readonly settled: true;
    readonly depth: {
        readonly kind: string;
        readonly finiteDepth: number | null;
    };
    readonly firstCohomologyRank: number;
    readonly stages: number;
}>;
export type CellProjection = FromSchema<typeof cellProjectionSchema>;
export declare const siteProjectionSchema: {
    readonly $id: "knowing/researching/site";
    readonly title: "SiteProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "increments", "cellsAdded", "trace"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.wire.site";
        };
        readonly increments: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly cellsAdded: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly trace: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/researching/increment";
                readonly title: "IncrementProjection";
                readonly type: "object";
                readonly required: readonly ["stage", "ordinal", "addedCells"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly stage: {
                        readonly type: "string";
                    };
                    readonly ordinal: {
                        readonly $id: "knowing/researching/ordinal";
                        readonly title: "OrdinalProjection";
                        readonly type: "object";
                        readonly required: readonly ["kind", "finiteDepth"];
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly kind: {
                                readonly type: "string";
                            };
                            readonly finiteDepth: {
                                readonly type: readonly ["number", "null"];
                            };
                        };
                    };
                    readonly addedCells: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
    };
};
export declare const siteProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.wire.site";
    readonly increments: number;
    readonly cellsAdded: number;
    readonly trace: readonly {
        readonly stage: string;
        readonly ordinal: {
            readonly kind: string;
            readonly finiteDepth: number | null;
        };
        readonly addedCells: number;
    }[];
}>;
export type SiteProjection = FromSchema<typeof siteProjectionSchema>;
export declare const lessonProjectionSchema: {
    readonly $id: "knowing/researching/lesson";
    readonly title: "LessonProjection";
    readonly type: "object";
    readonly required: readonly ["stage", "restrictionCells"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly stage: {
            readonly type: "string";
        };
        readonly restrictionCells: {
            readonly type: "integer";
            readonly minimum: 0;
        };
    };
};
export declare const lessonProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly stage: string;
    readonly restrictionCells: number;
}>;
export type LessonProjection = FromSchema<typeof lessonProjectionSchema>;
export declare const learningProjectionSchema: {
    readonly $id: "knowing/researching/learning";
    readonly title: "LearningProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "lessons", "sample"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.wire.learning";
        };
        readonly lessons: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly sample: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/researching/lesson";
                readonly title: "LessonProjection";
                readonly type: "object";
                readonly required: readonly ["stage", "restrictionCells"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly stage: {
                        readonly type: "string";
                    };
                    readonly restrictionCells: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
    };
};
export declare const learningProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.wire.learning";
    readonly lessons: number;
    readonly sample: readonly {
        readonly stage: string;
        readonly restrictionCells: number;
    }[];
}>;
export type LearningProjection = FromSchema<typeof learningProjectionSchema>;
export declare const explanationProjectionSchema: {
    readonly $id: "knowing/researching/explanation";
    readonly title: "ExplanationProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "steps", "cellsAdded", "derivation"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.explanation";
        };
        readonly steps: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly cellsAdded: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly derivation: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["stage", "addedCells"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly stage: {
                        readonly type: "string";
                    };
                    readonly addedCells: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
    };
};
export declare const explanationProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.explanation";
    readonly steps: number;
    readonly cellsAdded: number;
    readonly derivation: readonly {
        readonly stage: string;
        readonly addedCells: number;
    }[];
}>;
export type ExplanationProjection = FromSchema<typeof explanationProjectionSchema>;
export declare const curriculumProjectionSchema: {
    readonly $id: "knowing/researching/curriculum";
    readonly title: "CurriculumProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "lessons", "sequence"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.curriculum";
        };
        readonly lessons: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly sequence: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/researching/lesson";
                readonly title: "LessonProjection";
                readonly type: "object";
                readonly required: readonly ["stage", "restrictionCells"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly stage: {
                        readonly type: "string";
                    };
                    readonly restrictionCells: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
    };
};
export declare const curriculumProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.curriculum";
    readonly sequence: readonly {
        readonly stage: string;
        readonly restrictionCells: number;
    }[];
    readonly lessons: number;
}>;
export type CurriculumProjection = FromSchema<typeof curriculumProjectionSchema>;
export declare const nextStepProjectionSchema: {
    readonly $id: "knowing/researching/next-step";
    readonly title: "NextStepProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "step", "reason"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.next-step";
        };
        readonly step: {
            readonly anyOf: readonly [{
                readonly $id: "knowing/researching/lesson";
                readonly title: "LessonProjection";
                readonly type: "object";
                readonly required: readonly ["stage", "restrictionCells"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly stage: {
                        readonly type: "string";
                    };
                    readonly restrictionCells: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            }, {
                readonly type: "null";
            }];
        };
        readonly reason: {
            readonly type: "string";
        };
    };
};
export declare const nextStepProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.next-step";
    readonly step: {
        readonly stage: string;
        readonly restrictionCells: number;
    } | null;
    readonly reason: string;
}>;
export type NextStepProjection = FromSchema<typeof nextStepProjectionSchema>;
export declare const knowledgeProjectionSchema: {
    readonly $id: "knowing/researching/knowledge";
    readonly title: "KnowledgeProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "regime", "certified", "settledRelations", "settled"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.knowledge";
        };
        readonly regime: {
            readonly type: "string";
        };
        readonly certified: {
            readonly type: "boolean";
        };
        readonly settledRelations: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly settled: {
            readonly type: "array";
            readonly items: {
                readonly $id: "knowing/researching/increment";
                readonly title: "IncrementProjection";
                readonly type: "object";
                readonly required: readonly ["stage", "ordinal", "addedCells"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly stage: {
                        readonly type: "string";
                    };
                    readonly ordinal: {
                        readonly $id: "knowing/researching/ordinal";
                        readonly title: "OrdinalProjection";
                        readonly type: "object";
                        readonly required: readonly ["kind", "finiteDepth"];
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly kind: {
                                readonly type: "string";
                            };
                            readonly finiteDepth: {
                                readonly type: readonly ["number", "null"];
                            };
                        };
                    };
                    readonly addedCells: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
    };
};
export declare const knowledgeProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.knowledge";
    readonly settled: readonly {
        readonly stage: string;
        readonly ordinal: {
            readonly kind: string;
            readonly finiteDepth: number | null;
        };
        readonly addedCells: number;
    }[];
    readonly regime: string;
    readonly certified: boolean;
    readonly settledRelations: number;
}>;
export type KnowledgeProjection = FromSchema<typeof knowledgeProjectionSchema>;
export declare const researchProjectionSchema: {
    readonly $id: "knowing/researching/research";
    readonly title: "ResearchProjection";
    readonly type: "object";
    readonly required: readonly ["kind", "regime", "onShell", "certified", "stages"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.research.settled";
        };
        readonly regime: {
            readonly type: "string";
        };
        readonly onShell: {
            readonly type: "boolean";
        };
        readonly certified: {
            readonly type: "boolean";
        };
        readonly stages: {
            readonly type: "integer";
            readonly minimum: 0;
        };
    };
};
export declare const researchProjectionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "knowing.research.settled";
    readonly regime: string;
    readonly onShell: boolean;
    readonly certified: boolean;
    readonly stages: number;
}>;
export type ResearchProjection = FromSchema<typeof researchProjectionSchema>;
//# sourceMappingURL=schemas.d.mts.map