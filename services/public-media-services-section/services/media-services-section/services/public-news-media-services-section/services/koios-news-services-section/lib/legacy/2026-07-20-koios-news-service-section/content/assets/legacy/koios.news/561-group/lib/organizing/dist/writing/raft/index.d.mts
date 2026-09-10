/**
 * writing/raft - coordinated consensus exactly at the CALM frontier.
 *
 * Raft is not organizing's default merge. CALM keeps monotone operations
 * coordination-free; Raft appears only where the CALM reading reports a
 * non-monotone obstruction. The log below is a functorial RWIL view: each
 * leader-elected entry maps to append-only EAVT witnesses whose functional
 * projection has one command per log index.
 */
import { type FromSchema, type JsonValue } from "@emsenn/relating";
import type { EAVTRecord } from "@emsenn/relating/writing";
import type { CalmReading } from "../calm/index.mjs";
export declare const raftLeadershipSchema: {
    readonly $id: "organizing/writing/raft/leadership";
    readonly title: "RaftLeadership";
    readonly description: "The elected Raft authority for one term. This is the T that orders non-monotone writes: one leader imposes a total order on log indexes for the term.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "cluster", "term", "leader"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.writing.raft.leadership";
        };
        readonly cluster: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly term: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly leader: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type RaftLeadership = FromSchema<typeof raftLeadershipSchema>;
export declare const raftLeadershipCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.writing.raft.leadership";
    readonly term: number;
    readonly cluster: string;
    readonly leader: string;
}>;
export declare const raftLogEntrySchema: {
    readonly $id: "organizing/writing/raft/log-entry";
    readonly title: "RaftLogEntry";
    readonly description: "One totally ordered RWIL log entry. The index is the log address, term+leader are the elected order witness, and command is the single value admitted at that index.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "cluster", "index", "term", "leader", "command", "witness"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.writing.raft.log-entry";
        };
        readonly cluster: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly index: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly term: {
            readonly type: "integer";
            readonly minimum: 1;
        };
        readonly leader: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly command: {
            readonly description: "caller-owned JSON command/value carried by the coordinated log";
        };
        readonly witness: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type RaftLogEntry = Omit<FromSchema<typeof raftLogEntrySchema>, "command"> & {
    readonly command: JsonValue;
};
export declare const raftLogEntryCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.writing.raft.log-entry";
    readonly term: number;
    readonly witness: string;
    readonly cluster: string;
    readonly leader: string;
    readonly index: number;
    readonly command: unknown;
}>;
export declare const raftLogSchema: {
    readonly $id: "organizing/writing/raft/log";
    readonly title: "RaftLog";
    readonly description: "A Raft log as a sorted sequence of elected RWIL entries. Safety requires that each index carry exactly one command.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "cluster", "entries"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.writing.raft.log";
        };
        readonly cluster: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly entries: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "organizing/writing/raft/log-entry";
            };
        };
    };
};
export type RaftLog = Omit<FromSchema<typeof raftLogSchema>, "entries"> & {
    readonly entries: readonly RaftLogEntry[];
};
export declare const raftLogCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.writing.raft.log";
    readonly entries: readonly unknown[];
    readonly cluster: string;
}>;
export declare const raftAppendResultSchema: {
    readonly $id: "organizing/writing/raft/append-result";
    readonly title: "RaftAppendResult";
    readonly description: "The result of admitting concurrent proposals through a single elected leader term. Accepted entries preserve one-value-per-index; rejected entries are the coordinated dual of a CRDT retaining both writes.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "log", "accepted", "rejected"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.writing.raft.append-result";
        };
        readonly log: {
            readonly $ref: "organizing/writing/raft/log";
        };
        readonly accepted: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "organizing/writing/raft/log-entry";
            };
        };
        readonly rejected: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["entry", "reason"];
                readonly properties: {
                    readonly entry: {
                        readonly $ref: "organizing/writing/raft/log-entry";
                    };
                    readonly reason: {
                        readonly enum: readonly ["not-current-leader", "index-already-set", "leader-conflict"];
                    };
                };
            };
        };
    };
};
export type RaftAppendResult = Omit<FromSchema<typeof raftAppendResultSchema>, "log" | "accepted" | "rejected"> & {
    readonly log: RaftLog;
    readonly accepted: readonly RaftLogEntry[];
    readonly rejected: readonly {
        readonly entry: RaftLogEntry;
        readonly reason: "not-current-leader" | "index-already-set" | "leader-conflict";
    }[];
};
export declare const raftAppendResultCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.writing.raft.append-result";
    readonly log: unknown;
    readonly accepted: readonly unknown[];
    readonly rejected: readonly {
        readonly reason: "not-current-leader" | "index-already-set" | "leader-conflict";
        readonly entry: unknown;
    }[];
}>;
export declare const calmRaftFrontierSchema: {
    readonly $id: "organizing/writing/raft/calm-frontier";
    readonly title: "CalmRaftFrontier";
    readonly description: "The mechanized CALM/Raft boundary: monotone operations lift coordination-free with no Raft round; non-monotone operations require the leader's total order.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "theorem", "operation", "monotone", "raftRound", "reason", "witness"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.writing.raft.calm-frontier";
        };
        readonly theorem: {
            readonly const: "CALM/Raft";
        };
        readonly operation: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly monotone: {
            readonly type: "boolean";
        };
        readonly raftRound: {
            readonly enum: readonly ["not-required", "required"];
        };
        readonly reason: {
            readonly enum: readonly ["CALM monotone lift", "non-monotone CALM obstruction"];
        };
        readonly witness: {
            readonly type: "object";
            readonly additionalProperties: false;
            readonly required: readonly ["shared", "contested", "federationOnly"];
            readonly properties: {
                readonly shared: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly contested: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
                readonly federationOnly: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
};
export type CalmRaftFrontier = FromSchema<typeof calmRaftFrontierSchema>;
export declare const calmRaftFrontierCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.writing.raft.calm-frontier";
    readonly reason: "CALM monotone lift" | "non-monotone CALM obstruction";
    readonly monotone: boolean;
    readonly witness: {
        readonly contested: number;
        readonly federationOnly: number;
        readonly shared: number;
    };
    readonly theorem: "CALM/Raft";
    readonly operation: string;
    readonly raftRound: "required" | "not-required";
}>;
export interface RaftProposal {
    readonly cluster: string;
    readonly index: number;
    readonly term: number;
    readonly leader: string;
    readonly command: JsonValue;
    readonly witness: string;
}
export interface CoordinateWithRaftOptions {
    readonly log?: RaftLog;
    readonly leadership?: RaftLeadership;
    readonly proposals?: readonly RaftProposal[];
    readonly operation?: string;
}
export declare function emptyRaftLog(cluster: string): RaftLog;
export declare function raftEntry(proposal: RaftProposal): RaftLogEntry;
export declare function raftEntryRows(entry: RaftLogEntry): readonly EAVTRecord[];
export declare function raftLogRows(log: RaftLog): readonly EAVTRecord[];
export declare function projectRaftState(log: RaftLog): import("@emsenn/relating/ledger").StateView;
export declare function oneValuePerIndex(log: RaftLog): boolean;
export declare function appendRaftProposals(log: RaftLog, leadership: RaftLeadership, proposals: readonly RaftProposal[]): RaftAppendResult;
export declare function readCalmRaftFrontier(reading: CalmReading, operation?: string): CalmRaftFrontier;
export declare function coordinateByCalmOrRaft(reading: CalmReading, options?: CoordinateWithRaftOptions): {
    readonly frontier: CalmRaftFrontier;
    readonly log: RaftLog;
    readonly append?: RaftAppendResult;
};
//# sourceMappingURL=index.d.mts.map