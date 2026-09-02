#!/usr/bin/env node
/**
 * @module publish-issue-draft
 * Verify + re-compose an issue directory's three renderings, create a
 * Buttondown DRAFT from the composed Markdown, and record a receipt.
 * No .github lane: this section is not its own repo, so this script is
 * the publish lane.
 */

import { existsSync, readFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { createSemanticRecordJournal } from "@red-cup-engineering/semantic-record-journal-service";
import { composeIssue } from "@red-cup-engineering/newsletter-issue-production-services-section/scripts/compose-issue.mjs";
import { createDraftEmail } from "@red-cup-engineering/buttondown-services-section";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_DATA_ROOT = resolve(HERE, "..", "data");
const OBJECT_KIND = "health-education-newsletter.issue-draft-publication.record";
const CATEGORY = "health-education-newsletter.issue-draft-publication";
const RENDERING_NAMES = Object.freeze(["issue.md", "issue.paste.html"]);

/**
 * @param {string} issueDir
 * @returns {{path: string, format: "rss"|"atom"}|null} the existing
 *   feed-item rendering, or null when neither extension is present
 */
function locateFeedItemRendering(issueDir) {
  const rss = join(issueDir, "issue.feed-item.rss.xml");
  if (existsSync(rss)) return { path: rss, format: "rss" };
  const atom = join(issueDir, "issue.feed-item.atom.xml");
  if (existsSync(atom)) return { path: atom, format: "atom" };
  return null;
}

/**
 * Verify the three renderings already exist in `issueDir`, throwing a
 * single message naming every rendering that is missing.
 * @param {string} issueDir
 * @returns {"rss"|"atom"} the feed-item format found on disk
 * @throws {Error} when any of the three renderings is absent
 */
function verifyRenderingsExist(issueDir) {
  const missing = RENDERING_NAMES.filter((name) => !existsSync(join(issueDir, name)));
  const feedItem = locateFeedItemRendering(issueDir);
  if (feedItem === null) missing.push("issue.feed-item.{rss,atom}.xml");
  if (missing.length > 0) {
    throw new Error(`publish-issue-draft: ${issueDir} is missing rendering(s) — ${missing.join(", ")}; compose the issue at least once before publishing`);
  }
  return feedItem.format;
}

/**
 * Find the single issue JSON file inside `issueDir` (any `*.json` file:
 * the three renderings are `.md`/`.html`/`.xml`, never `.json`).
 * @param {string} issueDir
 * @returns {Promise<string>} absolute path to the issue JSON file
 * @throws {Error} when zero or more than one `*.json` file is found
 */
async function locateIssueJson(issueDir) {
  const entries = await readdir(issueDir, { withFileTypes: true });
  const jsonFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".json")).map((entry) => entry.name);
  if (jsonFiles.length === 0) throw new Error(`publish-issue-draft: ${issueDir} contains no issue *.json file`);
  if (jsonFiles.length > 1) throw new Error(`publish-issue-draft: ${issueDir} contains more than one *.json file — ${jsonFiles.join(", ")}`);
  return join(issueDir, jsonFiles[0]);
}

/**
 * Open this section's semantic record journal, rooted beneath its own
 * `data/` directory — the same shape koios-intelligence-briefing's
 * launch-state-record.mjs uses.
 * @param {string} dataRoot
 * @returns {ReturnType<typeof createSemanticRecordJournal>}
 */
function journal(dataRoot) {
  return createSemanticRecordJournal({ root: resolve(dataRoot, "records", "journal"), objectKind: OBJECT_KIND });
}

/**
 * Publish one issue directory: verify + re-compose its three renderings,
 * create a Buttondown DRAFT from the freshly composed Markdown, and record
 * a dated publication receipt. Refuses cleanly, before any network call,
 * when `BUTTONDOWN_API_KEY` is unset.
 * @param {string} issueDir - path to an issue directory (e.g. `content/issues/001`)
 * @param {object} [options]
 * @param {string} [options.feedLink] - RSS/Atom `<link>`; defaults to a
 *   `NEWSLETTER_NAME.example` placeholder built from the issue directory's
 *   basename, matching the placeholder issue 001's own renderings already use
 * @param {string} [options.publishDate] - ISO 8601 instant for the feed item; defaults to now
 * @param {"draft"|"scheduled"} [options.status] - Buttondown creation status; defaults to "draft"
 * @param {string} [options.scheduledPublishDate] - required ISO 8601 instant when status is "scheduled"
 * @param {Record<string,string|undefined>} [options.env] - injected environment; defaults to process.env
 * @param {typeof fetch} [options.fetchImpl] - injected fetch capability; defaults to global fetch
 * @param {string} [options.dataRoot] - this section's `data/` directory; defaults to `<section>/data`
 * @returns {Promise<{issueDir: string, issueTitle: string, files: {markdown: string, pasteHtml: string, feedItem: string}, draft: object, receipt: object}>}
 * @throws {Error} when a rendering is missing, the issue JSON is not exactly one file,
 *   the issue fails validation, or BUTTONDOWN_API_KEY is unset
 */
export async function publishIssueDraft(issueDir, options = {}) {
  const {
    feedLink,
    publishDate,
    status,
    scheduledPublishDate,
    env = process.env,
    fetchImpl = fetch,
    dataRoot = DEFAULT_DATA_ROOT,
  } = options;

  const resolvedIssueDir = resolve(issueDir);
  const format = verifyRenderingsExist(resolvedIssueDir);
  const issueJsonPath = await locateIssueJson(resolvedIssueDir);
  const issue = JSON.parse(readFileSync(issueJsonPath, "utf8"));

  const link = feedLink ?? `https://NEWSLETTER_NAME.example/issues/${basename(resolvedIssueDir)}`;
  const { files } = composeIssue(issue, resolvedIssueDir, { link, pubDate: publishDate, format });

  const token = env.BUTTONDOWN_API_KEY;
  if (!token) throw new Error("publish-issue-draft: BUTTONDOWN_API_KEY is not set; refusing to create a Buttondown draft");

  const body = readFileSync(files.markdown, "utf8");
  const draft = await createDraftEmail({
    token,
    fetch: fetchImpl,
    subject: issue.title,
    body,
    status,
    publishDate: scheduledPublishDate,
  });

  const recordedAt = new Date().toISOString();
  const receipt = journal(dataRoot).record({
    category: CATEGORY,
    recordedAt,
    record: { issueDir: resolvedIssueDir, issueTitle: issue.title, feedLink: link, files, draft },
    charge: { support: true, refutation: false },
  });

  return { issueDir: resolvedIssueDir, issueTitle: issue.title, files, draft, receipt };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    options: {
      "feed-link": { type: "string" },
      "publish-date": { type: "string" },
      status: { type: "string" },
      "scheduled-publish-date": { type: "string" },
      "data-root": { type: "string" },
    },
    allowPositionals: true,
  });
  const [issueDir] = positionals;
  if (!issueDir) {
    console.error("usage: publish-issue-draft.mjs <issue-dir> [--feed-link <url>] [--publish-date <iso>] [--status draft|scheduled] [--scheduled-publish-date <iso>] [--data-root <path>]");
    process.exitCode = 2;
  } else {
    try {
      const result = await publishIssueDraft(issueDir, {
        feedLink: values["feed-link"],
        publishDate: values["publish-date"],
        status: values.status,
        scheduledPublishDate: values["scheduled-publish-date"],
        dataRoot: values["data-root"] ? resolve(values["data-root"]) : undefined,
      });
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(error.message ?? error);
      process.exitCode = 1;
    }
  }
}
