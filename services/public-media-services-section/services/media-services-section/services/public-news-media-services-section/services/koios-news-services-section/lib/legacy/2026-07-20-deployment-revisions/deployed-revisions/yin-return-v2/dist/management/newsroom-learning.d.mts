export declare const NEWSROOM_LEARNING_CONTRACT = "koios-news/newsroom-learning-pulse/v1";
export type LearningMove = "observe-more" | "resume-assignment" | "replay-assignment" | "replay-source-intelligence" | "replay-writer" | "repair-draft" | "review-deterministic-gate" | "review-editorial-assessment" | "review-provider-route" | "maintain-policy";
export type LearningReading = Readonly<{
    assignmentId: string;
    slug: string | null;
    outcome: "published" | "refused" | "obstructed" | "open";
    failureLayer: string;
    proposedMove: LearningMove;
    rationale: string;
    evidence: Readonly<{
        circuitEventDigests: readonly string[];
        editorialJudgmentDigests: readonly string[];
        providerReceiptCount: number;
        attentionObserved: boolean;
        revenueObserved: boolean;
    }>;
    safeguards: readonly string[];
}>;
export type LearningPulse = Readonly<{
    kind: "koios.newsroom-learning-pulse";
    contract: typeof NEWSROOM_LEARNING_CONTRACT;
    pulseId: string;
    recordedAt: string;
    evidenceDigest: string;
    disposition: "proposal" | "no-new-evidence";
    readings: readonly LearningReading[];
    authority: "proposal-only";
}>;
export type SettledLearningPulse = LearningPulse & Readonly<{
    settlement: "recorded" | "unchanged";
}>;
export declare function inspectNewsroomLearning(input: Readonly<{
    dataDir?: string;
    pulseId: string;
    now: string;
}>): LearningPulse;
export declare function settleNewsroomLearningPulse(input: Readonly<{
    dataDir?: string;
    pulseId: string;
    now: string;
}>): SettledLearningPulse;
//# sourceMappingURL=newsroom-learning.d.mts.map