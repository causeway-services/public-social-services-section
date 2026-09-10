#!/usr/bin/env node
import { auditProduction } from "../src/production-audit.mjs";

const options = {};
const names = new Map([
  ["--release-receipt", "releaseReceiptPath"],
  ["--schedule-transition-receipt", "scheduleTransitionReceiptPath"],
  ["--scheduler-tick", "schedulerTickPath"],
  ["--backup-receipt", "backupReceiptPath"],
  ["--restore-receipt", "restoreReceiptPath"],
]);

for (let index = 2; index < process.argv.length; index += 2) {
  const name = names.get(process.argv[index]);
  const value = process.argv[index + 1];
  if (!name || !value) {
    console.error("usage: koios-news-production-audit [--release-receipt PATH] [--schedule-transition-receipt PATH] [--scheduler-tick PATH] [--backup-receipt PATH] [--restore-receipt PATH]");
    process.exit(2);
  }
  options[name] = value;
}

try {
  const result = await auditProduction(options);
  console.log(JSON.stringify(result, null, 2));
  process.exitCode = result.alertRequired ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({
    kind: "koios.news.production-audit-error/v1",
    alertRequired: true,
    error: error.message,
  }, null, 2));
  process.exitCode = 1;
}
