#!/usr/bin/env node
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  enrichPacketWithExcerpts,
  lintDraft,
  packetFromBrief,
  postMarkdown,
  postsDir,
  slugify,
  synthesizeArticleBody,
  todayIsoDate,
  titleForTerm,
  words,
} from "../../lib/koios-workshop.mjs";

const MAX_SYNTHESIS_ATTEMPTS = 8;

const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const briefPath = cliArgs[0];

if (briefPath === undefined || briefPath === "--help" || briefPath === "-h") {
  console.error("usage: pnpm run new-post -- working/researching/library/<brief>.md");
  process.exit(briefPath === undefined ? 2 : 0);
}

const packet = packetFromBrief(briefPath);
if (packet.charge === "absurd") {
  console.error(`refusing to write from a brief with charge "absurd" (no evidenced sources): ${briefPath}`);
  process.exit(1);
}

const term = packet.seo_term;
const beat = packet.beat ?? "news";
const title = titleForTerm(term);
const slug = slugify(title);
const file = resolve(postsDir, `${slug}.md`);

if (existsSync(file)) {
  console.error(`refusing to overwrite ${file}`);
  process.exit(1);
}

const frontmatter = {
  title,
  date: todayIsoDate(),
  draft: true,
  slug,
  description: descriptionFor(packet),
  summary: summaryFor(packet),
  keywords: [term],
  categories: [categoryFor(beat)],
  tags: tagsFor(packet),
  koios: {
    seo_term: term,
    beat,
    tweet: tweetFor(packet),
    gates_clear: false,
  },
  references: packet.primary_sources.map((source) => ({
    id: source.id,
    type: source.type,
    title: source.title,
    URL: source.URL,
    "container-title": source["container-title"],
    issued: source.issued,
  })),
  license: "CC BY 4.0",
  license_url: "https://creativecommons.org/licenses/by/4.0/",
  syndication_rights: "Licensed under Creative Commons Attribution 4.0 International; Koios.News permits indexing, snippets, large image previews, feed distribution, Google Search/News/Discover surfaces, and other attributed downstream syndication.",
};

const enrichedPacket = await enrichPacketWithExcerpts(packet);
const body = await synthesizeUntilItPasses(enrichedPacket, title, frontmatter);

mkdirSync(postsDir, { recursive: true });
writeFileSync(file, postMarkdown(frontmatter, body));
console.log(file);
console.log(`draft=true words=${words(body).length} seo_term=${JSON.stringify(term)}`);

// Generate, then check against the SAME gate lint-post.mjs enforces, before ever writing to
// disk. On failure, the specific gate failures are fed back to the model as the next attempt's
// instructions. This is the difference between "a script that produces something shaped like an
// article" and one that produces something that actually clears the bar — mechanically checked,
// not hoped for.
async function synthesizeUntilItPasses(packet, title, frontmatter) {
  let feedback = [];
  for (let attempt = 1; attempt <= MAX_SYNTHESIS_ATTEMPTS; attempt += 1) {
    const body = await synthesizeArticleBody(packet, title, { feedback });
    const { failures } = lintDraft(frontmatter, body);
    if (failures.length === 0) {
      if (attempt > 1) console.error(`synthesis passed the gate on attempt ${attempt}`);
      return body;
    }
    console.error(`synthesis attempt ${attempt}/${MAX_SYNTHESIS_ATTEMPTS} failed the gate:`);
    for (const failure of failures) console.error(`  - ${failure}`);
    feedback = failures;
  }
  throw new Error(`gave up after ${MAX_SYNTHESIS_ATTEMPTS} synthesis attempts for ${JSON.stringify(packet.seo_term)}; last failures:\n${feedback.map((line) => `  - ${line}`).join("\n")}`);
}

function categoryFor(beat) {
  return String(beat).split(/[^a-z0-9]+/iu).filter(Boolean)
    .map((part) => `${part.slice(0, 1).toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join(" ") || "News";
}

function tagsFor(packet) {
  return [
    packet.seo_term,
    packet.beat ?? "news",
    "climate breakdown",
    "collapse",
  ];
}

function descriptionFor(packet) {
  const lead = packet.primary_sources[0];
  const base = lead === undefined ? packet.seo_term : `${packet.seo_term}: ${lead.summary}`;
  return base.slice(0, 155);
}

function summaryFor(packet) {
  const sourceTitle = packet.primary_sources[0]?.title ?? "today's wire sources";
  return `${packet.seo_term} is not an isolated headline. The desk packet around ${sourceTitle} points to a wider collapse pattern: public systems are being asked to absorb climate, capital, and infrastructure stress at the same time.`;
}

function tweetFor(packet) {
  return `${packet.seo_term} is a window onto collapse as infrastructure stress, not a one-off headline.`;
}
