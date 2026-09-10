import { type PrimaryReleaseSettlement } from "./cloudflare-primary-release-contract.mjs";
import { type CloseCorrectionInput, type CloseCorrectionResult } from "./corrections.mjs";
export type CorrectionReleaseResult = Readonly<{
    kind: "koios.correction-publication-settlement";
    contract: "koios.news/correction-publication/v1";
    disposition: "released" | "release-obstructed";
    correction: CloseCorrectionResult;
    release: PrimaryReleaseSettlement;
}>;
export declare function releaseClosedCorrection(input: Readonly<{
    correction: CloseCorrectionResult;
    outputDir: string;
    dataDir: string;
    now: string;
}>): CorrectionReleaseResult;
export declare function closeAndReleaseCorrection(input: CloseCorrectionInput): Promise<CorrectionReleaseResult>;
//# sourceMappingURL=correction-release.d.mts.map