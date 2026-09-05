import type { FrontMatterRecord } from "@emsenn/organizing-a-content-farm";
import { type CorrectionCoverageReading, type CorrectionRecord, type CorrectionRegisterReading, type CorrectionValidationFinding } from "@emsenn/organizing-a-content-mill";
import type { KoiosPost } from "../../../../../../content.mjs";
import type { KoiosItem } from "../../../../../../surface.mjs";
export { CORRECTION_POLICY, DEFAULT_CORRECTION_AFFECTED_SURFACES, type CorrectionCoverageReading, type CorrectionKind, type CorrectionRecord, type CorrectionRegisterReading, type CorrectionValidationFinding, } from "@emsenn/organizing-a-content-mill";
export declare function correctionRecordsForArticle(input: Readonly<{
    frontMatter: FrontMatterRecord;
    slug: string;
    articlePath: string;
    articleHeadline: string;
}>): readonly CorrectionRecord[];
export declare function correctionCoverageForFrontMatter(frontMatter: FrontMatterRecord): CorrectionCoverageReading;
export declare function correctionStateForFrontMatter(frontMatter: FrontMatterRecord): "retracted" | "current" | "clarified" | "corrected";
export declare function correctionRecordsForPost(post: KoiosPost, item: KoiosItem): readonly CorrectionRecord[];
export declare function correctionValidationFindings(frontMatter: FrontMatterRecord): readonly CorrectionValidationFinding[];
export declare function correctionRegisterReading(input: Readonly<{
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
}>): CorrectionRegisterReading;
//# sourceMappingURL=corrections.d.mts.map