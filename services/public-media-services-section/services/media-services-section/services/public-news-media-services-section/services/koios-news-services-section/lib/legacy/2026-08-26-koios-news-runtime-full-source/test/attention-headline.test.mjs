import assert from "node:assert/strict";
import test from "node:test";

import { selectAccountableHeadline } from "../dist/researching/writing/attention-headline.mjs";

const body = "Rent credit applications close Friday. The housing office says eligible tenants need proof of income. Read the filing notice at https://example.test/rent-credit.";

test("an attractive headline is selected only when the exact body discharges its promise", () => {
  const result = selectAccountableHeadline({
    raw: "Rent Credit Applications Close Friday—Here’s Who Qualifies",
    fallback: "Rent credit applications close Friday",
    assignmentTerm: "rent credit deadline",
    body,
    sourceUrls: ["https://example.test/rent-credit"],
  });
  assert.equal(result.accepted, true);
  assert.equal(result.selected, "Rent Credit Applications Close Friday—Here’s Who Qualifies");
});

test("empty curiosity and certainty inflation are refused rather than admitted as headlines", () => {
  for (const raw of ["You Won’t Believe What Happens Next With Rent Credit", "Rent Credit Will Certainly Save Every Tenant"]) {
    const result = selectAccountableHeadline({ raw, fallback: "Rent credit applications close Friday", assignmentTerm: "rent credit deadline", body, sourceUrls: ["https://example.test/rent-credit"] });
    assert.equal(result.accepted, false);
    assert.equal(result.selected, result.fallback);
    assert.ok(result.findings.length > 0);
  }
});

test("a model cannot launder the upstream source headline into Koios publication copy", () => {
  const result = selectAccountableHeadline({
    raw: "Rent credit applications close Friday",
    fallback: "Rent credit applications close Friday",
    assignmentTerm: "rent credit deadline",
    body,
    sourceUrls: ["https://example.test/rent-credit"],
  });
  assert.equal(result.accepted, false);
  assert.ok(result.findings.includes("headline copies the upstream source title"));
});
