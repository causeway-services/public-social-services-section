/**
 * cognizing/binding — knowing's `binding` carrier, single-source JSON Schema
 * (relation-model notation), no TypeBox and no codegen.
 */
import { type FromSchema } from "@emsenn/relating";
export declare const bindingSchema: {
    readonly $id: "knowing/binding";
    readonly title: "Binding";
    readonly description: "The verdict of the BINDING PROBLEM solved by sheaf cohomology. How do distributed feature representations — color, shape, motion, location, in different cortical areas — bind into ONE unified percept? The 2024–2025 cellular-sheaf / Hansen–Ghrist turn frames it as sheaf gluing, which IS the corpus's settling cohomology: features are local sections over the predication graph (entities = nodes, predications = edges); binding is gluing into a global section; the obstruction is H¹. `percepts` = H⁰ (bound objects), `bound` = (H¹=0), `obstruction` = H¹ (illusory conjunctions). $id is the bare package-rooted path. Grounded in content/…/settling-cohomology.md.";
    readonly type: "object";
    readonly required: readonly ["kind", "features", "percepts", "bound", "obstruction"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "knowing.binding";
        };
        readonly features: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "the distributed feature predications to integrate — the held memes of the comonad context C(Meme)";
        };
        readonly percepts: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "H⁰ — the connected components of the feature graph: the distinct BOUND PERCEPTS (segmentation — how many unified objects the features cohere into)";
        };
        readonly bound: {
            readonly type: "boolean";
            readonly description: "H¹ = 0 — the features bind coherently (the feature graph is a spanning forest / acyclic): a unique consistent conjunction of the distributed features exists";
        };
        readonly obstruction: {
            readonly type: "integer";
            readonly minimum: 0;
            readonly description: "H¹ — the BINDING OBSTRUCTION: the cycle rank of the feature graph (edges − nodes + components), the independent cycles where the same features admit multiple inconsistent conjunctions (illusory conjunctions / the superposition catastrophe)";
        };
    };
};
export declare const bindingCarrier: any;
export type Binding = FromSchema<typeof bindingSchema>;
//# sourceMappingURL=binding.d.mts.map