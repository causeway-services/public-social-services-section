import { type JsonObject } from "../../../management/ledger.mjs";
export declare const EDITORIAL_ASSESSMENT_CONTRACT = "independent-editorial-assessment/editorial-assessment/v1";
type JsonRecord = Record<string, unknown>;
export type EditorialTool = "submit_editorial_acceptance" | "submit_revision_request" | "submit_editorial_refusal";
export type EditorialFailureLayer = "sources" | "assignment" | "instructions" | "deterministic-gates" | "writer-model" | "draft-repair" | "none";
export type EditorialToolSelection = Readonly<{
    tool: EditorialTool;
    failureLayer: EditorialFailureLayer;
    replayFrom: string;
    summary: string;
    requiredRepairs: readonly string[];
    report: string;
}>;
export declare class EditorialAssessmentRefusal extends Error {
    readonly code: string;
    readonly providerResult?: Readonly<JsonRecord>;
    constructor(code: string, message: string, providerResult?: Readonly<JsonRecord>);
}
export declare function procureEditorialAssessment(input: Readonly<{
    slug: string;
    manuscript: string;
    manuscriptDigest: string;
    standards: Readonly<JsonObject>;
    run?: Readonly<JsonObject>;
    evidence: readonly Readonly<JsonObject>[];
    pipeline: readonly Readonly<JsonObject>[];
    editorialContextDigest: string;
    now: string;
    dataDir: string;
    model?: string;
    executionMode?: "dry-run" | "live";
    providerRoot?: string;
    lissRoot?: string;
}>): Readonly<{
    selection: EditorialToolSelection;
    selectionDigest: string;
    providerResult: JsonRecord;
    providerExchange: JsonRecord;
    recordedAt: string;
}>;
export {};
//# sourceMappingURL=editorial-assessment-contract.d.mts.map