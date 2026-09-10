import { requestInferenceWorkLot } from "@red-cup-engineering/inference-work-lot-service/client";
import { EMPTY_WITNESS_ROOT, identifyNormalizedSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { isNiUri as isCanonicalSha256NiUri } from "@red-cup-engineering/ni-services-section";
import { inferTy } from "@red-cup-engineering/relation-model-notation-typing";

import { recordDigest } from "./ledger.mts";

export const TEXT_WORK_INTENT_TYPE = ["product", ["mark"], ["product", ["mark"], ["product", ["mark"], ["mark"]]]];
export type TextWorkClass = "editorial-judgment" | "accountable-prose" | "general-text" | "classification" | "summarization";

export type TextWorkCandidate = Readonly<{
  text: string;
  serviceClass: TextWorkClass;
  workLot: string;
  requestNi: string;
  resultNi: string;
  settlementNi: string;
  receiptNi: string;
  provider: string;
  model: string;
  marketAccount: string;
  exchange: Readonly<Record<string, unknown>>;
}>;

export type TextWorkIntent = Readonly<{
  value: Readonly<{ term: string; normalForm: unknown; canonicalBytesBase64: string }>;
  instruction: string;
  prompt: string;
  serviceClass: TextWorkClass;
  executionMode: "dry-run" | "live";
}>;

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} is required`);
  return value;
}

function workType(serviceClass: TextWorkClass): "chat" | "classification" | "summarization" {
  if (serviceClass === "classification" || serviceClass === "editorial-judgment") return "classification";
  if (serviceClass === "summarization") return "summarization";
  return "chat";
}

function difficulty(serviceClass: TextWorkClass): number {
  if (serviceClass === "editorial-judgment") return 0.55;
  if (serviceClass === "accountable-prose") return 0.45;
  return 0.3;
}

export async function compileTextWorkIntent(input: Readonly<{
  instruction: string;
  prompt: string;
  serviceClass: TextWorkClass;
  executionMode?: "dry-run" | "live";
  env?: NodeJS.ProcessEnv;
}>): Promise<TextWorkIntent> {
  const env = input.env ?? process.env;
  const executionMode = input.executionMode ?? "live";
  const term = ["pair", ["mark", input.instruction], ["pair", ["mark", input.prompt], ["pair", ["mark", input.serviceClass], ["mark", executionMode]]]];
  const semanticType = inferTy([], term);
  if (semanticType === null) throw new Error("Koios text-work intent does not infer one current RMN type");
  const identified = identifyNormalizedSemanticContent({ objectKind: "koios.text-work-intent", semanticType, term, witnessRoot: EMPTY_WITNESS_ROOT });
  const value = Object.freeze({ term: identified.token, normalForm: identified.envelope.settledBody, canonicalBytesBase64: Buffer.from(identified.bytes).toString("base64") });
  return Object.freeze({ value, instruction: input.instruction, prompt: input.prompt, serviceClass: input.serviceClass, executionMode });
}

export async function requestTextWorkCandidate(input: Readonly<{
  instruction: string;
  prompt: string;
  serviceClass: TextWorkClass;
  executionMode?: "dry-run" | "live";
  env?: NodeJS.ProcessEnv;
  routingProfile?: "bounded" | "extended";
  extendedRoutingRationale?: string;
}>, options: Readonly<{ request?: typeof requestInferenceWorkLot }> = {}): Promise<TextWorkCandidate> {
  const env = input.env ?? process.env;
  const intent = await compileTextWorkIntent(input);
  const workLot = `urn:work-lot:koios-text:${recordDigest({ intent: intent.value.term, serviceClass: intent.serviceClass, executionMode: intent.executionMode }).split(";")[1]}`;
  const market = await (options.request ?? requestInferenceWorkLot)({
    agentUrl: required(env, "INFERENCE_WORK_LOT_AGENT_CARD_URL"),
    request: {
      objective: intent.instruction,
      context: intent.prompt,
      desiredUse: `Return one ${intent.serviceClass} candidate for independent Koios assay and admission.`,
      workType: workType(intent.serviceClass),
      requiredCapabilities: [intent.serviceClass, "text-output"],
      difficulty: difficulty(intent.serviceClass),
      maxTokens: 4096,
      outputSchema: {
        type: "object", additionalProperties: false, required: ["text"],
        properties: { text: { type: "string", minLength: 1 } },
      },
      excludeProviders: [],
      customer: "urn:ame:koios-news",
      workLotId: workLot,
      mode: intent.executionMode,
      ...(input.routingProfile === undefined ? {} : { routingProfile: input.routingProfile }),
      ...(input.extendedRoutingRationale === undefined ? {} : { extendedRoutingRationale: input.extendedRoutingRationale }),
    },
  });
  const result = market.result as Record<string, unknown>;
  const candidate = result["candidate"];
  if (result["outcome"] !== "candidate-pending-customer-acceptance" || candidate === null || typeof candidate !== "object" || Array.isArray(candidate) || typeof (candidate as Record<string, unknown>)["text"] !== "string") {
    throw new Error(`inference work market returned ${String(result["outcome"] ?? "unknown")} without a customer-assayable text candidate`);
  }
  const evidence = result["evidence"] as Record<string, unknown> | undefined;
  const receiptNi = evidence?.["receipt"], settlementNi = evidence?.["settlement"];
  if (!isCanonicalSha256NiUri(receiptNi) || !isCanonicalSha256NiUri(settlementNi)) throw new Error("inference work candidate lacks exact settlement and receipt identities");
  return Object.freeze({
    text: String((candidate as Record<string, unknown>)["text"]), serviceClass: intent.serviceClass, workLot,
    requestNi: market.exchange.inputNi, resultNi: market.resultNi, settlementNi, receiptNi,
    provider: String(result["provider"]), model: String(result["model"]), marketAccount: market.provider.account,
    exchange: Object.freeze(market as unknown as Record<string, unknown>),
  });
}
