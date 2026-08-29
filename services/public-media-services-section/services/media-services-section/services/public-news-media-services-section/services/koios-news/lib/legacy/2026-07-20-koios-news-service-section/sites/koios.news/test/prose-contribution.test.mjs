import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalizeSourceUrls,
  proseContributionBody,
  summaryFromProse,
} from "../dist/researching/writing/prose-contribution.mjs";
import { capitalizeIndigenousInProse } from "../dist/researching/writing/editing/standards.mjs";

const SOURCE = "https://example.test/report";

test("settles prose from the real failed labeled carrier without requiring its labels", () => {
  const raw = `**A model-shaped headline**

DESCRIPTION: A description the model was never authorized to settle.
SUMMARY: A summary the model was never authorized to settle.
TAGS: model, output
BODY:
[The source report](${SOURCE}) records that twelve communities received evacuation orders after the fire crossed two roads. Officials said all residents were accounted for by Friday morning. The report names the affected settlements and gives the time of each order.

## The response

Emergency crews opened three reception centers while local leaders assessed damage to homes and public buildings. The source says the next assessment remains pending. That unresolved assessment, rather than an invented prediction, closes the reported account.`;
  const body = proseContributionBody(raw);
  assert.ok(body.startsWith(`[The source report](${SOURCE})`));
  assert.ok(!body.includes("DESCRIPTION:"));
  assert.ok(!body.includes("TAGS:"));
  const summary = summaryFromProse(body);
  const wordCount = summary.split(/\s+/u).length;
  assert.ok(wordCount >= 40 && wordCount <= 70);
});

test("canonicalizes model-mutated source URL casing to the admitted identifier", () => {
  const mutated = "[Source](https://example.test/Report)";
  assert.equal(canonicalizeSourceUrls(mutated, [SOURCE]), `[Source](${SOURCE})`);
});

test("capitalizes Indigenous in prose without mutating a source identifier", () => {
  const markdown = "An indigenous community is [reported](https://example.test/indigenous/report).";
  assert.equal(capitalizeIndigenousInProse(markdown), "An Indigenous community is [reported](https://example.test/indigenous/report).");
});

test("accepts an unlabeled Markdown body as the native contribution", () => {
  const body = proseContributionBody(`The [source](${SOURCE}) reports one witnessed event.\n\n## Development\n\nA second paragraph advances it.`);
  assert.match(body, /^The \[source\]/u);
});
