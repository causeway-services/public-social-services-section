import assert from "node:assert/strict";
import test from "node:test";

import {
  composeCompletenessRepairPrompt,
  shouldRetryIncompleteDraft,
} from "../dist/draft-repair.mjs";

test("a short otherwise-valid Sonnet revision receives one bounded completion pass", () => {
  const problem = "draft repair returned 562 words; the deterministic completeness floor is 600";
  assert.equal(shouldRetryIncompleteDraft({ provider: "liss", problems: [problem], words: 562 }), true);
  assert.equal(shouldRetryIncompleteDraft({ provider: "property", problems: [problem], words: 562 }), false);
  assert.equal(shouldRetryIncompleteDraft({ provider: "liss", problems: [problem, "citation missing"], words: 562 }), false);
  assert.equal(shouldRetryIncompleteDraft({ provider: "liss", problems: [], words: 650 }), false);

  const prompt = composeCompletenessRepairPrompt({
    editorReport: "Preserve the thesis and repair its unsupported conclusion.",
    researchPacket: { sources: [{ url: "https://example.test/source" }] },
    candidateBody: "A short candidate with a [source](https://example.test/source).",
    candidateWords: 562,
  });
  assert.match(prompt, /650 to 1,000 words/u);
  assert.match(prompt, /562 words/u);
  assert.match(prompt, /https:\/\/example\.test\/source/u);
  assert.match(prompt, /Return prose only/u);
});
