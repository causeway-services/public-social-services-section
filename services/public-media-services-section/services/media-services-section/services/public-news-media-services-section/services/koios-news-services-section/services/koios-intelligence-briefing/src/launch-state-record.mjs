import { resolve } from "node:path";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";

const OBJECT_KIND = "koios-news.intelligence-briefing.launch-state.record";
const CATEGORY = "koios-intelligence-briefing.launch-state";

/**
 * Opens this package's semantic record journal, rooted beneath `data/records/`.
 * @param {string} dataRoot Absolute path to this package's `data/` directory.
 * @returns {ReturnType<typeof createSemanticRecordJournal>} The opened journal.
 * @throws {TypeError} When `dataRoot` is not a non-empty string.
 */
function journal(dataRoot) {
  if (typeof dataRoot !== "string" || dataRoot.length === 0) {
    throw new TypeError("koios intelligence briefing launch-state journal requires its data root");
  }
  return createSemanticRecordJournal({
    root: resolve(dataRoot, "records", "journal"),
    objectKind: OBJECT_KIND,
  });
}

/**
 * Records one dated koios-intelligence-briefing product-line launch-state
 * snapshot: the measured claim-store topic distribution, the pricing
 * rationale, the funnel, and the explicit not-yet-solicited fence.
 * @param {{dataRoot: string, recordedAt: string, record: object}} input
 *   `dataRoot` is this package's `data/` directory; `recordedAt` is an
 *   ISO-8601 timestamp; `record` is the plain JSON-serializable launch-state
 *   payload.
 * @returns {{id: string, objectKind: string, appended: boolean, appended: boolean, charge: {support: boolean, refutation: boolean}}}
 *   The journal's append receipt.
 */
export function recordLaunchState({ dataRoot, recordedAt, record }) {
  return journal(dataRoot).record({
    category: CATEGORY,
    recordedAt,
    record,
    charge: { support: true, refutation: false },
  });
}

/**
 * Queries every recorded koios-intelligence-briefing launch-state snapshot.
 * @param {{dataRoot: string}} input `dataRoot` is this package's `data/`
 *   directory.
 * @returns {object[]} Every recorded launch-state payload, oldest first.
 */
export function queryLaunchStates({ dataRoot }) {
  return journal(dataRoot)
    .query({ category: CATEGORY })
    .map((entry) => entry.record);
}
