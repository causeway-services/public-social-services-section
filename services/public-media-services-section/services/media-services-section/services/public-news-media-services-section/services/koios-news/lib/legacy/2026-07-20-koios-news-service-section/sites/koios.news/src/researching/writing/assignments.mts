// researching/writing/assignments - Koios' assignment store adapter.
//
// Upstream supplies the assignment carriers and pure projection algebra.
// Koios owns the durable carrier: dated append-only records in its assignment
// state ledger. The older content-farm `data/logs/assignments.jsonl` path is not
// an ambient second authority.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import {
  assignmentActivityFromLog,
  assignmentBaseId,
  assignmentCarrier,
  assignmentLogAssignment,
  assignmentLogCompletedEvent,
  assignmentLogCreatedEvent,
  assignmentLogNotedEvent,
  assignmentLogProjectionReading,
  assignmentManuscriptArtifact,
  assignmentNoteCarrier,
  completeAssignmentResult,
  createAssignmentNoteResult,
  createAssignmentResult,
  projectAssignmentLog,
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
import { appendDatedRecord, ledgerRootPath, type JsonObject } from "../../management/ledger.mjs";

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

function jsonlFiles(root: string): readonly string[] {
  try {
    return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
      ? jsonlFiles(join(root, entry.name))
      : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []));
  } catch { return Object.freeze([]); }
}

function assignmentEvents(dataDir: string): readonly AssignmentLogEvent[] {
  const events: AssignmentLogEvent[] = [];
  for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "assignments"))].sort()) {
    try {
      for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
        try {
          const record = JSON.parse(line) as JsonObject;
          if (record["kind"] === "koios.assignment-witness" || record["kind"] === "koios.assignment-successor-witness") {
            const assignment = record["assignment"];
            const at = record["at"];
            if (assignment !== null && typeof assignment === "object" && !Array.isArray(assignment) && typeof at === "string") {
              const {
                status: _status,
                completedAt: _completedAt,
                manuscriptSlug: _manuscriptSlug,
                manuscriptUrl: _manuscriptUrl,
                ...logged
              } = assignment as JsonObject;
              events.push(assignmentLogCreatedEvent({ at, assignment: logged as AssignmentLogAssignment }));
            }
          } else if (record["kind"] === "koios.assignment-completion-witness" && typeof record["assignmentId"] === "string" && typeof record["at"] === "string") {
            events.push(assignmentLogCompletedEvent({ at: record["at"], assignmentId: record["assignmentId"] }));
          } else if (record["kind"] === "koios.assignment-note-witness" && typeof record["assignmentId"] === "string" && typeof record["at"] === "string") {
            const note = record["note"];
            if (note !== null && typeof note === "object" && !Array.isArray(note)) {
              events.push(assignmentLogNotedEvent({ at: record["at"], assignmentId: record["assignmentId"], note: note as AssignmentNoteReading }));
            }
          }
        } catch { /* malformed records remain evidence but do not erase later valid events */ }
      }
    } catch { /* an unreadable carrier does not erase other dated carriers */ }
  }
  return Object.freeze(events);
}

export function readAssignmentDispositions(dataDir: string): ReadonlyMap<string, AssignmentDisposition> {
  const dispositions = new Map<string, AssignmentDisposition>();
  for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "assignments"))].sort()) {
    try {
      for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
        const record = JSON.parse(line) as JsonObject;
        if (record["kind"] !== "koios.assignment-disposition-witness"
          || typeof record["assignmentId"] !== "string"
          || !["refused", "superseded"].includes(String(record["disposition"] ?? ""))
          || typeof record["reason"] !== "string"
          || typeof record["authority"] !== "string"
          || typeof record["contract"] !== "string"
          || typeof record["at"] !== "string") continue;
        dispositions.set(record["assignmentId"], Object.freeze({
          assignmentId: record["assignmentId"],
          disposition: record["disposition"] as AssignmentDisposition["disposition"],
          reason: record["reason"],
          authority: record["authority"],
          contract: record["contract"],
          at: record["at"],
          ...(typeof record["replacementAssignmentId"] === "string" ? { replacementAssignmentId: record["replacementAssignmentId"] } : {}),
        }));
      }
    } catch { /* one malformed carrier cannot reopen another settled assignment */ }
  }
  return dispositions;
}

export function readAssignmentDisposition(dataDir: string, assignmentId: string): AssignmentDisposition | undefined {
  return readAssignmentDispositions(dataDir).get(assignmentId);
}

export function readAssignmentControls(dataDir: string): ReadonlyMap<string, AssignmentControl> {
  const controls = new Map<string, AssignmentControl>();
  for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "assignments"))].sort()) {
    try {
      for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
        const record = JSON.parse(line) as JsonObject;
        if (record["kind"] !== "koios.assignment-control-witness"
          || typeof record["assignmentId"] !== "string"
          || !["active", "deferred"].includes(String(record["state"] ?? ""))
          || typeof record["reason"] !== "string"
          || typeof record["authority"] !== "string"
          || typeof record["contract"] !== "string"
          || typeof record["at"] !== "string") continue;
        controls.set(record["assignmentId"], Object.freeze({
          assignmentId: record["assignmentId"],
          state: record["state"] as AssignmentControl["state"],
          reason: record["reason"],
          authority: record["authority"],
          contract: record["contract"],
          at: record["at"],
        }));
      }
    } catch { /* one malformed control record cannot change another assignment */ }
  }
  return controls;
}

export function recordAssignmentControl(
  dataDir: string,
  input: Readonly<Omit<AssignmentControl, "at">>,
  instant = new Date().toISOString(),
): AssignmentControl {
  if (input.assignmentId.trim() === "" || input.reason.trim() === "" || input.authority.trim() === "" || input.contract.trim() === "") throw new Error("assignment control requires assignment, reason, authority, and contract");
  if (readAssignmentDisposition(dataDir, input.assignmentId) !== undefined) throw new Error(`terminal assignment ${input.assignmentId} cannot be reactivated or deferred`);
  const prior = readAssignmentControls(dataDir).get(input.assignmentId);
  if (prior !== undefined && prior.state === input.state && prior.reason === input.reason && prior.authority === input.authority && prior.contract === input.contract) return prior;
  const control = Object.freeze({ ...input, at: instant });
  appendAssignmentRecord(dataDir, instant, Object.freeze({ kind: "koios.assignment-control-witness", ...control }) as JsonObject);
  return control;
}

export function readActionableAssignments(dataDir: string, posts: readonly KoiosPost[] = []): readonly AssignmentReading[] {
  const dispositions = readAssignmentDispositions(dataDir);
  const controls = readAssignmentControls(dataDir);
  return Object.freeze(readAssignments(dataDir, posts).filter((assignment) => openAssignment(assignment)
    && !dispositions.has(assignment.assignmentId)
    && controls.get(assignment.assignmentId)?.state !== "deferred"));
}

export function recordAssignmentDisposition(
  dataDir: string,
  input: Readonly<{
    assignmentId: string;
    disposition: "refused" | "superseded";
    reason: string;
    authority: string;
    contract: string;
    replacementAssignmentId?: string;
  }>,
  instant = new Date().toISOString(),
): AssignmentDisposition {
  if (input.assignmentId.trim() === "" || input.reason.trim() === "" || input.authority.trim() === "" || input.contract.trim() === "") throw new Error("assignment disposition requires assignment, reason, authority, and contract");
  const prior = readAssignmentDisposition(dataDir, input.assignmentId);
  if (prior !== undefined) {
    if (prior.disposition !== input.disposition
      || prior.reason !== input.reason
      || prior.authority !== input.authority
      || prior.contract !== input.contract
      || prior.replacementAssignmentId !== input.replacementAssignmentId) throw new Error(`assignment ${input.assignmentId} already has a different terminal disposition`);
    return prior;
  }
  const disposition = Object.freeze({ ...input, at: instant });
  appendAssignmentRecord(dataDir, instant, Object.freeze({ kind: "koios.assignment-disposition-witness", ...disposition }) as JsonObject);
  return disposition;
}

function appendAssignmentRecord(dataDir: string, instant: string, record: JsonObject): void {
  appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant, record });
}

function openAssignment(assignment: AssignmentReading): boolean {
  return assignment.status === "assigned" || assignment.status === "drafted";
}

export function readAssignments(dataDir: string, posts: readonly KoiosPost[] = []): readonly AssignmentReading[] {
  return projectAssignmentLog({ events: assignmentEvents(dataDir), artifacts: assignmentArtifacts(posts) });
}

export function readAssignmentLogProjection(dataDir: string, posts: readonly KoiosPost[] = []): AssignmentLogProjectionReading {
  const events = assignmentEvents(dataDir);
  return assignmentLogProjectionReading({ events, assignments: projectAssignmentLog({ events, artifacts: assignmentArtifacts(posts) }) });
}

export function readAssignment(dataDir: string, assignmentId: string, posts: readonly KoiosPost[] = []): AssignmentReading {
  const assignment = readAssignments(dataDir, posts).find((candidate) => candidate.assignmentId === assignmentId);
  if (assignment === undefined) throw new Error(`no such assignment: ${assignmentId}`);
  return assignment;
}

export function readAssignmentActivity(dataDir: string, assignmentId: string, posts: readonly KoiosPost[] = []): AssignmentActivityReading {
  return assignmentActivityFromLog({ assignmentId, events: assignmentEvents(dataDir), artifacts: assignmentArtifacts(posts) });
}

export function recordAssignmentNote(
  dataDir: string,
  assignmentId: string,
  input: CreateAssignmentNoteInput,
  posts: readonly KoiosPost[] = [],
): CreateAssignmentNoteResult {
  const assignment = readAssignment(dataDir, assignmentId, posts);
  const note = assignmentNoteCarrier.assert({ body: input.body, ...(input.author === undefined ? {} : { author: input.author }) }, "Koios assignment note");
  const at = new Date().toISOString();
  appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-note-witness", at, assignmentId, note }) as JsonObject);
  return createAssignmentNoteResult({ recorded: true, assignment, note });
}

export function createAssignment(
  dataDir: string,
  input: CreateAssignmentInput,
  posts: readonly KoiosPost[] = [],
  instant = new Date().toISOString(),
): CreateAssignmentResult {
  const existingAssignments = readAssignments(dataDir, posts);
  const terminal = readAssignmentDispositions(dataDir);
  const existing = existingAssignments.find((assignment) => openAssignment(assignment)
    && !terminal.has(assignment.assignmentId)
    && assignment.term.toLowerCase() === input.term.toLowerCase()
    && assignment.beat.toLowerCase() === input.beat.toLowerCase());
  if (existing !== undefined) return createAssignmentResult({ created: false, assignment: existing });
  const baseId = assignmentBaseId(input);
  const ids = new Set(existingAssignments.map(({ assignmentId }) => assignmentId));
  let assignmentId = baseId;
  let suffix = 2;
  while (ids.has(assignmentId)) {
    assignmentId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  const at = instant;
  const assignment = assignmentLogAssignment({
    kind: "producing-content.assignment",
    assignmentId,
    term: input.term,
    beat: input.beat,
    createdAt: at,
    priority: input.priority ?? 0,
    ...(input.summary === undefined ? {} : { summary: input.summary }),
    ...(input.angle === undefined ? {} : { angle: input.angle }),
    ...(input.assignee === undefined ? {} : { assignee: input.assignee }),
    ...(input.dueAt === undefined ? {} : { dueAt: input.dueAt }),
    sourceUrls: [...(input.sourceUrls ?? [])],
    ...(input.evidence === undefined ? {} : { evidence: input.evidence }),
  });
  appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-witness", at, contract: "koios-assignment-state/v1", created: true, assignment }) as JsonObject);
  const created = readAssignments(dataDir, posts).find((candidate) => candidate.assignmentId === assignmentId)
    ?? assignmentCarrier.assert({ ...assignment, status: "assigned" }, "created Koios assignment");
  return createAssignmentResult({ created: true, assignment: created });
}

export type SuccessorAssignmentResult = Readonly<{
  created: boolean;
  predecessorAssignmentId: string;
  predecessorDisposition: AssignmentDisposition;
  assignment: AssignmentReading;
}>;

/**
 * Create one digest-bound successor without reopening or rewriting its
 * terminal predecessor.  The created assignment and predecessor relation
 * share one append-only witness, so a crash cannot leave an unlinked work
 * order in the assignment log.
 */
export function createSuccessorAssignment(
  dataDir: string,
  input: Readonly<{
    predecessorAssignmentId: string;
    successorAssignmentId: string;
    reason: string;
    authority: string;
    contract: string;
  }>,
  posts: readonly KoiosPost[] = [],
  instant = new Date().toISOString(),
): SuccessorAssignmentResult {
  for (const [label, value] of Object.entries(input)) {
    if (value.trim() === "") throw new Error(`successor assignment requires ${label}`);
  }
  if (input.predecessorAssignmentId === input.successorAssignmentId) throw new Error("successor assignment cannot reopen its predecessor");
  const predecessor = readAssignment(dataDir, input.predecessorAssignmentId, posts);
  const predecessorDisposition = readAssignmentDisposition(dataDir, input.predecessorAssignmentId);
  if (predecessorDisposition === undefined) throw new Error(`predecessor assignment ${input.predecessorAssignmentId} is not terminal`);
  const existing = readAssignments(dataDir, posts).find(({ assignmentId }) => assignmentId === input.successorAssignmentId);
  if (existing !== undefined) {
    if (existing.term !== predecessor.term || existing.beat !== predecessor.beat) throw new Error("existing successor does not preserve predecessor assignment scope");
    return Object.freeze({ created: false, predecessorAssignmentId: predecessor.assignmentId, predecessorDisposition, assignment: existing });
  }
  const at = instant;
  const assignment = assignmentLogAssignment({
    kind: "producing-content.assignment",
    assignmentId: input.successorAssignmentId,
    term: predecessor.term,
    beat: predecessor.beat,
    createdAt: at,
    priority: predecessor.priority,
    ...(predecessor.summary === undefined ? {} : { summary: predecessor.summary }),
    ...(predecessor.angle === undefined ? {} : { angle: predecessor.angle }),
    ...(predecessor.assignee === undefined ? {} : { assignee: predecessor.assignee }),
    ...(predecessor.dueAt === undefined ? {} : { dueAt: predecessor.dueAt }),
    sourceUrls: [...predecessor.sourceUrls],
    ...(predecessor.evidence === undefined ? {} : { evidence: predecessor.evidence }),
  });
  appendAssignmentRecord(dataDir, at, Object.freeze({
    kind: "koios.assignment-successor-witness",
    at,
    contract: input.contract,
    authority: input.authority,
    reason: input.reason,
    predecessorAssignmentId: predecessor.assignmentId,
    predecessorDisposition,
    assignment,
  }) as JsonObject);
  const created = readAssignment(dataDir, input.successorAssignmentId, posts);
  return Object.freeze({ created: true, predecessorAssignmentId: predecessor.assignmentId, predecessorDisposition, assignment: created });
}

/**
 * Form the exact assignment identity a successful issue contract would create,
 * without writing the assignment ledger. This lets evidence procurement fail
 * before a publication-owned work order exists.
 */
export function previewAssignment(
  dataDir: string,
  input: CreateAssignmentInput,
  posts: readonly KoiosPost[] = [],
  instant = new Date().toISOString(),
): AssignmentReading {
  const existingAssignments = readAssignments(dataDir, posts);
  const terminal = readAssignmentDispositions(dataDir);
  const existing = existingAssignments.find((assignment) => openAssignment(assignment)
    && !terminal.has(assignment.assignmentId)
    && assignment.term.toLowerCase() === input.term.toLowerCase()
    && assignment.beat.toLowerCase() === input.beat.toLowerCase());
  if (existing !== undefined) return existing;
  const baseId = assignmentBaseId(input);
  const ids = new Set(existingAssignments.map(({ assignmentId }) => assignmentId));
  let assignmentId = baseId;
  let suffix = 2;
  while (ids.has(assignmentId)) {
    assignmentId = `${baseId}-${suffix}`;
    suffix += 1;
  }
  return assignmentCarrier.assert({
    kind: "producing-content.assignment",
    assignmentId,
    term: input.term,
    beat: input.beat,
    createdAt: instant,
    status: "assigned",
    priority: input.priority ?? 0,
    ...(input.summary === undefined ? {} : { summary: input.summary }),
    ...(input.angle === undefined ? {} : { angle: input.angle }),
    ...(input.assignee === undefined ? {} : { assignee: input.assignee }),
    ...(input.dueAt === undefined ? {} : { dueAt: input.dueAt }),
    sourceUrls: [...(input.sourceUrls ?? [])],
    ...(input.evidence === undefined ? {} : { evidence: input.evidence }),
  }, "prospective Koios assignment");
}

export function completeAssignment(
  dataDir: string,
  assignmentId: string,
  posts: readonly KoiosPost[] = [],
): CompleteAssignmentResult {
  const before = readAssignment(dataDir, assignmentId, posts);
  if (before.status === "completed" || before.status === "published") return completeAssignmentResult({ completed: false, assignment: before });
  const at = new Date().toISOString();
  appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-completion-witness", at, assignmentId }) as JsonObject);
  return completeAssignmentResult({ completed: true, assignment: readAssignment(dataDir, assignmentId, posts) });
}
