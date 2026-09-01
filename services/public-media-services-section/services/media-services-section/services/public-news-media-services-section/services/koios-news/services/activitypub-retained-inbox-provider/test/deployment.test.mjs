import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import test from "node:test";

const here = path.dirname(fileURLToPath(import.meta.url));
const deployment = path.join(here, "..", "content", "deployments", "cold-red-gate");

test("deployment custody is package-local and SQLite uses the writable StateDirectory", async () => {
  const [unit, installer, environment] = await Promise.all([
    readFile(path.join(deployment, "bare-cedar-fog-koios-activitypub.service"), "utf8"),
    readFile(path.join(deployment, "install-and-verify.sh"), "utf8"),
    readFile(path.join(deployment, "koios-activitypub.env.example"), "utf8"),
  ]);
  assert.match(unit, /^StateDirectory=koios-news$/mu);
  assert.match(unit, /^StateDirectoryMode=0700$/mu);
  assert.match(unit, /^Environment=ACTIVITYPUB_SQLITE_PATH=%S\/koios-news\/activitypub\.sqlite$/mu);
  assert.doesNotMatch(unit, /ACTIVITYPUB_SQLITE_PATH=%h\/\.local\/state/u);
  assert.match(unit, /^ProtectHome=read-only$/mu);
  assert.match(installer, /unit must bind SQLite to the writable StateDirectory sandbox/u);
  assert.match(installer, /Never enables or starts it/u);
  assert.match(environment, /^ACTIVITYPUB_KEYS_PATH=\/home\/REPLACE_WITH_VPS_ACCOUNT\//mu);
  assert.match(environment, /^ACTIVITYPUB_INBOX_BEARER_TOKEN_FILE=\/home\/REPLACE_WITH_VPS_ACCOUNT\//mu);
});
