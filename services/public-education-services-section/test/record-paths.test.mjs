import assert from "node:assert/strict";
import test from "node:test";
import { createMediaArtifactWorkLot } from "@red-cup-engineering/computer-inference-engine/media/artifact-work";
import { EDUCATION_ROOT, recordedPath, sameWorkLot } from "../src/channel.mjs";

const identity = `ni:///sha-256;${"A".repeat(43)}`;
const lot = (path) => createMediaArtifactWorkLot({
  workLot: "c/l/video", principal: "urn:ame:p", capability: "x", prompt: "p", outputMimeType: "video/mp4", sources: [{ path, identity }],
});

test("records name files relative to the education root, never by machine path", () => {
  const inside = `${EDUCATION_ROOT}/content/curricula/c/lessons/l/report.md`;
  assert.equal(recordedPath(inside), "content/curricula/c/lessons/l/report.md");
  assert.equal(recordedPath("/somewhere/else/entirely/report.md"), "report.md");
  assert.equal(JSON.stringify(lot(recordedPath(inside))).includes(EDUCATION_ROOT), false);
});

test("a work lot retained with machine-path sources is the same request as its relative-path successor", () => {
  const retained = lot(`${EDUCATION_ROOT}/content/report.md`);
  const fresh = lot(recordedPath(`${EDUCATION_ROOT}/content/report.md`));
  assert.notEqual(retained.id, fresh.id);
  assert.equal(sameWorkLot(retained, fresh), true);
  assert.equal(sameWorkLot(retained, { ...fresh, prompt: "other" }), false);
  assert.equal(sameWorkLot(null, fresh), false);
});
