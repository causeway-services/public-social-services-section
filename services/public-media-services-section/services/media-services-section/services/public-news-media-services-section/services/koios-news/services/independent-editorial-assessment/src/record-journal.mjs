import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";

const objectKind = "koios-news.independent-editorial-assessment.record";
const actor = "urn:ame:independent-editorial-assessment";

export function createSettlementStore({ settlementRoot } = {}) {
  return Object.freeze({ record({ category, recordedAt, record }) {
    return createSemanticRecordJournal({ root: settlementRoot, objectKind }).record({
      category, recordedAt, record,
      charge: { support: true, refutation: false },
      relation: { subject: actor, predicate: "records", object: record.id ?? category },
    });
  } });
}

export function querySettlementRecords(category, { root } = {}) {
  return createSemanticRecordJournal({ root, objectKind }).query({ category }).map((row) => structuredClone(row.record));
}
