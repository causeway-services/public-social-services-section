// editing — gates, review candidates, and publishability.
//
// Editing owns judgment after a manuscript exists. The public audit remains in
// the publishing surface; this reading is the newsroom's internal state.

import type { GateReport } from "@red-cup-engineering/organizing-a-content-mill";

import type { KoiosPost } from "../../../content.mts";
import { deskWorkItems, type DeskWorkItem } from "../../../desk.mts";
import { auditReports } from "../../../surface.mts";

export type EditingDepartmentReading = Readonly<{
  department: "editing";
  reports: readonly GateReport[];
  workItems: readonly DeskWorkItem[];
  publishableCount: number;
  withheldCount: number;
  reviewCandidateCount: number;
}>;

export function editingDepartmentReading(posts: readonly KoiosPost[]): EditingDepartmentReading {
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

export {
  publishManuscript,
  normalizeManuscriptReferences,
  repairManuscriptHeadings,
  reviewManuscriptStandards,
} from "./standards.mts";
export type {
  NormalizeManuscriptReferencesResult,
  PublishManuscriptResult,
  RepairManuscriptHeadingsResult,
  StandardsFinding,
  StandardsReview,
  StandardsSeverity,
} from "./standards.mts";
