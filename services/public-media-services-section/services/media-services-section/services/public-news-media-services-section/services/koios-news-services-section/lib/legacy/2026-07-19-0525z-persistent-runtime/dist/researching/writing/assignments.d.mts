import { type AssignmentActivityEvent, type AssignmentActivityReading, type AssignmentLogCompletedEvent, type AssignmentLogCreatedEvent, type AssignmentLogEvent, type AssignmentLogNotedEvent, type AssignmentLogProjectionReading, type AssignmentReading, type CompleteAssignmentResult, type CreateAssignmentInput, type CreateAssignmentNoteInput, type CreateAssignmentNoteResult, type CreateAssignmentResult } from "@emsenn/organizing-a-content-farm";
import type { KoiosPost } from "../../content.mjs";
export { assignmentActivityReading, assignmentLogProjectionReading, completeAssignmentResult, createAssignmentInputFromDemand, createAssignmentJsonSchema, createAssignmentNoteJsonSchema, createAssignmentNoteResult, createAssignmentResult, normalizeCreateAssignmentInput, normalizeCreateAssignmentNoteInput, type AssignmentActivityEvent, type AssignmentActivityReading, type AssignmentEvidence, type AssignmentLogAssignment, type AssignmentLogCompletedEvent, type AssignmentLogCreatedEvent, type AssignmentLogEvent, type AssignmentLogNotedEvent, type AssignmentLogProjectionReading, type AssignmentNoteReading, type AssignmentReading, type AssignmentStatus, type CompleteAssignmentResult, type CreateAssignmentInput, type CreateAssignmentNoteInput, type CreateAssignmentNoteResult, type CreateAssignmentResult, } from "@emsenn/organizing-a-content-farm";
export type AssignmentCreatedEvent = AssignmentLogCreatedEvent;
export type AssignmentCompletedEvent = AssignmentLogCompletedEvent;
export type AssignmentNotedEvent = AssignmentLogNotedEvent;
export type KoiosAssignmentActivityEvent = AssignmentActivityEvent & Readonly<{
    kind: "created" | "completed" | "noted" | "drafted" | "published";
    at: string;
    label: string;
    origin: "log" | "artifact";
    event?: AssignmentLogEvent;
    artifact?: Readonly<{
        manuscriptSlug: string;
        manuscriptUrl: string;
    }>;
}>;
export type AssignmentDisposition = Readonly<{
    assignmentId: string;
    disposition: "refused" | "superseded";
    reason: string;
    authority: string;
    contract: string;
    at: string;
    replacementAssignmentId?: string;
}>;
export type AssignmentControl = Readonly<{
    assignmentId: string;
    state: "active" | "deferred";
    reason: string;
    authority: string;
    contract: string;
    at: string;
}>;
export declare function readAssignmentDispositions(dataDir: string): ReadonlyMap<string, AssignmentDisposition>;
export declare function readAssignmentDisposition(dataDir: string, assignmentId: string): AssignmentDisposition | undefined;
export declare function readAssignmentControls(dataDir: string): ReadonlyMap<string, AssignmentControl>;
export declare function recordAssignmentControl(dataDir: string, input: Readonly<Omit<AssignmentControl, "at">>, instant?: string): AssignmentControl;
export declare function readActionableAssignments(dataDir: string, posts?: readonly KoiosPost[]): readonly AssignmentReading[];
export declare function recordAssignmentDisposition(dataDir: string, input: Readonly<{
    assignmentId: string;
    disposition: "refused" | "superseded";
    reason: string;
    authority: string;
    contract: string;
    replacementAssignmentId?: string;
}>, instant?: string): AssignmentDisposition;
export declare function readAssignments(dataDir: string, posts?: readonly KoiosPost[]): readonly AssignmentReading[];
export declare function readAssignmentLogProjection(dataDir: string, posts?: readonly KoiosPost[]): AssignmentLogProjectionReading;
export declare function readAssignment(dataDir: string, assignmentId: string, posts?: readonly KoiosPost[]): AssignmentReading;
export declare function readAssignmentActivity(dataDir: string, assignmentId: string, posts?: readonly KoiosPost[]): AssignmentActivityReading;
export declare function recordAssignmentNote(dataDir: string, assignmentId: string, input: CreateAssignmentNoteInput, posts?: readonly KoiosPost[]): CreateAssignmentNoteResult;
export declare function createAssignment(dataDir: string, input: CreateAssignmentInput, posts?: readonly KoiosPost[], instant?: string): CreateAssignmentResult;
/**
 * Form the exact assignment identity a successful issue contract would create,
 * without writing the assignment ledger. This lets evidence procurement fail
 * before a publication-owned work order exists.
 */
export declare function previewAssignment(dataDir: string, input: CreateAssignmentInput, posts?: readonly KoiosPost[], instant?: string): AssignmentReading;
export declare function completeAssignment(dataDir: string, assignmentId: string, posts?: readonly KoiosPost[]): CompleteAssignmentResult;
//# sourceMappingURL=assignments.d.mts.map