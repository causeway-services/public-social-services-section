import assert from "node:assert/strict";
import test from "node:test";

import { sourceOriginalityFindings } from "../dist/researching/writing/editing/source-originality.mjs";
import { newsroomSourceOriginalityFindings } from "../dist/management/newsroom-circuit.mjs";

const sourceUrl = "https://theconversation.example/geometry";
const source = "Wherever a Spanish player received the ball, two teammates appeared at different angles. The defender therefore had to choose which passing lane to close before the shape changed again.";

test("refuses lightly padded source prose even when the sentence is not byte-identical", () => {
  const draft = "Wherever a Spanish player received the ball against France, two teammates appeared at different angles, causing defenders to arrive too late.";
  const findings = sourceOriginalityFindings(draft, [{ sourceUrl, text: source }]);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].sourceUrl, sourceUrl);
});

test("permits independent reporting of the same facts", () => {
  const draft = "Spain repeatedly gave the ball carrier two outlets, leaving France to decide which route to concede.";
  assert.deepEqual(sourceOriginalityFindings(draft, [{ sourceUrl, text: source }]), []);
});

test("permits an explicitly marked quotation", () => {
  const draft = `The analyst wrote: “${source}”`;
  assert.deepEqual(sourceOriginalityFindings(draft, [{ sourceUrl, text: source }]), []);
});

test("the newsroom circuit gates the exact source packet before editorial inference", () => {
  const packet = {
    claims: [{ predicate: "summary", sourceUrl, object: source }],
  };
  const draft = "Wherever a Spanish player received the ball against France, two teammates appeared at different angles, causing defenders to arrive too late.";
  const findings = newsroomSourceOriginalityFindings(draft, packet);
  assert.equal(findings.length, 1);
  assert.equal(findings[0].sourceUrl, sourceUrl);
});
