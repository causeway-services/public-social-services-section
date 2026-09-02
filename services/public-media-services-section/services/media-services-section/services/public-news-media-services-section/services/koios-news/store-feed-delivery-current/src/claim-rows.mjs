import { readFileSync } from "node:fs";
import { basename, dirname } from "node:path";
import { assertRow, constituteEntity, listEntities, stratify } from "@red-cup-engineering/eavt";
import { listStoreClaimFiles } from "./store-feed-delivery.mjs";

// Base wire predicates read straight off a claim's own proposition.predicate,
// emitted as Level-0 rows in this fixed order when the store file carries them.
const BASE_PREDICATES = Object.freeze(["title", "url", "summary", "published"]);

function bytewise(left, right) {
  return Buffer.compare(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
}

/**
 * Reads one koios claim-store file (`{subject, claims}`) and projects it
 * into EAVT rows: the article's constituting genesis row, one row per
 * present base predicate (title/url/summary/published), four bookkeeping
 * rows per source claim (witness/citation/force/status), and one
 * store-category/store-slug row pair naming the file's location in the
 * store.
 *
 * @param {string} file Absolute path to a `<storeRoot>/<category>/<slug>.json`
 *   claim-store file.
 * @returns {{entity: string, rows: readonly {e: string, a: string, v: *,
 *   t: string}[]}} `entity` is the article's constituted address
 *   (`article:<ni-digest>`); `rows` includes the genesis row first.
 * @throws {Error} When the file is not valid claim JSON, does not have the
 *   `{subject, claims}` shape, has no claims, no claim carries a
 *   `time.asserted`, or carries no `url` claim.
 */
export function storeFileToRows(file) {
  if (typeof file !== "string" || file === "") throw new TypeError("claim-rows: file must be a non-empty string");
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    throw new Error(`store file is not valid JSON: ${file}: ${error.message}`);
  }
  if (parsed === null || typeof parsed !== "object" || typeof parsed.subject !== "string" || !Array.isArray(parsed.claims)) {
    throw new Error(`store file does not have the {subject, claims} shape: ${file}`);
  }
  const { claims } = parsed;
  if (claims.length === 0) throw new Error(`store file has no claims: ${file}`);

  const times = claims.map((claim) => claim?.time?.asserted).filter((t) => typeof t === "string");
  if (times.length === 0) throw new Error(`store file has no claim with a time.asserted: ${file}`);
  const earliest = times.reduce((min, t) => (bytewise(t, min) < 0 ? t : min));

  const urlClaim = claims.find((claim) => claim?.proposition?.predicate === "url");
  if (urlClaim === undefined || typeof urlClaim.proposition.object !== "string") {
    throw new Error(`store file has no url claim: ${file}`);
  }

  const { genesisRow } = constituteEntity({ kind: "article", attributes: { url: urlClaim.proposition.object }, t: earliest });
  const entity = genesisRow.e;

  const rows = [assertRow(genesisRow)];
  for (const predicate of BASE_PREDICATES) {
    const claim = claims.find((claim_) => claim_?.proposition?.predicate === predicate);
    if (claim === undefined) continue;
    rows.push(assertRow({ e: entity, a: predicate, v: claim.proposition.object, t: claim.time.asserted }));
  }
  for (const claim of claims) {
    const t = claim?.time?.asserted;
    const provenance = claim?.provenance ?? {};
    rows.push(assertRow({ e: entity, a: "witness", v: provenance.witness, t }));
    rows.push(assertRow({ e: entity, a: "citation", v: provenance.citation, t }));
    rows.push(assertRow({ e: entity, a: "force", v: claim?.force, t }));
    rows.push(assertRow({ e: entity, a: "status", v: claim?.status, t }));
  }
  rows.push(assertRow({ e: entity, a: "store-category", v: basename(dirname(file)), t: earliest }));
  rows.push(assertRow({ e: entity, a: "store-slug", v: basename(file, ".json"), t: earliest }));

  return Object.freeze({ entity, rows: Object.freeze(rows) });
}

/**
 * Walks every category beneath a koios claim-store root in deterministic
 * order (via `listStoreClaimFiles`) and projects every file into EAVT rows.
 *
 * @param {string} storeRoot Path to a koios claim-store root.
 * @returns {{rows: readonly object[], receipts: readonly {file: string,
 *   entity: string, rows: readonly object[]}[]}}
 * @throws {Error} When `storeRoot` does not exist, or any file under it is
 *   malformed (see `storeFileToRows`).
 */
export function storeToTrace(storeRoot) {
  const entries = listStoreClaimFiles(storeRoot);
  const rows = [];
  const receipts = [];
  for (const { path } of entries) {
    const { entity, rows: fileRows } = storeFileToRows(path);
    rows.push(...fileRows);
    receipts.push({ file: path, entity, rows: fileRows });
  }
  return Object.freeze({ rows: Object.freeze(rows), receipts: Object.freeze(receipts) });
}

/**
 * Stratifies one article's rows into the braided tower (asserted /
 * saturated / settled). Thin delegate to eavt's own `stratify`.
 *
 * @param {readonly object[]} rows An {e,a,v,t} row array (any order; the
 *   whole trace, not pre-filtered to the subject).
 * @param {string} entity The article's constituted address.
 * @returns {{entity: string, asserted: object[], saturated: object[],
 *   settled: {entity: string, fiber: object[]}}}
 */
export function stratifyArticle(rows, entity) {
  return stratify(entity, rows);
}

/**
 * Stratifies every entity present in a rows trace and summarizes the
 * corpus: entity count, total row count, and the total row/fiber-cell
 * count at each of the three levels.
 *
 * @param {readonly object[]} rows An {e,a,v,t} row array (any order; the
 *   whole trace).
 * @returns {{entities: readonly {entity: string, asserted: object[],
 *   saturated: object[], settled: {entity: string, fiber: object[]}}[],
 *   summary: {entities: number, rows: number, asserted: number,
 *   saturated: number, settled: number}}}
 * @throws {TypeError} If `rows` is not an array.
 */
export function stratifyStore(rows) {
  if (!Array.isArray(rows)) throw new TypeError("claim-rows: rows must be an {e,a,v,t} array");
  const perEntity = listEntities(rows).map((entity) => stratifyArticle(rows, entity));
  const summary = {
    entities: perEntity.length,
    rows: rows.length,
    asserted: perEntity.reduce((sum, s) => sum + s.asserted.length, 0),
    saturated: perEntity.reduce((sum, s) => sum + s.saturated.length, 0),
    settled: perEntity.reduce((sum, s) => sum + s.settled.fiber.length, 0),
  };
  return { entities: perEntity, summary };
}
