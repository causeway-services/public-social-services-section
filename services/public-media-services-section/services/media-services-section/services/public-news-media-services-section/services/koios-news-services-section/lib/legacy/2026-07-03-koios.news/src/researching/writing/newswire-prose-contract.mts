// Koios's customer-side treaty with the separately hireable Newswire
// Editorial Production settlement. The durable route is one canonical RMN
// proposal: Koios -> Newswire -> inference market -> the selected inference die. There is
// no direct-process or legacy digest compatibility path here.

import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { conformTerm } from "@red-cup-engineering/relation-model-notation-conformance/client";
import { loadSettlementAccount } from "@lenticule-science/rwil-rdf-projection-service/client";

import { compileTextWorkIntent, TEXT_WORK_INTENT_TYPE } from "../../management/inference-work-market-client.mjs";
import { appendKoiosAct, recordDigest, type JsonObject } from "../../management/ledger.mjs";
import { settleStageProduct, STAGE_PRODUCT_REGISTRY_CONTRACT } from "../../management/stage-product-registry.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "https://koios.news/activitypub/actor";
const PROVIDER = "urn:ame:newswire-editorial-production";
const CONTRACT = "ni:///sha-256;39byDc2_ULR8hEaz8_4s4wvFJcXhqgIFAZSyXc1s8kc";
const OPERATION_TYPE = TEXT_WORK_INTENT_TYPE;
const OUTER_TYPE = ["product", ["effect"], OPERATION_TYPE];
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/newswire-editorial-production");

type JsonRecord = Record<string, unknown>;
type NewswireProseProduct = JsonObject & Readonly<{
  type: "KoiosNewswireProseProduct";
  text: string;
  model: string;
  selectedTier: string;
  selectedProvider: string;
  providerResult: JsonRecord;
  providerExchange: JsonRecord;
  recordedAt: string;
}>;

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
function admittedNewswireProseProduct(value: JsonObject): NewswireProseProduct {
  const required = ["text", "model", "selectedTier", "selectedProvider", "recordedAt"] as const;
  if (value["type"] !== "KoiosNewswireProseProduct" || required.some((field) => typeof value[field] !== "string" || String(value[field]).length === 0)) throw new Error("retained Newswire product is incomplete");
  record(value["providerResult"], "retained Newswire provider result");
  record(value["providerExchange"], "retained Newswire provider exchange");
  return Object.freeze(value as NewswireProseProduct);
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
}>): Promise<Readonly<{ text: string; model: string; selectedTier: string; selectedProvider: string; providerResult: JsonRecord; providerExchange: JsonRecord; recordedAt: string; stageProductDigest: string; reused: boolean }>> {
  const root = resolve(input.providerRoot ?? process.env["KOIOS_NEWSWIRE_EDITORIAL_PRODUCTION_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
  const newswireAccount = providerAccount(root);
  const instruction = [
      input.purpose,
      `Return only the commissioned ${input.shape === "headline" ? "headline" : "article prose"}.`,
      `Assignment: ${input.assignmentId} (${input.assignmentDigest}).`,
      `Licensed editorial state: ${input.licensedEditorialStateDigest}.`,
      `Research packet: ${input.researchPacketDigest}.`,
      `Writing law: ${input.writingPolicyDigest}. Style law: ${input.stylePolicyDigest}.`,
      `Required source URLs: ${[...new Set(input.requiredSourceUrls)].join(", ")}.`,
    ].join("\n");
  const stage = await settleStageProduct<NewswireProseProduct>({
    dataDir: input.dataDir,
    now: input.now,
    stage: input.shape === "headline" ? "newswire.accountable-headline" : "newswire.article-body",
    producerContract: CONTRACT,
    mechanismDigest: recordDigest({ type: "KoiosNewswireProseMechanism", version: 3, registry: STAGE_PRODUCT_REGISTRY_CONTRACT, route: "RMN->Newswire->inference-work-market" }),
    inputs: {
      purposeDigest: recordDigest(input.purpose),
      assignmentDigest: input.assignmentDigest,
      instructionDigest: recordDigest(instruction),
      promptDigest: recordDigest(input.prompt),
      licensedEditorialStateDigest: input.licensedEditorialStateDigest,
      researchPacketDigest: input.researchPacketDigest,
      writingPolicyDigest: input.writingPolicyDigest,
      stylePolicyDigest: input.stylePolicyDigest,
      requiredSourceUrlsDigest: recordDigest([...new Set(input.requiredSourceUrls)]),
      shape: input.shape ?? "article-body",
      serviceClass: "accountable-prose",
      executionMode: input.executionMode ?? "live",
    },
    execute: async () => {
      const intent = await compileTextWorkIntent({
        instruction,
        prompt: input.prompt,
        serviceClass: "accountable-prose",
        ...(input.executionMode === undefined ? {} : { executionMode: input.executionMode }),
      });
      const customerAccount = loadSettlementAccount(SITE_ROOT).settlement;
      const rmnAgent = required("RMN_CONFORMANCE_AGENT");
      const cell = {
        law: CONTRACT, caller: customerAccount, provider: newswireAccount,
        precondition: input.assignmentDigest, operation: intent.value.term,
        postcondition: input.writingPolicyDigest, refusal: input.licensedEditorialStateDigest,
        evidenceRoot: input.researchPacketDigest, outcome: { positiveEvidence: false, negativeEvidence: false },
        measures: [{ dimension: "commission", quantity: "1", unit: input.shape ?? "article-body" }], parent: null,
      };
      const outer = await conformTerm({ agentUrl: rmnAgent, term: ["pair", ["effect", cell], intent.value.normalForm], expectedType: OUTER_TYPE });
      const activity = Object.freeze({
        "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Accept", actor: CUSTOMER, target: PROVIDER,
        object: Object.freeze({ type: "ServiceContract", contract: CONTRACT, callerAccount: customerAccount,
          proposal: Object.freeze({ type: "Document", id: outer.term, mediaType: "application/rmn+cbor", content: outer.canonicalBytesBase64 }) }),
      });
      const execution = spawnSync(process.execPath, [providerEndpoint(root)], {
        cwd: root, input: `${JSON.stringify(activity)}\n`, encoding: "utf8", timeout: 1_200_000,
        env: { ...process.env, INFERENCE_WORK_LOT_AGENT_CARD_URL: required("INFERENCE_WORK_LOT_AGENT_CARD_URL") },
        maxBuffer: 64 * 1024 * 1024,
      });
      let delivery: JsonRecord;
      try { delivery = record(JSON.parse(execution.stdout), "Newswire delivery"); }
      catch { throw new NewswireProseRefusal("provider-transport-failure", execution.error?.message || execution.stderr || `Newswire exited ${execution.status}`); }
      const result = record(delivery["object"], "Newswire settlement");
      if (delivery["type"] !== "Accept" || result["disposition"] !== "completion") {
        const inferenceRefusal = record(result["inference"] ?? {}, "Newswire inference evidence");
        const refusalText = typeof result["text"] === "string" && result["text"].trim() !== "" ? result["text"] : undefined;
        throw new NewswireProseRefusal("inference-obstructed", refusalText ?? `Newswire refused the RMN prose contribution (inference disposition: ${String(inferenceRefusal["disposition"] ?? "unknown")})`, delivery);
      }
      const text = result["text"];
      if (typeof text !== "string" || text.trim() === "") throw new NewswireProseRefusal("empty-prose", "Newswire completed without prose", delivery);
      const exchange = Object.freeze({ proposal: result["proposal"], completion: result["completion"], witness: result["witness"], inference: result["inference"] }) as JsonRecord;
      const inference = record(result["inference"], "Newswire inference evidence");
      return Object.freeze({ type: "KoiosNewswireProseProduct", text, model: String(inference["model"] ?? "provider-managed"), selectedTier: "market-selected", selectedProvider: String(inference["provider"] ?? "newswire-editorial-production"), providerResult: delivery, providerExchange: exchange, recordedAt: input.now }) as NewswireProseProduct;
    },
    admit: admittedNewswireProseProduct,
  });
  const product = stage.product as NewswireProseProduct;
  const result = record(product.providerResult["object"], "retained Newswire settlement");
  if (stage.reused) {
    await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "writer.prose.reused", subject: input.assignmentId, data: { service: CONTRACT, provider: product.selectedProvider, serviceClass: "accountable-prose", stageProductRequestDigest: stage.requestDigest, stageProductDigest: stage.productDigest, inferencePurchased: false } });
  } else {
    await appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "writer.prose.delivered", subject: input.assignmentId, data: { service: CONTRACT, provider: product.selectedProvider, serviceClass: "accountable-prose", proposal: result["proposal"], completion: result["completion"], witness: result["witness"], stageProductDigest: stage.productDigest } as JsonObject });
    await appendKoiosAct({ dataRoot: input.dataDir, ledger: "provider-usage", instant: input.now, act: "provider.service.consumed", subject: String(result["completion"]), data: { assignmentId: input.assignmentId, purpose: input.purpose, provider: product.selectedProvider, service: "produce-rmn-prose-contribution", serviceClass: "accountable-prose", price: { amount: 0, currency: "USD" }, resultBodyRecorded: true, resultBodyDigest: recordDigest(product.text), stageProductRequestDigest: stage.requestDigest, stageProductDigest: stage.productDigest } });
  }
  return Object.freeze({ text: product.text, model: product.model, selectedTier: product.selectedTier, selectedProvider: product.selectedProvider, providerResult: product.providerResult, providerExchange: product.providerExchange, recordedAt: product.recordedAt, stageProductDigest: stage.productDigest, reused: stage.reused });
}
