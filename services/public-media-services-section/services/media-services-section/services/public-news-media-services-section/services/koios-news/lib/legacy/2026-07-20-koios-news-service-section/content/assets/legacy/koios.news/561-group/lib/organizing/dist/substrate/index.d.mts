import { type Agent } from "@emsenn/animating";
import { type FromSchema, type UtteranceCarrier } from "@emsenn/relating";
import { type Constituent, type Organization, type OrganizationOptions } from "../organizing.mjs";
import { type WorkItem } from "../work.mjs";
export declare const SubstratePackageSchema: {
    readonly $id: "organizing/substrate/package";
    readonly title: "OrganizingSubstratePackage";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "name", "utterances", "exports", "bins", "scripts", "dependencies"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.substrate.package";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly term: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly layer: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly utterances: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly exports: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly bins: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly scripts: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly dependencies: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const SubstrateChronicleSchema: {
    readonly $id: "organizing/substrate/chronicle";
    readonly title: "OrganizingSubstrateChronicle";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "feed", "path", "witnesses", "sessions"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.substrate.chronicle";
        };
        readonly feed: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly path: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly witnesses: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly sessions: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const SubstrateContentSchema: {
    readonly $id: "organizing/substrate/content";
    readonly title: "OrganizingSubstrateContent";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "root", "resources"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.substrate.content";
        };
        readonly root: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly resources: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["path", "bytes"];
                readonly properties: {
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly bytes: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
    };
};
export declare const DirectorySubstrateSchema: {
    readonly $id: "organizing/substrate/directory";
    readonly title: "OrganizingDirectorySubstrate";
    readonly description: "A frozen organizing intake reading of a directory as governed substrate.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "root", "readAt", "packages", "chronicles", "content", "constituents", "workItems"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.substrate.directory";
        };
        readonly root: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly readAt: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly packages: {
            readonly type: "array";
            readonly items: {
                readonly $id: "organizing/substrate/package";
                readonly title: "OrganizingSubstratePackage";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "name", "utterances", "exports", "bins", "scripts", "dependencies"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "organizing.substrate.package";
                    };
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly term: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly layer: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly utterances: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                        };
                    };
                    readonly exports: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly bins: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly scripts: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                    readonly dependencies: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly chronicles: {
            readonly type: "array";
            readonly items: {
                readonly $id: "organizing/substrate/chronicle";
                readonly title: "OrganizingSubstrateChronicle";
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["kind", "feed", "path", "witnesses", "sessions"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "organizing.substrate.chronicle";
                    };
                    readonly feed: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly witnesses: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                        };
                    };
                    readonly sessions: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly content: {
            readonly $id: "organizing/substrate/content";
            readonly title: "OrganizingSubstrateContent";
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["kind", "root", "resources"];
            readonly properties: {
                readonly kind: {
                    readonly const: "organizing.substrate.content";
                };
                readonly root: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly resources: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly required: readonly ["path", "bytes"];
                        readonly properties: {
                            readonly path: {
                                readonly type: "string";
                                readonly minLength: 1;
                            };
                            readonly bytes: {
                                readonly type: "integer";
                                readonly minimum: 0;
                            };
                        };
                    };
                };
            };
        };
        readonly constituents: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["name", "utteranceCount"];
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly utteranceCount: {
                        readonly type: "integer";
                        readonly minimum: 0;
                    };
                };
            };
        };
        readonly workItems: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["term", "title", "status"];
                readonly properties: {
                    readonly term: {};
                    readonly title: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly status: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                };
            };
        };
    };
};
export type SubstratePackage = FromSchema<typeof SubstratePackageSchema>;
export type SubstrateChronicle = FromSchema<typeof SubstrateChronicleSchema>;
export type SubstrateContent = FromSchema<typeof SubstrateContentSchema>;
export type DirectorySubstrate = FromSchema<typeof DirectorySubstrateSchema> & {
    readonly organizationInput: {
        readonly constituents: readonly Constituent[];
        readonly agents: readonly Agent[];
        readonly workItems: readonly WorkItem[];
    };
};
export declare const substratePackageCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.substrate.package";
    readonly utterances: readonly Record<string, unknown>[];
    readonly name: string;
    readonly exports: readonly string[];
    readonly bins: readonly string[];
    readonly scripts: readonly string[];
    readonly dependencies: readonly string[];
    readonly term?: string;
    readonly layer?: string;
}>;
export declare const substrateChronicleCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.substrate.chronicle";
    readonly path: string;
    readonly witnesses: readonly Record<string, unknown>[];
    readonly feed: string;
    readonly sessions: readonly string[];
}>;
export declare const substrateContentCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.substrate.content";
    readonly root: string;
    readonly resources: readonly {
        readonly path: string;
        readonly bytes: number;
    }[];
}>;
export declare const directorySubstrateCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.substrate.directory";
    readonly constituents: readonly {
        readonly name: string;
        readonly utteranceCount: number;
    }[];
    readonly root: string;
    readonly readAt: string;
    readonly packages: readonly {
        readonly kind: "organizing.substrate.package";
        readonly utterances: readonly Record<string, unknown>[];
        readonly name: string;
        readonly exports: readonly string[];
        readonly bins: readonly string[];
        readonly scripts: readonly string[];
        readonly dependencies: readonly string[];
        readonly term?: string;
        readonly layer?: string;
    }[];
    readonly chronicles: readonly {
        readonly kind: "organizing.substrate.chronicle";
        readonly path: string;
        readonly witnesses: readonly Record<string, unknown>[];
        readonly feed: string;
        readonly sessions: readonly string[];
    }[];
    readonly content: {
        readonly kind: "organizing.substrate.content";
        readonly root: string;
        readonly resources: readonly {
            readonly path: string;
            readonly bytes: number;
        }[];
    };
    readonly workItems: readonly {
        readonly status: string;
        readonly term: unknown;
        readonly title: string;
    }[];
}>;
export interface JSNodePackageSubstrate {
    readonly name: string;
    readonly term?: string;
    readonly layer?: string;
    readonly utterances: readonly UtteranceCarrier[];
    readonly exports?: readonly string[];
    readonly dependencies?: readonly string[];
    readonly manifest?: {
        readonly bins?: readonly string[];
        readonly scripts?: readonly string[];
    };
}
export interface JSNodeWorkspaceSubstrate {
    readonly root: string;
    readonly packages: readonly JSNodePackageSubstrate[];
}
export interface DirectorySubstrateOptions {
    readonly dataRoot?: string;
    readonly contentRoot?: string;
    readonly contentLimit?: number;
    readonly readAt?: string;
    readonly workspace?: JSNodeWorkspaceSubstrate;
    readonly readWorkspace?: (root: string) => JSNodeWorkspaceSubstrate;
}
export declare function readDirectorySubstrate(root: string, options?: DirectorySubstrateOptions): DirectorySubstrate;
export declare function assembleDirectorySubstrate(reading: DirectorySubstrate, options?: OrganizationOptions): Organization;
export declare function directorySubstrateResource(reading: DirectorySubstrate): FromSchema<typeof DirectorySubstrateSchema>;
//# sourceMappingURL=index.d.mts.map