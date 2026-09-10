/**
 * writing/atproto — AT Protocol as a second across-federation wire for socializing.
 *
 * AT Protocol is not a second social ontology here. A per-actor signed repo is
 * read as an RWIL witness log scoped to one observer: each commit operation is a
 * witnessed cell, Lexicon is a typed carrier declaration, and the firehose is
 * socializing.broadcast projected as repository events.
 */
import { type FromSchema, type JsonRecord, type JsonValue } from "@emsenn/relating";
import { cell, type LogReading } from "@emsenn/relating/ledger";
import { type StateCrdt } from "../crdt/index.mjs";
type WitnessRow = ReturnType<typeof cell>;
declare const atRepoOperationSchema: {
    readonly type: "object";
    readonly required: readonly ["action", "path"];
    readonly properties: {
        readonly action: {
            readonly enum: readonly ["create", "update", "delete"];
        };
        readonly path: {
            readonly type: "string";
            readonly minLength: 3;
            readonly pattern: "^[A-Za-z0-9._~-]+\\/[A-Za-z0-9._~-]+$";
            readonly description: "AT repo path: <collection NSID>/<record-key>.";
        };
        readonly cid: {
            readonly type: "string";
            readonly minLength: 1;
            readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
        };
        readonly record: {
            readonly description: "Lexicon-shaped record value, retained as JSON.";
        };
    };
    readonly additionalProperties: false;
};
declare const atRepoRecordSchema: {
    readonly type: "object";
    readonly required: readonly ["path", "cid", "record"];
    readonly properties: {
        readonly path: {
            readonly type: "string";
            readonly minLength: 3;
            readonly pattern: "^[A-Za-z0-9._~-]+\\/[A-Za-z0-9._~-]+$";
            readonly description: "AT repo path: <collection NSID>/<record-key>.";
        };
        readonly cid: {
            readonly type: "string";
            readonly minLength: 1;
            readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
        };
        readonly record: {
            readonly description: "Current record JSON for this path.";
        };
    };
    readonly additionalProperties: false;
};
export declare const AtRepoCommitSchema: {
    readonly $id: "socializing/writing/atproto/repo-commit";
    readonly title: "AT Protocol repo commit as RWIL witness step";
    readonly description: "A signed per-actor AT Protocol repository commit read as one observer-scoped RWIL witness step. Operations are the witnessed cells; the signature is retained as witness metadata.";
    readonly type: "object";
    readonly required: readonly ["kind", "did", "version", "rev", "data", "prev", "sig", "ops"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.atproto.repo.commit";
        };
        readonly did: {
            readonly type: "string";
            readonly pattern: "^did:[a-z0-9]+:.+";
        };
        readonly version: {
            readonly const: 3;
        };
        readonly rev: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly data: {
            readonly type: "string";
            readonly minLength: 1;
            readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
        };
        readonly prev: {
            readonly description: "Previous commit CID, or null for the root commit.";
        };
        readonly sig: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ops: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["action", "path"];
                readonly properties: {
                    readonly action: {
                        readonly enum: readonly ["create", "update", "delete"];
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly pattern: "^[A-Za-z0-9._~-]+\\/[A-Za-z0-9._~-]+$";
                        readonly description: "AT repo path: <collection NSID>/<record-key>.";
                    };
                    readonly cid: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
                    };
                    readonly record: {
                        readonly description: "Lexicon-shaped record value, retained as JSON.";
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type AtRepoOperation = FromSchema<typeof atRepoOperationSchema>;
export type AtRepoCommit = Omit<FromSchema<typeof AtRepoCommitSchema>, "prev" | "ops"> & {
    readonly prev: string | null;
    readonly ops: readonly AtRepoOperation[];
};
export declare const atRepoCommitCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.atproto.repo.commit";
    readonly did: string;
    readonly version: 3;
    readonly rev: string;
    readonly data: string;
    readonly prev: unknown;
    readonly sig: string;
    readonly ops: readonly {
        readonly action: "create" | "update" | "delete";
        readonly path: string;
        readonly cid?: string;
        readonly record?: unknown;
    }[];
}>;
export declare const AtRepoSchema: {
    readonly $id: "socializing/writing/atproto/repo";
    readonly title: "AT Protocol repo as observer RWIL log";
    readonly description: "A normalized AT Protocol per-actor repository: current records plus the signed commit sequence whose operations project functorially to RWIL cells.";
    readonly type: "object";
    readonly required: readonly ["kind", "did", "head", "commits", "records"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.atproto.repo";
        };
        readonly did: {
            readonly type: "string";
            readonly pattern: "^did:[a-z0-9]+:.+";
        };
        readonly head: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly commits: {
            readonly type: "array";
            readonly items: {
                readonly $id: "socializing/writing/atproto/repo-commit";
                readonly title: "AT Protocol repo commit as RWIL witness step";
                readonly description: "A signed per-actor AT Protocol repository commit read as one observer-scoped RWIL witness step. Operations are the witnessed cells; the signature is retained as witness metadata.";
                readonly type: "object";
                readonly required: readonly ["kind", "did", "version", "rev", "data", "prev", "sig", "ops"];
                readonly properties: {
                    readonly kind: {
                        readonly const: "socializing.atproto.repo.commit";
                    };
                    readonly did: {
                        readonly type: "string";
                        readonly pattern: "^did:[a-z0-9]+:.+";
                    };
                    readonly version: {
                        readonly const: 3;
                    };
                    readonly rev: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly data: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
                    };
                    readonly prev: {
                        readonly description: "Previous commit CID, or null for the root commit.";
                    };
                    readonly sig: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly ops: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "object";
                            readonly required: readonly ["action", "path"];
                            readonly properties: {
                                readonly action: {
                                    readonly enum: readonly ["create", "update", "delete"];
                                };
                                readonly path: {
                                    readonly type: "string";
                                    readonly minLength: 3;
                                    readonly pattern: "^[A-Za-z0-9._~-]+\\/[A-Za-z0-9._~-]+$";
                                    readonly description: "AT repo path: <collection NSID>/<record-key>.";
                                };
                                readonly cid: {
                                    readonly type: "string";
                                    readonly minLength: 1;
                                    readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
                                };
                                readonly record: {
                                    readonly description: "Lexicon-shaped record value, retained as JSON.";
                                };
                            };
                            readonly additionalProperties: false;
                        };
                    };
                };
                readonly additionalProperties: false;
            };
        };
        readonly records: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["path", "cid", "record"];
                readonly properties: {
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly pattern: "^[A-Za-z0-9._~-]+\\/[A-Za-z0-9._~-]+$";
                        readonly description: "AT repo path: <collection NSID>/<record-key>.";
                    };
                    readonly cid: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
                    };
                    readonly record: {
                        readonly description: "Current record JSON for this path.";
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type AtRepoRecord = Omit<FromSchema<typeof atRepoRecordSchema>, "record"> & {
    readonly record: JsonValue;
};
export type AtRepo = Omit<FromSchema<typeof AtRepoSchema>, "commits" | "records"> & {
    readonly commits: readonly AtRepoCommit[];
    readonly records: readonly AtRepoRecord[];
};
export declare const atRepoCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.atproto.repo";
    readonly did: string;
    readonly head: string;
    readonly commits: readonly {
        readonly kind: "socializing.atproto.repo.commit";
        readonly did: string;
        readonly version: 3;
        readonly rev: string;
        readonly data: string;
        readonly prev: unknown;
        readonly sig: string;
        readonly ops: readonly {
            readonly action: "create" | "update" | "delete";
            readonly path: string;
            readonly cid?: string;
            readonly record?: unknown;
        }[];
    }[];
    readonly records: readonly {
        readonly path: string;
        readonly cid: string;
        readonly record: unknown;
    }[];
}>;
export declare const AtLexiconSchema: {
    readonly $id: "socializing/writing/atproto/lexicon";
    readonly title: "AT Protocol Lexicon document";
    readonly description: "An AT Protocol Lexicon file admitted as a typed carrier declaration. The Lexicon schema is the protocol's carrier source; carrierFrom supplies the local validation surface.";
    readonly type: "object";
    readonly required: readonly ["lexicon", "id", "defs"];
    readonly properties: {
        readonly lexicon: {
            readonly const: 1;
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly description: {
            readonly type: "string";
        };
        readonly defs: {
            readonly type: "object";
        };
    };
    readonly additionalProperties: false;
};
export type AtLexicon = Omit<FromSchema<typeof AtLexiconSchema>, "defs"> & {
    readonly defs: JsonRecord;
};
export declare const atLexiconCarrier: import("@emsenn/relating").Carrier<{
    readonly id: string;
    readonly lexicon: 1;
    readonly defs: Record<string, unknown>;
    readonly description?: string;
}>;
export declare const AtFirehoseCommitSchema: {
    readonly $id: "socializing/writing/atproto/firehose-commit";
    readonly title: "AT Protocol firehose commit event";
    readonly description: "The broadcast face of an AT repo commit: a sequence-addressed repository event compatible with the com.atproto.sync.subscribeRepos commit reading.";
    readonly type: "object";
    readonly required: readonly ["kind", "seq", "repo", "commit", "rev", "time", "ops"];
    readonly properties: {
        readonly kind: {
            readonly const: "socializing.atproto.firehose.commit";
        };
        readonly seq: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly repo: {
            readonly type: "string";
            readonly pattern: "^did:[a-z0-9]+:.+";
        };
        readonly commit: {
            readonly type: "string";
            readonly minLength: 1;
            readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
        };
        readonly rev: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly time: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly ops: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["action", "path"];
                readonly properties: {
                    readonly action: {
                        readonly enum: readonly ["create", "update", "delete"];
                    };
                    readonly path: {
                        readonly type: "string";
                        readonly minLength: 3;
                        readonly pattern: "^[A-Za-z0-9._~-]+\\/[A-Za-z0-9._~-]+$";
                        readonly description: "AT repo path: <collection NSID>/<record-key>.";
                    };
                    readonly cid: {
                        readonly type: "string";
                        readonly minLength: 1;
                        readonly description: "CID text carried opaquely; content addressing belongs to the AT repo wire.";
                    };
                    readonly record: {
                        readonly description: "Lexicon-shaped record value, retained as JSON.";
                    };
                };
                readonly additionalProperties: false;
            };
        };
    };
    readonly additionalProperties: false;
};
export type AtFirehoseCommit = Omit<FromSchema<typeof AtFirehoseCommitSchema>, "ops"> & {
    readonly ops: readonly AtRepoOperation[];
};
export declare const atFirehoseCommitCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "socializing.atproto.firehose.commit";
    readonly rev: string;
    readonly ops: readonly {
        readonly action: "create" | "update" | "delete";
        readonly path: string;
        readonly cid?: string;
        readonly record?: unknown;
    }[];
    readonly seq: number;
    readonly repo: string;
    readonly commit: string;
    readonly time: string;
}>;
/** Build and admit one normalized AT repo commit. */
export declare function atRepoCommit(input: {
    readonly did: string;
    readonly rev: string;
    readonly data: string;
    readonly sig: string;
    readonly prev?: string | null;
    readonly ops: readonly AtRepoOperation[];
}): AtRepoCommit;
/** Build a normalized per-actor repo from commits, deriving the current record view. */
export declare function atRepo(did: string, commits: readonly AtRepoCommit[]): AtRepo;
/** Project a signed repo commit to RWIL rows: commits are witnesses. */
export declare function witnessLogFromAtRepoCommit(commit: AtRepoCommit): readonly WitnessRow[];
/** Project a per-actor repo to its observer-scoped RWIL witness log. */
export declare function witnessLogFromAtRepo(repo: AtRepo): readonly WitnessRow[];
/** Reconstruct the normalized AT repo view from the RWIL rows produced above. */
export declare function atRepoFromWitnessLog(rows: readonly WitnessRow[]): AtRepo;
export declare const atRepoLogReading: LogReading<AtRepo>;
/** Project one commit as socializing.broadcast over the AT firehose channel. */
export declare function firehoseCommitFromRepoCommit(commit: AtRepoCommit, seq: number, time: string): AtFirehoseCommit;
/** Broadcast a repo's commit sequence as firehose events. */
export declare function firehoseFromAtRepo(repo: AtRepo, opts?: {
    readonly startSeq?: number;
    readonly time?: string;
}): readonly AtFirehoseCommit[];
/** Lower an AT repo to the existing socializing.merge CRDT carrier. */
export declare function crdtStateFromAtRepo(repo: AtRepo): StateCrdt;
/** Merge AT repos by delegating exactly to socializing's CRDT <=_k join. */
export declare function mergeAtRepos(...repos: readonly AtRepo[]): StateCrdt;
/** Translate the main Lexicon record definition into the JSON-Schema carrier kernel. */
export declare function jsonSchemaFromLexiconRecord(lexicon: AtLexicon, defName?: string): JsonRecord & {
    readonly $id: string;
};
/** Build a relating carrier from an AT Lexicon record definition. */
export declare function carrierFromLexiconRecord(lexicon: AtLexicon, defName?: string): import("@emsenn/relating").Carrier<unknown>;
/** Stable equality witness for tests and callers comparing channel-code projections. */
export declare function sameAtprotoProjection(left: JsonValue, right: JsonValue): boolean;
export {};
//# sourceMappingURL=index.d.mts.map