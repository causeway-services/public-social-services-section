import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { deliverBriefingDraft } from "../scripts/deliver-briefing-draft.mjs";

test("refuses cleanly when BUTTONDOWN_API_KEY is unset, before touching the network", async () => {
  let called = false;
  const fetchImpl = async () => {
    called = true;
    throw new Error("must not be called");
  };
  await assert.rejects(
    () => deliverBriefingDraft({ issuePath: "/does/not/exist.md", subject: "Issue #1" }, {}, fetchImpl),
    /BUTTONDOWN_API_KEY is not set/u,
  );
  assert.equal(called, false);
});

test("refuses cleanly when issuePath or subject is missing", async () => {
  await assert.rejects(() => deliverBriefingDraft({ subject: "Issue #1" }, { BUTTONDOWN_API_KEY: "token" }, async () => {}), /usage:/u);
  await assert.rejects(() => deliverBriefingDraft({ issuePath: "issue.md" }, { BUTTONDOWN_API_KEY: "token" }, async () => {}), /usage:/u);
});

test("creates a draft via the injected fetch when BUTTONDOWN_API_KEY is set", async () => {
  const dir = mkdtempSync(join(tmpdir(), "deliver-briefing-draft-"));
  try {
    const issuePath = join(dir, "issue.md");
    writeFileSync(issuePath, "# Hello\n\nBody markdown.\n", "utf8");

    let seenUrl, seenInit;
    const fetchImpl = async (url, init) => {
      seenUrl = url;
      seenInit = init;
      return { ok: true, text: async () => JSON.stringify({ id: "draft-abc", subject: "Issue #1", status: "draft" }) };
    };

    const result = await deliverBriefingDraft(
      { issuePath, subject: "Issue #1" },
      { BUTTONDOWN_API_KEY: "test-token" },
      fetchImpl,
    );

    assert.equal(result.id, "draft-abc");
    assert.equal(result.status, "draft");
    assert.match(seenUrl, /\/v1\/emails$/u);
    assert.equal(seenInit.headers.authorization, "Token test-token");
    assert.match(seenInit.body, /Body markdown\./u);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
