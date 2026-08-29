#!/usr/bin/env node
export type DraftRepairResult = Readonly<{
    kind: "koios.draft-repair";
    at: string;
    slug: string;
    assignmentId: string;
    editorJudgmentDigest: string;
    before: Readonly<{
        path: string;
        digest: string;
    }>;
    after: Readonly<{
        path: string;
        digest: string;
        standards: unknown;
    }>;
    replacement: Readonly<{
        beforeBodyDigest: string;
        afterBodyDigest: string;
        beforeCharacters: number;
        afterCharacters: number;
    }>;
    inference: Readonly<Record<string, unknown>>;
    composition: Readonly<{
        promptDigest: string;
        promptCharacters: number;
    }>;
}>;
export declare function repairDraft(input: Readonly<{
    slug: string;
    provider?: "property" | "liss";
    now?: string;
}>): Promise<DraftRepairResult>;
//# sourceMappingURL=draft-repair.d.mts.map