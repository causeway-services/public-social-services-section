import type { KoiosPost } from "../../content.mjs";
export type StoryManuscript = Readonly<{
    slug: string;
    title: string;
    summary: string;
    draft: boolean;
    wordCount: number;
    keywords: readonly string[];
}>;
export type WritingDepartmentReading = Readonly<{
    department: "writing";
    manuscripts: readonly StoryManuscript[];
    draftCount: number;
    publishedCount: number;
}>;
export declare function manuscriptOf(post: KoiosPost): StoryManuscript;
export declare function writingDepartmentReading(posts: readonly KoiosPost[]): WritingDepartmentReading;
export { createAssignment, createAssignmentInputFromDemand, normalizeCreateAssignmentNoteInput, normalizeCreateAssignmentInput, readAssignment, readAssignmentActivity, readAssignments, recordAssignmentNote, } from "./assignments.mjs";
export type { AssignmentActivityEvent, AssignmentActivityReading, AssignmentCompletedEvent, AssignmentCreatedEvent, AssignmentLogEvent, AssignmentNoteReading, AssignmentNotedEvent, AssignmentReading, AssignmentStatus, CreateAssignmentNoteInput, CreateAssignmentNoteResult, CreateAssignmentInput, CreateAssignmentResult, } from "./assignments.mjs";
//# sourceMappingURL=index.d.mts.map