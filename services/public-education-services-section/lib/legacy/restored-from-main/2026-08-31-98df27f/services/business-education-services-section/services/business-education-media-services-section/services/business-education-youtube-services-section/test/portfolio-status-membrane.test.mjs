import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { localA2aMembrane } from "../src/local-a2a-membrane.mjs";

test("the portfolio-status membrane supplies durable, provider-isolated task and coordination sources", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "modern-business-portfolio-status-membrane-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const business = localA2aMembrane(root, "modern-business-portfolio-status");
  const other = localA2aMembrane(root, "other-provider");
  await business.taskSource.put({ taskId: "task-1", tenant: "", envelope: { protocol: "A2A" } });
  assert.equal((await business.taskSource.get({ taskId: "task-1" })).taskId, "task-1");
  assert.equal(await other.taskSource.get({ taskId: "task-1" }), null);
  const stored = await business.coordinationSource.put({ namespace: "push-configurations", tenant: "", key: "task-1", value: { configurations: [] } });
  assert.equal(typeof stored.etag, "string");
  assert.equal(typeof stored.contentSha256, "string");
  assert.deepEqual((await business.coordinationSource.get({ namespace: "push-configurations", tenant: "", key: "task-1" })).value, { configurations: [] });
});
