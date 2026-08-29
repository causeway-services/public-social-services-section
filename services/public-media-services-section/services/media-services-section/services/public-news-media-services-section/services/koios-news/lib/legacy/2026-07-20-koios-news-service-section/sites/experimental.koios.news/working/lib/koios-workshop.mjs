import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import {
  chargeValueName,
  mark,
  valueOf,
} from "@emsenn/metroplat";
import { parseMarkdown } from "@emsenn/metroplat/projections";
import { knowledgeAggregate, witnessedPotential } from "@emsenn/metroplat/calculus/predicating/positing";

const here = dirname(fileURLToPath(import.meta.url));
export const packageRoot = resolve(here, "..", "..");
export const postsDir = resolve(packageRoot, "content", "posts");
export const briefLibraryDir = resolve(packageRoot, "working", "researching", "library");

export const workshopPrimitives = Object.freeze([
  "@emsenn/metroplat/calculus/predicating/positing.charge",
  "@emsenn/metroplat/calculus/predicating/positing.chargeValue",
  "@emsenn/metroplat/calculus/predicating/positing.valueOf",
  "@emsenn/metroplat/articulation.mark",
  "@emsenn/metroplat/projections.parseMarkdown",
  "@emsenn/metroplat/codecs/text/markdown/vault via loadPosts",
  "@emsenn/metroplat/services/filesystem-store via projectDeskQueue",
  "@emsenn/metroplat/codecs/text/json/jsonl/eavt via projectDeskQueue",
]);

export function todayIsoDate(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/gu, "")
    .toLowerCase()
    .replace(/['"]/gu, "")
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-+|-+$/gu, "")
    .slice(0, 120) || "item";
}

export function normalizeTerm(value) {
  return String(value).trim().toLowerCase().replace(/\s+/gu, " ");
}

function text(value) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function record(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function stripHtml(value) {
  return String(value ?? "")
    .replace(/<script[\s\S]*?<\/script>/giu, " ")
    .replace(/<style[\s\S]*?<\/style>/giu, " ")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&nbsp;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&quot;/gu, '"')
    .replace(/&#39;/gu, "'")
    .replace(/\s+/gu, " ")
    .trim();
}

function hashId(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 10);
}

function walkFiles(dir, suffix) {
  const files = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const path = resolve(dir, entry);
    const stats = statSync(path);
    if (stats.isDirectory()) files.push(...walkFiles(path, suffix));
    else if (stats.isFile() && path.endsWith(suffix)) files.push(path);
  }
  return files.sort();
}

export async function koiosApi() {
  const dist = resolve(packageRoot, "dist", "index.mjs");
  if (!existsSync(dist)) {
    throw new Error("sites/koios.news/dist/index.mjs is missing; run `pnpm --filter @emsenn/koios.news build` first.");
  }
  return import(pathToFileURL(dist).href);
}

export async function openDeskQueue() {
  const api = await koiosApi();
  const queue = await api.projectDeskQueue(resolve(packageRoot, "data"));
  return queue.open;
}

export async function findDeskWorkItem(selector) {
  const wanted = normalizeTerm(selector);
  const slug = slugify(selector);
  const items = await openDeskQueue();
  return items.find((item) =>
    normalizeTerm(item.title) === wanted ||
    normalizeTerm(item.demand?.term ?? "") === wanted ||
    item.slug === slug ||
    item.identity === selector) ?? null;
}

function bundleFromStateEntry(entry) {
  const attrs = record(entry);
  const bundle = record(attrs["koios.news.cable.bundle"]);
  if (bundle.kind !== "koios.news.cable.claim-state-bundle") return null;
  const article = record(bundle.article);
  const item = record(bundle.item);
  const provenance = record(bundle.provenance);
  const title = text(article.title) ?? text(item.title);
  const url = text(article.url) ?? text(item.url) ?? text(provenance.itemUrl);
  if (title === undefined || url === undefined) return null;
  return Object.freeze({
    entity: text(bundle.entity) ?? "",
    wire: text(bundle.wire) ?? text(article.section) ?? "",
    fingerprint: text(bundle.fingerprint) ?? "",
    title,
    author: text(article.author) ?? text(item.author) ?? "Unknown",
    url,
    sourceUrl: text(provenance.sourceUrl) ?? "",
    published: text(article.date) ?? text(item.published) ?? "",
    summary: stripHtml(text(item.summary) ?? text(article.summary) ?? ""),
    section: text(article.section) ?? text(bundle.wire) ?? "",
    keywords: Array.isArray(article.keywords) ? article.keywords.filter((value) => typeof value === "string") : [],
    tags: Array.isArray(article.tags) ? article.tags.filter((value) => typeof value === "string") : [],
  });
}

export function readWireBundles() {
  const files = walkFiles(resolve(packageRoot, "store"), ".json");
  const byUrl = new Map();
  for (const file of files) {
    let parsed;
    try {
      parsed = JSON.parse(readFileSync(file, "utf8"));
    } catch {
      continue;
    }
    for (const value of Object.values(record(parsed))) {
      const bundle = bundleFromStateEntry(value);
      if (bundle !== null && !byUrl.has(bundle.url)) byUrl.set(bundle.url, bundle);
    }
  }
  return Object.freeze([...byUrl.values()]);
}

function tokensFor(value) {
  return new Set(normalizeTerm(value).split(/[^a-z0-9]+/u).filter((token) => token.length > 2));
}

function sourceScore(workItem, bundle) {
  const term = workItem.demand?.term ?? workItem.title;
  const termTokens = [...tokensFor(term)];
  // Bounded fields only. bundle.summary is sometimes a short RSS excerpt and sometimes an
  // entire scraped article body (thousands of words) — at that length it contains most common
  // tokens by chance regardless of topic, which silently defeats any coverage threshold. Title,
  // keywords, and tags are curated and short, so a match against them is real signal.
  const haystack = normalizeTerm([
    bundle.title,
    bundle.keywords.join(" "),
    bundle.tags.join(" "),
  ].join(" "));
  const matchedTokens = termTokens.filter((token) => haystack.includes(token));
  const isLeadSource = workItem.wire?.url === bundle.url;
  // A single incidentally-shared word (e.g. "climate" in both "climate reparations" and an
  // unrelated heatwave story) is not evidence the source is ABOUT this term, and neither is
  // merely sharing a beat/section with hundreds of other unrelated wire items in that category.
  // Require a strict majority of the term's distinctive tokens — or being the work item's own
  // lead source — before crediting a source as relevant at all. The beat match is real but
  // weaker signal, so it only affects ranking among sources already established as relevant.
  const isRelevant = isLeadSource || (termTokens.length > 0 && matchedTokens.length / termTokens.length > 0.5);
  if (!isRelevant) return 0;
  let score = bundle.section === workItem.beat || bundle.wire === workItem.beat ? 12 : 0;
  score += 5 * matchedTokens.length;
  if (isLeadSource) score += 50;
  return score;
}

export function citationsForWorkItem(workItem, limit = 5) {
  const bundles = readWireBundles();
  const scored = bundles
    .map((bundle) => ({ bundle, score: sourceScore(workItem, bundle) }))
    .sort((left, right) => right.score - left.score || right.bundle.published.localeCompare(left.bundle.published));
  // A bundle with score 0 shares no beat, keyword, or URL with this work item — it is not
  // evidence for this story. Padding the citation list with such bundles to hit a minimum
  // count is how unrelated wire items (an EU budget Q&A, a shooting story) end up cited as
  // "primary sources" for an unrelated piece. Prefer a short, honest source list.
  const chosen = scored.filter((entry) => entry.score > 0).slice(0, limit).map((entry) => entry.bundle);
  return Object.freeze(chosen.map((bundle) => citationFromBundle(bundle)));
}

function citationFromBundle(bundle) {
  const host = (() => {
    try {
      return new URL(bundle.url).hostname.replace(/^www\./u, "");
    } catch {
      return "source";
    }
  })();
  return Object.freeze({
    id: `${host.replace(/[^a-z0-9]+/giu, "-")}-${hashId(bundle.url)}`,
    type: "webpage",
    title: bundle.title,
    author: bundle.author,
    URL: bundle.url,
    "container-title": host,
    issued: bundle.published,
    source_url: bundle.sourceUrl,
    summary: bundle.summary,
    beat: bundle.section || bundle.wire,
  });
}

// The packet's charge is Belnap FOUR joined from real evidence, not a decorative
// label: each relevant source (see sourceScore/citationsForWorkItem) witnesses its
// own "potential" charge, and knowledgeAggregate folds them by the knowledge-order
// join (absurd if the fold is empty; potential if only "for" evidence accumulated).
// Zero relevant sources therefore reports "absurd" (told nothing), not "potential"
// — a story with no real evidence should say so, not be dressed up as researched.
function evidenceChargeName(kind, slug, sources) {
  const perSource = sources.map((source) =>
    valueOf(witnessedPotential(mark({ kind, slug, citation: source.id }))));
  return chargeValueName(knowledgeAggregate(perSource));
}

export function researchPacket(workItem, now = new Date()) {
  const seoTerm = workItem.demand?.term ?? workItem.title;
  const sources = citationsForWorkItem(workItem);
  const slug = slugify(`${seoTerm}-${todayIsoDate(now)}`);
  return Object.freeze({
    kind: "koios.news.research.packet",
    generated_at: now.toISOString(),
    slug,
    title: titleForTerm(seoTerm),
    seo_term: seoTerm,
    beat: workItem.beat ?? "news",
    work_item: workItem,
    charge: evidenceChargeName("koios.news.research.packet", slug, sources),
    claims: Object.freeze([
      { predicate: "koios.work_item.source", object: workItem.source },
      { predicate: "koios.work_item.charge", object: workItem.charge },
      { predicate: "koios.seo_term", object: seoTerm },
      { predicate: "koios.beat", object: workItem.beat ?? "news" },
      { predicate: "koios.primary_sources.count", object: sources.length },
    ]),
    primary_sources: sources,
    collapse_frame: collapseFrameFor(workItem, seoTerm),
    feasibility_check: "Any response has to be tested against energy, insurance, administrative capacity, supply-chain stability, and public legitimacy in the world now carrying the stress.",
    primitives: Object.freeze([...(workItem.primitives ?? []), ...workshopPrimitives]),
  });
}

export function titleForTerm(term) {
  const words = String(term).trim().split(/\s+/u);
  return words.map((word) => /^[A-Z0-9]+$/u.test(word)
    ? word
    : `${word.slice(0, 1).toUpperCase()}${word.slice(1)}`).join(" ");
}

// Fetches a source's real article text so synthesis is grounded in actual reported facts
// rather than a one-sentence RSS teaser. A model asked for 800 grounded words from one sentence
// of summary will fill the gap with plausible-sounding invented specifics (a wrong filing year,
// a fabricated organization) — that is a data-starvation failure, not a prompting failure, and
// no amount of "don't hallucinate" instruction fixes it without giving the model something real
// to write from. Falls back to the RSS summary if the fetch fails (paywall, timeout, 404).
export async function fetchSourceExcerpt(url, limit = 6000) {
  try {
    const res = await fetch(url, { redirect: "follow", signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const html = await res.text();
    const text = stripHtml(html);
    return text.length > 0 ? text.slice(0, limit) : null;
  } catch {
    return null;
  }
}

// Returns a copy of the packet whose primary_sources carry real fetched article text (in
// `excerpt`) alongside the original short `summary`. Fetches run once, in parallel, so repeated
// synthesis retries in the same new-post.mjs run reuse the same real material instead of
// re-fetching per attempt.
export async function enrichPacketWithExcerpts(packet) {
  const enriched = await Promise.all(packet.primary_sources.map(async (source) => {
    const excerpt = await fetchSourceExcerpt(source.URL);
    return excerpt === null ? source : { ...source, excerpt };
  }));
  return Object.freeze({ ...packet, primary_sources: Object.freeze(enriched) });
}

const NIK_SYSTEM_PROMPT = `You are Nik Koios, Editor-in-Chief of Koios.News (https://koios.news).
You are not an assistant helping Nik: you ARE Nik. Write in first person as the byline author would, in third-person reported prose (standard news-article voice), not as a chatbot addressing anyone.

Standing constraints:
- Koios.News is Web 2.0 only: HTML, feeds, sitemaps, ordinary web syndication. Never mention or allude to the fediverse, ActivityPub, or Hive.
- Koios Thought (the lens every piece reads events through): climate breakdown is the upstream cause of the other macro crises (industrial fragility, de-dollarization, multipolarity, insurance retreat, grid stress, migration, state-capacity failure). No event is isolated from the emergent phenomenon it belongs to. Collapse is dynamically compounding, not merely additive. Things treated as immutable (nation-states, global trade, cheap insurance, technological progress) are contemporary arrangements that can disintegrate. Imagined futures must be feasibility-checked against whether the world can actually support them. A vision is never a prophecy — write "might", not "will".
- Voice: confident-but-comfortable opinionation, in the register of a sharp modern content-farm writer. Concise. Educational. Give one or two examples, not ten. Do not pad with generic collapse-theory paragraphs that could be pasted into any article unchanged — every sentence should be doing real work with the ACTUAL facts given to you below, not restating the frame in the abstract.
- Cite primary sources by title and permalink, as markdown links: [Exact Source Title](URL). Do not paraphrase a source's argument away; point at the longer piece and add your synthetic frame. Only cite the sources given to you below — never invent a source, a quote, a statistic, or a named person that is not in the material given to you.
- If only one source is given, write a single-source piece grounded entirely in that source's real facts — do not manufacture additional "context" sources or a false sense of a multi-source investigation.
- Every specific fact — a date, a dollar figure, an organization name, a person's name or title, a count, a quote — MUST be traceable to the "excerpt" or "summary" text given to you below for that source. If a specific detail you'd like to cite is not present in that text, describe the situation at the level of generality the material actually supports instead of inventing a plausible-sounding specific. A shorter true sentence beats a longer invented one.

Hard mechanical requirements (a separate automated gate checks these; failing any of them means the piece cannot publish):
- The exact SEO term given below must appear verbatim, character for character (including punctuation and capitalization), in the article's FIRST paragraph.
- The exact SEO term must also appear verbatim in at least one "## " markdown subheader.
- Every source's exact title and exact URL, given below, must each appear verbatim somewhere in the body text (a markdown link satisfies both at once).
- The body must be at least 800 words. If you need more length, add more real detail, angles, or implications from the material given to you — NEVER repeat a paragraph or sentence you've already written, even reworded. A repeated paragraph is an automatic failure, worse than falling short on length.
- Output ONLY the markdown body: an "# " H1 title line, then the article. No frontmatter, no commentary about what you're doing, no meta-notes.`;

function synthesisUserPrompt(packet, title, feedback) {
  const sourcesBlock = packet.primary_sources.map((source, index) => [
    `Source ${index + 1}:`,
    `  title: ${source.title}`,
    `  url: ${source.URL}`,
    `  author: ${source.author}`,
    `  published: ${source.issued}`,
    `  summary: ${source.summary}`,
    source.excerpt === undefined ? undefined : `  excerpt (the real article text — use THIS for specific facts): ${source.excerpt}`,
  ].filter((line) => line !== undefined).join("\n")).join("\n\n");
  const feedbackBlock = feedback.length === 0 ? "" : [
    "",
    "Your previous draft FAILED the automated gate for these reasons. Fix all of them in this draft:",
    ...feedback.map((line) => `- ${line}`),
  ].join("\n");
  return [
    `SEO term (must appear verbatim in the first paragraph and in one ## subheader): ${packet.seo_term}`,
    `Suggested title: ${title}`,
    `Beat: ${packet.beat}`,
    `Collapse frame for this story: ${packet.collapse_frame}`,
    `Feasibility-check angle to apply: ${packet.feasibility_check}`,
    "",
    packet.primary_sources.length === 1 ? "You have exactly one primary source. Write the piece from it." : `You have ${packet.primary_sources.length} primary sources.`,
    "",
    sourcesBlock,
    feedbackBlock,
  ].join("\n");
}

function agentEndpointConfig(env = process.env) {
  const url = env.KOIOS_AGENT_ENDPOINT_URL ?? "https://integrate.api.nvidia.com/v1/chat/completions";
  const apiKey = env.KOIOS_AGENT_API_KEY ?? env.NVIDIA_API_KEY;
  // nemotron-super-49b is a reasoning model: it spends real completion tokens on chain-of-thought
  // before the final answer, so it needs a larger max_tokens budget and can legitimately take a
  // couple of minutes for an 800+ word article — that is normal for a background job, not a
  // failure. Chosen as the default after a head-to-head: llama-3.1-8b-instruct is fast but weak
  // (padded word count by paraphrasing the same 2-3 points instead of writing new material);
  // llama-3.3-70b-instruct returned zero bytes after 4m39s on a 10-token trivial request in
  // testing (2026-07-02) — genuinely unresponsive on the free tier, not just slow.
  const model = env.KOIOS_AGENT_MODEL ?? "nvidia/llama-3.3-nemotron-super-49b-v1.5";
  return Object.freeze({ url, apiKey, model });
}

// Calls the configured OpenAI-chat-completions-compatible endpoint (NVIDIA NIM by default,
// same convention as turntide-islands' steward.mts) to synthesize a real article body from a
// packet's genuinely-relevant sources. Throws rather than falling back to a template: a story
// nobody actually wrote should not silently become templated boilerplate.
export async function synthesizeArticleBody(packet, title, { feedback = [], env = process.env } = {}) {
  const endpoint = agentEndpointConfig(env);
  if (endpoint.apiKey === undefined) {
    throw new Error(`no agent endpoint credential configured (set KOIOS_AGENT_API_KEY or NVIDIA_API_KEY) — refusing to synthesize ${JSON.stringify(packet.seo_term)}`);
  }
  const res = await fetch(endpoint.url, {
    method: "POST",
    headers: {
      authorization: `Bearer ${endpoint.apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: endpoint.model,
      messages: [
        { role: "system", content: NIK_SYSTEM_PROMPT },
        { role: "user", content: synthesisUserPrompt(packet, title, feedback) },
      ],
      temperature: 0.4,
      max_tokens: Number(env.KOIOS_AGENT_MAX_TOKENS ?? 6000),
    }),
  });
  const raw = await res.text();
  if (!res.ok) throw new Error(`agent endpoint failed ${res.status}: ${raw.slice(0, 300)}`);
  const parsed = JSON.parse(raw);
  const content = parsed.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.trim() === "") {
    throw new Error(`agent endpoint returned no usable content for ${JSON.stringify(packet.seo_term)}`);
  }
  return content.trim();
}

function collapseFrameFor(workItem, seoTerm) {
  const beat = workItem.beat ?? "news";
  if (beat === "technology") return `${seoTerm} is a window onto how computation turns into energy demand, water demand, land conflict, and capital pressure.`;
  if (beat === "economy") return `${seoTerm} is a window onto capital trying to preserve growth assumptions while physical systems become less cooperative.`;
  if (beat === "politics") return `${seoTerm} is a window onto state capacity under climate, migration, border, and legitimacy stress.`;
  if (beat === "environment") return `${seoTerm} is a window onto climate breakdown moving from background condition into administrative and household reality.`;
  if (beat === "war") return `${seoTerm} is a window onto conflict systems absorbing resource, climate, and legitimacy shocks.`;
  return `${seoTerm} is a window onto collapse as a compounding system rather than an isolated event.`;
}

export function briefPathFor(packet) {
  return resolve(briefLibraryDir, `${todayIsoDate(new Date(packet.generated_at))}-${slugify(packet.seo_term)}.md`);
}

export function writeBrief(packet) {
  mkdirSync(briefLibraryDir, { recursive: true });
  const file = briefPathFor(packet);
  if (existsSync(file)) throw new Error(`refusing to overwrite ${file}`);
  writeFileSync(file, briefMarkdown(packet));
  return file;
}

function briefMarkdown(packet) {
  const sources = packet.primary_sources.map((source) => `- ${source.title} — ${source.author} — ${source.URL}`).join("\n");
  const claims = packet.claims.map((claim) => `- ${claim.predicate}: ${claim.object}`).join("\n");
  return `---\ntitle: ${yamlScalar(packet.title)}\ndate: ${todayIsoDate(new Date(packet.generated_at))}\nstatus: brief\nkind: koios.news.research.packet\nseo_term: ${yamlScalar(packet.seo_term)}\nbeat: ${yamlScalar(packet.beat)}\ncharge: ${yamlScalar(packet.charge)}\n---\n\n# ${packet.title}\n\n## Desk work item\n\n${packet.work_item.title} (${packet.work_item.source}, ${packet.work_item.charge}, ${packet.work_item.beat ?? "news"}).\n\n## Primary sources\n\n${sources}\n\n## Claims\n\n${claims}\n\n## Collapse frame\n\n${packet.collapse_frame}\n\n## Feasibility check\n\n${packet.feasibility_check}\n\n## Packet JSON\n\n\`\`\`json\n${JSON.stringify(packet, null, 2)}\n\`\`\`\n`;
}

export function packetFromBrief(path) {
  const raw = readFileSync(path, "utf8");
  const match = raw.match(/```json\s*([\s\S]*?)\s*```/u);
  if (match === null) throw new Error(`brief ${path} is missing Packet JSON`);
  return JSON.parse(match[1]);
}

export function yamlScalar(value) {
  if (typeof value === "boolean" || typeof value === "number") return JSON.stringify(value);
  const textValue = String(value ?? "");
  if (/^[A-Za-z0-9][A-Za-z0-9 ._/-]*$/u.test(textValue) && !/^(true|false|null)$/u.test(textValue)) return textValue;
  return JSON.stringify(textValue);
}

function yamlBlock(value, indent = 0) {
  const pad = " ".repeat(indent);
  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";
    return `\n${value.map((item) => {
      if (item !== null && typeof item === "object" && !Array.isArray(item)) {
        const rendered = yamlBlock(item, indent + 2).replace(/^\n/u, "");
        return `${pad}- ${rendered.trimStart()}`;
      }
      return `${pad}- ${yamlScalar(item)}`;
    }).join("\n")}`;
  }
  if (value !== null && typeof value === "object") {
    const lines = Object.entries(value)
      .filter(([, item]) => item !== undefined)
      .map(([key, item]) => {
        if (Array.isArray(item) || (item !== null && typeof item === "object")) return `${pad}${key}:${yamlBlock(item, indent + 2)}`;
        return `${pad}${key}: ${yamlScalar(item)}`;
      });
    return `\n${lines.join("\n")}`;
  }
  return yamlScalar(value);
}

export function postMarkdown(frontmatter, body) {
  const preferred = [
    "title",
    "date",
    "draft",
    "slug",
    "description",
    "summary",
    "keywords",
    "categories",
    "tags",
    "koios",
    "references",
    "license",
    "license_url",
    "syndication_rights",
  ];
  const keys = [...preferred, ...Object.keys(frontmatter).filter((key) => !preferred.includes(key)).sort()];
  const lines = [];
  for (const key of keys) {
    if (!(key in frontmatter) || frontmatter[key] === undefined) continue;
    const value = frontmatter[key];
    if (Array.isArray(value) || (value !== null && typeof value === "object")) lines.push(`${key}:${yamlBlock(value, 2)}`);
    else lines.push(`${key}: ${yamlScalar(value)}`);
  }
  return `---\n${lines.join("\n")}\n---\n${body.trim()}\n`;
}

export function readPost(path) {
  const raw = readFileSync(path, "utf8");
  const parsed = parseMarkdown(raw);
  if (parsed.frontmatter === null) throw new Error(`${path} has no YAML frontmatter`);
  return { raw, frontmatter: { ...parsed.frontmatter }, body: parsed.body };
}

export function words(value) {
  return String(value).trim().split(/\s+/u).filter(Boolean);
}

export function bodyFirstParagraph(body) {
  return body
    .split(/\n\s*\n/gu)
    .map((part) => part.trim())
    .find((part) => part !== "" && !part.startsWith("#") && !part.startsWith("<!--")) ?? "";
}

export async function loadPublicPosts() {
  const api = await koiosApi();
  return api.loadPosts(postsDir);
}

// The editorial gate as a pure function: the single source of truth for what makes a draft
// publishable, shared by lint-post.mjs (the mechanical gate a human/agent runs by hand) and
// new-post.mjs's synthesis retry loop (so a generated draft is checked, and regenerated on
// failure, before it ever touches disk — rather than writing a known-broken draft and hoping
// someone runs the lint step later).
export function lintDraft(frontmatter, body) {
  const koios = record(frontmatter.koios);
  const references = Array.isArray(frontmatter.references) ? frontmatter.references.map(record) : [];
  const seoTerm = text(koios.seo_term);
  const keywords = Array.isArray(frontmatter.keywords) ? frontmatter.keywords.filter((item) => typeof item === "string") : [];
  const subheads = [...body.matchAll(/^##\s+(.+)$/gmu)].map((match) => match[1]);
  const firstPara = bodyFirstParagraph(body);
  const failures = [];
  const warnings = [];
  const contains = (haystack, needle) => String(haystack).toLowerCase().includes(String(needle).toLowerCase());
  const requiredString = (name, value) => {
    if (text(value) === undefined) failures.push(`${name} is required`);
  };

  requiredString("title", frontmatter.title);
  requiredString("date", frontmatter.date);
  requiredString("description", frontmatter.description);
  requiredString("summary", frontmatter.summary);
  requiredString("license", frontmatter.license);
  requiredString("syndication_rights", frontmatter.syndication_rights);
  requiredString("koios.seo_term", koios.seo_term);
  requiredString("koios.beat", koios.beat);
  requiredString("koios.tweet", koios.tweet);

  if (typeof frontmatter.draft !== "boolean") failures.push("frontmatter draft must be boolean");
  if (keywords.length !== 1) failures.push(`keywords must contain exactly one SEO term; found ${keywords.length}`);
  if (seoTerm !== undefined && keywords[0] !== seoTerm) failures.push("keywords[0] must match koios.seo_term");
  if (seoTerm !== undefined && !contains(firstPara, seoTerm)) failures.push(`SEO term ${JSON.stringify(seoTerm)} is not in the first paragraph`);
  if (seoTerm !== undefined && !subheads.some((heading) => contains(heading, seoTerm))) failures.push(`SEO term ${JSON.stringify(seoTerm)} is not in any ## subheader`);
  if (references.length === 0) failures.push("references must include at least one primary source");

  for (const reference of references) {
    const title = text(reference.title);
    const url = text(reference.URL);
    if (title === undefined || url === undefined) {
      failures.push("each reference needs title and URL");
      continue;
    }
    if (!body.includes(title)) failures.push(`reference title is not cited in body: ${title}`);
    if (!body.includes(url)) failures.push(`reference URL is not cited in body: ${url}`);
  }

  const prohibited = ["fediverse", "ActivityPub", "Hive"];
  for (const term of prohibited) {
    if (contains(body, term) || contains(JSON.stringify(frontmatter), term)) failures.push(`Web 2.0 constraint violated by ${term}`);
  }

  const wordCount = words(body).length;
  if (wordCount < 800) failures.push(`body is ${wordCount} words; need at least 800`);

  // A model padding toward the word-count minimum by repeating whole paragraphs verbatim will
  // still pass every check above — word count, citations, SEO term placement — while being
  // obviously degenerate to any reader. Reject exact-duplicate paragraphs (excluding headers,
  // which legitimately repeat the SEO term) as a hard failure, not a style nit: this is the
  // single most likely way an unattended generator ships something unpublishable.
  const paragraphs = body.split(/\n\s*\n/gu).map((part) => part.trim()).filter((part) => part !== "" && !part.startsWith("#"));
  const seenParagraphs = new Set();
  for (const paragraph of paragraphs) {
    const key = paragraph.toLowerCase();
    if (seenParagraphs.has(key)) {
      failures.push(`body repeats a paragraph verbatim (likely padding toward the word-count minimum): ${JSON.stringify(paragraph.slice(0, 80))}...`);
      break;
    }
    seenParagraphs.add(key);
  }

  if (words(String(frontmatter.summary ?? "")).length < 35) warnings.push("summary is shorter than the 50-word target");
  if (String(frontmatter.description ?? "").length > 160) warnings.push("description is longer than 160 characters");

  return Object.freeze({ failures: Object.freeze(failures), warnings: Object.freeze(warnings) });
}
