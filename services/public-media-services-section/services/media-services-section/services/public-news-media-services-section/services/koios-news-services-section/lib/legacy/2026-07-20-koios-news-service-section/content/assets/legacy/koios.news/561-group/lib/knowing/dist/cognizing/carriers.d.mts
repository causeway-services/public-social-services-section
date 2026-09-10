/**
 * cognizing/carriers — knowing's cognizing carriers, single-source JSON Schema
 * literals, no TypeBox and no codegen. Each carrier is one `as const` schema:
 * `FromSchema` reads it at compile time and `carrierFrom` registers the same
 * literal as the runtime validation law and bare `$id` identity.
 */
import { type FromSchema, type Meme } from "@emsenn/relating";
export declare const knowledgeStandingSchema: {
    readonly $id: "knowing/knowledge-standing";
    readonly title: "KnowledgeStanding";
    readonly description: "knowing's read-out of a cognized meme's <=_k standing by the comonad counit: the FOUR value, whether settled, whether reflexive, and the per-side evidence-witness depth. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "standing", "settled", "reflexive", "positiveEvidence", "negativeEvidence"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.knowledge-standing";
        };
        readonly standing: {
            readonly enum: readonly ["absurd", "active", "potential", "stable"];
            readonly description: "the meme's charge value on the knowledge order <=_k (absurd bottom to stable top)";
        };
        readonly settled: {
            readonly type: "boolean";
            readonly description: "true iff standing === 'stable' — the <=_k fixpoint is reached";
        };
        readonly reflexive: {
            readonly type: "boolean";
            readonly description: "true iff the meme's subject or object Token nests another meme";
        };
        readonly positiveEvidence: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of truth-side witness Marks";
        };
        readonly negativeEvidence: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of falsity-side witness Marks";
        };
    };
};
export declare const knowledgeStandingCarrier: any;
export type KnowledgeStanding = FromSchema<typeof knowledgeStandingSchema>;
export declare const knowledgeStateSchema: {
    readonly $id: "knowing/knowledge-state";
    readonly title: "KnowledgeState";
    readonly description: "knowing's comonad context C(Meme): a held section of memes, the knower's whole standing body of knowledge. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "base", "memes", "held", "settled", "contested", "glues"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.knowledge-state";
        };
        readonly base: {
            readonly type: "string";
            readonly description: "a label for the base region the section is held over";
        };
        readonly memes: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["kind"];
                readonly additionalProperties: true;
                readonly properties: {
                    readonly kind: {
                        readonly const: "predication.fiber.meme";
                    };
                };
            };
            readonly description: "the held section: the <=_k-folded memes";
        };
        readonly held: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct cells held in the section";
        };
        readonly settled: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of held cells at the <=_k top";
        };
        readonly contested: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of held contradictions";
        };
        readonly glues: {
            readonly type: "boolean";
            readonly description: "whether the section glues into a sheaf";
        };
    };
};
export declare const knowledgeStateCarrier: any;
/** A held meme (relating's meme carrier), kept structurally so the section is self-typing. */
export type HeldMeme = Meme;
export type KnowledgeState = Omit<FromSchema<typeof knowledgeStateSchema>, "memes"> & {
    readonly memes: readonly HeldMeme[];
};
export declare const settlingRegimeSchema: {
    readonly $id: "knowing/settling-regime";
    readonly title: "SettlingRegime";
    readonly description: "INTELLIGENCE as the closure regime of a meme's settling orbit. reflect/ruminate are two values of this faculty. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "regime", "converges", "monotone", "closureOrdinal", "settled"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.settling-regime";
        };
        readonly regime: {
            readonly enum: readonly ["strict-finite", "scott-continuous", "transfinite-bounded", "aperiodic"];
            readonly description: "the closure-orbit class: strict-finite, scott-continuous, transfinite-bounded, or aperiodic";
        };
        readonly converges: {
            readonly type: "boolean";
            readonly description: "whether the <=_k orbit reaches a fixpoint at all";
        };
        readonly monotone: {
            readonly type: "boolean";
            readonly description: "the orbit is knowledge-monotone";
        };
        readonly closureOrdinal: {
            readonly enum: readonly ["zero", "finite", "omega", "transfinite", "omega-1-or-above"];
            readonly description: "the least ordinal at which the settling endofunctor reaches a fixpoint, or the aperiodic marker";
        };
        readonly settled: {
            readonly type: "boolean";
            readonly description: "whether the meme already sits at its <=_k fixpoint";
        };
    };
};
export declare const settlingRegimeCarrier: any;
export type SettlingRegime = FromSchema<typeof settlingRegimeSchema>;
export declare const attractorSchema: {
    readonly $id: "knowing/attractor";
    readonly title: "Attractor";
    readonly description: "knowing's read of MEMORY RECALL as ATTRACTOR DYNAMICS. A cue settles to the fixed-point attractor it lies in the basin of; the orbit never cycles, and the open question is the regime and whether the attractor is spurious. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "cue", "attractor", "settled", "spurious", "regime", "terminates", "cycleFree", "recallable"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.attractor";
        };
        readonly cue: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the cells presented in the recall cue";
        };
        readonly attractor: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the cells of the fixed point the cue settles to";
        };
        readonly settled: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "cells committed to a definite for/against recall";
        };
        readonly spurious: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the <=_k-top told-both cells in the attractor";
        };
        readonly regime: {
            readonly enum: readonly ["strict-finite", "scott-continuous", "aperiodic"];
            readonly description: "the recall-orbit class: strict-finite, scott-continuous, or aperiodic";
        };
        readonly terminates: {
            readonly type: "boolean";
            readonly description: "whether the recall orbit reaches its attractor at a bounded ordinal";
        };
        readonly cycleFree: {
            readonly type: "boolean";
            readonly description: "the no-non-trivial-periodic-orbit guarantee";
        };
        readonly recallable: {
            readonly type: "boolean";
            readonly description: "true iff terminates and spurious === 0";
        };
    };
};
export declare const attractorCarrier: any;
export type Attractor = FromSchema<typeof attractorSchema>;
export declare const contextualitySchema: {
    readonly $id: "knowing/contextuality";
    readonly title: "Contextuality";
    readonly description: "knowing's read of sheaf-theoretic contextuality: signed gluing of agree/disagree constraints across measurement contexts. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "variables", "constraints", "contextual", "globalSection", "frustration"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.contextuality";
        };
        readonly variables: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the distinct cells/propositions constrained across contexts";
        };
        readonly constraints: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the agree/disagree constraints between cells";
        };
        readonly contextual: {
            readonly type: "boolean";
            readonly description: "true when no global consistent assignment exists";
        };
        readonly globalSection: {
            readonly type: "boolean";
            readonly description: "true when a global section exists";
        };
        readonly frustration: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the count of constraints conflicting with the global coloring";
        };
    };
};
export declare const contextualityCarrier: any;
export type Contextuality = FromSchema<typeof contextualitySchema>;
export declare const consolidationSchema: {
    readonly $id: "knowing/consolidation";
    readonly title: "Consolidation";
    readonly description: "the verdict of consolidating a held knowledge-state into a sheaf. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "held", "settled", "contested", "glues", "consistent", "settledFraction"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.consolidation";
        };
        readonly held: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of distinct held cells in the section";
        };
        readonly settled: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of held cells at the <=_k top";
        };
        readonly contested: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of held both-sides-witnessed contradictions";
        };
        readonly glues: {
            readonly type: "boolean";
            readonly description: "the sheaf-gluing condition";
        };
        readonly consistent: {
            readonly type: "boolean";
            readonly description: "whether the section holds no contested cell";
        };
        readonly settledFraction: {
            readonly type: "number";
            readonly minimum: 0;
            readonly maximum: 1;
            readonly description: "settled / held";
        };
    };
};
export declare const consolidationCarrier: any;
export type Consolidation = FromSchema<typeof consolidationSchema>;
export declare const derivabilitySchema: {
    readonly $id: "knowing/derivability";
    readonly title: "Derivability";
    readonly description: "the verdict of judging two held knowledge-states mutually locally derivable. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "equivalent", "leftSignature", "rightSignature", "sharedInvariant"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.derivability";
        };
        readonly equivalent: {
            readonly type: "boolean";
            readonly description: "whether the two sections are mutually locally derivable";
        };
        readonly leftSignature: {
            readonly type: "string";
            readonly description: "the canonical structural fingerprint of the left section";
        };
        readonly rightSignature: {
            readonly type: "string";
            readonly description: "the canonical structural fingerprint of the right section";
        };
        readonly sharedInvariant: {
            readonly type: "boolean";
            readonly description: "whether the classifying invariants agree";
        };
    };
};
export declare const derivabilityCarrier: any;
export type Derivability = FromSchema<typeof derivabilitySchema>;
export declare const knowledgeIdentitySchema: {
    readonly $id: "knowing/identity";
    readonly title: "KnowledgeIdentity";
    readonly description: "the identity of a meme's cell through memory's classical and paraconsistent equality predicates. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "onDiagonal", "classical", "paraconsistent", "mergeStable"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.identity";
        };
        readonly onDiagonal: {
            readonly type: "boolean";
            readonly description: "whether the meme's cell sits on the diagonal";
        };
        readonly classical: {
            readonly enum: readonly ["t", "f"];
            readonly description: "the classical two-valued equality";
        };
        readonly paraconsistent: {
            readonly enum: readonly ["top", "bottom"];
            readonly description: "the paraconsistent knowledge-order equality";
        };
        readonly mergeStable: {
            readonly type: "boolean";
            readonly description: "the paraconsistent equality is stable under <=_k join-merge";
        };
    };
};
export declare const knowledgeIdentityCarrier: any;
export type KnowledgeIdentity = FromSchema<typeof knowledgeIdentitySchema>;
export declare const modalStandingSchema: {
    readonly $id: "knowing/modal-standing";
    readonly title: "ModalStanding";
    readonly description: "the modal standing of a meme across a world-set. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly required: readonly ["kind", "modality", "value", "worlds", "heldIn"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.modal-standing";
        };
        readonly modality: {
            readonly enum: readonly ["necessity", "possibility"];
            readonly description: "the modal operator taken";
        };
        readonly value: {
            readonly enum: readonly ["absurd", "active", "potential", "stable"];
            readonly description: "the meme's charge value on the knowledge order <=_k (absurd bottom to stable top)";
        };
        readonly worlds: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the number of worlds the modal operator ranged over";
        };
        readonly heldIn: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "count of worlds where the meme's cell is held non-absurd";
        };
    };
};
export declare const modalStandingCarrier: any;
export type ModalStanding = FromSchema<typeof modalStandingSchema>;
//# sourceMappingURL=carriers.d.mts.map