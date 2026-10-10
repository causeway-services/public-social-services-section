import { basename, dirname, resolve } from "node:path";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";

const FEED = "mathematics-youtube-channel";
export const JOURNAL_OBJECT_KIND = "mathematics-youtube.journal-record";
function settlementRoot(value) { const path = resolve(value); return basename(path) === "data" ? dirname(path) : path; }
const OBJECT_KIND_BY_FEED = Object.freeze({
  "mathematics-curriculum": "mathematics-curriculum.journal-record",
  [FEED]: JOURNAL_OBJECT_KIND,
});
const categoryCoordinate = (category) => `record:${category}`;
const journal = (dataRoot, feed = FEED) => {
  const objectKind = OBJECT_KIND_BY_FEED[feed];
  if (objectKind === undefined) throw new TypeError(`unknown mathematics journal feed: ${feed}`);
  return createSemanticRecordJournal({ root: settlementRoot(dataRoot), objectKind });
};

export function recordJournal(dataRoot, category, recordedAt, record) {
  return journal(dataRoot).record({
    category: categoryCoordinate(category), record, recordedAt,
    charge: { support: true, refutation: false },
  });
}

export function journalRecords(root, category) {
  return journalRecordsFromFeed(root, FEED, category);
}

export function journalRecordsFromFeed(root, feed, category) {
  return journal(root, feed).query({ category: categoryCoordinate(category) }).map(({ record }) => record);
}
