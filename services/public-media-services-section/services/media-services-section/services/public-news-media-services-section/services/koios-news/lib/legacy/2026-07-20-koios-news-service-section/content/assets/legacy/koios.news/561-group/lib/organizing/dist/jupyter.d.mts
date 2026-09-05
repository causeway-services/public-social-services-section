/**
 * jupyter - organizing-owned standards boundary for notebook/runtime projection.
 *
 * Relating owns generic HTTP, OpenAPI, MCP, and codec law. This module owns the
 * Jupyter-shaped carriers that only make sense as organizing runtime projections:
 * notebooks as work records, kernels as offices of execution, sessions as active
 * work, and contents as organized workspace resources.
 */
import { type FromSchema } from "@emsenn/relating";
export type JupyterJson = null | boolean | number | string | readonly JupyterJson[] | {
    readonly [key: string]: JupyterJson;
};
export type JupyterJsonRecord = Readonly<Record<string, JupyterJson>>;
export declare const JupyterJsonSchema: {};
export declare const JupyterJsonRecordSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
};
export declare const JupyterSourceSchema: {
    readonly anyOf: readonly [{
        readonly type: "string";
    }, {
        readonly type: "array";
        readonly items: {
            readonly type: "string";
        };
    }];
};
export declare const JupyterStreamOutputSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["output_type", "name", "text"];
    readonly properties: {
        readonly output_type: {
            readonly const: "stream";
        };
        readonly name: {
            readonly enum: readonly ["stdout", "stderr"];
        };
        readonly text: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            }];
        };
    };
};
export declare const JupyterDisplayOutputSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["output_type", "data", "metadata"];
    readonly properties: {
        readonly output_type: {
            readonly enum: readonly ["display_data", "execute_result"];
        };
        readonly data: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly execution_count: {
            readonly type: readonly ["number", "null"];
        };
    };
};
export declare const JupyterErrorOutputSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["output_type", "ename", "evalue", "traceback"];
    readonly properties: {
        readonly output_type: {
            readonly const: "error";
        };
        readonly ename: {
            readonly type: "string";
        };
        readonly evalue: {
            readonly type: "string";
        };
        readonly traceback: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const JupyterOutputSchema: {
    readonly anyOf: readonly [{
        readonly type: "object";
        readonly additionalProperties: true;
        readonly required: readonly ["output_type", "name", "text"];
        readonly properties: {
            readonly output_type: {
                readonly const: "stream";
            };
            readonly name: {
                readonly enum: readonly ["stdout", "stderr"];
            };
            readonly text: {
                readonly anyOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                }];
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: true;
        readonly required: readonly ["output_type", "data", "metadata"];
        readonly properties: {
            readonly output_type: {
                readonly enum: readonly ["display_data", "execute_result"];
            };
            readonly data: {
                readonly type: "object";
                readonly additionalProperties: true;
            };
            readonly metadata: {
                readonly type: "object";
                readonly additionalProperties: true;
            };
            readonly execution_count: {
                readonly type: readonly ["number", "null"];
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: true;
        readonly required: readonly ["output_type", "ename", "evalue", "traceback"];
        readonly properties: {
            readonly output_type: {
                readonly const: "error";
            };
            readonly ename: {
                readonly type: "string";
            };
            readonly evalue: {
                readonly type: "string";
            };
            readonly traceback: {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            };
        };
    }];
};
export declare const JupyterMarkdownCellSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["cell_type", "metadata", "source"];
    readonly properties: {
        readonly cell_type: {
            readonly enum: readonly ["markdown", "raw"];
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly source: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            }];
        };
    };
};
export declare const JupyterCodeCellSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["cell_type", "metadata", "source", "execution_count", "outputs"];
    readonly properties: {
        readonly cell_type: {
            readonly const: "code";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly source: {
            readonly anyOf: readonly [{
                readonly type: "string";
            }, {
                readonly type: "array";
                readonly items: {
                    readonly type: "string";
                };
            }];
        };
        readonly execution_count: {
            readonly type: readonly ["number", "null"];
        };
        readonly outputs: {
            readonly type: "array";
            readonly items: {
                readonly anyOf: readonly [{
                    readonly type: "object";
                    readonly additionalProperties: true;
                    readonly required: readonly ["output_type", "name", "text"];
                    readonly properties: {
                        readonly output_type: {
                            readonly const: "stream";
                        };
                        readonly name: {
                            readonly enum: readonly ["stdout", "stderr"];
                        };
                        readonly text: {
                            readonly anyOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                    };
                }, {
                    readonly type: "object";
                    readonly additionalProperties: true;
                    readonly required: readonly ["output_type", "data", "metadata"];
                    readonly properties: {
                        readonly output_type: {
                            readonly enum: readonly ["display_data", "execute_result"];
                        };
                        readonly data: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly metadata: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly execution_count: {
                            readonly type: readonly ["number", "null"];
                        };
                    };
                }, {
                    readonly type: "object";
                    readonly additionalProperties: true;
                    readonly required: readonly ["output_type", "ename", "evalue", "traceback"];
                    readonly properties: {
                        readonly output_type: {
                            readonly const: "error";
                        };
                        readonly ename: {
                            readonly type: "string";
                        };
                        readonly evalue: {
                            readonly type: "string";
                        };
                        readonly traceback: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                    };
                }];
            };
        };
    };
};
export declare const JupyterCellSchema: {
    readonly anyOf: readonly [{
        readonly type: "object";
        readonly additionalProperties: true;
        readonly required: readonly ["cell_type", "metadata", "source"];
        readonly properties: {
            readonly cell_type: {
                readonly enum: readonly ["markdown", "raw"];
            };
            readonly id: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly metadata: {
                readonly type: "object";
                readonly additionalProperties: true;
            };
            readonly source: {
                readonly anyOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                }];
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: true;
        readonly required: readonly ["cell_type", "metadata", "source", "execution_count", "outputs"];
        readonly properties: {
            readonly cell_type: {
                readonly const: "code";
            };
            readonly id: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly metadata: {
                readonly type: "object";
                readonly additionalProperties: true;
            };
            readonly source: {
                readonly anyOf: readonly [{
                    readonly type: "string";
                }, {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                }];
            };
            readonly execution_count: {
                readonly type: readonly ["number", "null"];
            };
            readonly outputs: {
                readonly type: "array";
                readonly items: {
                    readonly anyOf: readonly [{
                        readonly type: "object";
                        readonly additionalProperties: true;
                        readonly required: readonly ["output_type", "name", "text"];
                        readonly properties: {
                            readonly output_type: {
                                readonly const: "stream";
                            };
                            readonly name: {
                                readonly enum: readonly ["stdout", "stderr"];
                            };
                            readonly text: {
                                readonly anyOf: readonly [{
                                    readonly type: "string";
                                }, {
                                    readonly type: "array";
                                    readonly items: {
                                        readonly type: "string";
                                    };
                                }];
                            };
                        };
                    }, {
                        readonly type: "object";
                        readonly additionalProperties: true;
                        readonly required: readonly ["output_type", "data", "metadata"];
                        readonly properties: {
                            readonly output_type: {
                                readonly enum: readonly ["display_data", "execute_result"];
                            };
                            readonly data: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly metadata: {
                                readonly type: "object";
                                readonly additionalProperties: true;
                            };
                            readonly execution_count: {
                                readonly type: readonly ["number", "null"];
                            };
                        };
                    }, {
                        readonly type: "object";
                        readonly additionalProperties: true;
                        readonly required: readonly ["output_type", "ename", "evalue", "traceback"];
                        readonly properties: {
                            readonly output_type: {
                                readonly const: "error";
                            };
                            readonly ename: {
                                readonly type: "string";
                            };
                            readonly evalue: {
                                readonly type: "string";
                            };
                            readonly traceback: {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            };
                        };
                    }];
                };
            };
        };
    }];
};
export declare const JupyterNotebookSchema: {
    readonly $id: "organizing/jupyter/notebook";
    readonly title: "Jupyter notebook";
    readonly description: "An organizing-owned nbformat 4 notebook projection.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["nbformat", "nbformat_minor", "metadata", "cells"];
    readonly properties: {
        readonly nbformat: {
            readonly const: 4;
        };
        readonly nbformat_minor: {
            readonly type: "number";
            readonly minimum: 0;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly cells: {
            readonly type: "array";
            readonly items: {
                readonly anyOf: readonly [{
                    readonly type: "object";
                    readonly additionalProperties: true;
                    readonly required: readonly ["cell_type", "metadata", "source"];
                    readonly properties: {
                        readonly cell_type: {
                            readonly enum: readonly ["markdown", "raw"];
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                        readonly metadata: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly source: {
                            readonly anyOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                    };
                }, {
                    readonly type: "object";
                    readonly additionalProperties: true;
                    readonly required: readonly ["cell_type", "metadata", "source", "execution_count", "outputs"];
                    readonly properties: {
                        readonly cell_type: {
                            readonly const: "code";
                        };
                        readonly id: {
                            readonly type: "string";
                            readonly minLength: 1;
                        };
                        readonly metadata: {
                            readonly type: "object";
                            readonly additionalProperties: true;
                        };
                        readonly source: {
                            readonly anyOf: readonly [{
                                readonly type: "string";
                            }, {
                                readonly type: "array";
                                readonly items: {
                                    readonly type: "string";
                                };
                            }];
                        };
                        readonly execution_count: {
                            readonly type: readonly ["number", "null"];
                        };
                        readonly outputs: {
                            readonly type: "array";
                            readonly items: {
                                readonly anyOf: readonly [{
                                    readonly type: "object";
                                    readonly additionalProperties: true;
                                    readonly required: readonly ["output_type", "name", "text"];
                                    readonly properties: {
                                        readonly output_type: {
                                            readonly const: "stream";
                                        };
                                        readonly name: {
                                            readonly enum: readonly ["stdout", "stderr"];
                                        };
                                        readonly text: {
                                            readonly anyOf: readonly [{
                                                readonly type: "string";
                                            }, {
                                                readonly type: "array";
                                                readonly items: {
                                                    readonly type: "string";
                                                };
                                            }];
                                        };
                                    };
                                }, {
                                    readonly type: "object";
                                    readonly additionalProperties: true;
                                    readonly required: readonly ["output_type", "data", "metadata"];
                                    readonly properties: {
                                        readonly output_type: {
                                            readonly enum: readonly ["display_data", "execute_result"];
                                        };
                                        readonly data: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly metadata: {
                                            readonly type: "object";
                                            readonly additionalProperties: true;
                                        };
                                        readonly execution_count: {
                                            readonly type: readonly ["number", "null"];
                                        };
                                    };
                                }, {
                                    readonly type: "object";
                                    readonly additionalProperties: true;
                                    readonly required: readonly ["output_type", "ename", "evalue", "traceback"];
                                    readonly properties: {
                                        readonly output_type: {
                                            readonly const: "error";
                                        };
                                        readonly ename: {
                                            readonly type: "string";
                                        };
                                        readonly evalue: {
                                            readonly type: "string";
                                        };
                                        readonly traceback: {
                                            readonly type: "array";
                                            readonly items: {
                                                readonly type: "string";
                                            };
                                        };
                                    };
                                }];
                            };
                        };
                    };
                }];
            };
        };
    };
};
export declare const JupyterKernelSpecSchema: {
    readonly $id: "organizing/jupyter/kernelspec";
    readonly title: "Jupyter kernelspec";
    readonly description: "A Jupyter kernelspec projected from an organizing execution office.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["argv", "display_name", "language"];
    readonly properties: {
        readonly argv: {
            readonly type: "array";
            readonly minItems: 1;
            readonly items: {
                readonly type: "string";
            };
        };
        readonly display_name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly language: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly env: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly metadata: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
export declare const JupyterKernelModelSchema: {
    readonly $id: "organizing/jupyter/kernel";
    readonly title: "Jupyter kernel model";
    readonly description: "A Jupyter Server kernel model projected from organizing runtime state.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["id", "name"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly last_activity: {
            readonly type: "string";
        };
        readonly execution_state: {
            readonly enum: readonly ["starting", "idle", "busy", "restarting", "dead", "unknown"];
        };
        readonly connections: {
            readonly type: "number";
            readonly minimum: 0;
        };
    };
};
export declare const JupyterSessionModelSchema: {
    readonly $id: "organizing/jupyter/session";
    readonly title: "Jupyter session model";
    readonly description: "A Jupyter Server session model projected from organizing active work.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["id", "path", "name", "type", "kernel"];
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly path: {
            readonly type: "string";
        };
        readonly name: {
            readonly type: "string";
        };
        readonly type: {
            readonly enum: readonly ["notebook", "console", "file", "terminal"];
        };
        readonly kernel: {
            readonly $id: "organizing/jupyter/kernel";
            readonly title: "Jupyter kernel model";
            readonly description: "A Jupyter Server kernel model projected from organizing runtime state.";
            readonly type: "object";
            readonly additionalProperties: true;
            readonly required: readonly ["id", "name"];
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly name: {
                    readonly type: "string";
                    readonly minLength: 1;
                };
                readonly last_activity: {
                    readonly type: "string";
                };
                readonly execution_state: {
                    readonly enum: readonly ["starting", "idle", "busy", "restarting", "dead", "unknown"];
                };
                readonly connections: {
                    readonly type: "number";
                    readonly minimum: 0;
                };
            };
        };
    };
};
export declare const JupyterContentsModelSchema: {
    readonly $id: "organizing/jupyter/contents";
    readonly title: "Jupyter contents model";
    readonly description: "A Jupyter Server contents model projected over an organized workspace.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["name", "path", "type", "writable", "created", "last_modified", "mimetype", "content", "format"];
    readonly properties: {
        readonly name: {
            readonly type: "string";
        };
        readonly path: {
            readonly type: "string";
        };
        readonly type: {
            readonly enum: readonly ["file", "directory", "notebook"];
        };
        readonly writable: {
            readonly type: "boolean";
        };
        readonly created: {
            readonly type: "string";
        };
        readonly last_modified: {
            readonly type: "string";
        };
        readonly mimetype: {
            readonly type: readonly ["string", "null"];
        };
        readonly content: {};
        readonly format: {
            readonly enum: readonly ["json", "text", "base64", null];
        };
    };
};
export declare const jupyterNotebookCarrier: import("@emsenn/relating").Carrier<{
    readonly cells: readonly ({
        readonly source: string | readonly string[];
        readonly metadata: Record<string, unknown>;
        readonly cell_type: "raw" | "markdown";
        readonly id?: string;
    } | {
        readonly source: string | readonly string[];
        readonly metadata: Record<string, unknown>;
        readonly cell_type: "code";
        readonly execution_count: number | null;
        readonly outputs: readonly ({
            readonly name: "stdout" | "stderr";
            readonly output_type: "stream";
            readonly text: string | readonly string[];
        } | {
            readonly data: Record<string, unknown>;
            readonly output_type: "display_data" | "execute_result";
            readonly metadata: Record<string, unknown>;
            readonly execution_count?: number | null;
        } | {
            readonly output_type: "error";
            readonly ename: string;
            readonly evalue: string;
            readonly traceback: readonly string[];
        })[];
        readonly id?: string;
    })[];
    readonly metadata: Record<string, unknown>;
    readonly nbformat: 4;
    readonly nbformat_minor: number;
}>;
export declare const jupyterKernelSpecCarrier: import("@emsenn/relating").Carrier<{
    readonly argv: readonly string[];
    readonly display_name: string;
    readonly language: string;
    readonly metadata?: Record<string, unknown>;
    readonly env?: Record<string, unknown>;
}>;
export declare const jupyterKernelModelCarrier: import("@emsenn/relating").Carrier<{
    readonly id: string;
    readonly name: string;
    readonly last_activity?: string;
    readonly execution_state?: "unknown" | "starting" | "idle" | "busy" | "restarting" | "dead";
    readonly connections?: number;
}>;
export declare const jupyterSessionModelCarrier: import("@emsenn/relating").Carrier<{
    readonly path: string;
    readonly id: string;
    readonly name: string;
    readonly type: "file" | "notebook" | "console" | "terminal";
    readonly kernel: {
        readonly id: string;
        readonly name: string;
        readonly last_activity?: string;
        readonly execution_state?: "unknown" | "starting" | "idle" | "busy" | "restarting" | "dead";
        readonly connections?: number;
    };
}>;
export declare const jupyterContentsModelCarrier: import("@emsenn/relating").Carrier<{
    readonly path: string;
    readonly name: string;
    readonly format: "json" | "text" | "base64" | null;
    readonly type: "file" | "notebook" | "directory";
    readonly content: unknown;
    readonly writable: boolean;
    readonly created: string;
    readonly last_modified: string;
    readonly mimetype: string | null;
}>;
export type JupyterCellType = "code" | "markdown" | "raw";
export type JupyterOutput = FromSchema<typeof JupyterOutputSchema>;
export type JupyterCell = FromSchema<typeof JupyterCellSchema>;
export type JupyterNotebook = FromSchema<typeof JupyterNotebookSchema>;
export type JupyterKernelSpec = FromSchema<typeof JupyterKernelSpecSchema>;
export type JupyterKernelModel = FromSchema<typeof JupyterKernelModelSchema>;
export type JupyterSessionModel = FromSchema<typeof JupyterSessionModelSchema>;
export type JupyterContentsModel = FromSchema<typeof JupyterContentsModelSchema>;
export interface OrganizingNotebookCell {
    readonly kind: JupyterCellType;
    readonly source: string | readonly string[];
    readonly metadata?: JupyterJsonRecord;
    readonly executionCount?: number | null;
    readonly outputs?: readonly JupyterOutput[];
}
export interface OrganizingNotebookInput {
    readonly id: string;
    readonly title: string;
    readonly summary?: string;
    readonly cells?: readonly OrganizingNotebookCell[];
    readonly metadata?: JupyterJsonRecord;
}
export interface OrganizingJupyterCodec<T> {
    readonly name: string;
    readonly mediaType: string;
    readonly decode: (text: string) => T;
    readonly encode: (value: T) => string;
}
export declare const ORGANIZING_JUPYTER_METADATA_KEY = "organizing";
export declare const organizingIpynbCodec: OrganizingJupyterCodec<JupyterNotebook>;
export declare function organizingNotebook(input: OrganizingNotebookInput): JupyterNotebook;
export declare function encodeIpynb(notebook: JupyterNotebook): string;
export declare function decodeIpynb(text: string): JupyterNotebook;
export declare function organizingKernelSpec(input: Readonly<{
    argv: readonly string[];
    displayName: string;
    language: string;
    env?: JupyterJsonRecord;
    metadata?: JupyterJsonRecord;
}>): JupyterKernelSpec;
export declare function organizingKernelModel(input: Readonly<{
    id: string;
    name: string;
    lastActivity?: string;
    executionState?: JupyterKernelModel["execution_state"];
    connections?: number;
}>): JupyterKernelModel;
export declare function organizingSessionModel(input: Readonly<{
    id: string;
    path: string;
    name: string;
    type?: JupyterSessionModel["type"];
    kernel: JupyterKernelModel;
}>): JupyterSessionModel;
export declare function organizingContentsModel(input: Readonly<{
    name: string;
    path: string;
    type: JupyterContentsModel["type"];
    writable?: boolean;
    created: string;
    lastModified: string;
    mimetype?: string | null;
    content?: JupyterJson | string | null;
    format?: JupyterContentsModel["format"];
}>): JupyterContentsModel;
//# sourceMappingURL=jupyter.d.mts.map