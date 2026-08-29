// researching/writing/assignments - Koios' assignment store adapter.
//
// The durable assignment log/record machinery lives upstream in
// producing-content. Koios only contributes the site-local fact that a post's
// `koios.assignment_id` front matter is a manuscript artifact for that
// assignment.

import {
  assignmentManuscriptArtifact,
  completeAssignment as completeFarmAssignment,
  createAssignment as createFarmAssignment,
  readAssignment as readFarmAssignment,
  readAssignmentActivity as readFarmAssignmentActivity,
  readAssignmentLogProjection as readFarmAssignmentLogProjection,
  readAssignments as readFarmAssignments,
  recordAssignmentNote as recordFarmAssignmentNote,
  type AssignmentActivityEvent,
  type AssignmentActivityReading,
  type AssignmentEvidence,
  type AssignmentLogAssignment,
  type AssignmentLogCompletedEvent,
  type AssignmentLogCreatedEvent,
  type AssignmentLogEvent,
  type AssignmentLogNotedEvent,
  type AssignmentLogProjectionReading,
  type AssignmentManuscriptArtifact,
  type AssignmentNoteReading,
  type AssignmentReading,
  type AssignmentStatus,
  type CompleteAssignmentResult,
  type CreateAssignmentInput,
  type CreateAssignmentNoteInput,
  type CreateAssignmentNoteResult,
  type CreateAssignmentResult,
} from "@emsenn/organizing-a-content-farm";

import type { KoiosPost } from "../../content.mjs";

export {
  assignmentActivityReading,
  assignmentLogProjectionReading,
  completeAssignmentResult,
  createAssignmentInputFromDemand,
  createAssignmentJsonSchema,
  createAssignmentNoteJsonSchema,
  createAssignmentNoteResult,
  createAssignmentResult,
  normalizeCreateAssignmentInput,
  normalizeCreateAssignmentNoteInput,
  type AssignmentActivityEvent,
  type AssignmentActivityReading,
  type AssignmentEvidence,
  type AssignmentLogAssignment,
  type AssignmentLogCompletedEvent,
  type AssignmentLogCreatedEvent,
  type AssignmentLogEvent,
  type AssignmentLogNotedEvent,
  type AssignmentLogProjectionReading,
  type AssignmentNoteReading,
  type AssignmentReading,
  type AssignmentStatus,
  type CompleteAssignmentResult,
  type CreateAssignmentInput,
  type CreateAssignmentNoteInput,
  type CreateAssignmentNoteResult,
  type CreateAssignmentResult,
} from "@emsenn/organizing-a-content-farm";

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

function maybeString(value: unknown): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  return String(value);
}

function koiosFrontMatter(post: KoiosPost): Readonly<Record<string, unknown>> {
  const value = post.document.frontMatter["koios"];
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function manuscriptStatus(post: KoiosPost): AssignmentManuscriptArtifact["status"] {
  return post.document.frontMatter["draft"] === true || post.document.frontMatter["draft"] === "true"
    ? "drafted"
    : "published";
}

function assignmentArtifacts(posts: readonly KoiosPost[]): readonly AssignmentManuscriptArtifact[] {
  return Object.freeze(posts.flatMap((post): AssignmentManuscriptArtifact[] => {
    const assignmentId = maybeString(koiosFrontMatter(post)["assignment_id"]);
    if (assignmentId === undefined) return [];
    const at = maybeString(post.document.frontMatter["date"]);
    return [assignmentManuscriptArtifact({
      assignmentId,
      status: manuscriptStatus(post),
      manuscriptSlug: post.slug,
      manuscriptUrl: `/posts/${encodeURIComponent(post.slug)}`,
      ...(at === undefined ? {} : { at }),
    })];
  }));
}

export function readAssignments(dataDir: string, posts: readonly KoiosPost[] = []): readonly AssignmentReading[] {
  return readFarmAssignments(dataDir, assignmentArtifacts(posts));
}

export function readAssignmentLogProjection(dataDir: string, posts: readonly KoiosPost[] = []): AssignmentLogProjectionReading {
  return readFarmAssignmentLogProjection(dataDir, assignmentArtifacts(posts));
}

export function readAssignment(dataDir: string, assignmentId: string, posts: readonly KoiosPost[] = []): AssignmentReading {
  return readFarmAssignment(dataDir, assignmentId, assignmentArtifacts(posts));
}

export function readAssignmentActivity(dataDir: string, assignmentId: string, posts: readonly KoiosPost[] = []): AssignmentActivityReading {
  return readFarmAssignmentActivity(dataDir, assignmentId, assignmentArtifacts(posts));
}

export function recordAssignmentNote(
  dataDir: string,
  assignmentId: string,
  input: CreateAssignmentNoteInput,
  posts: readonly KoiosPost[] = [],
): CreateAssignmentNoteResult {
  return recordFarmAssignmentNote(dataDir, assignmentId, input, assignmentArtifacts(posts));
}

export function createAssignment(
  dataDir: string,
  input: CreateAssignmentInput,
  posts: readonly KoiosPost[] = [],
): CreateAssignmentResult {
  return createFarmAssignment(dataDir, input, assignmentArtifacts(posts));
}

export function completeAssignment(
  dataDir: string,
  assignmentId: string,
  posts: readonly KoiosPost[] = [],
): CompleteAssignmentResult {
  return completeFarmAssignment(dataDir, assignmentId, assignmentArtifacts(posts));
}
