// holography/projecting/store — the thin filesystem binding for the three tiers.
//
// THIS IS THE ONLY EFFECTFUL FILE in projecting/: the one place that imports
// node:fs. Every other module here is pure mathematics over carriers. It
// congregates the fs idioms re-derived across the corpus: content-dedup append,
// ENOENT-tolerant read, and atomic temp-write + rename for the projected tiers.
//
//   <logDir>/<feed>.jsonl      append-only EAVT witnesses (the boundary)
//   <stateDir>/<feed>.json     the current view, projected from the log (bulk)
//   <recordDir>/<feed>.jsonl   settled invariants (Datoms), log compacted (bulk)
import { appendFileSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { canonical, requireJsonValue, serializeLines } from "../../codecs/json.mjs";
import { eavtId, eavtRecord, parse as parseEavt, serialize as serializeEavt, serializeDatoms, } from "../../codecs/eavt.mjs";
/** The flat leaf path of a feed's file under a tier directory. */
export function feedPath(dir, feed, type) {
    return path.join(dir, `${feed}.${type}`);
}
/** Atomically write content: temp file + rename (atomic on POSIX), so a crash
 *  mid-write never corrupts the target. */
export function writeFileAtomic(filePath, content) {
    const tmp = `${filePath}.${process.pid}.tmp`;
    mkdirSync(path.dirname(filePath), { recursive: true });
    writeFileSync(tmp, content, "utf8");
    renameSync(tmp, filePath);
}
/** Append records as newline-delimited canonical JSON. Best-effort (advisory):
 *  write errors are swallowed, never thrown. No-op on empty input. */
export function appendJsonl(filePath, records) {
    if (records.length === 0)
        return;
    try {
        mkdirSync(path.dirname(filePath), { recursive: true });
        appendFileSync(filePath, serializeLines(records.map((r) => requireJsonValue(r, "jsonl record"))), "utf8");
    }
    catch {
        // non-fatal: persistence is advisory
    }
}
/** Read newline-delimited JSON, skipping malformed lines; a missing file is []. */
export function readJsonl(filePath) {
    let text;
    try {
        text = readFileSync(filePath, "utf8");
    }
    catch {
        return [];
    }
    const out = [];
    for (const line of text.split("\n")) {
        const trimmed = line.trim();
        if (!trimmed)
            continue;
        try {
            out.push(JSON.parse(trimmed));
        }
        catch {
            // skip malformed lines
        }
    }
    return out;
}
/** Read a single JSON document, or null if absent/unreadable. */
export function readJsonFile(filePath) {
    try {
        return JSON.parse(readFileSync(filePath, "utf8"));
    }
    catch {
        return null;
    }
}
/** Ensure all three tier directories exist. */
export function ensureStoreDirs(store) {
    mkdirSync(store.logDir, { recursive: true });
    mkdirSync(store.stateDir, { recursive: true });
    mkdirSync(store.recordDir, { recursive: true });
}
/** Read a feed's witness log as normalized EAVT records. Missing file yields []. */
export function readWitnessLog(store, feed) {
    let content;
    try {
        content = readFileSync(feedPath(store.logDir, feed, "jsonl"), "utf8");
    }
    catch {
        return [];
    }
    return parseEavt(content);
}
/** Append only the witnesses not already present (by content identity). Returns
 *  how many rows were genuinely new — the per-tick growth signal. */
export function appendWitnesses(store, feed, rows) {
    if (rows.length === 0)
        return { appended: 0 };
    const present = new Set(readWitnessLog(store, feed).map((row) => eavtId(row)));
    const fresh = [];
    for (const row of rows) {
        const id = eavtId(row);
        if (present.has(id))
            continue;
        present.add(id);
        fresh.push(eavtRecord(row));
    }
    if (fresh.length === 0)
        return { appended: 0 };
    mkdirSync(store.logDir, { recursive: true });
    appendFileSync(feedPath(store.logDir, feed, "jsonl"), serializeEavt(fresh), "utf8");
    return { appended: fresh.length };
}
/** Atomically write a JSON snapshot to `<dir>/<feed>.<type>`. */
export function writeJsonAtomic(dir, feed, value, type = "json") {
    writeFileAtomic(feedPath(dir, feed, type), `${canonical(value)}\n`);
}
/** Commit a settled projection: append its Datoms to the record tier and
 *  atomically rewrite the log to the compacted (kept) rows. No-op when empty. */
export function commitRecord(store, feed, datoms, keptLog) {
    if (datoms.length === 0)
        return;
    mkdirSync(store.recordDir, { recursive: true });
    appendFileSync(feedPath(store.recordDir, feed, "jsonl"), serializeDatoms(datoms), "utf8");
    writeFileAtomic(feedPath(store.logDir, feed, "jsonl"), serializeEavt(keptLog));
}
//# sourceMappingURL=store.mjs.map