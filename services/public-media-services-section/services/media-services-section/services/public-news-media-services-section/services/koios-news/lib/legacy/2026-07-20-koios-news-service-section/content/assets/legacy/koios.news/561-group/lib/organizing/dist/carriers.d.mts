/**
 * carriers — organizing's hand-authored schema literals.
 */
import { type FromSchema } from "@emsenn/relating";
export declare const organizationSymmetrySchema: {
    readonly $id: "organizing/symmetry";
    readonly title: "OrganizationSymmetry";
    readonly description: "The organization's SYMMETRY — the FSym(𝔸) structure of its membership. $id is the bare package-rooted descent path.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "members", "roles", "interchangeable", "mobile", "uniform", "arenaUniform"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.symmetry";
        };
        readonly members: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly roles: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly interchangeable: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly mobile: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly uniform: {
            readonly type: "boolean";
        };
        readonly arenaUniform: {
            readonly type: "boolean";
        };
    };
};
export type OrganizationSymmetry = FromSchema<typeof organizationSymmetrySchema>;
export declare const organizationSymmetryCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.symmetry";
    readonly members: number;
    readonly roles: number;
    readonly interchangeable: number;
    readonly mobile: number;
    readonly uniform: boolean;
    readonly arenaUniform: boolean;
}>;
export declare const organizationStanceSchema: {
    readonly $id: "organizing/stance";
    readonly title: "OrganizationStance";
    readonly description: "The organization's STANCE — which way the collective leans on the bilattice TRUTH order. $id is the bare package-rooted descent path.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "lean", "coordinationFree"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.stance";
        };
        readonly lean: {
            readonly enum: readonly ["absurd", "potential", "active", "stable"];
        };
        readonly coordinationFree: {
            readonly type: "boolean";
        };
    };
};
export type OrganizationStance = FromSchema<typeof organizationStanceSchema>;
export declare const organizationStanceCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.stance";
    readonly lean: "absurd" | "potential" | "active" | "stable";
    readonly coordinationFree: boolean;
}>;
export declare const governanceSchema: {
    readonly $id: "organizing/governance";
    readonly title: "Governance";
    readonly description: "The organization's GOVERNANCE — the consolidation of socializing, computing, and gaming impossibility-escapes into one verdict. $id is the bare package-rooted descent path.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "socialChoice", "consensus", "equilibrium", "governable", "irreducible"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.governance";
        };
        readonly socialChoice: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["acyclic", "contested", "majorityCyclic"];
            readonly properties: {
                readonly acyclic: {
                    readonly type: "boolean";
                };
                readonly contested: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly majorityCyclic: {
                    readonly type: "boolean";
                };
            };
        };
        readonly consensus: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["coordinationFree", "converges", "contested", "flpEscaped"];
            readonly properties: {
                readonly coordinationFree: {
                    readonly type: "boolean";
                };
                readonly converges: {
                    readonly type: "boolean";
                };
                readonly contested: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly flpEscaped: {
                    readonly type: "boolean";
                };
            };
        };
        readonly equilibrium: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["reachable", "bestResponseCyclic", "contested"];
            readonly properties: {
                readonly reachable: {
                    readonly type: "boolean";
                };
                readonly bestResponseCyclic: {
                    readonly type: "boolean";
                };
                readonly contested: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
        readonly governable: {
            readonly type: "boolean";
        };
        readonly irreducible: {
            readonly type: "integer";
            readonly minimum: 0;
        };
    };
};
export type Governance = FromSchema<typeof governanceSchema>;
export declare const governanceCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.governance";
    readonly socialChoice: {
        readonly contested: number;
        readonly acyclic: boolean;
        readonly majorityCyclic: boolean;
    };
    readonly consensus: {
        readonly contested: number;
        readonly coordinationFree: boolean;
        readonly converges: boolean;
        readonly flpEscaped: boolean;
    };
    readonly equilibrium: {
        readonly contested: number;
        readonly reachable: boolean;
        readonly bestResponseCyclic: boolean;
    };
    readonly governable: boolean;
    readonly irreducible: number;
}>;
export declare const cohesionSchema: {
    readonly $id: "organizing/cohesion";
    readonly title: "OrganizationCohesion";
    readonly description: "The organization's COHESION — whether its members' sentiment network partitions into stable coalitions. $id is the bare package-rooted descent path.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "members", "ties", "balanced", "clusterable", "factions", "dissonance", "frustration"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.cohesion";
        };
        readonly members: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly ties: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly balanced: {
            readonly type: "boolean";
        };
        readonly clusterable: {
            readonly type: "boolean";
        };
        readonly factions: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly dissonance: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly frustration: {
            readonly type: "integer";
            readonly minimum: 0;
        };
    };
};
export type OrganizationCohesion = FromSchema<typeof cohesionSchema>;
export declare const cohesionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.cohesion";
    readonly balanced: boolean;
    readonly members: number;
    readonly ties: number;
    readonly clusterable: boolean;
    readonly factions: number;
    readonly dissonance: number;
    readonly frustration: number;
}>;
//# sourceMappingURL=carriers.d.mts.map