import assert from "node:assert/strict";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { publishIssueDraft } from "../scripts/publish-issue-draft.mjs";
// Same source-path debt as the script under test -- see its module header.
import { renderMarkdown, renderPasteHtml } from "../../../../../../../../../../engineering-services-section/services/computer-engineering-services-section/services/computer-data-services-section/services/computer-content-services-section/services/documents-services-section/services/newsletter-issue-production-services-section/src/newsletter-issue.mjs";

const FIXTURES_ROOT = fileURLToPath(new URL("./fixtures/issues", import.meta.url));

function tempCopyOf(fixtureName) {
  const workRoot = mkdtempSync(join(tmpdir(), "health-education-newsletter-"));
  const issueDir = join(workRoot, fixtureName);
  cpSync(join(FIXTURES_ROOT, fixtureName), issueDir, { recursive: true });
  return { workRoot, issueDir, dataRoot: join(workRoot, "data") };
}

function fetchSpy(calls, response = { id: "draft-fixture-1", status: "draft", publish_date: null }) {
  return async (url, init) => {
    calls.push({ url, init });
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ ...response, subject: JSON.parse(init.body).subject }),
    };
  };
}

test("recomposes stale renderings, creates a Buttondown draft, and records a receipt", async () => {
  const { workRoot, issueDir, dataRoot } = tempCopyOf("001-valid");
  try {
    const issue = JSON.parse(readFileSync(join(issueDir, "issue-001.json"), "utf8"));
    const calls = [];
    const result = await publishIssueDraft(issueDir, {
      feedLink: "https://fixture.example/issues/001-valid",
      publishDate: "2026-01-01T00:00:00.000Z",
      env: { BUTTONDOWN_API_KEY: "fixture-token" },
      fetchImpl: fetchSpy(calls),
      dataRoot,
    });

    assert.equal(readFileSync(result.files.markdown, "utf8"), renderMarkdown(issue));
    assert.equal(readFileSync(result.files.pasteHtml, "utf8"), renderPasteHtml(issue));
    assert.doesNotMatch(readFileSync(result.files.markdown, "utf8"), /STALE/u);

    assert.equal(calls.length, 1);
    assert.match(calls[0].url, /\/v1\/emails$/u);
    assert.equal(calls[0].init.headers.authorization, "Token fixture-token");
    assert.equal(JSON.parse(calls[0].init.body).subject, issue.title);

    assert.equal(result.draft.id, "draft-fixture-1");
    assert.ok(result.receipt.contentAppended);
    assert.equal(result.receipt.charge.support, true);
    assert.equal(result.receipt.charge.refutation, false);
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }
});

test("refuses cleanly, before any network call, when BUTTONDOWN_API_KEY is absent", async () => {
  const { workRoot, issueDir, dataRoot } = tempCopyOf("001-valid");
  try {
    const calls = [];
    const refusingFetch = async () => {
      calls.push(true);
      throw new Error("fetch must not be called when BUTTONDOWN_API_KEY is unset");
    };
    await assert.rejects(
      () => publishIssueDraft(issueDir, {
        feedLink: "https://fixture.example/issues/001-valid",
        env: {},
        fetchImpl: refusingFetch,
        dataRoot,
      }),
      /BUTTONDOWN_API_KEY is not set/u,
    );
    assert.equal(calls.length, 0);
    // Recompose (a local, keyless step) still ran ahead of the refusal.
    assert.doesNotMatch(readFileSync(join(issueDir, "issue.md"), "utf8"), /STALE/u);
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }
});

test("throws naming every missing rendering, and never reaches Buttondown", async () => {
  const { workRoot, issueDir, dataRoot } = tempCopyOf("002-missing-rendering");
  try {
    const calls = [];
    await assert.rejects(
      () => publishIssueDraft(issueDir, {
        env: { BUTTONDOWN_API_KEY: "fixture-token" },
        fetchImpl: fetchSpy(calls),
        dataRoot,
      }),
      /missing rendering\(s\).*issue\.paste\.html.*issue\.feed-item/su,
    );
    assert.equal(calls.length, 0);
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }
});

test("throws when the issue directory carries more than one *.json file", async () => {
  const { workRoot, issueDir, dataRoot } = tempCopyOf("001-valid");
  try {
    writeFileSync(join(issueDir, "extra.json"), "{}");
    await assert.rejects(
      () => publishIssueDraft(issueDir, { env: { BUTTONDOWN_API_KEY: "fixture-token" }, dataRoot }),
      /more than one \*\.json file/u,
    );
  } finally {
    rmSync(workRoot, { recursive: true, force: true });
  }
});
