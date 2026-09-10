import { randomUUID } from "node:crypto";
import { dirname } from "node:path";

import { sendRmnTask } from "@emsenn/a2a-services-section/client";
import { conformTerm } from "@emsenn/rmn-semantic-conformance/client";
import { loadSettlementAccount } from "@emsenn/rwil-rdf-services/client";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../config.mjs";
import { recordDigest } from "./ledger.mjs";

const CHILD_OPERATION_TYPE = ["product", ["mark"], ["product", ["mark"], ["product", ["mark"], ["mark"]]]];
const CHILD_BUNDLE_TYPE = ["product", ["effect"], CHILD_OPERATION_TYPE];
const OUTER_OPERATION_TYPE = ["product", CHILD_BUNDLE_TYPE, ["mark"]];
const OUTER_BUNDLE_TYPE = ["product", ["effect"], OUTER_OPERATION_TYPE];
const SITE_ROOT = dirname(DEFAULT_CONTENT_PRODUCTION_CONFIG);

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (typeof value !== "string" || value.length === 0) throw new Error(`${name} is required`);
  return value;
}
function resultParts(result: unknown): readonly Record<string, unknown>[] {
  if (result !== null && typeof result === "object" && !Array.isArray(result)) {
    const value = result as Record<string, unknown>;
    if (Array.isArray(value["parts"])) return value["parts"] as Record<string, unknown>[];
    if (Array.isArray(value["artifacts"])) return (value["artifacts"] as Record<string, unknown>[]).flatMap((artifact) => Array.isArray(artifact["parts"]) ? artifact["parts"] as Record<string, unknown>[] : []);
  }
  return [];
}
function resultText(result: unknown): string {
  const part = resultParts(result).find((value) => {
    const content = value["content"];
    return typeof value["text"] === "string" || (content !== null && typeof content === "object" && !Array.isArray(content) && (content as Record<string, unknown>)["$case"] === "text");
  });
  if (part === undefined) return "";
  if (typeof part["text"] === "string") return part["text"];
  const content = part["content"] as Record<string, unknown>;
  return typeof content["value"] === "string" ? content["value"] : "";
}

export type RmnTextInferenceResult = Readonly<{
  text: string;
  model: string;
  law: string;
  proposalNi: string;
  completionNi: string;
  exchange: Readonly<Record<string, unknown>>;
}>;

export type RmnTextInferenceProposal = Readonly<{
  outer: Awaited<ReturnType<typeof conformTerm>>;
  child: Awaited<ReturnType<typeof conformTerm>>;
  model: string;
  law: string;
}>;

export async function compileRmnTextInferenceProposal(input: Readonly<{
  instruction: string;
  prompt: string;
  model: string;
  callerAccount?: string;
  executionMode?: "dry-run" | "live";
  child?: Readonly<{ agentCard: string; account: string; law: string }>;
  env?: NodeJS.ProcessEnv;
}>): Promise<RmnTextInferenceProposal> {
  const env = input.env ?? process.env;
  const rmnAgentCard = required(env, "RMN_CONFORMANCE_AGENT");
  const lissAccount = required(env, "LISS_ACCOUNT");
  const lissLaw = required(env, "LISS_LAW");
  const child = input.child ?? Object.freeze({
    agentCard: required(env, "CLAUDE_CHILD_AGENT_CARD_URL"),
    account: required(env, "CLAUDE_CHILD_ACCOUNT"),
    law: required(env, "CLAUDE_CHILD_LAW"),
  });
  const caller = input.callerAccount ?? loadSettlementAccount(SITE_ROOT).settlement;
  const mode = input.executionMode ?? "live";
  const childOperation = ["pair", ["mark", input.instruction], ["pair", ["mark", input.prompt], ["pair", ["mark", input.model], ["mark", mode]]]];
  const childOperationValue = await conformTerm({ agentUrl: rmnAgentCard, term: childOperation, expectedType: CHILD_OPERATION_TYPE });
  const childCell = {
    law: child.law, caller: lissAccount, provider: child.account,
    precondition: recordDigest({ law: child.law, term: "child-precondition" }), operation: childOperationValue.term,
    postcondition: recordDigest({ law: child.law, term: "child-postcondition" }), refusal: recordDigest({ law: child.law, term: "child-refusal" }),
    evidenceRoot: recordDigest({ law: child.law, term: "child-four-bottom" }), outcome: { positiveEvidence: false, negativeEvidence: false }, measures: [], parent: null,
  };
  const childTerm = ["pair", ["effect", childCell], childOperation];
  const childBundle = await conformTerm({ agentUrl: rmnAgentCard, term: childTerm, expectedType: CHILD_BUNDLE_TYPE });
  const outerOperation = ["pair", childTerm, ["mark", child.agentCard]];
  const outerOperationValue = await conformTerm({ agentUrl: rmnAgentCard, term: outerOperation, expectedType: OUTER_OPERATION_TYPE });
  const outerCell = {
    law: lissLaw, caller, provider: lissAccount,
    precondition: recordDigest({ law: lissLaw, term: "outer-precondition" }), operation: outerOperationValue.term,
    postcondition: recordDigest({ law: lissLaw, term: "outer-postcondition" }), refusal: recordDigest({ law: lissLaw, term: "outer-refusal" }),
    evidenceRoot: recordDigest({ law: lissLaw, term: "outer-four-bottom" }), outcome: { positiveEvidence: false, negativeEvidence: false }, measures: [], parent: null,
  };
  const outer = await conformTerm({ agentUrl: rmnAgentCard, term: ["pair", ["effect", outerCell], outerOperation], expectedType: OUTER_BUNDLE_TYPE });
  return Object.freeze({ outer, child: childBundle, model: input.model, law: lissLaw });
}

export async function procureRmnTextInference(input: Readonly<{
  instruction: string;
  prompt: string;
  model: string;
  executionMode?: "dry-run" | "live";
  child?: Readonly<{ agentCard: string; account: string; law: string }>;
  env?: NodeJS.ProcessEnv;
}>): Promise<RmnTextInferenceResult> {
  const env = input.env ?? process.env;
  const lissAgentCard = required(env, "LISS_AGENT_CARD_URL");
  const proposal = await compileRmnTextInferenceProposal(input);
  const { outer } = proposal;
  const exchange = await sendRmnTask({ agentUrl: lissAgentCard, message: {
    messageId: randomUUID(), role: "ROLE_USER",
    parts: [{ raw: outer.canonicalBytesBase64, metadata: { ni: outer.term }, filename: "inference.rmn.cbor", mediaType: "application/rmn+cbor" }],
    metadata: { law: proposal.law },
  } });
  const disposition = typeof exchange.result?.metadata?.disposition === "string" ? exchange.result.metadata.disposition : "unknown";
  const text = resultText(exchange.result);
  if (disposition !== "completion" || text.length === 0) throw new Error(`typed LISS inference ${disposition}: ${text.slice(0, 500) || "no completion evidence"}`);
  return Object.freeze({ text, model: input.model, law: proposal.law, proposalNi: outer.term, completionNi: exchange.outputNi, exchange: Object.freeze(exchange as unknown as Record<string, unknown>) });
}
