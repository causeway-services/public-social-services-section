#!/usr/bin/env node
import { createOffProviderBackup, restoreOffProviderBackup } from "../src/production-recovery.mjs";

const [operation, ...args] = process.argv.slice(2);
const parsed = {};
for (let index = 0; index < args.length; index += 2) {
  if (!args[index]?.startsWith("--") || !args[index + 1]) throw new Error(`invalid argument: ${args[index] ?? "missing"}`);
  parsed[args[index].slice(2)] = args[index + 1];
}

try {
  let result;
  if (operation === "backup") {
    result = await createOffProviderBackup({
      sourcePublicRoot: parsed.source,
      backupRoot: parsed.backup,
      receiptPath: parsed.receipt,
    });
  } else if (operation === "restore") {
    result = await restoreOffProviderBackup({
      backupRoot: parsed.backup,
      backupReceiptPath: parsed["backup-receipt"],
      restoreRoot: parsed.restore,
      receiptPath: parsed.receipt,
    });
  } else {
    throw new Error("usage: koios-news-production-recovery backup --source DIR --backup ABSENT_DIR --receipt ABSENT_FILE | restore --backup DIR --backup-receipt FILE --restore ABSENT_DIR --receipt ABSENT_FILE");
  }
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(JSON.stringify({ kind: "koios.news.production-recovery-error/v1", accepted: false, error: error.message }, null, 2));
  process.exitCode = 1;
}
