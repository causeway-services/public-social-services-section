import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { composeBriefingIssue, resolveWindow } from "../scripts/compose-briefing-issue.mjs";

const FIXTURE_ROOT = fileURLToPath(new URL("./fixtures/briefing-store", import.meta.url));

test("resolveWindow defaults until to the most recent story and since to windowDays earlier", () => {
  const stories = [{ assertedAt: "2026-06-30T09:00:00.000Z" }, { assertedAt: "2026-06-20T00:00:00.000Z" }];
  const window = resolveWindow({ stories, windowDays: 7 });
  assert.equal(window.until, "2026-06-30T09:00:00.000Z");
  assert.equal(window.since, "2026-06-23T09:00:00.000Z");
});

test("resolveWindow throws when until is unresolved and the store has no stories", () => {
  assert.throws(() => resolveWindow({ stories: [], windowDays: 7 }), /no dateable stories/u);
});

test("composes a briefing issue over a fixture window and writes all three renderings", () => {
  const outDir = mkdtempSync(join(tmpdir(), "compose-briefing-issue-"));
  try {
    const result = composeBriefingIssue({
      storeRoot: FIXTURE_ROOT,
      since: "2026-06-24T00:00:00.000Z",
      until: "2026-07-01T00:00:00.000Z",
      outDir,
      link: "https://example.test/briefing",
    });

    assert.equal(result.window.since, "2026-06-24T00:00:00.000Z");
    assert.equal(result.window.until, "2026-07-01T00:00:00.000Z");
    assert.equal(result.report.valid, true);
    assert.deepEqual(
      result.issue.sections.map((section) => section.heading),
      [
        "Story Gamma: the most recent story in the window",
        "Story Beta: vendor lock-in dispute escalates",
        "Story Delta: a culture-beat story in the window",
        "Story Alpha: infrastructure fragility widens",
      ],
    );

    assert.ok(existsSync(result.files.markdown));
    assert.ok(existsSync(result.files.pasteHtml));
    assert.ok(existsSync(result.files.feedItem));

    const markdown = readFileSync(result.files.markdown, "utf8");
    assert.match(markdown, /^# Koios Intelligence Briefing/u);
    assert.match(markdown, /Story Gamma/u);
    assert.doesNotMatch(markdown, /Story Epsilon/u);

    const pasteHtml = readFileSync(result.files.pasteHtml, "utf8");
    assert.match(pasteHtml, /<h2>Story Gamma/u);

    const feedItem = readFileSync(result.files.feedItem, "utf8");
    assert.match(feedItem, /<item>/u);
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("restricts composition to one category with --category semantics", () => {
  const outDir = mkdtempSync(join(tmpdir(), "compose-briefing-issue-"));
  try {
    const result = composeBriefingIssue({
      storeRoot: FIXTURE_ROOT,
      category: "culture",
      since: "2026-06-24T00:00:00.000Z",
      until: "2026-07-10T00:00:00.000Z",
      outDir,
      link: "https://example.test/briefing",
    });
    assert.deepEqual(
      result.issue.sections.map((section) => section.heading),
      ["Story Epsilon: outside the seven-day window", "Story Delta: a culture-beat story in the window"],
    );
  } finally {
    rmSync(outDir, { recursive: true, force: true });
  }
});

test("throws when the resolved window contains no stories", () => {
  assert.throws(
    () =>
      composeBriefingIssue({
        storeRoot: FIXTURE_ROOT,
        since: "2020-01-01T00:00:00.000Z",
        until: "2020-01-02T00:00:00.000Z",
        outDir: join(tmpdir(), "unused"),
      }),
    /no stories fall within/u,
  );
});
