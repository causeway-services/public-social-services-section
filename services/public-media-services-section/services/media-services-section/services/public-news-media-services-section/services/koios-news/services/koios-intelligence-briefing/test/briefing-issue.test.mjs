import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  extractStoryFromClaimFile,
  listStoreStories,
  mostRecentAssertedAt,
  selectStoriesInWindow,
  buildBriefingIssue,
} from "../src/briefing-issue.mjs";

const FIXTURE_ROOT = fileURLToPath(new URL("./fixtures/briefing-store", import.meta.url));
const ALPHA_FILE = fileURLToPath(new URL("./fixtures/briefing-store/collapse-tech/story-alpha.json", import.meta.url));

test("extracts a story's title, url, summary, citation, and assertedAt from one claim file", () => {
  const story = extractStoryFromClaimFile(ALPHA_FILE, "collapse-tech");
  assert.equal(story.subject, "story-alpha");
  assert.equal(story.category, "collapse-tech");
  assert.equal(story.title, "Story Alpha: infrastructure fragility widens");
  assert.equal(story.url, "https://example.test/story-alpha");
  assert.equal(story.summary, "Fixture summary for story alpha, inside the seven-day window.");
  assert.equal(story.citation, "https://example.test/story-alpha");
  assert.equal(story.assertedAt, "2026-06-25T09:00:00.000Z");
});

test("throws extracting a claim file with an empty summary", () => {
  const dir = mkdtempSync(join(tmpdir(), "briefing-issue-"));
  try {
    const filePath = join(dir, "empty-summary.json");
    writeFileSync(
      filePath,
      JSON.stringify({
        subject: "empty-summary",
        claims: [
          { id: "title", proposition: { predicate: "title", object: "Has a title" }, time: { asserted: "2026-06-18T00:00:00.000Z" }, provenance: { witness: "x", citation: "https://example.test/x" } },
          { id: "summary", proposition: { predicate: "summary", object: "" }, time: { asserted: "2026-06-18T00:00:00.000Z" }, provenance: { witness: "x", citation: "https://example.test/x" } },
        ],
      }),
    );
    assert.throws(() => extractStoryFromClaimFile(filePath, "x"), /no usable summary claim/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("lists every story across every category by default", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT });
  assert.deepEqual(
    stories.map((story) => story.subject).sort(),
    ["story-alpha", "story-beta", "story-delta", "story-epsilon", "story-gamma"],
  );
});

test("restricts the walk to one named category", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT, category: "culture" });
  assert.deepEqual(stories.map((story) => story.subject).sort(), ["story-delta", "story-epsilon"]);
});

test("skips a file with an empty summary rather than aborting the whole walk", () => {
  const dir = mkdtempSync(join(tmpdir(), "briefing-issue-store-"));
  try {
    const categoryRoot = join(dir, "some-category");
    mkdirSync(categoryRoot, { recursive: true });
    writeFileSync(
      join(categoryRoot, "good.json"),
      JSON.stringify({
        subject: "good",
        claims: [
          { id: "title", proposition: { predicate: "title", object: "Good story" }, time: { asserted: "2026-06-18T00:00:00.000Z" }, provenance: { witness: "some-category", citation: "https://example.test/good" } },
          { id: "summary", proposition: { predicate: "summary", object: "A usable summary." }, time: { asserted: "2026-06-18T00:00:00.000Z" }, provenance: { witness: "some-category", citation: "https://example.test/good" } },
        ],
      }),
    );
    writeFileSync(
      join(categoryRoot, "bad.json"),
      JSON.stringify({
        subject: "bad",
        claims: [
          { id: "title", proposition: { predicate: "title", object: "Bad story" }, time: { asserted: "2026-06-18T00:00:00.000Z" }, provenance: { witness: "some-category", citation: "https://example.test/bad" } },
          { id: "summary", proposition: { predicate: "summary", object: "" }, time: { asserted: "2026-06-18T00:00:00.000Z" }, provenance: { witness: "some-category", citation: "https://example.test/bad" } },
        ],
      }),
    );
    const { stories, skipped } = listStoreStories({ storeRoot: dir });
    assert.deepEqual(stories.map((story) => story.subject), ["good"]);
    assert.equal(skipped.length, 1);
    assert.equal(skipped[0].filePath, join(categoryRoot, "bad.json"));
    assert.match(skipped[0].reason, /no usable summary claim/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("still throws for a file that is not valid claim JSON at all", () => {
  const dir = mkdtempSync(join(tmpdir(), "briefing-issue-store-"));
  try {
    const categoryRoot = join(dir, "some-category");
    mkdirSync(categoryRoot, { recursive: true });
    writeFileSync(join(categoryRoot, "broken.json"), "{ not json");
    assert.throws(() => listStoreStories({ storeRoot: dir }), /not valid JSON/u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("finds the most recent assertedAt across a story list", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT });
  assert.equal(mostRecentAssertedAt(stories), "2026-07-05T09:00:00.000Z");
});

test("returns null for an empty story list", () => {
  assert.equal(mostRecentAssertedAt([]), null);
});

test("selects only stories in [since, until), newest first", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT });
  const windowed = selectStoriesInWindow({ stories, since: "2026-06-24T00:00:00.000Z", until: "2026-07-01T00:00:00.000Z" });
  assert.deepEqual(
    windowed.map((story) => story.subject),
    ["story-gamma", "story-beta", "story-delta", "story-alpha"],
  );
});

test("excludes a story whose assertedAt falls outside the window", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT });
  const windowed = selectStoriesInWindow({ stories, since: "2026-06-24T00:00:00.000Z", until: "2026-07-01T00:00:00.000Z" });
  assert.ok(!windowed.some((story) => story.subject === "story-epsilon"));
});

test("throws for an unparseable since/until", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT });
  assert.throws(() => selectStoriesInWindow({ stories, since: "not-a-date", until: "2026-07-01T00:00:00.000Z" }), /parseable since/u);
  assert.throws(() => selectStoriesInWindow({ stories, since: "2026-06-24T00:00:00.000Z", until: "not-a-date" }), /parseable until/u);
});

test("builds a valid newsletter-issue-shaped object from a story window", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT, category: "collapse-tech" });
  const windowed = selectStoriesInWindow({ stories, since: "2026-06-24T00:00:00.000Z", until: "2026-07-01T00:00:00.000Z" });
  const issue = buildBriefingIssue({ title: "Test Issue", dek: "A test dek.", stories: windowed });
  assert.equal(issue.title, "Test Issue");
  assert.equal(issue.sections.length, 3);
  assert.equal(issue.sections[0].heading, "Story Gamma: the most recent story in the window");
  assert.deepEqual(issue.sections[0].sources, ["story-gamma"]);
  assert.equal(issue.references["story-gamma"].type, "webpage");
  assert.equal(issue.references["story-gamma"].URL, "https://example.test/story-gamma");
});

test("caps the built issue at maxStories", () => {
  const { stories } = listStoreStories({ storeRoot: FIXTURE_ROOT });
  const windowed = selectStoriesInWindow({ stories, since: "2026-06-24T00:00:00.000Z", until: "2026-07-01T00:00:00.000Z" });
  const issue = buildBriefingIssue({ title: "Capped", dek: "", stories: windowed, maxStories: 2 });
  assert.equal(issue.sections.length, 2);
});

test("throws when no stories fall within the window", () => {
  assert.throws(() => buildBriefingIssue({ title: "Empty", dek: "", stories: [] }), /no stories fall within/u);
});
