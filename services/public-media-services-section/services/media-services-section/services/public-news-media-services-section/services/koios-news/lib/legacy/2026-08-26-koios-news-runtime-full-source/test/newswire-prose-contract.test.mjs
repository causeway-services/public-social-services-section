import assert from "node:assert/strict";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

import { NewswireProseRefusal, procureNewswireProse } from "../dist/researching/writing/newswire-prose-contract.mjs";
import { recordDigest } from "../dist/management/ledger.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function firstPackage(...candidates) {
  const found = candidates.find((candidate) => existsSync(join(candidate, "package.json")));
  if (found === undefined) throw new Error(`test fixture is unavailable: ${candidates.join(", ")}`);
  return found;
}
const SOURCE_NEWSWIRE = firstPackage(resolve(ROOT, "services/newswire-editorial-production"), resolve(ROOT, "../../services/newswire-editorial-production"));
const SOURCE_LISS = firstPackage(resolve(ROOT, "../logical-inference-service-section"), resolve(ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section"));
const NOW = "2099-07-18T12:00:00.000Z";

test("Koios forms one exact Newswire-to-LISS route while retaining manuscript authority", () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-newswire-customer-"));
  const newswireRoot = join(territory, "newswire-editorial-production");
  const lissRoot = join(territory, "logical-inference-service-section");
  cpSync(SOURCE_NEWSWIRE, newswireRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_NEWSWIRE, "data")) });
  cpSync(SOURCE_LISS, lissRoot, { recursive: true, filter: (path) => !path.startsWith(join(SOURCE_LISS, "data")) });

  const aliases = ["GROQ_API_KEY", "API_KEY_GROQ_GROQCLOUD", "API_KEY_GROQ", "GEMINI_API_KEY", "GOOGLE_API_KEY", "API_KEY_GOOGLE_GEMINI", "NVIDIA_API_KEY", "API_KEY_NVIDIA_NIM", "NVIDIA_NIM_API_KEY", "API_KEY_INFERENCE_NVIDIA"];
  const saved = Object.fromEntries(aliases.map((name) => [name, process.env[name]]));
  const priorLiss = process.env.NEWSWIRE_LISS_ROOT;
  const priorSocket = process.env.NEWSWIRE_LISS_SOCKET;
  const priorData = process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT;
  try {
    for (const name of aliases) delete process.env[name];
    process.env.NEWSWIRE_LISS_ROOT = lissRoot;
    process.env.NEWSWIRE_LISS_SOCKET = join(territory, "no-ambient-liss.sock");
    process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT = join(territory, "newswire-data");
    assert.throws(() => procureNewswireProse({
      purpose: "Rehearse a prose commission without consuming inference.",
      assignmentId: "assignment:test-newswire",
      assignmentDigest: recordDigest({ assignmentId: "assignment:test-newswire" }),
      prompt: "Write a reported analysis from https://example.test/source and return prose only.",
      licensedEditorialStateDigest: recordDigest({ licensed: true }),
      researchPacketDigest: recordDigest({ admitted: true }),
      writingPolicyDigest: recordDigest({ writing: "law" }),
      stylePolicyDigest: recordDigest({ style: "law" }),
      requiredSourceUrls: ["https://example.test/source"],
      now: NOW,
      dataDir: join(territory, "koios-data"),
      executionMode: "dry-run",
      providerRoot: newswireRoot,
    }), (error) => error instanceof NewswireProseRefusal && error.code === "dry-run-has-no-prose");

    const providerEvents = readFileSync(join(territory, "newswire-data", "events", "2099", "07", "18", "2099-07-18-newswire-editorial-production-events.jsonl"), "utf8");
    const routeEvents = readFileSync(join(lissRoot, "data", "journals", "events", "2099", "07", "18", "2099-07-18-logical-inference-service-section-events.jsonl"), "utf8");
    assert.match(providerEvents, /provider\.offer/u);
    assert.match(providerEvents, /provider\.exchange/u);
    assert.match(routeEvents, /free-gemini/u);
    assert.match(routeEvents, /gemini-inference-team/u);
    assert.doesNotMatch(providerEvents, /manuscriptPath|contentDir|customerFilesystem/u);
  } finally {
    for (const name of aliases) { const value = saved[name]; if (value === undefined) delete process.env[name]; else process.env[name] = value; }
    if (priorLiss === undefined) delete process.env.NEWSWIRE_LISS_ROOT; else process.env.NEWSWIRE_LISS_ROOT = priorLiss;
    if (priorSocket === undefined) delete process.env.NEWSWIRE_LISS_SOCKET; else process.env.NEWSWIRE_LISS_SOCKET = priorSocket;
    if (priorData === undefined) delete process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT; else process.env.NEWSWIRE_EDITORIAL_PRODUCTION_DATA_ROOT = priorData;
    rmSync(territory, { recursive: true, force: true });
  }
});
