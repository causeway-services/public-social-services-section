import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";

import { EDITORIAL_PIPELINE_CONTEXT, EDITORIAL_PIPELINE_CONTEXT_TOTAL_BYTES } from "../dist/generated/editorial-pipeline-context.mjs";
import { editorialPipelineArtifacts } from "../dist/researching/writing/editing/liss-editorial.mjs";
import { projectEditorialBoundaryValue } from "../dist/researching/writing/editing/editorial-assessment-contract.mjs";

test("the deployed editor carries the paid newsroom knowledge and production implementation", () => {
  assert.equal(EDITORIAL_PIPELINE_CONTEXT.length, 14);
  assert.ok(EDITORIAL_PIPELINE_CONTEXT_TOTAL_BYTES > 250_000);
  assert.deepEqual(EDITORIAL_PIPELINE_CONTEXT.map((entry) => entry.sourceId), [
    "prior-art/agentic-newsroom",
    "prior-art/news-topology",
    "prior-art/claims-to-prose",
    "prior-art/accountable-attention",
    "newsroom/researching-skill",
    "newsroom/researching-script",
    "newsroom/writing-skill",
    "newsroom/writing-script",
    "newsroom/editing-skill",
    "newsroom/editing-script",
    "production/cultivate",
    "production/newsroom",
    "production/article-topology",
    "production/inference-adapter",
  ]);
  for (const entry of EDITORIAL_PIPELINE_CONTEXT) {
    assert.ok(entry.content.length > 100, entry.sourceId);
    assert.equal(entry.digest, `sha256:${createHash("sha256").update(entry.content).digest("hex")}`);
  }
  const portableBundle = JSON.parse(readFileSync(new URL("../content/editorial-context/pipeline-context.json", import.meta.url), "utf8"));
  assert.deepEqual(portableBundle, EDITORIAL_PIPELINE_CONTEXT);
  const projected = projectEditorialBoundaryValue({ pipeline: EDITORIAL_PIPELINE_CONTEXT });
  assert.equal(projected.pipeline.length, 14);
  assert.equal(projected.pipeline[0].sourceId, "prior-art/agentic-newsroom");
  assert.equal(projected.pipeline.at(-1).sourceId, "production/inference-adapter");
});

test("the live editorial packet keeps exact operative law while manifesting bulky prior art", () => {
  const projected = editorialPipelineArtifacts();
  assert.ok(JSON.stringify(projected).length < 180_000);
  const generated = projected.filter((entry) => !String(entry.sourceId).startsWith("runtime/"));
  assert.equal(generated.length, EDITORIAL_PIPELINE_CONTEXT.length);
  assert.ok(generated.find((entry) => entry.sourceId === "production/newsroom")?.content.length > 1_000);
  assert.equal(generated.find((entry) => entry.sourceId === "prior-art/agentic-newsroom")?.content, undefined);
  assert.ok(generated.find((entry) => entry.sourceId === "prior-art/agentic-newsroom")?.digest.startsWith("sha256:"));
});
