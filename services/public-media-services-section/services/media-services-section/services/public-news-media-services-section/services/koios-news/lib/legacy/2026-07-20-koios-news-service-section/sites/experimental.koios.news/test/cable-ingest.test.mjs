import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { ingestKoiosCable } from "../dist/index.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

describe("Koios cable ingest", () => {
  it("writes witnessed per-wire EAVT rows with provenance and fingerprint dedupe", async () => {
    const temp = await mkdtemp(resolve(tmpdir(), "koios-cable-"));
    try {
      const fixture = pathToFileURL(resolve(root, "test/fixtures/cable.rss")).href;
      const configPath = resolve(temp, "cable.config.json");
      const storeDir = resolve(temp, "store");
      await writeFile(configPath, JSON.stringify({
        name: "koios.news",
        newscable: {
          title: "Fixture Cable",
          wires: [{
            name: "environment",
            title: "Environment",
            keyword: "climate change",
            sources: [{ adapter: "rss", url: fixture, max: 2 }],
          }],
        },
      }), "utf8");

      const first = await ingestKoiosCable({
        configPath,
        storeDir,
        now: new Date("2026-06-29T14:00:00.000Z"),
      });
      assert.equal(first[0].wire, "environment");
      assert.equal(first[0].projected, 2);
      assert.ok(first[0].written > 0);
      assert.equal(first[0].errors.length, 0);

      const logPath = first[0].sources[0].logPath;
      assert.ok(logPath);
      const log = await readFile(logPath, "utf8");
      assert.match(log, /koios\.news\.cable\.bundle/u);
      assert.match(log, /koios\.news\.cable\.source_url/u);
      assert.match(log, /koios\.news\.cable\.content_fingerprint/u);
      assert.match(log, /climate change/u);

      const second = await ingestKoiosCable({
        configPath,
        storeDir,
        now: new Date("2026-06-29T15:00:00.000Z"),
      });
      assert.equal(second[0].projected, 0);
      assert.equal(second[0].skipped, 2);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
});
