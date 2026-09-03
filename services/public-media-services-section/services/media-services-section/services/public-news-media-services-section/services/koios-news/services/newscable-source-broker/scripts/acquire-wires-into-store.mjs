#!/usr/bin/env node
// Acquires every configured syndication wire and writes each item into a
// koios claim store as one `{subject, claims}` file per article under
// `<store>/<wire>/<slug>.json` — the exact shape the store already carries
// (title/url/summary/published claims, each with witness + citation).
// Existing files are never overwritten: a store file is an observation
// record, and re-acquisition only adds articles not yet seen.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { acquireSyndicationSource } from "../src/syndication.mjs";

function usage() {
  return "Usage: acquire-wires-into-store --wires <wires.json> --store <store-root> [--now <ISO-8601>]\n";
}

function slug(value) {
  return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "").slice(0, 96).replace(/-+$/u, "") || "source-report";
}

export function storeClaimFile(item, { wire, asserted }) {
  const entries = [["title", item.title], ["url", item.url], ...(item.summary ? [["summary", item.summary]] : []), ...(item.published ? [["published", item.published]] : [])];
  const claims = entries.map(([predicate, object]) => ({
    id: predicate,
    proposition: { predicate, object },
    time: { asserted },
    force: "alleges",
    provenance: { witness: wire, citation: item.url },
    status: "supported",
  }));
  return { subject: slug(item.title || item.url), claims };
}

export async function acquireWiresIntoStore({ wires, storeRoot, now = new Date().toISOString(), io = {} }) {
  const report = [];
  for (const wire of wires) {
    if (typeof wire.name !== "string" || !/^[a-z0-9-]+$/u.test(wire.name)) throw new TypeError("wire.name must be a lowercase slug");
    const directory = join(storeRoot, wire.name);
    mkdirSync(directory, { recursive: true });
    let written = 0, skipped = 0, failed = 0;
    for (const source of wire.sources) {
      let items;
      try { items = await acquireSyndicationSource(source, io); } catch (error) { failed += 1; report.push({ wire: wire.name, source: source.url, error: error.message }); continue; }
      for (const item of items) {
        if (typeof item.url !== "string" || typeof item.title !== "string" || item.title.trim() === "") continue;
        const file = storeClaimFile(item, { wire: wire.name, asserted: now });
        const target = join(directory, `${file.subject}.json`);
        if (existsSync(target)) { skipped += 1; continue; }
        writeFileSync(target, `${JSON.stringify(file, null, 2)}\n`);
        written += 1;
      }
    }
    report.push({ wire: wire.name, written, skipped, failedSources: failed });
  }
  return report;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) { process.stdout.write(usage()); process.exit(0); }
  const value = (flag) => { const index = argv.indexOf(flag); return index < 0 ? undefined : argv[index + 1]; };
  const wiresPath = value("--wires"), storeRoot = value("--store"), now = value("--now");
  if (!wiresPath || !storeRoot) { process.stderr.write(usage()); process.exit(2); }
  const wires = JSON.parse(readFileSync(wiresPath, "utf8")).wires;
  const report = await acquireWiresIntoStore({ wires, storeRoot, ...(now ? { now } : {}) });
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
