import { type EditorialTool } from "./editorial-assessment-contract.mjs";
type JsonRecord = Record<string, unknown>;
export type EditorialDisposition = "accept" | "revise" | "refuse";
export declare class InferenceRouteRefusal extends Error {
    readonly failedTiers: readonly string[];
    readonly refusalDigest: string;
    constructor(message: string, failedTiers: readonly string[], refusalDigest: string);
}
export type EditorialJudgment = Readonly<{
    kind: "koios.editorial-judgment";
    slug: string;
    manuscriptDigest: string;
    editorialContextDigest: string;
    disposition: EditorialDisposition;
    publishable: boolean;
    summary: string;
    findings: readonly Readonly<{
        severity: "error" | "warning";
        code: string;
        evidence: string;
        instruction: string;
    }>[];
    claimAudit: readonly Readonly<{
        claim: string;
        support: "supported" | "unsupported" | "overstated";
        evidence: string;
    }>[];
    requiredRepairs: readonly string[];
    pipelineDiagnosis: Readonly<{
        failureLayer: "sources" | "assignment" | "instructions" | "deterministic-gates" | "writer-model" | "draft-repair" | "none";
        evidence: string;
        improvement: string;
        replayFrom: string;
    }>;
    provider: string;
    model: string;
    contract: string;
    serviceAccepted: boolean;
    report: string;
    providerResult: unknown;
    selectedTool?: EditorialTool;
    toolSelectionValidated?: boolean;
    toolSelectionDigest?: string;
    recordedAt: string;
}>;
export declare function procureLissProse(input: Readonly<{
    purpose: string;
    prompt: string;
    model?: string;
    tiers?: readonly ("free-groq" | "free-nim" | "leader-claude")[];
    models?: Readonly<Partial<Record<"free-groq" | "free-nim" | "leader-claude", string>>>;
    lissRoot?: string;
    now?: string;
    requiredText?: readonly string[];
    maxTokens?: number;
}>): Readonly<{
    text: string;
    providerResult: JsonRecord;
    model: string;
    recordedAt: string;
    selectedTier: string;
    selectedProvider: string;
}>;
export declare function editorialContextDigestForManuscript(input: Readonly<{
    slug: string;
    contentDir?: string;
    dataDir?: string;
    storeDir?: string;
}>): string;
export declare function judgeManuscriptUnderContract(input: Readonly<{
    slug: string;
    contentDir?: string;
    dataDir?: string;
    storeDir?: string;
    lissRoot?: string;
    now?: string;
    model?: string;
}>): EditorialJudgment;
export declare function recoverEditorialDiagnostic(input: Readonly<{
    slug: string;
    exchangePath: string;
    contentDir?: string;
    now?: string;
    model?: string;
}>): EditorialJudgment;
export declare function reprojectLatestEditorialJudgment(input: Readonly<{
    slug: string;
    contentDir?: string;
    now?: string;
}>): EditorialJudgment;
export {};
//# sourceMappingURL=liss-editorial.d.mts.map