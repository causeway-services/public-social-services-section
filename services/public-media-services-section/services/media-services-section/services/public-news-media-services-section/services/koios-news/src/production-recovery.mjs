import { createHash } from "node:crypto";
import { copyFile, lstat, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve, sep } from "node:path";

const MANIFEST_KIND = "koios.news.static-publication-manifest/v1";

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

async function absent(path, label) {
  try {
    await lstat(path);
    throw new Error(`${label} already exists: ${path}`);
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

function validFile(file) {
  return typeof file === "string" && file.length > 0 &&
    !file.startsWith("/") && !file.includes("\\") &&
    file.split("/").every((part) => part && part !== "." && part !== "..");
}

async function listFiles(root, current = root) {
  const entries = await readdir(current, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(current, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`symbolic links are not admissible: ${path}`);
    if (entry.isDirectory()) files.push(...await listFiles(root, path));
    else if (entry.isFile()) files.push(relative(root, path).split(sep).join("/"));
    else throw new Error(`non-regular filesystem entry is not admissible: ${path}`);
  }
  return files.sort();
}

async function inspectPublicRoot(root) {
  const absoluteRoot = resolve(root);
  const manifestBytes = await readFile(join(absoluteRoot, "manifest.json"));
  const manifestSha256 = sha256(manifestBytes);
  const manifest = JSON.parse(manifestBytes.toString("utf8"));
  if (manifest.kind !== MANIFEST_KIND || !Array.isArray(manifest.artifacts) || manifest.artifacts.length === 0) {
    throw new Error("public root has no admissible static publication manifest");
  }
  const files = manifest.artifacts.map((artifact) => artifact.file);
  if (!files.every(validFile) || new Set(files).size !== files.length) {
    throw new Error("manifest artifact paths are unsafe or duplicated");
  }
  for (const artifact of manifest.artifacts) {
    const bytes = await readFile(join(absoluteRoot, artifact.file));
    if (bytes.length !== artifact.bytes || sha256(bytes) !== artifact.sha256) {
      throw new Error(`sealed artifact mismatch: ${artifact.file}`);
    }
  }
  const expectedFiles = [...files, "manifest.json"].sort();
  const observedFiles = await listFiles(absoluteRoot);
  if (JSON.stringify(observedFiles) !== JSON.stringify(expectedFiles)) {
    throw new Error("public root contains files outside the sealed manifest plus manifest.json");
  }
  return { absoluteRoot, manifest, manifestBytes, manifestSha256, files: expectedFiles };
}

async function treeSha256(root, files) {
  const hash = createHash("sha256");
  for (const file of files) {
    const name = Buffer.from(file, "utf8");
    const bytes = await readFile(join(root, file));
    const lengths = Buffer.alloc(16);
    lengths.writeBigUInt64BE(BigInt(name.length), 0);
    lengths.writeBigUInt64BE(BigInt(bytes.length), 8);
    hash.update(lengths).update(name).update(bytes);
  }
  return hash.digest("hex");
}

async function copyExact(sourceRoot, destinationRoot, files) {
  await absent(destinationRoot, "destination root");
  await mkdir(dirname(destinationRoot), { recursive: true });
  await mkdir(destinationRoot, { recursive: false });
  for (const file of files) {
    const destination = join(destinationRoot, file);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(join(sourceRoot, file), destination);
  }
}

async function writeReceipt(path, receipt) {
  await mkdir(dirname(resolve(path)), { recursive: true });
  await writeFile(path, `${JSON.stringify(receipt, null, 2)}\n`, { flag: "wx", mode: 0o600 });
}

export async function createOffProviderBackup({ sourcePublicRoot, backupRoot, receiptPath }) {
  await absent(receiptPath, "backup receipt");
  const source = await inspectPublicRoot(sourcePublicRoot);
  const absoluteBackupRoot = resolve(backupRoot);
  await copyExact(source.absoluteRoot, absoluteBackupRoot, source.files);
  const backup = await inspectPublicRoot(absoluteBackupRoot);
  const backupObjectSha256 = await treeSha256(absoluteBackupRoot, backup.files);
  const receipt = {
    kind: "koios.news.off-provider-backup-receipt/v1",
    accepted: true,
    createdAt: new Date().toISOString(),
    sourcePublicRoot: source.absoluteRoot,
    backupRoot: absoluteBackupRoot,
    productionManifestSha256: source.manifestSha256,
    artifactCount: source.manifest.artifacts.length,
    backupObjectSha256,
  };
  await writeReceipt(receiptPath, receipt);
  return receipt;
}

export async function restoreOffProviderBackup({ backupRoot, backupReceiptPath, restoreRoot, receiptPath }) {
  await absent(receiptPath, "restore receipt");
  const backupReceiptBytes = await readFile(backupReceiptPath);
  const backupReceipt = JSON.parse(backupReceiptBytes.toString("utf8"));
  if (backupReceipt.kind !== "koios.news.off-provider-backup-receipt/v1" || backupReceipt.accepted !== true) {
    throw new Error("backup receipt is not accepted");
  }
  const backup = await inspectPublicRoot(backupRoot);
  const backupObjectSha256 = await treeSha256(backup.absoluteRoot, backup.files);
  if (backup.manifestSha256 !== backupReceipt.productionManifestSha256 ||
      backupObjectSha256 !== backupReceipt.backupObjectSha256) {
    throw new Error("backup bytes do not match the backup receipt");
  }
  const absoluteRestoreRoot = resolve(restoreRoot);
  await copyExact(backup.absoluteRoot, absoluteRestoreRoot, backup.files);
  const restored = await inspectPublicRoot(absoluteRestoreRoot);
  const restoredObjectSha256 = await treeSha256(restored.absoluteRoot, restored.files);
  if (restoredObjectSha256 !== backupObjectSha256) throw new Error("fresh restore differs from backup object");
  const receipt = {
    kind: "koios.news.fresh-restore-receipt/v1",
    accepted: true,
    createdAt: new Date().toISOString(),
    backupReceiptSha256: sha256(backupReceiptBytes),
    backupObjectSha256,
    productionManifestSha256: backup.manifestSha256,
    restoredManifestSha256: restored.manifestSha256,
    restoredObjectSha256,
    artifactCount: restored.manifest.artifacts.length,
    restoreRoot: absoluteRestoreRoot,
  };
  await writeReceipt(receiptPath, receipt);
  return receipt;
}
