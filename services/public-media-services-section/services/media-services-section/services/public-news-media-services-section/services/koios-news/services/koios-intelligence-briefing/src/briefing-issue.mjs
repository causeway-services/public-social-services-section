import { join } from "node:path";
import { listStoreCategories, listCategoryFiles, readClaimFile } from "./topic-distribution.mjs";

/**
 * Looks up one claim by `id` within a parsed claim file's `claims` array.
 *
 * @param {object[]} claims Parsed `{subject, claims}.claims`.
 * @param {string} id The claim `id` to find (e.g. `"title"`).
 * @returns {object|undefined} The matching claim, or undefined.
 */
function claimById(claims, id) {
  return claims.find((claim) => claim.id === id);
}

/**
 * Projects one already-parsed `{subject, claims}` claim file into one
 * briefing story. Separated from `extractStoryFromClaimFile` so a batch
 * walk (`listStoreStories`) can let a `readClaimFile` failure (not valid
 * claim JSON — a data-integrity defect) propagate, while catching only
 * this function's editorial-usability failures (an empty `summary`, as
 * the real store has) to skip that one file and continue.
 *
 * @param {{subject: string, claims: object[]}} parsed A parsed claim file.
 * @param {string} filePath The file it was read from, for error messages.
 * @param {string} category The category directory name the file lives under.
 * @returns {{
 *   subject: string,
 *   category: string,
 *   filePath: string,
 *   title: string,
 *   url: string,
 *   summary: string,
 *   citation: string,
 *   witness: string,
 *   assertedAt: string
 * }} One briefing story.
 * @throws {Error} When the file is missing a usable `title` or `summary`
 *   claim, or a resolvable `provenance.citation`, or a parseable `time.asserted`.
 */
export function projectStoryFromParsedClaimFile({ subject, claims }, filePath, category) {
  const titleClaim = claimById(claims, "title");
  const urlClaim = claimById(claims, "url");
  const summaryClaim = claimById(claims, "summary");

  if (titleClaim === undefined || typeof titleClaim.proposition?.object !== "string" || titleClaim.proposition.object.trim() === "") {
    throw new Error(`claim file has no usable title claim: ${filePath}`);
  }
  if (summaryClaim === undefined || typeof summaryClaim.proposition?.object !== "string" || summaryClaim.proposition.object.trim() === "") {
    throw new Error(`claim file has no usable summary claim: ${filePath}`);
  }
  const url = typeof urlClaim?.proposition?.object === "string" ? urlClaim.proposition.object.trim() : undefined;
  const citation = titleClaim.provenance?.citation ?? summaryClaim.provenance?.citation ?? url;
  if (typeof citation !== "string" || citation.trim() === "") {
    throw new Error(`claim file has no resolvable citation: ${filePath}`);
  }
  const assertedAt = titleClaim.time?.asserted ?? summaryClaim.time?.asserted;
  if (typeof assertedAt !== "string" || Number.isNaN(Date.parse(assertedAt))) {
    throw new Error(`claim file's title claim has no parseable time.asserted: ${filePath}`);
  }

  return {
    subject,
    category,
    filePath,
    title: titleClaim.proposition.object.trim(),
    url: url ?? citation.trim(),
    summary: summaryClaim.proposition.object.trim(),
    citation: citation.trim(),
    witness: titleClaim.provenance?.witness ?? category,
    assertedAt,
  };
}

/**
 * Reads one koios claim-store file (via `readClaimFile` — the same
 * store-reading code path `computeClaimTopicDistribution` uses) and
 * projects it into one briefing story.
 *
 * @param {string} filePath Path to one `{subject, claims}` claim-store file.
 * @param {string} category The category directory name the file lives under.
 * @returns {ReturnType<typeof projectStoryFromParsedClaimFile>} One briefing story.
 * @throws {Error} When the file is not valid claim JSON, or fails
 *   `projectStoryFromParsedClaimFile`.
 */
export function extractStoryFromClaimFile(filePath, category) {
  return projectStoryFromParsedClaimFile(readClaimFile(filePath), filePath, category);
}

/**
 * Walks every category directory beneath a claim-store root (or one named
 * category) and projects every claim file into a briefing story. Reuses
 * `listStoreCategories`/`listCategoryFiles`/`readClaimFile` — the same
 * store-walking code paths `computeClaimTopicDistribution` uses. A file
 * that is not valid claim JSON still throws (a data-integrity defect); a
 * file that parses but is editorially unusable (the real store has files
 * with an empty, not missing, `summary`) is skipped, not fatal.
 *
 * @param {{storeRoot: string, category?: string}} input `storeRoot` is a
 *   koios claim-store root; `category`, when given, restricts the walk to
 *   that one category directory.
 * @returns {{
 *   stories: ReturnType<typeof extractStoryFromClaimFile>[],
 *   skipped: {filePath: string, category: string, reason: string}[]
 * }} Every usable story, and every file skipped as editorially unusable.
 * @throws {TypeError} When `input.storeRoot` is not a non-empty string.
 * @throws {Error} When the store root, or the named category, does not
 *   exist, or a claim file is not valid claim JSON.
 */
export function listStoreStories({ storeRoot, category } = {}) {
  if (typeof storeRoot !== "string" || storeRoot.length === 0) {
    throw new TypeError("listStoreStories requires its store root");
  }
  const categories = category === undefined ? listStoreCategories(storeRoot) : [category];
  const stories = [];
  const skipped = [];
  for (const oneCategory of categories) {
    const categoryRoot = join(storeRoot, oneCategory);
    for (const filePath of listCategoryFiles(categoryRoot)) {
      const parsed = readClaimFile(filePath);
      try {
        stories.push(projectStoryFromParsedClaimFile(parsed, filePath, oneCategory));
      } catch (error) {
        skipped.push({ filePath, category: oneCategory, reason: error.message });
      }
    }
  }
  return { stories, skipped };
}

/**
 * The most recent `assertedAt` timestamp across a list of stories.
 *
 * @param {ReadonlyArray<{assertedAt: string}>} stories
 * @returns {string|null} An ISO-8601 timestamp, or null when `stories` is empty.
 */
export function mostRecentAssertedAt(stories) {
  let maxMs = null;
  for (const story of stories) {
    const ms = Date.parse(story.assertedAt);
    if (Number.isFinite(ms) && (maxMs === null || ms > maxMs)) maxMs = ms;
  }
  return maxMs === null ? null : new Date(maxMs).toISOString();
}

/**
 * Selects the stories whose `assertedAt` falls in `[since, until)`, most
 * recent first.
 *
 * @param {{stories: ReadonlyArray<{assertedAt: string}>, since: string, until: string}} input
 *   `since`/`until` are ISO-8601 instants (`until` exclusive).
 * @returns {typeof input.stories} The matching stories, newest first.
 * @throws {TypeError} When `since` or `until` do not parse as instants.
 */
export function selectStoriesInWindow({ stories, since, until } = {}) {
  const sinceMs = Date.parse(since);
  const untilMs = Date.parse(until);
  if (!Number.isFinite(sinceMs)) throw new TypeError(`selectStoriesInWindow requires a parseable since, got: ${since}`);
  if (!Number.isFinite(untilMs)) throw new TypeError(`selectStoriesInWindow requires a parseable until, got: ${until}`);
  return stories
    .filter((story) => {
      const ms = Date.parse(story.assertedAt);
      return Number.isFinite(ms) && ms >= sinceMs && ms < untilMs;
    })
    .sort((a, b) => Date.parse(b.assertedAt) - Date.parse(a.assertedAt));
}

/**
 * @param {string} assertedAt An ISO-8601 timestamp.
 * @returns {{"date-parts": [[number, number, number]]}} A CSL-JSON `issued` value.
 */
function issuedFrom(assertedAt) {
  const date = new Date(assertedAt);
  return { "date-parts": [[date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate()]] };
}

/**
 * Builds a `@red-cup-engineering/newsletter-issue-production-services-section`
 * issue (`{title, dek, sections, references}`) from a window of briefing
 * stories: one section per story (heading = story title, body-markdown =
 * story summary, sources = [story.subject]) and one CSL-JSON `"webpage"`
 * reference per story keyed by its subject.
 *
 * @param {{title: string, dek: string, stories: ReadonlyArray<ReturnType<typeof extractStoryFromClaimFile>>, maxStories?: number}} input
 * @returns {{title: string, dek: string, sections: object[], references: Record<string, object>}}
 * @throws {TypeError} When `title` is not a non-empty string.
 * @throws {Error} When no stories are given (or remain after `maxStories`).
 */
export function buildBriefingIssue({ title, dek, stories, maxStories } = {}) {
  if (typeof title !== "string" || title.trim() === "") throw new TypeError("buildBriefingIssue requires a non-empty title");
  const chosen = Number.isInteger(maxStories) ? stories.slice(0, maxStories) : stories.slice();
  if (chosen.length === 0) throw new Error("buildBriefingIssue: no stories fall within the requested window");

  const references = {};
  const sections = chosen.map((story) => {
    references[story.subject] = {
      id: story.subject,
      type: "webpage",
      title: story.title,
      URL: story.citation,
      issued: issuedFrom(story.assertedAt),
    };
    return {
      heading: story.title,
      "body-markdown": story.summary,
      sources: [story.subject],
    };
  });

  return { title: title.trim(), dek: typeof dek === "string" ? dek : "", sections, references };
}
