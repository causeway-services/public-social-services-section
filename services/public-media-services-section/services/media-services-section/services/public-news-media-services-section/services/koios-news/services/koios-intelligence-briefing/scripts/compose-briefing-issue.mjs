#!/usr/bin/env node
/**
 * @module compose-briefing-issue
 * The effect: read the koios claim store, select a dated window of
 * stories, and compose a briefing issue through
 * `@red-cup-engineering/newsletter-issue-production-services-section`.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { composeIssue } from "@red-cup-engineering/newsletter-issue-production-services-section/scripts/compose-issue.mjs";
import { listStoreStories, mostRecentAssertedAt, selectStoriesInWindow, buildBriefingIssue } from "../src/briefing-issue.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_STORE_ROOT = resolve(HERE, "..", "..", "..", "sites", "koios.news", "store");
const DEFAULT_OUT_ROOT = resolve(HERE, "..", "content", "text", "documents", "issues");
const DEFAULT_WINDOW_DAYS = 7;
const DEFAULT_MAX_STORIES = 5;
const DEFAULT_LINK = "https://koios.news/";

/**
 * @param {string} isoInstant
 * @returns {string} the `YYYY-MM-DD` slice of an ISO-8601 instant
 */
function dateSlug(isoInstant) {
  return isoInstant.slice(0, 10);
}

/**
 * Resolves the `[since, until)` window: explicit `--since`/`--until`
 * override; `until` otherwise defaults to the most recent `assertedAt`
 * story in the store (the store is a dated snapshot, not a live clock, so
 * anchoring the "last N days" window on wall-clock now() would silently
 * select zero stories); `since` defaults to `until` minus `windowDays`.
 *
 * @param {{stories: object[], since?: string, until?: string, windowDays: number}} input
 * @returns {{since: string, until: string}}
 * @throws {Error} When `until` is not given and the store has no stories.
 */
export function resolveWindow({ stories, since, until, windowDays }) {
  const resolvedUntil = until ?? mostRecentAssertedAt(stories);
  if (typeof resolvedUntil !== "string") {
    throw new Error("resolveWindow: --until was not given and the store has no dateable stories");
  }
  const resolvedSince = since ?? new Date(Date.parse(resolvedUntil) - windowDays * 24 * 60 * 60 * 1000).toISOString();
  return { since: resolvedSince, until: resolvedUntil };
}

/**
 * Composes one briefing issue from a dated window of the koios claim store
 * and writes its Markdown/paste-HTML/feed-item renderings to `outDir`.
 *
 * @param {{
 *   storeRoot: string,
 *   category?: string,
 *   since?: string,
 *   until?: string,
 *   windowDays?: number,
 *   maxStories?: number,
 *   title?: string,
 *   dek?: string,
 *   outDir?: string,
 *   link?: string,
 *   format?: "rss"|"atom"
 * }} options
 * @returns {{window: {since: string, until: string}, issue: object, report: object, files: object, skipped: object[]}}
 * @throws {Error} When no stories fall in the resolved window, or the
 *   composed issue fails validation.
 */
export function composeBriefingIssue(options = {}) {
  const {
    storeRoot,
    category,
    since,
    until,
    windowDays = DEFAULT_WINDOW_DAYS,
    maxStories = DEFAULT_MAX_STORIES,
    link = DEFAULT_LINK,
    format = "rss",
  } = options;

  const { stories: allStories, skipped } = listStoreStories({ storeRoot, category });
  const window = resolveWindow({ stories: allStories, since, until, windowDays });
  const windowStories = selectStoriesInWindow({ stories: allStories, since: window.since, until: window.until });

  const title = options.title ?? `Koios Intelligence Briefing — ${dateSlug(window.since)} to ${dateSlug(window.until)}`;
  const dek = options.dek ?? `${windowStories.length} sourced-claim ${windowStories.length === 1 ? "story" : "stories"} from koios.news, ${dateSlug(window.since)} to ${dateSlug(window.until)}.`;
  const issue = buildBriefingIssue({ title, dek, stories: windowStories, maxStories });

  const outDir = options.outDir ?? resolve(DEFAULT_OUT_ROOT, `${dateSlug(window.since)}-to-${dateSlug(window.until)}`);
  const { report, files } = composeIssue(issue, outDir, { link, format, pubDate: window.until });

  return { window, issue, report, files, skipped };
}

/**
 * Parses `compose-briefing-issue.mjs` CLI flags.
 * @param {string[]} argv `process.argv.slice(2)`.
 * @returns {Parameters<typeof composeBriefingIssue>[0]}
 */
function optionsFromArgv(argv) {
  const flag = (name) => {
    const index = argv.indexOf(name);
    if (index === -1) return undefined;
    const value = argv[index + 1];
    if (!value) throw new TypeError(`${name} requires an argument`);
    return value;
  };
  const storeRoot = flag("--store");
  const outDir = flag("--out-dir");
  const windowDays = flag("--window-days");
  const maxStories = flag("--max-stories");
  return {
    storeRoot: storeRoot === undefined ? DEFAULT_STORE_ROOT : resolve(storeRoot),
    outDir: outDir === undefined ? undefined : resolve(outDir),
    category: flag("--category"),
    since: flag("--since"),
    until: flag("--until"),
    windowDays: windowDays === undefined ? DEFAULT_WINDOW_DAYS : Number(windowDays),
    maxStories: maxStories === undefined ? DEFAULT_MAX_STORIES : Number(maxStories),
    title: flag("--title"),
    dek: flag("--dek"),
    link: flag("--link") ?? DEFAULT_LINK,
    format: flag("--format") ?? "rss",
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const result = composeBriefingIssue(optionsFromArgv(process.argv.slice(2)));
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`compose-briefing-issue: ${error.message}\n`);
    process.exitCode = 2;
  }
}
