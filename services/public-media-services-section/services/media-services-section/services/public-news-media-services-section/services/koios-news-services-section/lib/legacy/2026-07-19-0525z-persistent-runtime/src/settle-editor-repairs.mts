#!/usr/bin/env node
// settle-editor-repairs — apply source-exact, non-generative repairs selected
// from an accepted Editor report. This operation cannot invent prose: every
// inserted identity string must already occur in the witnessed source.

import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "./config.mjs";
import { koiosFarmProperty } from "./demand.mjs";
import { normalizeCandidateReferences } from "./researching/sourcing/source-cycle.mjs";
import { reviewManuscriptStandards } from "./researching/writing/editing/standards.mjs";

const SITE_ROOT = dirname(DEFAULT_CONTENT_PRODUCTION_CONFIG);
const SOURCE_PATH = join(SITE_ROOT, "store/decolonization/as-climate-and-conflict-collide-indigenous-leaders-confront-overlapping-crises-at-the-un.json");
const SOURCE_FORM = "Kohen Mattinas of Lac Seul First Nation and Constance Lake First Nation";
const BEFORE_FORM = "Kohen Mattinas, representing the nation at EMRIP";
const AFTER_FORM = `${SOURCE_FORM}, representing the nation at EMRIP`;
const BEFORE_TITLE = "Indigenous Leaders Confront the Collision of Climate and Extraction at the UN";
const AFTER_TITLE = "Indigenous Leaders Confront Climate, Conflict, and Extraction at the UN";
const BEFORE_LEDE = "The discussions reveal a pattern where environmental degradation and violent conflict do not merely coexist but actively reinforce one another, disproportionately impacting communities and peoples least responsible for the emissions driving the crisis.";
const AFTER_LEDE = "The discussions reveal a pattern where environmental degradation and violent conflict do not merely coexist but actively reinforce one another.";
const BEFORE_DIGITAL_GLOSS = "This framing applies the same FPIC standard that governs land and resource decisions to the digital domain: Indigenous communities must be able to consent to, or refuse, technologies that draw on their languages, cultural knowledge, or territorial data before those systems are built and deployed.";
const AFTER_DIGITAL_GLOSS = "That has led to a push for data sovereignty and stronger protections against technologies being developed without free, prior, and informed consent.";
const BEFORE_CLOSING = "leaving Indigenous peoples to absorb the initial and most severe damages of a destabilizing world.";
const AFTER_CLOSING = "leaving Indigenous peoples to absorb the most severe damages of a destabilizing world.";
const BEFORE_DIGITAL_DUPLICATE = "The session includes discussions on artificial intelligence and the push for data sovereignty, ensuring that technologies are not developed or deployed without free, prior, and informed consent. That has led to a push for data sovereignty and stronger protections against technologies being developed without free, prior, and informed consent.";
const AFTER_DIGITAL_DUPLICATE = "Artificial intelligence is among the session's emerging issues, and delegates are pushing for data sovereignty and stronger protections against technologies being developed without free, prior, and informed consent.";
const BEFORE_LEDE_PROXIMITY = "This meeting occurs nearly two decades after the adoption of the United Nations Declaration on the Rights of Indigenous Peoples, yet participants report that the rights the declaration promises remain under siege.";
const AFTER_LEDE_PROXIMITY = "Nearly two decades after UNDRIP's adoption, participants report that its promised rights remain under siege.";

function digest(value: string): string { return `sha256:${createHash("sha256").update(value).digest("hex")}`; }

const slug = process.argv[2];
if (slug === undefined || slug === "") throw new TypeError("usage: settle-editor-repairs <slug>");
const property = koiosFarmProperty();
const path = resolve(property.contentDir, `${slug}.md`);
const before = readFileSync(path, "utf8");
const source = readFileSync(SOURCE_PATH, "utf8");
if (!source.includes(SOURCE_FORM) || !source.includes(AFTER_DIGITAL_GLOSS)) throw new Error("witnessed source does not contain the proposed source-exact repair material");
const document = decodeFrontMatterDocument(before);
const specificityChanged = document.body.includes(BEFORE_FORM);
if (!specificityChanged && !document.body.includes(AFTER_FORM)) throw new Error("manuscript does not expose the exact bounded repair site or its settled form");
const body = specificityChanged ? document.body.replace(BEFORE_FORM, AFTER_FORM) : document.body;
const title = String(document.frontMatter["title"] ?? "");
const headlineChanged = title === BEFORE_TITLE;
if (!headlineChanged && title !== AFTER_TITLE) throw new Error("manuscript headline is neither the bounded repair site nor its settled form");
const ledeChanged = body.includes(BEFORE_LEDE);
if (!ledeChanged && !body.includes(AFTER_LEDE)) throw new Error("manuscript lede is neither the bounded repair site nor its settled form");
const ledeBody = ledeChanged ? body.replace(BEFORE_LEDE, AFTER_LEDE) : body;
const digitalGlossChanged = ledeBody.includes(BEFORE_DIGITAL_GLOSS);
if (!digitalGlossChanged && !ledeBody.includes(AFTER_DIGITAL_GLOSS) && !ledeBody.includes(AFTER_DIGITAL_DUPLICATE)) throw new Error("manuscript does not expose the current source-exact digital-sovereignty repair site or its settled form");
const digitalBody = digitalGlossChanged ? ledeBody.replace(BEFORE_DIGITAL_GLOSS, AFTER_DIGITAL_GLOSS) : ledeBody;
const closingChanged = digitalBody.includes(BEFORE_CLOSING);
if (!closingChanged && !digitalBody.includes(AFTER_CLOSING)) throw new Error("manuscript does not expose the current bounded closing repair site or its settled form");
const closingBody = closingChanged ? digitalBody.replace(BEFORE_CLOSING, AFTER_CLOSING) : digitalBody;
const digitalDuplicateChanged = closingBody.includes(BEFORE_DIGITAL_DUPLICATE);
if (!digitalDuplicateChanged && !closingBody.includes(AFTER_DIGITAL_DUPLICATE)) throw new Error("manuscript does not expose the current bounded digital-sovereignty deduplication site or its settled form");
const deduplicatedBody = digitalDuplicateChanged ? closingBody.replace(BEFORE_DIGITAL_DUPLICATE, AFTER_DIGITAL_DUPLICATE) : closingBody;
const ledeProximityChanged = deduplicatedBody.includes(BEFORE_LEDE_PROXIMITY);
if (!ledeProximityChanged && !deduplicatedBody.includes(AFTER_LEDE_PROXIMITY)) throw new Error("manuscript does not expose the current bounded lede-proximity repair site or its settled form");
const nextBody = ledeProximityChanged ? deduplicatedBody.replace(BEFORE_LEDE_PROXIMITY, AFTER_LEDE_PROXIMITY) : deduplicatedBody;
if (specificityChanged || headlineChanged || ledeChanged || digitalGlossChanged || closingChanged || digitalDuplicateChanged || ledeProximityChanged) writeFileSync(path, encodeFrontMatterDocument({
  ...document,
  frontMatter: Object.freeze({ ...document.frontMatter, title: AFTER_TITLE }),
  body: nextBody,
}), "utf8");
const referenceRepair = normalizeCandidateReferences(path);
const after = readFileSync(path, "utf8");
const standards = reviewManuscriptStandards(resolve(property.contentDir), slug);
const now = new Date().toISOString(); const day = now.slice(0, 10); const [year, month, date] = day.split("-");
const record = Object.freeze({
  kind: "koios.editor-source-exact-repair", at: now, slug,
  source: Object.freeze({ path: SOURCE_PATH, digest: digest(source) }),
  operations: Object.freeze([
    Object.freeze({ kind: "source-exact-specificity", before: BEFORE_FORM, after: AFTER_FORM, changed: specificityChanged }),
    Object.freeze({ kind: "editor-selected-headline-fidelity", before: BEFORE_TITLE, after: AFTER_TITLE, changed: headlineChanged }),
    Object.freeze({ kind: "editor-selected-unsupported-claim-removal", before: BEFORE_LEDE, after: AFTER_LEDE, changed: ledeChanged }),
    Object.freeze({ kind: "source-exact-policy-gloss-removal", before: BEFORE_DIGITAL_GLOSS, after: AFTER_DIGITAL_GLOSS, changed: digitalGlossChanged }),
    Object.freeze({ kind: "editor-selected-temporal-overclaim-removal", before: BEFORE_CLOSING, after: AFTER_CLOSING, changed: closingChanged }),
    Object.freeze({ kind: "editor-selected-near-duplicate-contraction", before: BEFORE_DIGITAL_DUPLICATE, after: AFTER_DIGITAL_DUPLICATE, changed: digitalDuplicateChanged }),
    Object.freeze({ kind: "editor-selected-lede-proximity-contraction", before: BEFORE_LEDE_PROXIMITY, after: AFTER_LEDE_PROXIMITY, changed: ledeProximityChanged }),
    Object.freeze({ kind: "wire-title-reference-normalization", changed: referenceRepair.changed }),
  ]),
  before: Object.freeze({ path, digest: digest(before) }),
  after: Object.freeze({ path, digest: digest(after), standards }),
});
const logPath = join(resolve(property.dataDir), "records", "editor-repairs", year!, month!, date!, `${day}-koios-news-editor-repairs.jsonl`);
mkdirSync(dirname(logPath), { recursive: true }); appendFileSync(logPath, `${JSON.stringify(record)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
