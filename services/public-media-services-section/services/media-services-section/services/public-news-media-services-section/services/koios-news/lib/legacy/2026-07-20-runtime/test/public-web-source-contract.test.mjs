import assert from "node:assert/strict";
import test from "node:test";

import { sourceUrlsNeedingPublicText } from "../dist/researching/sourcing/public-web-source-contract.mjs";

function evidence(entries) {
  return {
    object: {
      bundles: entries.map(({ url, summary }, index) => ({
        bundle: {
          claims: [
            { proposition: { predicate: "url", object: url } },
            { proposition: { predicate: "summary", object: summary } },
          ],
        },
        subject: `source-${index + 1}`,
      })),
    },
  };
}

test("requests article text only for syndication sources too thin to report", () => {
  const rich = `A first sourced sentence. A second sourced sentence. A third sourced sentence. ${"Material reporting context. ".repeat(100)}`;
  const current = evidence([
    { url: "https://thin.example/story", summary: "A short feed description." },
    { url: "https://rich.example/story", summary: rich },
  ]);
  assert.deepEqual(sourceUrlsNeedingPublicText(current, ["https://thin.example/story", "https://rich.example/story"]), ["https://thin.example/story"]);
});
