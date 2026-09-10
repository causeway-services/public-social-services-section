import { type FromSchema, type JsonValue } from "@emsenn/relating";
export declare const SituationSceneSchema: {
    readonly enum: readonly ["frontier-node", "contested-locus", "task-to-be-done"];
};
export declare const SituationSchema: {
    readonly $id: "organizing/situation";
    readonly title: "OrganizingSituation";
    readonly description: "A constructed scene over governed substrate: a frontier node, contested locus, or task-to-be-done that calls a camp into performance.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "id", "scene", "substrate", "matchSize", "requiresCapabilities", "requiresAuthorities"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.situation";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly scene: {
            readonly enum: readonly ["frontier-node", "contested-locus", "task-to-be-done"];
        };
        readonly subject: {
            readonly description: "Caller-owned substrate subject carried as JSON.";
        };
        readonly substrate: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly minItems: 1;
        };
        readonly matchSize: {
            readonly type: "integer";
            readonly minimum: 2;
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
        readonly description: {
            readonly type: "string";
        };
    };
};
export type SituationScene = FromSchema<typeof SituationSceneSchema>;
export type Situation = Omit<FromSchema<typeof SituationSchema>, "subject"> & {
    readonly subject?: JsonValue;
};
export declare const situationCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.situation";
    readonly id: string;
    readonly requiresCapabilities: readonly string[];
    readonly requiresAuthorities: readonly string[];
    readonly substrate: readonly string[];
    readonly scene: "frontier-node" | "contested-locus" | "task-to-be-done";
    readonly matchSize: number;
    readonly subject?: unknown;
    readonly description?: string;
}>;
export interface SituationInput {
    readonly id: string;
    readonly scene: SituationScene;
    readonly subject?: JsonValue;
    readonly substrate: readonly string[];
    readonly matchSize?: number;
    readonly requiresCapabilities?: readonly string[];
    readonly requiresAuthorities?: readonly string[];
    readonly description?: string;
}
export declare function situation(input: SituationInput): Situation;
//# sourceMappingURL=index.d.mts.map