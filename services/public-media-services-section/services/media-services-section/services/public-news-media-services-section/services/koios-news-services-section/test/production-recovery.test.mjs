import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createOffProviderBackup, restoreOffProviderBackup } from "../src/production-recovery.mjs";

const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function publicFixture() {
  const root = await mkdtemp(join(tmpdir(), "koios-recovery-"));
  const source = join(root, "source");
  await mkdir(join(source, "nested"), { recursive: true });
  await writeFile(join(source, "index.html"), "home");
  await writeFile(join(source, "nested", "story.json"), "story");
  const artifacts = [
    { file: "index.html", bytes: 4, sha256: digest("home") },
    { file: "nested/story.json", bytes: 5, sha256: digest("story") },
  ];
  await writeFile(join(source, "manifest.json"), JSON.stringify({
    kind: "koios.news.static-publication-manifest/v1",
    artifacts,
  }));
  return { root, source };
}

test("creates an exact backup and verifies a fresh restore", async (t) => {
  const fixture = await publicFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  const backupRoot = join(fixture.root, "backup");
  const backupReceiptPath = join(fixture.root, "receipts", "backup.json");
  const restoreRoot = join(fixture.root, "restore-rehearsal", "public");
  const restoreReceiptPath = join(fixture.root, "receipts", "restore.json");
  const backup = await createOffProviderBackup({ sourcePublicRoot: fixture.source, backupRoot, receiptPath: backupReceiptPath });
  const restore = await restoreOffProviderBackup({ backupRoot, backupReceiptPath, restoreRoot, receiptPath: restoreReceiptPath });
  assert.equal(backup.accepted, true);
  assert.equal(restore.restoredManifestSha256, backup.productionManifestSha256);
  assert.equal(restore.restoredObjectSha256, backup.backupObjectSha256);
  assert.equal((await readFile(join(restoreRoot, "nested", "story.json"), "utf8")), "story");
});

test("refuses a changed backup and does not issue a restore receipt", async (t) => {
  const fixture = await publicFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  const backupRoot = join(fixture.root, "backup");
  const backupReceiptPath = join(fixture.root, "backup.json");
  const restoreReceiptPath = join(fixture.root, "restore.json");
  await createOffProviderBackup({ sourcePublicRoot: fixture.source, backupRoot, receiptPath: backupReceiptPath });
  await writeFile(join(backupRoot, "index.html"), "evil");
  await assert.rejects(
    restoreOffProviderBackup({ backupRoot, backupReceiptPath, restoreRoot: join(fixture.root, "restore"), receiptPath: restoreReceiptPath }),
    /sealed artifact mismatch/u,
  );
  await assert.rejects(readFile(restoreReceiptPath), { code: "ENOENT" });
});

test("refuses to overwrite an existing backup destination", async (t) => {
  const fixture = await publicFixture();
  t.after(() => rm(fixture.root, { recursive: true, force: true }));
  const backupRoot = join(fixture.root, "backup");
  await mkdir(backupRoot);
  await assert.rejects(
    createOffProviderBackup({ sourcePublicRoot: fixture.source, backupRoot, receiptPath: join(fixture.root, "backup.json") }),
    /destination root already exists/u,
  );
});
