// Koios-owned retention boundary for completed stage products. A provider
// receipt proves that work ran; this registry preserves the work itself so a
// downstream refusal can resume from that product instead of buying it again.

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createSettlementStore } from "@red-cup-engineering/settlement-record-store-service";

import { recordDigest, type JsonObject } from "./ledger.mts";

const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const LAW_PATH = resolve(SITE_ROOT, "lib/management/contracts/stage-product-registry.json");
const LAW = Object.freeze(JSON.parse(readFileSync(LAW_PATH, "utf8")) as JsonObject);

export const STAGE_PRODUCT_REGISTRY_CONTRACT = recordDigest(LAW);
export const STAGE_PRODUCT_CATEGORY = `${STAGE_PRODUCT_REGISTRY_CONTRACT}.products`;

type StoredStageProduct = Readonly<{
  type: "KoiosStageProduct";
  law: string;
  stage: string;
  requestDigest: string;
  request: JsonObject;
  productDigest: string;
  product: JsonObject;
  producerContract: string;
  recordedAt: string;
  outcome: Readonly<{ positiveEvidence: true; negativeEvidence: false }>;
}>;

export type StageProductSettlement<T extends JsonObject> = Readonly<{
  requestDigest: string;
  productDigest: string;
  product: Readonly<T>;
  reused: boolean;
  recordNi: string;
}>;

function object(value: unknown, label: string): JsonObject {
  if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error(`${label} must be a record`);
  return value as JsonObject;
}

function store(dataDir: string) {
  const agentUrl = process.env["WITNESS_JOURNAL_RDF_AGENT"];
  if (!agentUrl) throw new Error("WITNESS_JOURNAL_RDF_AGENT must name Koios's hired witness-journal RDF provider before a stage product can be purchased");
  return createSettlementStore({ settlementRoot: SITE_ROOT, agentUrl });
}

function admittedProduct(value: unknown, requestDigest: string): StoredStageProduct | undefined {
  const candidate = object(value, "stage-product record");
  if (candidate["type"] !== "KoiosStageProduct" || candidate["law"] !== STAGE_PRODUCT_REGISTRY_CONTRACT || candidate["requestDigest"] !== requestDigest) return undefined;
  const request = object(candidate["request"], "stage-product request");
  const product = object(candidate["product"], "stage product");
  if (recordDigest(request) !== requestDigest) throw new Error(`stage-product request identity mismatch for ${requestDigest}`);
  const productDigest = String(candidate["productDigest"] ?? "");
  if (recordDigest(product) !== productDigest) throw new Error(`stage-product content identity mismatch for ${requestDigest}`);
  return candidate as unknown as StoredStageProduct;
}

/**
 * Return the exact retained result for a stage request, or execute and witness
 * the producer once. The caller admits the product's domain shape before it
 * can cross into the next stage.
 */
export async function settleStageProduct<T extends JsonObject>(input: Readonly<{
  dataDir: string;
  now: string;
  stage: string;
  producerContract: string;
  mechanismDigest: string;
  inputs: JsonObject;
  execute: () => Promise<T>;
  admit: (value: JsonObject) => T;
}>): Promise<StageProductSettlement<T>> {
  if (input.stage.trim() === "") throw new Error("stage-product request must name its stage");
  const request = Object.freeze({
    type: "KoiosStageProductRequest",
    law: STAGE_PRODUCT_REGISTRY_CONTRACT,
    stage: input.stage,
    producerContract: input.producerContract,
    mechanismDigest: input.mechanismDigest,
    inputs: Object.freeze({ ...input.inputs }),
  }) as JsonObject;
  const requestDigest = recordDigest(request);
  const settlementStore = store(input.dataDir);
  const prior = settlementStore.records(STAGE_PRODUCT_CATEGORY)
    .flatMap((value: unknown) => {
      const admitted = admittedProduct(value, requestDigest);
      return admitted === undefined ? [] : [admitted];
    });
  const productDigests = new Set(prior.map((value) => value.productDigest));
  if (productDigests.size > 1) throw new Error(`stage-product collision for ${requestDigest}`);
  const retained = prior.at(-1);
  if (retained !== undefined) {
    const product = Object.freeze(input.admit(retained.product));
    return Object.freeze({ requestDigest, productDigest: retained.productDigest, product, reused: true, recordNi: recordDigest(retained) });
  }

  const product = Object.freeze(input.admit(object(await input.execute(), "executed stage product"))) as Readonly<T>;
  const productDigest = recordDigest(product);
  const record = Object.freeze({
    type: "KoiosStageProduct",
    law: STAGE_PRODUCT_REGISTRY_CONTRACT,
    stage: input.stage,
    requestDigest,
    request,
    productDigest,
    product,
    producerContract: input.producerContract,
    recordedAt: input.now,
    outcome: Object.freeze({ positiveEvidence: true as const, negativeEvidence: false as const }),
  });
  await settlementStore.record({ category: STAGE_PRODUCT_CATEGORY, recordedAt: input.now, record });
  return Object.freeze({ requestDigest, productDigest, product, reused: false, recordNi: recordDigest(record) });
}
