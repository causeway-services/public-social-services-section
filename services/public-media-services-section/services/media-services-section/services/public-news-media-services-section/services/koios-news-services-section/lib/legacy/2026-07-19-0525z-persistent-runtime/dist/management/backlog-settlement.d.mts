export declare const BACKLOG_SETTLEMENT_CONTRACT = "koios.news/editorial-backlog-settlement/v1";
export type BacklogDecision = Readonly<{
    assignmentId: string;
    slug?: string;
    decision: "refuse" | "activate" | "defer";
    reason: string;
    judgmentDigest?: string;
    failureLayer?: string;
    replayFrom?: string;
}>;
export declare function planBacklogSettlement(input?: Readonly<{
    dataDir?: string;
    contentDir?: string;
}>): readonly BacklogDecision[];
export declare function settleBacklog(input?: Readonly<{
    dataDir?: string;
    contentDir?: string;
    now?: string;
    apply?: boolean;
}>): Readonly<{
    kind: "koios.news.backlog-settlement";
    contract: typeof BACKLOG_SETTLEMENT_CONTRACT;
    applied: boolean;
    decisions: readonly BacklogDecision[];
    actionableAfter: readonly string[];
}>;
//# sourceMappingURL=backlog-settlement.d.mts.map