// Koios's customer-side treaty with the separately hireable Newswire
// Editorial Production settlement. The durable route is one canonical RMN
// proposal: Koios -> Newswire -> LISS -> the selected inference team. There is
// no direct-process or legacy digest compatibility path here.

import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { conformTerm } from "@emsenn/rmn-semantic-conformance/client";
import { loadSettlementAccount } from "@emsenn/rwil-rdf-services/client";

import { compileRmnTextInferenceProposal } from "../../management/rmn-inference-client.mjs";
import { appendKoiosAct, type JsonObject } from "../../management/ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "urn:ame:newswire-editorial-production";
const CONTRACT = "ni:///sha-256;HKxMYmmVzhFWSVM0_aPwv1fLodxbDH44k8MZ4dAq05A";
const CHILD_OPERATION_TYPE = ["product", ["mark"], ["product", ["mark"], ["product", ["mark"], ["mark"]]]];
const CHILD_BUNDLE_TYPE = ["product", ["effect"], CHILD_OPERATION_TYPE];
const LISS_OPERATION_TYPE = ["product", CHILD_BUNDLE_TYPE, ["mark"]];
const OPERATION_TYPE = ["product", ["effect"], LISS_OPERATION_TYPE];
const OUTER_TYPE = ["product", ["effect"], OPERATION_TYPE];
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/newswire-editorial-production");

type JsonRecord = Record<string, unknown>;
type WriterTierId = "free-groq" | "free-gemini" | "free-nim" | "leader-claude";
type ChildRoute = Readonly<{ tier: WriterTierId; model: string; agentCard: string; account: string; law: string }>;

export class NewswireProseRefusal extends Error {
  readonly code: string;
  readonly providerResult?: Readonly<JsonRecord>;
  constructor(code: string, message: string, providerResult?: Readonly<JsonRecord>) {
    super(message); this.name = "NewswireProseRefusal"; this.code = code;
    if (providerResult !== undefined) this.providerResult = providerResult;
  }
}

function record(value: unknown, label: string): JsonRecord {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a record`);
  return value as JsonRecord;
}
function required(name: string): string {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} is required`);
  return value;
}
function providerAccount(root: string): string {
  const binding = record(JSON.parse(readFileSync(resolve(root, "content/evm/accounts/eip155-31337.json"), "utf8")), "Newswire account binding");
  return String(record(binding["account"], "Newswire account")["caip10"]);
}
function providerEndpoint(root: string): string {
  const pkg = record(JSON.parse(readFileSync(resolve(root, "package.json"), "utf8")), "Newswire package");
  const bins = record(pkg["bin"], "Newswire operation catalog");
  if (typeof bins["invoke-service"] !== "string") throw new Error("Newswire does not advertise invoke-service");
  return resolve(root, bins["invoke-service"]);
}
function childRoutes(): readonly ChildRoute[] {
  const routes: ChildRoute[] = [];
  if (process.env["GEMINI_CHILD_AGENT_CARD_URL"] && process.env["GEMINI_CHILD_ACCOUNT"] && process.env["GEMINI_CHILD_LAW"]) routes.push(Object.freeze({
    tier: "free-gemini", model: process.env["GEMINI_CHILD_MODEL"] ?? "gemini-3.1-flash-lite",
    agentCard: required("GEMINI_CHILD_AGENT_CARD_URL"), account: required("GEMINI_CHILD_ACCOUNT"), law: required("GEMINI_CHILD_LAW"),
  }));
  if (process.env["CLAUDE_CHILD_AGENT_CARD_URL"] && process.env["CLAUDE_CHILD_ACCOUNT"] && process.env["CLAUDE_CHILD_LAW"]) routes.push(Object.freeze({
    tier: "leader-claude", model: process.env["CLAUDE_CHILD_MODEL"] ?? "claude-sonnet-4-6",
    agentCard: required("CLAUDE_CHILD_AGENT_CARD_URL"), account: required("CLAUDE_CHILD_ACCOUNT"), law: required("CLAUDE_CHILD_LAW"),
  }));
  return Object.freeze(routes);
}

export async function procureNewswireProse(input: Readonly<{
  purpose: string;
  assignmentId: string;
  assignmentDigest: string;
  prompt: string;
  licensedEditorialStateDigest: string;
  researchPacketDigest: string;
  writingPolicyDigest: string;
  stylePolicyDigest: string;
  requiredSourceUrls: readonly string[];
  now: string;
  dataDir: string;
  executionMode?: "dry-run" | "live";
  providerRoot?: string;
  shape?: "article-body" | "headline";
  admissibleTiers?: readonly WriterTierId[];
}>): Promise<Readonly<{ text: string; model: string; selectedTier: string; selectedProvider: string; providerResult: JsonRecord; providerExchange: JsonRecord; recordedAt: string }>> {
  const admitted = new Set(input.admissibleTiers ?? ["free-gemini", "leader-claude"]);
  const route = childRoutes().find((candidate) => admitted.has(candidate.tier));
  if (route === undefined) throw new NewswireProseRefusal("no-admissible-route", "no configured RMN inference team is admitted by this prose commission");
  const root = resolve(input.providerRoot ?? process.env["KOIOS_NEWSWIRE_EDITORIAL_PRODUCTION_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
  const newswireAccount = providerAccount(root);
  const liss = await compileRmnTextInferenceProposal({
    instruction: [
      input.purpose,
      `Return only the commissioned ${input.shape === "headline" ? "headline" : "article prose"}.`,
      `Assignment: ${input.assignmentId} (${input.assignmentDigest}).`,
      `Licensed editorial state: ${input.licensedEditorialStateDigest}.`,
      `Research packet: ${input.researchPacketDigest}.`,
      `Writing law: ${input.writingPolicyDigest}. Style law: ${input.stylePolicyDigest}.`,
      `Required source URLs: ${[...new Set(input.requiredSourceUrls)].join(", ")}.`,
    ].join("\n"),
    prompt: input.prompt,
    model: route.model,
    callerAccount: newswireAccount,
    ...(input.executionMode === undefined ? {} : { executionMode: input.executionMode }),
    child: route,
  });
  const customerAccount = loadSettlementAccount(SITE_ROOT).settlement;
  const rmnAgent = required("RMN_CONFORMANCE_AGENT");
  const cell = {
    law: CONTRACT, caller: customerAccount, provider: newswireAccount,
    precondition: input.assignmentDigest, operation: liss.outer.term,
    postcondition: input.writingPolicyDigest, refusal: input.licensedEditorialStateDigest,
    evidenceRoot: input.researchPacketDigest, outcome: { positiveEvidence: false, negativeEvidence: false },
    measures: [{ dimension: "commission", quantity: "1", unit: input.shape ?? "article-body" }], parent: null,
  };
  const outer = await conformTerm({ agentUrl: rmnAgent, term: ["pair", ["effect", cell], liss.outer.normalForm], expectedType: OUTER_TYPE });
  const activity = Object.freeze({
    "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Accept", actor: CUSTOMER, target: PROVIDER,
    object: Object.freeze({ type: "ServiceContract", contract: CONTRACT, callerAccount: customerAccount,
      proposal: Object.freeze({ type: "Document", id: outer.term, mediaType: "application/rmn+cbor", content: outer.canonicalBytesBase64 }) }),
  });
  const execution = spawnSync(process.execPath, [providerEndpoint(root)], {
    cwd: root, input: `${JSON.stringify(activity)}\n`, encoding: "utf8", timeout: 1_200_000,
    env: { ...process.env, UNION_LISS_AGENT_CARD_URL: required("LISS_AGENT_CARD_URL") },
    maxBuffer: 64 * 1024 * 1024,
  });
  let delivery: JsonRecord;
  try { delivery = record(JSON.parse(execution.stdout), "Newswire delivery"); }
  catch { throw new NewswireProseRefusal("provider-transport-failure", execution.error?.message || execution.stderr || `Newswire exited ${execution.status}`); }
  const result = record(delivery["object"], "Newswire settlement");
  if (delivery["type"] !== "Accept" || result["disposition"] !== "completion") throw new NewswireProseRefusal("inference-obstructed", String(result["text"] ?? "Newswire refused the RMN prose contribution"), delivery);
  const text = result["text"];
  if (typeof text !== "string" || text.trim() === "") throw new NewswireProseRefusal("empty-prose", "Newswire completed without prose", delivery);
  const exchange = Object.freeze({ proposal: result["proposal"], completion: result["completion"], witness: result["witness"], inference: result["inference"] }) as JsonRecord;
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "writer.prose.delivered", subject: input.assignmentId, data: { service: CONTRACT, provider: "newswire-editorial-production", tier: route.tier, model: route.model, proposal: result["proposal"], completion: result["completion"], witness: result["witness"] } as JsonObject });
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(result["completion"]), data: { assignmentId: input.assignmentId, purpose: input.purpose, provider: "newswire-editorial-production", service: "produce-rmn-prose-contribution", tier: route.tier, model: route.model, price: { amount: 0, currency: "USD" } } });
  return Object.freeze({ text, model: route.model, selectedTier: route.tier, selectedProvider: "newswire-editorial-production", providerResult: delivery, providerExchange: exchange, recordedAt: input.now });
}
