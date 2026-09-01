import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { requireMigratedAggregate, status } from "../src/tombstone.mjs";

test("the retired aggregate refuses execution in favor of package-local contracts", () => {
  assert.equal(status.type, "KoiosNewsAggregateTombstone");
  assert.throws(requireMigratedAggregate, /bounded tombstone/u);
});

test("the retired package exposes no historical execution surface", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url)));
  assert.deepEqual(Object.keys(packageJson.scripts).sort(), ["check", "test", "verify"]);
  assert.deepEqual(Object.keys(packageJson.exports).sort(), [".", "./package.json", "./tombstone"]);
  assert.equal(packageJson.dependencies, undefined);
  const result = spawnSync(process.execPath, [fileURLToPath(new URL("../src/tombstone.mjs", import.meta.url))], { encoding: "utf8" });
  assert.equal(result.status, 2);
  assert.equal(JSON.parse(result.stderr).type, "KoiosNewsAggregateTombstone");
  const installer = fileURLToPath(new URL("../deploy/systemd/install-and-verify.sh", import.meta.url));
  const installResult = spawnSync("bash", [installer, "--install"], { encoding: "utf8" });
  assert.equal(installResult.status, 2);
  assert.match(installResult.stderr, /refusing retired Koios aggregate systemd installation/u);
});
