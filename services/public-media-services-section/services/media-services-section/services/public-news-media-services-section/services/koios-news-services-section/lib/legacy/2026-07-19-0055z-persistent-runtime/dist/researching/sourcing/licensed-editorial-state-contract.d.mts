import type { ResearchPacket } from "./research-packets.mjs";
type JsonRecord = Record<string, unknown>;
export type LicensedAssertion = Readonly<{
    id: string;
    sourceSubject: string;
    sourceUrl: string;
    sourceTitle: string;
    text: string;
    force: "alleges";
    status: "source-supported";
    attribution: "required";
    scope: string;
    sourcePublished?: string;
}>;
export type LicensedEditorialState = Readonly<{
    kind: "koios-news.licensed-editorial-state";
    version: 1;
    formedAt: string;
    assignment: Readonly<{
        assignmentId: string;
        term: string;
        beat: string;
        demandStatus: "attention-pressure-not-evidence";
    }>;
    assertions: readonly LicensedAssertion[];
    plan: Readonly<{
        genre: "reported-analysis";
        evidenceBudget: Readonly<{
            targetWords: Readonly<{
                minimum: number;
                maximum: number;
            }>;
            licensedMaximumWords: number;
            distinctAssertionCount: number;
            primaryAssertionCount: number;
            maximumWordsPerAssertion: number;
            status: "cleared";
        }>;
        headline: Readonly<{
            subject: string;
            claimIds: readonly string[];
            law: string;
        }>;
        ledeClaimIds: readonly string[];
        sections: readonly Readonly<{
            id: string;
            purpose: string;
            claimIds: readonly string[];
        }>[];
        interpretation: Readonly<{
            requestedAngle: string;
            authority: "editorial-purpose-only";
            law: string;
        }>;
    }>;
    prohibitions: readonly string[];
    correctionPolicy: string;
}>;
export type LicensedEditorialDiagnosis = Readonly<{
    failureLayer: string;
    requiredMove: string;
    replayFrom: string;
    evidence?: JsonRecord;
    suggestedAssignment?: Readonly<{
        term: string;
        summary: string;
        angle: string;
        sourceUrls: readonly string[];
    }>;
}>;
export declare class LicensedEditorialStateRefusal extends Error {
    readonly code: string;
    readonly diagnosis: LicensedEditorialDiagnosis;
    constructor(code: string, message: string, diagnosis: LicensedEditorialDiagnosis);
}
export declare function procureLicensedEditorialState(input: Readonly<{
    assignment: Readonly<{
        assignmentId: string;
        term: string;
        beat: string;
        summary: string;
        angle: string;
        sourceUrls: readonly string[];
    }>;
    researchPacket: ResearchPacket;
    now: string;
}>): Promise<Readonly<{
    state: LicensedEditorialState;
    stateDigest: string;
    providerExchange: JsonRecord;
}>>;
export declare function licensedEditorialBrief(state: LicensedEditorialState): string;
export {};
//# sourceMappingURL=licensed-editorial-state-contract.d.mts.map