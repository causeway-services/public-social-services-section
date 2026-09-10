// researching/writing/assignments - Koios' assignment store adapter.
//
// Upstream supplies the assignment carriers and pure projection algebra.
// Koios owns the durable carrier: dated append-only records in its assignment
// state ledger. The older content-farm `data/logs/assignments.jsonl` path is not
// an ambient second authority.
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { assignmentActivityFromLog, assignmentBaseId, assignmentCarrier, assignmentLogAssignment, assignmentLogCompletedEvent, assignmentLogCreatedEvent, assignmentLogNotedEvent, assignmentLogProjectionReading, assignmentManuscriptArtifact, assignmentNoteCarrier, completeAssignmentResult, createAssignmentNoteResult, createAssignmentResult, projectAssignmentLog, } from "@emsenn/organizing-a-content-farm";
import { appendDatedRecord, ledgerRootPath } from "../../management/ledger.mjs";
export { assignmentActivityReading, assignmentLogProjectionReading, completeAssignmentResult, createAssignmentInputFromDemand, createAssignmentJsonSchema, createAssignmentNoteJsonSchema, createAssignmentNoteResult, createAssignmentResult, normalizeCreateAssignmentInput, normalizeCreateAssignmentNoteInput, } from "@emsenn/organizing-a-content-farm";
function maybeString(value) {
    if (value === undefined || value === null || value === "")
        return undefined;
    return String(value);
}
function koiosFrontMatter(post) {
    const value = post.document.frontMatter["koios"];
    return value !== null && typeof value === "object" && !Array.isArray(value)
        ? value
        : Object.freeze({});
}
function manuscriptStatus(post) {
    return post.document.frontMatter["draft"] === true || post.document.frontMatter["draft"] === "true"
        ? "drafted"
        : "published";
}
function assignmentArtifacts(posts) {
    return Object.freeze(posts.flatMap((post) => {
        const assignmentId = maybeString(koiosFrontMatter(post)["assignment_id"]);
        if (assignmentId === undefined)
            return [];
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
function jsonlFiles(root) {
    try {
        return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
            ? jsonlFiles(join(root, entry.name))
            : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []));
    }
    catch {
        return Object.freeze([]);
    }
}
function assignmentEvents(dataDir) {
    const events = [];
    for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "assignments"))].sort()) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
                try {
                    const record = JSON.parse(line);
                    if (record["kind"] === "koios.assignment-witness") {
                        const assignment = record["assignment"];
                        const at = record["at"];
                        if (assignment !== null && typeof assignment === "object" && !Array.isArray(assignment) && typeof at === "string") {
                            const { status: _status, completedAt: _completedAt, manuscriptSlug: _manuscriptSlug, manuscriptUrl: _manuscriptUrl, ...logged } = assignment;
                            events.push(assignmentLogCreatedEvent({ at, assignment: logged }));
                        }
                    }
                    else if (record["kind"] === "koios.assignment-completion-witness" && typeof record["assignmentId"] === "string" && typeof record["at"] === "string") {
                        events.push(assignmentLogCompletedEvent({ at: record["at"], assignmentId: record["assignmentId"] }));
                    }
                    else if (record["kind"] === "koios.assignment-note-witness" && typeof record["assignmentId"] === "string" && typeof record["at"] === "string") {
                        const note = record["note"];
                        if (note !== null && typeof note === "object" && !Array.isArray(note)) {
                            events.push(assignmentLogNotedEvent({ at: record["at"], assignmentId: record["assignmentId"], note: note }));
                        }
                    }
                }
                catch { /* malformed records remain evidence but do not erase later valid events */ }
            }
        }
        catch { /* an unreadable carrier does not erase other dated carriers */ }
    }
    return Object.freeze(events);
}
export function readAssignmentDispositions(dataDir) {
    const dispositions = new Map();
    for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "assignments"))].sort()) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
                const record = JSON.parse(line);
                if (record["kind"] !== "koios.assignment-disposition-witness"
                    || typeof record["assignmentId"] !== "string"
                    || !["refused", "superseded"].includes(String(record["disposition"] ?? ""))
                    || typeof record["reason"] !== "string"
                    || typeof record["authority"] !== "string"
                    || typeof record["contract"] !== "string"
                    || typeof record["at"] !== "string")
                    continue;
                dispositions.set(record["assignmentId"], Object.freeze({
                    assignmentId: record["assignmentId"],
                    disposition: record["disposition"],
                    reason: record["reason"],
                    authority: record["authority"],
                    contract: record["contract"],
                    at: record["at"],
                    ...(typeof record["replacementAssignmentId"] === "string" ? { replacementAssignmentId: record["replacementAssignmentId"] } : {}),
                }));
            }
        }
        catch { /* one malformed carrier cannot reopen another settled assignment */ }
    }
    return dispositions;
}
export function readAssignmentDisposition(dataDir, assignmentId) {
    return readAssignmentDispositions(dataDir).get(assignmentId);
}
export function readAssignmentControls(dataDir) {
    const controls = new Map();
    for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "assignments"))].sort()) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
                const record = JSON.parse(line);
                if (record["kind"] !== "koios.assignment-control-witness"
                    || typeof record["assignmentId"] !== "string"
                    || !["active", "deferred"].includes(String(record["state"] ?? ""))
                    || typeof record["reason"] !== "string"
                    || typeof record["authority"] !== "string"
                    || typeof record["contract"] !== "string"
                    || typeof record["at"] !== "string")
                    continue;
                controls.set(record["assignmentId"], Object.freeze({
                    assignmentId: record["assignmentId"],
                    state: record["state"],
                    reason: record["reason"],
                    authority: record["authority"],
                    contract: record["contract"],
                    at: record["at"],
                }));
            }
        }
        catch { /* one malformed control record cannot change another assignment */ }
    }
    return controls;
}
export function recordAssignmentControl(dataDir, input, instant = new Date().toISOString()) {
    if (input.assignmentId.trim() === "" || input.reason.trim() === "" || input.authority.trim() === "" || input.contract.trim() === "")
        throw new Error("assignment control requires assignment, reason, authority, and contract");
    if (readAssignmentDisposition(dataDir, input.assignmentId) !== undefined)
        throw new Error(`terminal assignment ${input.assignmentId} cannot be reactivated or deferred`);
    const prior = readAssignmentControls(dataDir).get(input.assignmentId);
    if (prior !== undefined && prior.state === input.state && prior.reason === input.reason && prior.authority === input.authority && prior.contract === input.contract)
        return prior;
    const control = Object.freeze({ ...input, at: instant });
    appendAssignmentRecord(dataDir, instant, Object.freeze({ kind: "koios.assignment-control-witness", ...control }));
    return control;
}
export function readActionableAssignments(dataDir, posts = []) {
    const dispositions = readAssignmentDispositions(dataDir);
    const controls = readAssignmentControls(dataDir);
    return Object.freeze(readAssignments(dataDir, posts).filter((assignment) => openAssignment(assignment)
        && !dispositions.has(assignment.assignmentId)
        && controls.get(assignment.assignmentId)?.state !== "deferred"));
}
export function recordAssignmentDisposition(dataDir, input, instant = new Date().toISOString()) {
    if (input.assignmentId.trim() === "" || input.reason.trim() === "" || input.authority.trim() === "" || input.contract.trim() === "")
        throw new Error("assignment disposition requires assignment, reason, authority, and contract");
    const prior = readAssignmentDisposition(dataDir, input.assignmentId);
    if (prior !== undefined) {
        if (prior.disposition !== input.disposition
            || prior.reason !== input.reason
            || prior.authority !== input.authority
            || prior.contract !== input.contract
            || prior.replacementAssignmentId !== input.replacementAssignmentId)
            throw new Error(`assignment ${input.assignmentId} already has a different terminal disposition`);
        return prior;
    }
    const disposition = Object.freeze({ ...input, at: instant });
    appendAssignmentRecord(dataDir, instant, Object.freeze({ kind: "koios.assignment-disposition-witness", ...disposition }));
    return disposition;
}
function appendAssignmentRecord(dataDir, instant, record) {
    appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant, record });
}
function openAssignment(assignment) {
    return assignment.status === "assigned" || assignment.status === "drafted";
}
export function readAssignments(dataDir, posts = []) {
    return projectAssignmentLog({ events: assignmentEvents(dataDir), artifacts: assignmentArtifacts(posts) });
}
export function readAssignmentLogProjection(dataDir, posts = []) {
    const events = assignmentEvents(dataDir);
    return assignmentLogProjectionReading({ events, assignments: projectAssignmentLog({ events, artifacts: assignmentArtifacts(posts) }) });
}
export function readAssignment(dataDir, assignmentId, posts = []) {
    const assignment = readAssignments(dataDir, posts).find((candidate) => candidate.assignmentId === assignmentId);
    if (assignment === undefined)
        throw new Error(`no such assignment: ${assignmentId}`);
    return assignment;
}
export function readAssignmentActivity(dataDir, assignmentId, posts = []) {
    return assignmentActivityFromLog({ assignmentId, events: assignmentEvents(dataDir), artifacts: assignmentArtifacts(posts) });
}
export function recordAssignmentNote(dataDir, assignmentId, input, posts = []) {
    const assignment = readAssignment(dataDir, assignmentId, posts);
    const note = assignmentNoteCarrier.assert({ body: input.body, ...(input.author === undefined ? {} : { author: input.author }) }, "Koios assignment note");
    const at = new Date().toISOString();
    appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-note-witness", at, assignmentId, note }));
    return createAssignmentNoteResult({ recorded: true, assignment, note });
}
export function createAssignment(dataDir, input, posts = [], instant = new Date().toISOString()) {
    const existingAssignments = readAssignments(dataDir, posts);
    const terminal = readAssignmentDispositions(dataDir);
    const existing = existingAssignments.find((assignment) => openAssignment(assignment)
        && !terminal.has(assignment.assignmentId)
        && assignment.term.toLowerCase() === input.term.toLowerCase()
        && assignment.beat.toLowerCase() === input.beat.toLowerCase());
    if (existing !== undefined)
        return createAssignmentResult({ created: false, assignment: existing });
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
    appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-witness", at, contract: "koios-assignment-state/v1", created: true, assignment }));
    const created = readAssignments(dataDir, posts).find((candidate) => candidate.assignmentId === assignmentId)
        ?? assignmentCarrier.assert({ ...assignment, status: "assigned" }, "created Koios assignment");
    return createAssignmentResult({ created: true, assignment: created });
}
/**
 * Form the exact assignment identity a successful issue contract would create,
 * without writing the assignment ledger. This lets evidence procurement fail
 * before a publication-owned work order exists.
 */
export function previewAssignment(dataDir, input, posts = [], instant = new Date().toISOString()) {
    const existingAssignments = readAssignments(dataDir, posts);
    const terminal = readAssignmentDispositions(dataDir);
    const existing = existingAssignments.find((assignment) => openAssignment(assignment)
        && !terminal.has(assignment.assignmentId)
        && assignment.term.toLowerCase() === input.term.toLowerCase()
        && assignment.beat.toLowerCase() === input.beat.toLowerCase());
    if (existing !== undefined)
        return existing;
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
export function completeAssignment(dataDir, assignmentId, posts = []) {
    const before = readAssignment(dataDir, assignmentId, posts);
    if (before.status === "completed" || before.status === "published")
        return completeAssignmentResult({ completed: false, assignment: before });
    const at = new Date().toISOString();
    appendAssignmentRecord(dataDir, at, Object.freeze({ kind: "koios.assignment-completion-witness", at, assignmentId }));
    return completeAssignmentResult({ completed: true, assignment: readAssignment(dataDir, assignmentId, posts) });
}
//# sourceMappingURL=assignments.mjs.map