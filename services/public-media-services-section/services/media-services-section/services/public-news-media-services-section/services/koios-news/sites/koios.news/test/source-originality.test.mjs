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

test("permits an attributed rigid market enumeration without waiving copied narrative syntax", () => {
  const marketSource = "According to Deadline, The Odyssey has become Nolan’s biggest opening weekend in France, Italy, Spain, Poland, the Netherlands, and Brazil.";
  const marketDraft = "Citing Deadline data, WinterIsComing reported that the film set the director's highest-ever opening weekend in France, Italy, Spain, Poland, the Netherlands, and Brazil.";
  assert.deepEqual(sourceOriginalityFindings(marketDraft, [{ sourceUrl, text: marketSource }]), []);
  const copiedNarrative = "According to the analyst, wherever a Spanish player received the ball, two teammates appeared at different angles, causing defenders to arrive too late.";
  assert.equal(sourceOriginalityFindings(copiedNarrative, [{ sourceUrl, text: source }]).length, 1);
});

test("permits an attributed rigid list of contacted organizations", () => {
  const contactSource = "I contacted The New York Times, The Washington Post, the BBC, ProPublica, and so many more, requesting help.";
  const contactDraft = "Kuszmar writes that he contacted The New York Times, The Washington Post, the BBC, ProPublica, and numerous other outlets.";
  assert.deepEqual(sourceOriginalityFindings(contactDraft, [{ sourceUrl, text: contactSource }]), []);
});

test("permits attributed institutional and place names without waiving copied narrative", () => {
  const institutionSource = "In the early 1980s, he became the West Coast regional director of the American-Arab Anti-Discrimination Committee (ADC), a civil rights organization dedicated to fighting anti-Arab stereotypes, discrimination, and hate crimes.";
  const institutionDraft = "By the early 1980s he was serving as the West Coast regional director of the American-Arab Anti-Discrimination Committee (ADC), an organization challenging hate crimes, Hyperallergic reports.";
  assert.deepEqual(sourceOriginalityFindings(institutionDraft, [{ sourceUrl, text: institutionSource }]), []);

  const placeSource = "Artist Jon Rubin first encountered the statue in spring 2023, during his residency at the Grand Central Art Center in Santa Ana.";
  const placeDraft = "Rubin found the monument while completing a residency at the Grand Central Art Center in Santa Ana, according to Hyperallergic.";
  assert.deepEqual(sourceOriginalityFindings(placeDraft, [{ sourceUrl, text: placeSource }]), []);

  const copiedNarrative = "According to the analyst, wherever a Spanish player received the ball, two teammates appeared at different angles, causing defenders to arrive too late.";
  assert.equal(sourceOriginalityFindings(copiedNarrative, [{ sourceUrl, text: source }]).length, 1);
});

test("permits an explicitly marked quotation", () => {
  const draft = `The analyst wrote: “${source}”`;
  assert.deepEqual(sourceOriginalityFindings(draft, [{ sourceUrl, text: source }]), []);
});

test("permits rigid quotation attribution and a source-credited contact attempt", () => {
  const grist = "https://grist.org/extreme-weather/world-cup-smoke/";
  const contact = "Neither FIFA nor New York City Department of Health officials immediately responded to Grist’s request for comment.";
  const person = "Courtney Howard, an emergency room physician and Global Climate and Health Alliance official, told the Associated Press.";
  const watanabe = "said Nicholas Watanabe, a professor of sport and entertainment management at the University of South Carolina.";
  const watanabeSource = "It may get lucky again, says Nicholas Watanabe, a professor of sport and entertainment management at the University of South Carolina, but that does not excuse being unprepared.";
  assert.deepEqual(sourceOriginalityFindings(contact, [{ sourceUrl: grist, text: contact }]), []);
  assert.deepEqual(sourceOriginalityFindings(contact.replace("for comment", "for further comment"), [{ sourceUrl: grist, text: contact }]), []);
  assert.deepEqual(sourceOriginalityFindings("When Grist sought comment, neither FIFA nor city health officials responded.", [{ sourceUrl: grist, text: contact }]), []);
  assert.deepEqual(sourceOriginalityFindings("When Grist sought comment, neither FIFA nor New York City Department of Health officials responded.", [{ sourceUrl: grist, text: contact }]), []);
  assert.deepEqual(sourceOriginalityFindings(person, [{ sourceUrl: grist, text: person }]), []);
  assert.deepEqual(sourceOriginalityFindings(watanabe, [{ sourceUrl: grist, text: watanabeSource }]), []);
  const laundering = `Grist reported that ${source}`;
  assert.ok(sourceOriginalityFindings(laundering, [{ sourceUrl: grist, text: source }]).length > 0);
});

test("permits a short visibly marked direct quotation", () => {
  const quotation = '“I would change the whole calendar,” he said earlier this month.';
  const sourceSentence = '“I would change the whole calendar,” said the race leader earlier this month.';
  assert.deepEqual(sourceOriginalityFindings(quotation, [{ sourceUrl, text: sourceSentence }]), []);
});

test("does not treat an exact source-title citation as copied narrative", () => {
  const articleTitle = "A Living Memorial to Palestinian Activist Alex Odeh Takes Flight";
  const articleUrl = "https://hyperallergic.example/alex-odeh";
  const sourceText = `Feature ${articleTitle} is a participatory project that turns a decades-old monument into an artwork to keep a civil rights leader's memory alive.`;
  const draft = `The project's history is covered in Hyperallergic's [${articleTitle}](${articleUrl}).`;
  assert.deepEqual(sourceOriginalityFindings(draft, [{ sourceUrl: articleUrl, text: sourceText }]), []);
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
