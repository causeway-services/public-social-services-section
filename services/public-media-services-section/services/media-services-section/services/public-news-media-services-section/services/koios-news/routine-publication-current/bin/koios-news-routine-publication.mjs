#!/usr/bin/env node
import { planRoutinePublication, recoverRoutinePublication, writeRoutinePublication } from "../src/routine-publication.mjs";

const required = ["--content", "--draft", "--admission", "--authority-grant", "--authority-keys", "--authority-now", "--production-baseline", "--out"];
const optionalValues = ["--assessment-receipt", "--assessment-keys", "--replay-root"];
const usage = "Usage: koios-news-routine-publication --content <corpus-root> --draft <draft.md> --admission <acceptance.json> --authority-grant <signed-grant.json> --authority-keys <trusted-public-keys.json> --authority-now <UTC-instant> --production-baseline <offline-production-dir> [--assessment-receipt <signed-receipt.json> --assessment-keys <trusted-public-keys.json>] --out <candidate-dir> [--replay-root <durable-replay-root>] [--write] [--replace]\n       koios-news-routine-publication --recover --out <candidate-dir> --replay-root <durable-replay-root>\n";
const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) { process.stdout.write(usage); process.exit(0); }
const values = new Map(); let write = false; let replace = false; let recover = false;
for (let index = 0; index < args.length; index += 1) {
  const flag = args[index];
  if (flag === "--write") { write = true; continue; }
  if (flag === "--replace") { replace = true; continue; }
  if (flag === "--recover") { recover = true; continue; }
  if (![...required, ...optionalValues].includes(flag)) { process.stderr.write(`koios-news-routine-publication: unknown option: ${flag}\n`); process.exitCode = 2; break; }
  const value = args[index + 1];
  if (value === undefined || value.startsWith("--")) { process.stderr.write(`koios-news-routine-publication: missing value for ${flag}\n`); process.exitCode = 2; break; }
  values.set(flag, value); index += 1;
}
if (process.exitCode === undefined && (recover ? write || replace || !values.has("--out") || !values.has("--replay-root") : !required.every((flag) => values.has(flag)) || (values.has("--assessment-receipt") !== values.has("--assessment-keys")))) { process.stderr.write(usage); process.exitCode = 2; }
if (process.exitCode === undefined) {
  try {
    if (recover) { process.stdout.write(`${JSON.stringify(recoverRoutinePublication({ outputDir: values.get("--out"), replayRoot: values.get("--replay-root") }), null, 2)}\n`); process.exitCode = 0; }
    else {
    if (write && !values.has("--replay-root")) throw new Error("--replay-root is required with --write");
    const input = { contentDir: values.get("--content"), draftPath: values.get("--draft"), admissionPath: values.get("--admission"), authorityGrantPath: values.get("--authority-grant"), authorityKeysPath: values.get("--authority-keys"), authorityNow: values.get("--authority-now"), productionBaselineDir: values.get("--production-baseline"), assessmentReceiptPath: values.get("--assessment-receipt"), assessmentKeysPath: values.get("--assessment-keys"), outputDir: values.get("--out"), replayRoot: values.get("--replay-root"), replace };
    process.stdout.write(`${JSON.stringify(write ? writeRoutinePublication(input) : planRoutinePublication(input), null, 2)}\n`);
    }
  } catch (error) { process.stderr.write(`koios-news-routine-publication: ${error.message}\n`); process.exitCode = 1; }
}
