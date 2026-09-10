import { type FromSchema, type JsonValue } from "@emsenn/relating";
import { type LobbyMatch, type MatchPool, type MatchmakingResult } from "@emsenn/gaming";
import { type OfficeEligibilityDecision } from "../authority.mjs";
import { type OfficeName, type WorkAgent, type WorkAssignment } from "../work.mjs";
import type { Camp } from "../writing/activitypub/index.mjs";
import { type CalmRaftFrontier, type RaftAppendResult, type RaftLeadership, type RaftLog } from "../writing/raft/index.mjs";
import { type CalmReading } from "../writing/calm/index.mjs";
import type { Situation } from "../situation/index.mjs";
export declare const TroupeSchema: {
    readonly $id: "organizing/casting/troupe";
    readonly title: "OrganizingTroupe";
    readonly description: "The cast selected from a standing camp for one situation, with the gaming matchmaking pool and formed match as witness.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "camp", "situation", "memberIds", "members", "pool", "match", "matchmaking", "matchmakingAction"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.casting.troupe";
        };
        readonly camp: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly situation: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly memberIds: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly members: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
            };
        };
        readonly pool: {
            readonly type: "object";
        };
        readonly match: {
            readonly type: "object";
        };
        readonly matchmaking: {
            readonly type: "object";
        };
        readonly matchmakingAction: {
            readonly description: "Caller-owned JSON carrier slot.";
        };
    };
};
export declare const WorkLocusClaimSchema: {
    readonly $id: "organizing/casting/work-locus-claim";
    readonly title: "OrganizingWorkLocusClaim";
    readonly description: "A jural claim over governed substrate: a WorkAssignment over a WorkItem whose subject is the claimed substrate region.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "situation", "region", "assignment", "eligibility"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.casting.work-locus-claim";
        };
        readonly situation: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly region: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
            readonly minItems: 1;
        };
        readonly assignment: {
            readonly type: "object";
        };
        readonly eligibility: {
            readonly type: "object";
        };
    };
};
export declare const WorkLocusGovernanceSchema: {
    readonly $id: "organizing/casting/work-locus-governance";
    readonly title: "OrganizingWorkLocusGovernance";
    readonly description: "CALM/Raft governance over work-locus claims: monotone claims lift coordination-free; non-monotone overlaps are leader ordered.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "monotone", "calm", "frontier", "assignmentsByIndex", "log"];
    readonly properties: {
        readonly kind: {
            readonly const: "organizing.casting.work-locus-governance";
        };
        readonly monotone: {
            readonly type: "boolean";
        };
        readonly calm: {
            readonly type: "object";
        };
        readonly frontier: {
            readonly type: "object";
        };
        readonly assignmentsByIndex: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["substrateIndex", "assignment"];
                readonly properties: {
                    readonly substrateIndex: {
                        readonly type: "string";
                        readonly minLength: 1;
                    };
                    readonly assignment: {
                        readonly type: "object";
                    };
                };
            };
        };
        readonly log: {
            readonly type: "object";
        };
        readonly append: {
            readonly type: "object";
        };
    };
};
export type Troupe = Omit<FromSchema<typeof TroupeSchema>, "members" | "pool" | "match" | "matchmaking" | "matchmakingAction"> & {
    readonly members: Camp["members"];
    readonly pool: MatchPool;
    readonly match: LobbyMatch;
    readonly matchmaking: MatchmakingResult;
    readonly matchmakingAction: JsonValue;
};
export type WorkLocusClaim = Omit<FromSchema<typeof WorkLocusClaimSchema>, "assignment" | "eligibility"> & {
    readonly assignment: WorkAssignment;
    readonly eligibility: OfficeEligibilityDecision;
};
export type WorkLocusGovernance = Omit<FromSchema<typeof WorkLocusGovernanceSchema>, "calm" | "frontier" | "assignmentsByIndex" | "log" | "append"> & {
    readonly calm: CalmReading;
    readonly frontier: CalmRaftFrontier;
    readonly assignmentsByIndex: readonly {
        readonly substrateIndex: string;
        readonly assignment: WorkAssignment;
    }[];
    readonly log: RaftLog;
    readonly append?: RaftAppendResult;
};
export declare const troupeCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.casting.troupe";
    readonly members: readonly Record<string, unknown>[];
    readonly match: Record<string, unknown>;
    readonly situation: string;
    readonly camp: string;
    readonly memberIds: readonly string[];
    readonly pool: Record<string, unknown>;
    readonly matchmaking: Record<string, unknown>;
    readonly matchmakingAction: unknown;
}>;
export declare const workLocusClaimCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.casting.work-locus-claim";
    readonly assignment: Record<string, unknown>;
    readonly situation: string;
    readonly region: readonly string[];
    readonly eligibility: Record<string, unknown>;
}>;
export declare const workLocusGovernanceCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: "organizing.casting.work-locus-governance";
    readonly monotone: boolean;
    readonly log: Record<string, unknown>;
    readonly frontier: Record<string, unknown>;
    readonly calm: Record<string, unknown>;
    readonly assignmentsByIndex: readonly {
        readonly assignment: Record<string, unknown>;
        readonly substrateIndex: string;
    }[];
    readonly append?: Record<string, unknown>;
}>;
export declare function cast(camp: Camp, scene: Situation): Troupe;
export interface TroupeStageInput {
    readonly troupe: Troupe;
    readonly memberId: string;
    readonly designs: Readonly<Record<string, unknown>>;
    readonly universe: readonly unknown[];
    readonly stage: (actor: unknown, troupe: readonly unknown[], universe: readonly unknown[]) => unknown;
}
export declare function stageTroupeMember(input: TroupeStageInput): unknown;
export interface WorkLocusClaimInput {
    readonly situation: Situation;
    readonly region?: readonly string[];
    readonly office: string | OfficeName;
    readonly assignee: string | WorkAgent;
    readonly capabilities?: readonly string[];
    readonly officeAuthorities?: readonly string[];
    readonly requiresCapabilities?: readonly string[];
    readonly requiresAuthorities?: readonly string[];
    readonly duties?: readonly string[];
    readonly title?: string;
}
export declare function claimWorkLocus(input: WorkLocusClaimInput): WorkLocusClaim;
export interface GovernWorkLocusClaimsOptions {
    readonly cluster?: string;
    readonly leadership?: RaftLeadership;
    readonly log?: RaftLog;
}
export declare function governWorkLocusClaims(claims: readonly WorkLocusClaim[], options?: GovernWorkLocusClaimsOptions): WorkLocusGovernance;
//# sourceMappingURL=index.d.mts.map