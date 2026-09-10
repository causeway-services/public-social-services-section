import assert from "node:assert/strict";
import test from "node:test";

import {
  canonicalizeSourceUrls,
  composeNewsroomProse,
  descriptionFromProse,
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
  const sentenceCount = summary.match(/[.!?]+(?:["'”’)]*)/gu)?.length ?? 0;
  assert.ok(sentenceCount >= 3 && sentenceCount <= 4);
  assert.ok(wordCount >= 35 && wordCount <= 90);
});

test("canonicalizes model-mutated source URL casing to the admitted identifier", () => {
  const mutated = "[Source](https://example.test/Report)";
  assert.equal(canonicalizeSourceUrls(mutated, [SOURCE]), `[Source](${SOURCE})`);
});

test("projects standalone event, numeric detail, and analytical frame metadata from the lede", () => {
  const body = `Spain face Argentina at MetLife Stadium, per [Geometry, football and the World Cup final](${SOURCE}). Both sides arrive unbeaten after seven matches. Attacking flair could shape the contest. The tactical question is whether Argentina can disrupt Spain's control of where space appears.\n\n## Forcing choices\n\nThe analysis continues.`;
  assert.equal(summaryFromProse(body), "Spain face Argentina at MetLife Stadium. Both sides arrive unbeaten after seven matches. The tactical question is whether Argentina can disrupt Spain's control of where space appears.");
});

test("metadata projection does not split newsroom abbreviations into broken sentences", () => {
  const body = `Public-health reports estimate thousands of deaths during Europe's June heatwave. Dr. Christopher Callahan of Indiana University and Prof. Andrew Dessler of Texas A&M University estimated more than 2,700 deaths in France across 17 days. Different official methods produce different totals because they measure distinct relationships between temperature and mortality. The result is a set of estimates that must be read with their method and time window attached.\n\n## Counting methods\n\nThe reported analysis continues.`;
  const summary = summaryFromProse(body);
  assert.doesNotMatch(summary, /Prof\.\s*$/u);
  assert.match(summary, /Dr\. Christopher Callahan/u);
  assert.match(summary, /Prof\. Andrew Dessler/u);
});

test("metadata projection preserves decimal figures and dotted newsroom abbreviations", () => {
  const body = `Christopher Nolan's latest film opened with $264.1 million worldwide, setting a new global debut benchmark for the director according to the studio's Sunday estimate. The Global B.O. Sunday Update also reports $124.5 million in North America and $139.6 million internationally. Premium-format admissions supplied a material share of the opening while the film faced no immediate new-release competition. The next weekend will show how much of that audience returns after the initial event demand.\n\n## Opening weekend\n\nThe reported analysis continues.`;
  const summary = summaryFromProse(body);
  assert.match(summary, /\$264\.1 million/u);
  assert.match(summary, /Global B\.O\. Sunday Update/u);
  assert.doesNotMatch(summary, /\$264\.\s+1/u);
  assert.doesNotMatch(summary, /\$264\.\s+O\./u);
  const description = descriptionFromProse(body);
  assert.doesNotMatch(description, /\$264\.$/u);
});

test("metadata projection does not ingest source headlines or section headings", () => {
  const body = `Christopher Nolan's latest film opened with $264.1 million worldwide, according to [The Odyssey Becomes Christopher Nolan's Biggest Global Debut With a Record-Shattering Worldwide Total](${SOURCE}). Premium-format screens supplied a material share of the opening, while [Sunday Box Office Analysis Explains How the Director Reached a New Career Benchmark Across International Markets](https://example.test/second-report) records the domestic and international split. The release arrived without immediate new-release competition, which concentrates the next analytical question on audience retention. The second weekend will show how much of the opening represented durable demand rather than event attendance.\n\n## Production Scale and IMAX Filmmaking\n\nThe production used large-format cameras throughout principal photography.`;
  const summary = summaryFromProse(body);
  const summaryWords = summary.split(/\s+/u).length;
  assert.ok(summaryWords >= 40 && summaryWords <= 70);
  assert.match(summary, /\$264\.1 million/u);
  assert.doesNotMatch(summary, /Odyssey Becomes Christopher Nolan/u);
  assert.doesNotMatch(summary, /Sunday Box Office Analysis/u);
  assert.doesNotMatch(summary, /Production Scale/u);
  assert.doesNotMatch(summary, /principal photography/u);
  assert.doesNotMatch(summary, /the source/u);
  assert.doesNotMatch(summary, /according to[.!?]/u);
  const description = descriptionFromProse(body);
  assert.doesNotMatch(description, /Odyssey Becomes Christopher Nolan/u);
  assert.doesNotMatch(description, /Production Scale/u);
  assert.doesNotMatch(description, /the source/u);
});

test("source-coverage citations stay grammatical but do not become audience-facing metadata", () => {
  const body = `A bronze dove is traveling between homes after leaving a public monument with permission. The bird belongs to a memorial for Alex Odeh, a Palestinian-American poet and civil-rights organizer assassinated in 1985. The project's history and current visits are covered in Hyperallergic's [A Living Memorial to Palestinian Activist Alex Odeh Takes Flight](${SOURCE}). The original bird moves among temporary hosts while each host keeps a replica after the next transfer. Organizers hope the route will eventually carry it to Odeh's birthplace.\n\n## Why it travels\n\nThe reporting continues.`;
  const summary = summaryFromProse(body);
  assert.doesNotMatch(summary, /Hyperallergic/u);
  assert.doesNotMatch(summary, /Hyperallergic's\./u);
  assert.doesNotMatch(summary, /A Living Memorial to Palestinian Activist/u);
  assert.match(summary, /temporary hosts|Odeh's birthplace/u);
});

test("projects gate-sized metadata from complete admitted sentences without another inference job", () => {
  const body = `Spain face Argentina at MetLife Stadium in New Jersey on Sunday in the FIFA World Cup final. Both sides arrive unbeaten after seven matches and Spain defeated France 2-0 in the semi-final. Passing triangles let Spain constrain defensive choices by shaping where the next usable space appears. Argentina's compact defensive structure presents a different tactical test from the one France posed. The final therefore asks whether rapid geometric reconfiguration can keep producing an advantage against an opponent prepared to deny it.\n\n## Match geometry\n\nThe reported analysis continues.`;
  const summary = summaryFromProse(body);
  assert.ok(summary.split(/\s+/u).length >= 40 && summary.split(/\s+/u).length <= 70);
  assert.ok((summary.match(/[.!?]+(?:["'”’)]*)/gu) ?? []).length >= 3);
  const description = descriptionFromProse(body);
  assert.ok(description.length >= 100 && description.length <= 150);
  assert.ok(body.includes(description.replace(/…$/u, "")));
});

test("metadata surfaces advertise the lede and its nut rather than a later procedural detail", () => {
  const body = `Wildfire smoke has made air quality uncertain ahead of Sunday's cup final at an open-air stadium outside New York City. Large parts of the eastern United States have faced smoke from Canadian wildfires throughout the week. The tournament organizer has not published an air-quality contingency policy for the match.\n\n## Response\n\nNeither the organizer nor city health officials responded to the source outlet's request for comment.`;
  const description = descriptionFromProse(body);
  const summary = summaryFromProse(body);
  assert.match(description, /^Wildfire smoke has made air quality uncertain/u);
  assert.doesNotMatch(description, /request for comment/u);
  assert.match(summary, /has not published an air-quality contingency policy/u);
  assert.doesNotMatch(summary, /request for comment/u);
});

test("strips repair-cycle narration before admitting a prose contribution", () => {
  const body = proseContributionBody(`The Editor report identifies no body copy defects. The body is returned byte-for-byte.\n\nSpain face Argentina in the [final](${SOURCE}).\n\n## Tactics\n\nThe analysis continues.`);
  assert.match(body, /^Spain face Argentina/u);
  assert.doesNotMatch(body, /Editor report/u);
});

test("capitalizes Indigenous in prose without mutating a source identifier", () => {
  const markdown = "An indigenous community is [reported](https://example.test/indigenous/report).";
  assert.equal(capitalizeIndigenousInProse(markdown), "An Indigenous community is [reported](https://example.test/indigenous/report).");
});

test("accepts an unlabeled Markdown body as the native contribution", () => {
  const body = proseContributionBody(`The [source](${SOURCE}) reports one witnessed event.\n\n## Development\n\nA second paragraph advances it.`);
  assert.match(body, /^The \[source\]/u);
});

test("treats a long assignment term as a planning label rather than reusable source prose", async () => {
  let prompt = "";
  await composeNewsroomProse({
    voice: { persona: ["reporter"], laws: [] },
    term: "What we've learned about Yaxel Lendeborg from Warriors Summer League",
    story: { title: "Reporting source 1", url: SOURCE },
    context: [],
    intakeTitles: [],
    ask: async (value) => {
      prompt = value;
      return `[The report](${SOURCE}) describes the player’s summer development in Golden State’s program.\n\n## What changed\n\nThe evidence remains bounded to the admitted report.`;
    },
  });
  assert.match(prompt, /internal planning label/u);
  assert.match(prompt, /Do not reproduce that multiword label verbatim/u);
});
