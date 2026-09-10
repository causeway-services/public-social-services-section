import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import { loadPosts, runDesk } from "../dist/index.mjs";

function demandEntry(term, overrides = {}) {
  return {
    beat: "environment",
    term,
    priority: 9,
    rank: 1,
    normalizedTerm: term,
    score: 90,
    baseScore: 90,
    earnedViews: 0,
    searchConsoleClicks: 0,
    searchConsoleImpressions: 0,
    covered: 0,
    coverageDecay: 1,
    decayed: false,
    evidence: [],
    ...overrides,
  };
}

function cableBundle(entity, slug, url, title) {
  return [
    entity,
    "koios.news.cable.bundle",
    {
      kind: "koios.news.cable.claim-state-bundle",
      entity,
      wire: "environment",
      fingerprint: slug,
      item: {
        title,
        url,
        summary: `${title} summary`,
        published: "Tue, 30 Jun 2026 12:00:00 GMT",
      },
      article: {
        slug,
        title,
        section: "environment",
      },
      provenance: {
        sourceUrl: "https://example.test/rss",
        itemUrl: url,
      },
    },
    "2026-06-30T12:00:00.000Z",
  ];
}

async function writeFixture(root) {
  const contentDir = resolve(root, "content/posts");
  const dataDir = resolve(root, "data");
  const storeDir = resolve(root, "store");
  await mkdir(contentDir, { recursive: true });
  await mkdir(resolve(dataDir, "records"), { recursive: true });
  await mkdir(resolve(storeDir, "environment/data/logs"), { recursive: true });

  await writeFile(resolve(contentDir, "covered-post.md"), `---
title: "Covered data center water use post"
date: 2026-06-30
draft: false
description: "Covered post."
summary: "Covered post."
keywords: ["data center water use"]
categories: ["Technology"]
tags: ["data center water use"]
koios:
  seo_term: "data center water use"
  beat: "technology"
  gates_clear: true
references:
  - id: "covered-wire"
    type: "webpage"
    title: "Covered wire"
    URL: "https://example.test/covered-wire"
---
Covered.
`, "utf8");

  await writeFile(resolve(dataDir, "records/demand.json"), `${JSON.stringify({
    kind: "koios.news.demand.reading",
    demand: [
      demandEntry("climate tipping points", { rank: 1, normalizedTerm: "climate tipping points" }),
      demandEntry("data center water use", { rank: 2, normalizedTerm: "data center water use" }),
    ],
  }, null, 2)}\n`, "utf8");

  const rows = [
    cableBundle("koios:cable:environment:uncovered", "uncovered-wire-story", "https://example.test/uncovered-wire", "Uncovered wire story"),
    cableBundle("koios:cable:environment:covered", "covered-wire-story", "https://example.test/covered-wire", "Covered wire story"),
  ];
  await writeFile(resolve(storeDir, "environment/data/logs/fixture.jsonl"), `${rows.map((row) => JSON.stringify(row)).join("\n")}\n`, "utf8");

  return { contentDir, dataDir, storeDir };
}

describe("Koios desk", () => {
  it("posits uncovered demand and wire candidates without duplicating posts or open items", async () => {
    const temp = await mkdtemp(resolve(tmpdir(), "koios-desk-"));
    try {
      const { contentDir, dataDir, storeDir } = await writeFixture(temp);
      const posts = await loadPosts(contentDir);
      const first = await runDesk({
        posts,
        views: {},
        dataDir,
        cableStoreDir: storeDir,
        demandRecordPath: resolve(dataDir, "records/demand.json"),
        now: new Date("2026-06-30T13:00:00.000Z"),
      });

      assert.equal(first.posited, 2);
      const slugs = first.queue.open.map((item) => item.slug).sort();
      assert.deepEqual(slugs, ["climate-tipping-points", "uncovered-wire-story"]);
      assert.equal(first.queue.open.find((item) => item.slug === "climate-tipping-points")?.metroplatCharge, "potential");
      assert.equal(first.queue.open.some((item) => item.slug === "data-center-water-use"), false);
      assert.equal(first.queue.open.some((item) => item.slug === "covered-wire-story"), false);

      const second = await runDesk({
        posts,
        views: {},
        dataDir,
        cableStoreDir: storeDir,
        demandRecordPath: resolve(dataDir, "records/demand.json"),
        now: new Date("2026-06-30T14:00:00.000Z"),
      });

      assert.equal(second.posited, 0);
      assert.equal(second.skippedOpenItem, 2);
      assert.deepEqual(second.queue.open.map((item) => item.slug).sort(), slugs);
    } finally {
      await rm(temp, { recursive: true, force: true });
    }
  });
});
