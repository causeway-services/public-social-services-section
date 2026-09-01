/**
 * host-neutral-carriers - workspace governance carriers.
 *
 * These carriers organize package-manager and resolver facts without importing a
 * host reader. npm, pnpm, Git, Rust, or Guile emit the same bounded shapes.
 */
import { type FromSchema } from "@emsenn/relating";
export declare const WorkspaceCarrierSchema: {
    readonly $id: "organizing/workspace-carrier";
    readonly title: "WorkspaceCarrier";
    readonly description: "A host-neutral workspace as a governed set of manifest carriers.";
    readonly type: "object";
    readonly required: readonly ["kind", "id", "members"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.workspace-carrier";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly name: {
            readonly type: "string";
        };
        readonly packageManager: {
            readonly enum: readonly ["npm", "pnpm", "git", "mixed", "unknown"];
        };
        readonly members: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["name", "manifest"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly manifest: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly locator: {
                        readonly type: "string";
                    };
                    readonly packageManager: {
                        readonly enum: readonly ["npm", "pnpm", "git", "mixed", "unknown"];
                    };
                };
            };
        };
        readonly mediaType: {
            readonly type: "string";
        };
    };
};
export type WorkspaceCarrier = FromSchema<typeof WorkspaceCarrierSchema>;
export declare const workspaceCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.workspace-carrier";
    readonly id: string;
    readonly members: readonly {
        readonly name: string;
        readonly manifest: string;
        readonly packageManager?: "unknown" | "npm" | "pnpm" | "git" | "mixed";
        readonly locator?: string;
    }[];
    readonly name?: string;
    readonly mediaType?: string;
    readonly packageManager?: "unknown" | "npm" | "pnpm" | "git" | "mixed";
}>;
export declare const DependencyGraphSchema: {
    readonly $id: "organizing/dependency-graph";
    readonly title: "DependencyGraph";
    readonly description: "A governed dependency graph over workspace and registry nodes.";
    readonly type: "object";
    readonly required: readonly ["kind", "nodes", "edges"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.dependency-graph";
        };
        readonly nodes: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly manifest: {
                        readonly type: "string";
                    };
                    readonly workspaceMember: {
                        readonly type: "boolean";
                    };
                };
            };
        };
        readonly edges: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["from", "to", "relationship"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly from: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly to: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly relationship: {
                        readonly enum: readonly ["runtime", "development", "peer", "optional", "bundled", "workspace", "build"];
                    };
                    readonly range: {
                        readonly type: "string";
                    };
                    readonly resolvedBy: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly cycles: {
            readonly type: "array";
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
            };
        };
    };
};
export type DependencyGraph = FromSchema<typeof DependencyGraphSchema>;
export declare const dependencyGraphCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.dependency-graph";
    readonly nodes: readonly {
        readonly id: string;
        readonly manifest?: string;
        readonly workspaceMember?: boolean;
    }[];
    readonly edges: readonly {
        readonly from: string;
        readonly to: string;
        readonly relationship: "workspace" | "runtime" | "development" | "peer" | "optional" | "bundled" | "build";
        readonly range?: string;
        readonly resolvedBy?: string;
    }[];
    readonly cycles?: readonly (readonly string[])[];
}>;
export declare const CoverSchema: {
    readonly $id: "organizing/cover";
    readonly title: "Cover";
    readonly description: "A finite cover and nerve summary for workspace coordination.";
    readonly type: "object";
    readonly required: readonly ["kind", "universe", "opens", "nerveEdges", "h1", "coordinationFree"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.cover";
        };
        readonly universe: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly opens: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["id", "members"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly id: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly members: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly source: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly nerveEdges: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["left", "right", "intersection"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly left: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly right: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly intersection: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                };
            };
        };
        readonly h1: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly coordinationFree: {
            readonly type: "boolean";
        };
    };
};
export type Cover = FromSchema<typeof CoverSchema>;
export declare const coverCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.cover";
    readonly coordinationFree: boolean;
    readonly h1: number;
    readonly universe: readonly string[];
    readonly opens: readonly {
        readonly id: string;
        readonly members: readonly string[];
        readonly source?: string;
    }[];
    readonly nerveEdges: readonly {
        readonly left: string;
        readonly right: string;
        readonly intersection: readonly string[];
    }[];
}>;
export declare const ResolutionSchema: {
    readonly $id: "organizing/resolution";
    readonly title: "Resolution";
    readonly description: "A resolver's governed decisions, unresolved requests, and conflict cover.";
    readonly type: "object";
    readonly required: readonly ["kind", "decisions", "unresolved", "conflicts", "h1"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.resolution";
        };
        readonly decisions: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["requester", "dependency", "selected", "reason"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly requester: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly dependency: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly selected: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly range: {
                        readonly type: "string";
                    };
                    readonly reason: {
                        readonly enum: readonly ["workspace", "lockfile", "registry", "override", "git", "unresolved"];
                    };
                };
            };
        };
        readonly unresolved: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly conflicts: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["dependency", "requesters", "candidates"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly dependency: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly requesters: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                    readonly candidates: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                    };
                };
            };
        };
        readonly h1: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly cover: {
            readonly $id: "organizing/cover";
            readonly title: "Cover";
            readonly description: "A finite cover and nerve summary for workspace coordination.";
            readonly type: "object";
            readonly required: readonly ["kind", "universe", "opens", "nerveEdges", "h1", "coordinationFree"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly kind: {
                    readonly const: "organizing.cover";
                };
                readonly universe: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
                readonly opens: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["id", "members"];
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly id: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly members: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                            readonly source: {
                                readonly type: "string";
                            };
                        };
                    };
                };
                readonly nerveEdges: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly required: readonly ["left", "right", "intersection"];
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly left: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly right: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly intersection: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                };
                            };
                        };
                    };
                };
                readonly h1: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly coordinationFree: {
                    readonly type: "boolean";
                };
            };
        };
    };
};
export type Resolution = FromSchema<typeof ResolutionSchema>;
export declare const resolutionCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.resolution";
    readonly h1: number;
    readonly conflicts: readonly {
        readonly dependency: string;
        readonly requesters: readonly string[];
        readonly candidates: readonly string[];
    }[];
    readonly unresolved: readonly string[];
    readonly decisions: readonly {
        readonly reason: "workspace" | "git" | "lockfile" | "registry" | "override" | "unresolved";
        readonly dependency: string;
        readonly requester: string;
        readonly selected: string;
        readonly range?: string;
    }[];
    readonly cover?: {
        readonly kind: "organizing.cover";
        readonly coordinationFree: boolean;
        readonly h1: number;
        readonly universe: readonly string[];
        readonly opens: readonly {
            readonly id: string;
            readonly members: readonly string[];
            readonly source?: string;
        }[];
        readonly nerveEdges: readonly {
            readonly left: string;
            readonly right: string;
            readonly intersection: readonly string[];
        }[];
    };
}>;
//# sourceMappingURL=host-neutral-carriers.d.mts.map