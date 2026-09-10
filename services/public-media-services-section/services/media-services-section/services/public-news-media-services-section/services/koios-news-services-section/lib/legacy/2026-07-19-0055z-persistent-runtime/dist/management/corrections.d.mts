import { type CorrectionKind } from "../researching/writing/editing/publishing/managing/circulating/corrections.mjs";
export type OpenCorrectionInput = Readonly<{
    slug: string;
    kind: CorrectionKind;
    correctedAt: string;
    summary: string;
    details?: string;
    correctedBody?: string;
    replacements?: readonly Readonly<{
        from: string;
        to: string;
    }>[];
    expectedManuscriptDigest?: string;
    affectedSurfaces?: readonly string[];
    trigger: Readonly<{
        act: "source-claim.superseded" | "source-claim.withdrawn" | "claim.narrowed";
        evidenceDigest: string;
        reason: string;
        sourceSubjects?: readonly string[];
        claimIds?: readonly string[];
    }>;
    priorManifestDigest: string;
    priorRouteDigests: Readonly<Record<string, string>>;
    contentDir?: string;
    dataDir?: string;
}>;
export type OpenCorrectionResult = Readonly<{
    correctionId: string;
    slug: string;
    path: string;
    priorManuscriptDigest: string;
    correctedDraftDigest: string;
    affectedSurfaces: readonly string[];
    triggerActDigest: string;
    priorManifestDigest: string;
}>;
export type CloseCorrectionInput = Readonly<{
    slug: string;
    correctionId: string;
    closedAt: string;
    outputDir: string;
    contentDir?: string;
    dataDir?: string;
}>;
export type AmendCorrectionInput = Readonly<{
    slug: string;
    correctionId: string;
    amendedAt: string;
    summary: string;
    details?: string;
    contentDir?: string;
    dataDir?: string;
}>;
export type ReopenCorrectionInput = Readonly<{
    slug: string;
    correctionId: string;
    reopenedAt: string;
    reason: string;
    replacements: readonly Readonly<{
        from: string;
        to: string;
    }>[];
    contentDir?: string;
    dataDir?: string;
}>;
export type CloseCorrectionResult = Readonly<{
    correctionId: string;
    slug: string;
    manuscriptDigest: string;
    editorialAcceptanceDigest: string;
    triggerActDigest: string;
    priorManifestDigest: string;
    manifestDigest: string;
    routeDigests: Readonly<Record<string, string>>;
    routeChanges: Readonly<Record<string, Readonly<{
        relation: "changed" | "semantically-witnessed-byte-unchanged";
        before?: string;
        after: string;
        reason?: string;
    }>>>;
}>;
export declare function openCorrection(input: OpenCorrectionInput): OpenCorrectionResult;
export declare function amendCorrection(input: AmendCorrectionInput): Readonly<{
    correctionId: string;
    slug: string;
    manuscriptDigest: string;
}>;
export declare function reopenCorrection(input: ReopenCorrectionInput): Readonly<{
    correctionId: string;
    slug: string;
    manuscriptDigest: string;
    replacementCount: number;
}>;
export declare function closeCorrection(input: CloseCorrectionInput): Promise<CloseCorrectionResult>;
//# sourceMappingURL=corrections.d.mts.map