import { basename, dirname, resolve } from "node:path";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
import { ACTOR, NODE_ROOT } from "./channel.mjs";

const OBJECT_KIND = "emsweb.modern-business-youtube-channel.record";
function rootOf(root) { const path = resolve(root ?? joinDefault()); return basename(path) === "data" ? dirname(path) : path; }
function joinDefault() { return `${NODE_ROOT}/data`; }
function semanticJson(value) { if (value instanceof Uint8Array) return { "$bytes": Buffer.from(value).toString("base64url") }; if (Array.isArray(value)) return value.map(semanticJson); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, semanticJson(child)])); return value; }
export function createSettlementStore({ settlementRoot, root } = {}) { const dataRoot = rootOf(root ?? settlementRoot); return Object.freeze({ record({ category, recordedAt, record }) { const result = createSemanticRecordJournal({ root: dataRoot, objectKind: OBJECT_KIND }).record({ category, recordedAt, record: semanticJson(record), charge: { support: true, refutation: false }, relation: { subject: ACTOR, predicate: "records", object: record.id ?? category } }); return Object.freeze({ id: record.id ?? result.id, appended: result.contentAppended }); } }); }
export function querySettlementRecords(category, { root } = {},) { return Object.freeze(createSemanticRecordJournal({ root: rootOf(root), objectKind: OBJECT_KIND }).query({ category }).map((row) => structuredClone(row.record))); }
export function recordSettlementRecord({ category, recordedAt, record, root, dataRoot } = {}) { return createSettlementStore({ root: root ?? dataRoot }).record({ category, recordedAt, record }); }
