import type { GateReport } from "@emsenn/organizing-a-content-mill";
import type { KoiosPost } from "../../../content.mjs";
import { type DeskWorkItem } from "../../../desk.mjs";
export type EditingDepartmentReading = Readonly<{
    department: "editing";
    reports: readonly GateReport[];
    workItems: readonly DeskWorkItem[];
    publishableCount: number;
    withheldCount: number;
    reviewCandidateCount: number;
}>;
export declare function editingDepartmentReading(posts: readonly KoiosPost[]): EditingDepartmentReading;
export { publishManuscript, normalizeManuscriptReferences, repairManuscriptHeadings, reviewManuscriptStandards, } from "./standards.mjs";
export type { NormalizeManuscriptReferencesResult, PublishManuscriptResult, RepairManuscriptHeadingsResult, StandardsFinding, StandardsReview, StandardsSeverity, } from "./standards.mjs";
//# sourceMappingURL=index.d.mts.map