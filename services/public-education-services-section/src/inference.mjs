import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dispatchInferenceAsConfiguredCustomer, recordInferenceOutcome } from "@red-cup-engineering/computer-inference-engine/dispatch/inference-dispatch";
import { loadDirectEndpointProviderDescriptors } from "@red-cup-engineering/computer-inference-engine/dispatch/direct-endpoint-provider";
import { DEFAULT_INFERENCE_PRICING_ROOT } from "@red-cup-engineering/computer-inference-engine/dispatch/expected-resolution-pricing-client";

const EDUCATION_ACTOR = "urn:ame:public-education-services-section";
const digest = (bytes) => `ni:///sha-256;${createHash("sha256").update(bytes).digest("base64url")}`;
export class EducationInferenceUnavailable extends Error {}
export class EducationCandidateRefusal extends Error {}

/** Buy one bounded candidate; the editorial consumer alone decides whether it enters its artifact. */
export async function produceEducationArtifact({ env, objective, context, schema, taskClass, maximumOutputTokens, assay, persist, artifactPath }) {
  const pricingRoot = env.EXPECTED_RESOLUTION_PRICING_ROOT || DEFAULT_INFERENCE_PRICING_ROOT;
  const result = await dispatchInferenceAsConfiguredCustomer({
    objective, context, workType: "inquiry", taskClass,
    desiredUse: "Produce one editorial candidate for public education; the receiving section reviews and saves it separately.",
    outputSchema: schema, requiredCapabilities: ["json-output"], requiredQualityTiers: ["frontier-hosted"],
    zeroCashOnly: true, contextOptimization: { mode: "exact" },
    agentBounds: { maximumRequests: 2, maximumOutputTokens, maximumTokensPerRequest: maximumOutputTokens, maximumToolCalls: 0, maximumToolRounds: 0, maximumDepth: 0 },
  }, {
    customerActor: EDUCATION_ACTOR, pricingRoot,
    directDescriptors: loadDirectEndpointProviderDescriptors(env, { configPath: env.DIRECT_ENDPOINT_PROVIDER_CONFIG, pricingRoot }),
  });
  if (result.outcome !== "candidate-pending-customer-acceptance") throw new EducationInferenceUnavailable(`No inference provider delivered ${taskClass}: ${result.outcome}`);
  const outcome = async (decision, evidence) => recordInferenceOutcome({
    workLot: result.workLot, provider: result.provider, taskClass: result.taskClass,
    selectedOffer: result.selectedOffer, receipt: result.receipt.id, receiver: EDUCATION_ACTOR,
    configurationIdentity: result.configurationIdentity, outcome: decision, evidence,
  }, { pricingRoot });
  let admitted;
  try { admitted = assay(result.candidate); }
  catch (error) {
    if (error instanceof EducationCandidateRefusal) await outcome("refused", digest(JSON.stringify({ candidate: result.candidate, reason: error.message })));
    throw error;
  }
  const value = persist(admitted);
  await outcome("accepted", digest(readFileSync(artifactPath)));
  return { value, provider: result.provider, workLot: result.workLot };
}
