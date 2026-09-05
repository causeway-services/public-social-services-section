// researching/writing/assignments - Koios' assignment store adapter.
//
// Upstream supplies the assignment carriers and pure projection algebra.
// Koios owns the durable assignment carrier through its contracted witness-journal RDF
// memory die. No second assignment authority exists.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { isNiUri as isCanonicalSha256NiUri } from "@red-cup-engineering/ni-services-section";

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
} from "@red-cup-engineering/organizing-a-content-farm";

import type { KoiosPost } from "../../content.mts";
import { appendDatedRecord, readKoiosLedger, recordDigest, type JsonObject } from "../../management/ledger.mts";
import type { EditorialCommission } from "../../management/editorial-commissioning.mts";

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
} from "@red-cup-engineering/organizing-a-content-farm";

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

function assignmentEvents(dataDir: string): readonly AssignmentLogEvent[] {
  const events: AssignmentLogEvent[] = [];
  for (const record of readKoiosLedger(dataDir, "assignments")) {
    try {
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
  return Object.freeze(events);
}

export function readAssignmentDispositions(dataDir: string): ReadonlyMap<string, AssignmentDisposition> {
  const dispositions = new Map<string, AssignmentDisposition>();
  for (const record of readKoiosLedger(dataDir, "assignments")) {
        if (record["kind"] === "koios.assignment-disposition-revalidation-witness"
          && typeof record["assignmentId"] === "string"
          && typeof record["priorDispositionDigest"] === "string"
          && typeof record["refusalDigest"] === "string"
          && (record["priorGateMechanismDigest"] === null || typeof record["priorGateMechanismDigest"] === "string")
          && typeof record["gateMechanismDigest"] === "string"
          && typeof record["at"] === "string") {
          dispositions.delete(record["assignmentId"]);
          continue;
        }
        if (record["kind"] === "koios.assignment-repair-revalidation-witness"
          && typeof record["assignmentId"] === "string"
          && typeof record["priorDispositionDigest"] === "string"
          && typeof record["repairProductDigest"] === "string"
          && typeof record["repairMechanismDigest"] === "string"
          && typeof record["authority"] === "string"
          && typeof record["contract"] === "string"
          && typeof record["at"] === "string") {
          dispositions.delete(record["assignmentId"]);
          continue;
        }
        const carrier = record["kind"] === "koios.assignment-disposition-witness"
          ? record
          : record["kind"] === "koios.assignment-successor-witness"
            && record["predecessorDisposition"] !== null
            && typeof record["predecessorDisposition"] === "object"
            && !Array.isArray(record["predecessorDisposition"])
            ? record["predecessorDisposition"] as JsonObject
            : undefined;
        if (carrier === undefined
          || typeof carrier["assignmentId"] !== "string"
          || !["refused", "superseded"].includes(String(carrier["disposition"] ?? ""))
          || typeof carrier["reason"] !== "string"
          || typeof carrier["authority"] !== "string"
          || typeof carrier["contract"] !== "string"
          || typeof carrier["at"] !== "string") continue;
        dispositions.set(carrier["assignmentId"], Object.freeze({
          assignmentId: carrier["assignmentId"],
          disposition: carrier["disposition"] as AssignmentDisposition["disposition"],
          reason: carrier["reason"],
          authority: carrier["authority"],
          contract: carrier["contract"],
          at: carrier["at"],
          ...(typeof carrier["replacementAssignmentId"] === "string" ? { replacementAssignmentId: carrier["replacementAssignmentId"] } : {}),
        }));
  }
  return dispositions;
}

export function readAssignmentDisposition(dataDir: string, assignmentId: string): AssignmentDisposition | undefined {
  return readAssignmentDispositions(dataDir).get(assignmentId);
}

export function readAssignmentControls(dataDir: string): ReadonlyMap<string, AssignmentControl> {
  const controls = new Map<string, AssignmentControl>();
  for (const record of readKoiosLedger(dataDir, "assignments")) {
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
  return controls;
}

export async function recordAssignmentControl(
  dataDir: string,
  input: Readonly<Omit<AssignmentControl, "at">>,
  instant = new Date().toISOString(),
): Promise<AssignmentControl> {
  if (input.assignmentId.trim() === "" || input.reason.trim() === "" || input.authority.trim() === "" || input.contract.trim() === "") throw new Error("assignment control requires assignment, reason, authority, and contract");
  if (readAssignmentDisposition(dataDir, input.assignmentId) !== undefined) throw new Error(`terminal assignment ${input.assignmentId} cannot be reactivated or deferred`);
  const prior = readAssignmentControls(dataDir).get(input.assignmentId);
  if (prior !== undefined && prior.state === input.state && prior.reason === input.reason && prior.authority === input.authority && prior.contract === input.contract) return prior;
  const control = Object.freeze({ ...input, at: instant });
  await appendAssignmentRecord(dataDir, instant, Object.freeze({ kind: "koios.assignment-control-witness", ...control }) as JsonObject);
  return control;
}

export function readActionableAssignments(dataDir: string, posts: readonly KoiosPost[] = []): readonly AssignmentReading[] {
  const dispositions = readAssignmentDispositions(dataDir);
  const controls = readAssignmentControls(dataDir);
  return Object.freeze(readAssignments(dataDir, posts).filter((assignment) => openAssignment(assignment)
    && !dispositions.has(assignment.assignmentId)
    && controls.get(assignment.assignmentId)?.state !== "deferred"));
}

export async function recordAssignmentDisposition(
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
): Promise<AssignmentDisposition> {
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
  await appendAssignmentRecord(dataDir, instant, Object.freeze({ kind: "koios.assignment-disposition-witness", ...disposition }) as JsonObject);
  return disposition;
}

/** Append an exact revalidation transition that supersedes one refusal in the
 * assignment projection without deleting its historical witness. */
export async function recordAssignmentDispositionRevalidation(
  dataDir: string,
  input: Readonly<{
    assignmentId: string;
    refusalDigest: string;
    priorGateMechanismDigest: string | null;
    gateMechanismDigest: string;
    authority: string;
    contract: string;
  }>,
  instant = new Date().toISOString(),
): Promise<Readonly<JsonObject>> {
  const prior = readAssignmentDisposition(dataDir, input.assignmentId);
  if (prior?.disposition !== "refused") throw new Error(`assignment ${input.assignmentId} has no refused disposition to revalidate`);
  for (const [label, value] of Object.entries(input)) {
    if (value === null && label === "priorGateMechanismDigest") continue;
    if (typeof value !== "string" || value.trim() === "") throw new Error(`assignment disposition revalidation requires ${label}`);
  }
  const record = Object.freeze({
    kind: "koios.assignment-disposition-revalidation-witness",
    at: instant,
    ...input,
    // The projection validates this exact historical disposition while the
    // refusal itself remains in the monotone log.
    priorDispositionDigest: recordDigest(prior),
  }) as JsonObject;
  await appendAssignmentRecord(dataDir, instant, record);
  return record;
}

/** Preserve one assignment identity while an admitted retained repair product
 * reopens its manuscript for another bounded circuit pass. The historical
 * refusal remains in the monotone log; only the current projection changes. */
export async function recordAssignmentRepairRevalidation(
  dataDir: string,
  input: Readonly<{
    assignmentId: string;
    repairProductDigest: string;
    repairMechanismDigest: string;
    authority: string;
    contract: string;
  }>,
  instant = new Date().toISOString(),
): Promise<Readonly<JsonObject>> {
  const prior = readAssignmentDisposition(dataDir, input.assignmentId);
  if (prior?.disposition !== "refused") throw new Error(`assignment ${input.assignmentId} has no refused disposition to repair`);
  for (const [label, value] of Object.entries(input)) {
    if (typeof value !== "string" || value.trim() === "") throw new Error(`assignment repair revalidation requires ${label}`);
  }
  const record = Object.freeze({
    kind: "koios.assignment-repair-revalidation-witness",
    at: instant,
    ...input,
    priorDispositionDigest: recordDigest(prior),
  }) as JsonObject;
  await appendAssignmentRecord(dataDir, instant, record);
  return record;
}

async function appendAssignmentRecord(dataDir: string, instant: string, record: JsonObject): Promise<void> {
  await appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant, record });
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

/** Read the immutable product commission attached by the issue controller.
 * Older assignments predate product commissioning and therefore return no
 * value; callers may form and record a compatibility commission explicitly. */
export function readAssignmentCommission(dataDir: string, assignmentId: string): EditorialCommission | undefined {
  for (const record of [...readKoiosLedger(dataDir, "assignments")].reverse()) {
        const commission = record["commission"];
        if (record["kind"] !== "koios.assignment-selection" || record["assignmentId"] !== assignmentId
          || commission === null || typeof commission !== "object" || Array.isArray(commission)) continue;
        const value = commission as JsonObject;
        if (value["kind"] !== "koios.editorial-commission" || value["version"] !== 1 || typeof value["genre"] !== "string") continue;
        return Object.freeze(value) as EditorialCommission;
  }
  return undefined;
}

export function readAssignmentActivity(dataDir: string, assignmentId: string, posts: readonly KoiosPost[] = []): AssignmentActivityReading {
  return assignmentActivityFromLog({ assignmentId, events: assignmentEvents(dataDir), artifacts: assignmentArtifacts(posts) });
}

export async function recordAssignmentNote(
  dataDir: string,
  assignmentId: string,
  input: CreateAssignmentNoteInput,
  posts: readonly KoiosPost[] = [],
): Promise<CreateAssignmentNoteResult> {
  const assignment = readAssignment(dataDir, assignmentId, posts);
  const note = assignmentNoteCarrier.assert({ body: input.body, ...(input.author === undefined ? {} : { author: input.author }) }, "Koios assignment note");
  const at = new Date().toISOString();
  await appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-note-witness", at, assignmentId, note }) as JsonObject);
  return createAssignmentNoteResult({ recorded: true, assignment, note });
}

export async function createAssignment(
  dataDir: string,
  input: CreateAssignmentInput,
  posts: readonly KoiosPost[] = [],
  instant = new Date().toISOString(),
): Promise<CreateAssignmentResult> {
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
  await appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-witness", at, contract: "koios-assignment-state/v1", created: true, assignment }) as JsonObject);
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
 * terminal predecessor. A circuit-terminal but assignment-open predecessor
 * is superseded by the same append-only witness that creates its successor,
 * so a crash cannot strand either a closed predecessor or an unlinked work
 * order in the assignment log.
 */
export async function createSuccessorAssignment(
  dataDir: string,
  input: Readonly<{
    predecessorAssignmentId: string;
    successorAssignmentId: string;
    reason: string;
    authority: string;
    contract: string;
    terminalCircuitDigest: string;
    sourceUrls?: readonly string[];
  }>,
  posts: readonly KoiosPost[] = [],
  instant = new Date().toISOString(),
): Promise<SuccessorAssignmentResult> {
  for (const [label, value] of Object.entries(input)) {
    if (typeof value === "string" && value.trim() === "") throw new Error(`successor assignment requires ${label}`);
  }
  if (input.predecessorAssignmentId === input.successorAssignmentId) throw new Error("successor assignment cannot reopen its predecessor");
  if (!isCanonicalSha256NiUri(input.terminalCircuitDigest)) throw new Error("successor assignment requires an NI-identified terminal circuit");
  const predecessor = readAssignment(dataDir, input.predecessorAssignmentId, posts);
  const predecessorDisposition = readAssignmentDisposition(dataDir, input.predecessorAssignmentId) ?? Object.freeze({
    assignmentId: predecessor.assignmentId,
    disposition: "superseded" as const,
    reason: input.reason,
    authority: input.authority,
    contract: input.contract,
    at: instant,
    replacementAssignmentId: input.successorAssignmentId,
  });
  if (predecessorDisposition.disposition === "superseded"
    && predecessorDisposition.replacementAssignmentId !== undefined
    && predecessorDisposition.replacementAssignmentId !== input.successorAssignmentId) {
    throw new Error(`predecessor assignment ${input.predecessorAssignmentId} was superseded by a different assignment`);
  }
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
    sourceUrls: [...(input.sourceUrls ?? predecessor.sourceUrls)],
    ...(predecessor.evidence === undefined ? {} : { evidence: predecessor.evidence }),
  });
  await appendAssignmentRecord(dataDir, at, Object.freeze({
    kind: "koios.assignment-successor-witness",
    at,
    contract: input.contract,
    authority: input.authority,
    reason: input.reason,
    terminalCircuitDigest: input.terminalCircuitDigest,
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

export async function completeAssignment(
  dataDir: string,
  assignmentId: string,
  posts: readonly KoiosPost[] = [],
): Promise<CompleteAssignmentResult> {
  const before = readAssignment(dataDir, assignmentId, posts);
  if (before.status === "completed" || before.status === "published") return completeAssignmentResult({ completed: false, assignment: before });
  const at = new Date().toISOString();
  await appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-completion-witness", at, assignmentId }) as JsonObject);
  return completeAssignmentResult({ completed: true, assignment: readAssignment(dataDir, assignmentId, posts) });
}
