import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";

export const ACTOR = "https://koios-news-service-section.invalid/activitypub/actor";
export const CONTEXT = "https://www.w3.org/ns/activitystreams";
export const ENTERPRISE = "urn:ame:koios-news-service-section";
export const ACCOUNT = "eip155:31337:0x55397286728b70d86a139fe8263c2d63c5d6770c";
export const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const JOURNAL_OBJECT_KIND = "koios-news.service-section.record";

export function digest(value, objectKind = "koios-news.record") {
  return identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
}

export function niSuffix(value) {
  if (!/^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u.test(value ?? "")) throw new Error("semantic identity must be an RFC 6920 SHA-256 ni URI");
  return value.slice("ni:///sha-256;".length);
}

function dataRoot() {
  return resolve(process.env.KOIOS_NEWS_DATA_ROOT ?? ROOT);
}

export function records(category, root = dataRoot()) {
  return createSemanticRecordJournal({ root: resolve(root), objectKind: JOURNAL_OBJECT_KIND })
    .query({ category }).map((row) => structuredClone(row.record));
}

export function record(category, recordedAt, value, root = dataRoot()) {
  return createSemanticRecordJournal({ root: resolve(root), objectKind: JOURNAL_OBJECT_KIND }).record({
    category, recordedAt, record: value,
    charge: { support: true, refutation: false },
    relation: { subject: ACTOR, predicate: "records", object: value.id ?? digest(value, "koios-news.journal-record") },
  });
}
