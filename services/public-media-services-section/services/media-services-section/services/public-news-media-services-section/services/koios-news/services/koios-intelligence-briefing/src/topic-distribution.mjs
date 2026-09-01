import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Lists the category directories directly beneath a claim-store root.
 *
 * @param {string} storeRoot Absolute or relative path to a koios claim-store
 *   root (e.g. `sites/koios.news/store`), one subdirectory per category.
 * @returns {string[]} Category directory names, sorted ascending.
 * @throws {TypeError} When `storeRoot` is not a non-empty string.
 * @throws {Error} When `storeRoot` does not exist or is not a directory.
 */
export function listStoreCategories(storeRoot) {
  if (typeof storeRoot !== "string" || storeRoot.length === 0) {
    throw new TypeError("claim topic distribution requires its store root");
  }
  let stats;
  try {
    stats = statSync(storeRoot);
  } catch {
    throw new Error(`claim store root does not exist: ${storeRoot}`);
  }
  if (!stats.isDirectory()) {
    throw new Error(`claim store root is not a directory: ${storeRoot}`);
  }
  return readdirSync(storeRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

/**
 * Lists the claim-file paths directly beneath one category directory.
 *
 * @param {string} categoryRoot Absolute or relative path to one category
 *   directory (e.g. `sites/koios.news/store/collapse-tech`).
 * @returns {string[]} Absolute or relative claim-file paths, sorted ascending.
 */
function listCategoryFiles(categoryRoot) {
  return readdirSync(categoryRoot, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".json"))
    .map((entry) => join(categoryRoot, entry.name))
    .sort();
}

/**
 * Reads and parses one claim-store file.
 *
 * @param {string} filePath Path to one `{ subject, claims }` JSON file.
 * @returns {{subject: string, claims: object[]}} The parsed claim file.
 * @throws {Error} When the file cannot be read or is not valid claim JSON.
 */
function readClaimFile(filePath) {
  let text;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    throw new Error(`claim file could not be read: ${filePath}: ${error.message}`);
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    throw new Error(`claim file is not valid JSON: ${filePath}: ${error.message}`);
  }
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    typeof parsed.subject !== "string" ||
    !Array.isArray(parsed.claims)
  ) {
    throw new Error(`claim file does not have the {subject, claims} shape: ${filePath}`);
  }
  return parsed;
}

/**
 * Derives the `YYYY-MM` recency bucket for one ISO-8601 asserted timestamp.
 *
 * @param {string} asserted An ISO-8601 timestamp, e.g. claim.time.asserted.
 * @returns {string} The `YYYY-MM` bucket, or `"unknown"` when `asserted` is
 *   not a parseable ISO-8601 string.
 */
function monthBucket(asserted) {
  if (typeof asserted !== "string" || !/^\d{4}-\d{2}-\d{2}T/u.test(asserted)) {
    return "unknown";
  }
  return asserted.slice(0, 7);
}

/**
 * Increments `counter[key]`, initializing it to zero first when absent.
 *
 * @param {Record<string, number>} counter A plain tally object.
 * @param {string} key The bucket to increment.
 * @returns {void}
 */
function tally(counter, key) {
  counter[key] = (counter[key] ?? 0) + 1;
}

/**
 * Computes the topic distribution of a koios sourced-claim store: per-category
 * file and claim counts, a secondary breakdown by each claim's `force` and
 * `status`, and a recency histogram over each claim's `time.asserted` month.
 *
 * @param {{storeRoot: string}} input The claim-store root to measure, one
 *   subdirectory per category, each holding `{subject, claims}` JSON files.
 * @returns {{
 *   storeRoot: string,
 *   totals: {categories: number, files: number, claims: number},
 *   byCategory: Record<string, {files: number, claims: number}>,
 *   byForce: Record<string, number>,
 *   byStatus: Record<string, number>,
 *   recencyByMonth: Record<string, number>
 * }} A plain JSON-serializable distribution structure.
 * @throws {TypeError} When `input.storeRoot` is not a non-empty string.
 * @throws {Error} When `input.storeRoot` does not exist, is not a directory,
 *   or contains a file that is not valid `{subject, claims}` claim JSON.
 */
export function computeClaimTopicDistribution({ storeRoot } = {}) {
  const categories = listStoreCategories(storeRoot);
  const byCategory = {};
  const byForce = {};
  const byStatus = {};
  const recencyByMonth = {};
  let totalFiles = 0;
  let totalClaims = 0;

  for (const category of categories) {
    const categoryRoot = join(storeRoot, category);
    const files = listCategoryFiles(categoryRoot);
    let categoryClaims = 0;
    for (const filePath of files) {
      const { claims } = readClaimFile(filePath);
      categoryClaims += claims.length;
      for (const claim of claims) {
        tally(byForce, String(claim.force));
        tally(byStatus, String(claim.status));
        tally(recencyByMonth, monthBucket(claim.time?.asserted));
      }
    }
    byCategory[category] = { files: files.length, claims: categoryClaims };
    totalFiles += files.length;
    totalClaims += categoryClaims;
  }

  return {
    storeRoot,
    totals: { categories: categories.length, files: totalFiles, claims: totalClaims },
    byCategory,
    byForce,
    byStatus,
    recencyByMonth,
  };
}
