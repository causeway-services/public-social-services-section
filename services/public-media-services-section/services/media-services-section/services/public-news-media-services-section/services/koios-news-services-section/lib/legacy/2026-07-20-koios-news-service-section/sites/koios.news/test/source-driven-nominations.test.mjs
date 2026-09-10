import assert from "node:assert/strict";
import test from "node:test";

import { isReportableSourceNomination } from "../dist/researching/sourcing/discovery.mjs";

test("source-driven nominations refuse aggregate pages before spending inference", () => {
  assert.equal(isReportableSourceNomination(
    "Edward Church, Peter Hujar, Looted Art",
    "Editor's note. Read More News item. Read More Review item. Read More Feature item.",
  ), false);
  assert.equal(isReportableSourceNomination("Required Reading", "A weekly selection of links."), false);
  assert.equal(isReportableSourceNomination("The best recent crime and thrillers – review roundup", "Several reviews."), false);
});

test("source-driven nominations retain a substantive single story", () => {
  assert.equal(isReportableSourceNomination(
    "A Living Memorial to Palestinian Activist Alex Odeh Takes Flight",
    "A public artwork traces the history, makers, location, and contested memory of one memorial.",
  ), true);
});
