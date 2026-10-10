import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ROOT_ENV = "EMSWEB_RECORD_JOURNAL_ROOT";

export async function startLocalRecordJournal() {
  const root = mkdtempSync(join(tmpdir(), "emsweb-record-journal-"));
  const prior = process.env[ROOT_ENV];
  process.env[ROOT_ENV] = root;
  let open = true;
  return Object.freeze({
    root,
    async close() {
      if (!open) return;
      open = false;
      if (prior === undefined) delete process.env[ROOT_ENV];
      else process.env[ROOT_ENV] = prior;
      rmSync(root, { recursive: true, force: true });
    },
  });
}
