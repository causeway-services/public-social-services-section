#!/usr/bin/env node
// Admits CloudEvent JSON (stdin: one object or a JSON array — the exact
// shape `admit-set-of-feed-arrivals` emits) into MetroPlat's arrival
// journal, by importing the published `@red-cup-engineering/metroplat`
// package's own filesystem-integration functions directly (exact pin,
// see package.json). No second admission door is written here: metroplat
// owns `appendArrivalAtRoot`'s validation and content-addressed dedup, so
// re-admitting the same CloudEvent id a second time is already a no-op —
// this script performs no separate dedup layer of its own.
import { appendArrivalAtRoot } from "@red-cup-engineering/metroplat/integrations/filesystem";
import { arrivalReceiptHandle } from "@red-cup-engineering/metroplat/operations";
import { isDirectEntrypoint, processDataRootConfig, processEntrypointArgument, processPackageRoot } from "@red-cup-engineering/metroplat/integrations/process";

function usage() {
  return "Usage: admit-set-of-arrivals [--root <metroplat-data-root>]\n" +
    "Data root resolves like metroplat's own served process: --root, else\n" +
    "METROPLAT_DATA_ROOT env, else METROPLAT_CONFIG file, else this package's own directory.\n" +
    "Reads one CloudEvent JSON object, or a JSON array of them, from stdin.\n" +
    "Prints one JSON line per input event: {index, ok, arrivalReceiptHandle, obstructions?}.\n";
}

/**
 * Reads all bytes available on a stream without blocking when nothing is piped in.
 * @param {NodeJS.ReadStream} stream - stdin or an equivalent readable stream.
 * @returns {Promise<string>} the stream's full text, or "" when the stream is a TTY.
 */
function readStreamText(stream) {
  if (stream.isTTY) return Promise.resolve("");
  return new Promise((resolve) => {
    let text = "";
    stream.setEncoding("utf8");
    stream.on("data", (chunk) => { text += chunk; });
    stream.on("end", () => resolve(text));
    stream.on("error", () => resolve(text));
  });
}

/**
 * Normalizes stdin JSON (one CloudEvent, or an array of them) into a list.
 * @param {string} text - raw stdin text.
 * @returns {object[]} candidate CloudEvent objects, in input order.
 * @throws {SyntaxError} when `text` is not valid JSON.
 * @throws {TypeError} when `text` is empty.
 */
export function parseArrivalCandidates(text) {
  const trimmed = text.trim();
  if (trimmed === "") throw new TypeError("admit-set-of-arrivals: expected one CloudEvent JSON object, or a JSON array of them, on stdin");
  const parsed = JSON.parse(trimmed);
  return Array.isArray(parsed) ? parsed : [parsed];
}

/**
 * Admits one candidate CloudEvent under `root`, never throwing on a bad candidate.
 * @param {string} root - the MetroPlat data root to admit into.
 * @param {unknown} candidate - one parsed JSON value from stdin.
 * @param {number} index - its position in the stdin batch, echoed onto the result line.
 * @returns {{index: number, ok: boolean, arrivalReceiptHandle?: object, obstructions?: string[]}}
 *   the result line for this one input event.
 */
export function admitArrivalCandidate(root, candidate, index) {
  try {
    const receipt = appendArrivalAtRoot(root, candidate, { rootName: "@red-cup-engineering/metroplat" });
    const handle = arrivalReceiptHandle(receipt);
    return { index, ok: handle.ok, arrivalReceiptHandle: handle };
  } catch (error) {
    return { index, ok: false, obstructions: [error instanceof Error ? error.message : String(error)] };
  }
}

if (isDirectEntrypoint(import.meta.url, processEntrypointArgument())) {
  const argv = process.argv.slice(2);
  if (argv.includes("--help")) { process.stdout.write(usage()); process.exit(0); }

  // Same resolution metroplat's own served process uses for its data root
  // (argv --root > METROPLAT_DATA_ROOT env > METROPLAT_CONFIG file > default),
  // so this script and the production metroplat.service unit agree on the
  // journal root whenever both load the same EnvironmentFile.
  const { dataRoot: root } = processDataRootConfig({
    defaultRoot: processPackageRoot(import.meta.url),
    args: argv,
    envName: "METROPLAT_DATA_ROOT",
    configEnvName: "METROPLAT_CONFIG",
    legacyEnvNames: ["METROPLAT_DATA"],
    dataRootFlag: "--root",
  });

  const stdinText = await readStreamText(process.stdin);
  const candidates = parseArrivalCandidates(stdinText);
  for (let index = 0; index < candidates.length; index += 1) {
    process.stdout.write(`${JSON.stringify(admitArrivalCandidate(root, candidates[index], index))}\n`);
  }
}
