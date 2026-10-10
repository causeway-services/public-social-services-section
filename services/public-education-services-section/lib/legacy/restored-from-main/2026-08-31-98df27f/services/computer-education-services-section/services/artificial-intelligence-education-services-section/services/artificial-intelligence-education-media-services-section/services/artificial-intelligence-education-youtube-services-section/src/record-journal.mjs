import { resolve } from "node:path";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
const CHANNEL_RECORD_OBJECT_KIND = "emsweb.artificial-intelligence-youtube-channel.record";
const ROOT_ENV = "EMSWEB_RECORD_JOURNAL_ROOT";
const DEFAULT_ROOT = resolve(import.meta.dirname, "..");
const ALLOWED_RECORD_KEYS = new Set(["category", "recordedAt", "record"]);
const ALLOWED_DIRECT_KEYS = new Set(["root", ...ALLOWED_RECORD_KEYS]);

function exactObject(value, label) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new TypeError(`${label} must be one object`);
  return value;
}
function exactKeys(value, allowed, label) {
  for (const key of Object.keys(value)) if (!allowed.has(key)) throw new TypeError(`${label} refuses displaced field ${key}`);
}
function rootOf(root) {
  const selected = process.env[ROOT_ENV] ?? root ?? DEFAULT_ROOT;
  if (typeof selected !== "string" || selected.length === 0) throw new TypeError("record journal requires an explicit local custody root");
  return resolve(selected);
}
function requiredText(value, label) {
  if (typeof value !== "string" || value.length === 0) throw new TypeError(`record journal ${label} is required`);
  return value;
}
function semanticJson(value) { if (value instanceof Uint8Array) return { "$bytes": Buffer.from(value).toString("base64url") }; if (Array.isArray(value)) return value.map(semanticJson); if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, semanticJson(child)])); return value; }
function recordAt(root, value) {
  exactObject(value, "record journal write");
  exactKeys(value, ALLOWED_RECORD_KEYS, "record journal write");
  const category = requiredText(value.category, "category");
  const recordedAt = requiredText(value.recordedAt, "recordedAt");
  if (!Number.isFinite(Date.parse(recordedAt))) throw new TypeError("record journal recordedAt must be a finite instant");
  const record = structuredClone(exactObject(value.record, "record journal record"));
  const result = createSemanticRecordJournal({ root: rootOf(root), objectKind: CHANNEL_RECORD_OBJECT_KIND }).record({ category, recordedAt, record: semanticJson(record), charge: { support: true, refutation: false }, relation: { subject: "urn:ame:artificial-intelligence-youtube-channel-enterprise", predicate: "records", object: record.id ?? category } });
  return Object.freeze({ id: record.id ?? result.id, appended: result.contentAppended });
}

export function createRecordJournal(options = {}) {
  exactObject(options, "record journal options");
  exactKeys(options, new Set(["root"]), "record journal options");
  const root = rootOf(options.root);
  return Object.freeze({
    root,
    record(value) { return recordAt(root, value); },
    query(category) { return queryJournalRecords(category, { root }); },
  });
}

export function recordJournalRecord(options = {}) {
  exactObject(options, "record journal direct write");
  exactKeys(options, ALLOWED_DIRECT_KEYS, "record journal direct write");
  const { root, ...value } = options;
  return recordAt(root, value);
}

export function queryJournalRecords(category, options = {}) {
  requiredText(category, "category");
  exactObject(options, "record journal query options");
  exactKeys(options, new Set(["root"]), "record journal query options");
  const root = rootOf(options.root);
  return Object.freeze(createSemanticRecordJournal({ root, objectKind: CHANNEL_RECORD_OBJECT_KIND }).query({ category }).map((row) => structuredClone(row.record)));
}
