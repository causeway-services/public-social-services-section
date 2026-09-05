// editing — gates, review candidates, and publishability.
//
// Editing owns judgment after a manuscript exists. The public audit remains in
// the publishing surface; this reading is the newsroom's internal state.
import { deskWorkItems } from "../../../desk.mjs";
import { auditReports } from "../../../surface.mjs";
export function editingDepartmentReading(posts) {
    const reports = auditReports(posts);
    const workItems = deskWorkItems(posts);
    return Object.freeze({
        department: "editing",
        reports,
        workItems,
        publishableCount: reports.filter((report) => report.publishable).length,
        withheldCount: reports.filter((report) => !report.publishable).length,
        reviewCandidateCount: workItems.length,
    });
}
export { publishManuscript, normalizeManuscriptReferences, repairManuscriptHeadings, reviewManuscriptStandards, } from "./standards.mjs";
//# sourceMappingURL=index.mjs.map