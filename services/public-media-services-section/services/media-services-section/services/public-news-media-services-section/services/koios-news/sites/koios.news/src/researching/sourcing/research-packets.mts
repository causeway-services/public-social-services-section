// researching/sourcing/research-packets - Koios' default research-packet fiber.
//
// The packet itself is a producing-content carrier: term/beat demand selects
// attention, owned wire bundles provide source-bound evidence, and the packet
// gives writers the cited cut available for a manuscript. Koios only supplies
// its default content-production config path.

import { readFileSync } from "node:fs";

import {
  researchPacket as producingContentResearchPacket,
  researchPacketJsonSchema,
  type ResearchPacket,
  type ResearchPacketClaim,
  type ResearchPacketInput as ProducingContentResearchPacketInput,
  type ResearchPacketRisk,
  type ResearchPacketSource,
} from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mts";

export {
  researchPacketJsonSchema,
  type ResearchPacket,
  type ResearchPacketClaim,
  type ResearchPacketRisk,
  type ResearchPacketSource,
};

export type ResearchPacketInput = Omit<ProducingContentResearchPacketInput, "configPath"> & Readonly<{
  configPath?: string;
}>;

type BundleClaim = Readonly<{
  proposition?: Readonly<{ predicate?: unknown; object?: unknown }>;
}>;

function admittedPrimaryEvidence(packet: ResearchPacket, sourceUrls: readonly string[] | undefined): ResearchPacket {
  const primaryUrls = new Set(sourceUrls ?? []);
  if (primaryUrls.size === 0) return packet;
  const fullSummaries = new Map<string, string>();
  for (const source of packet.intakeSources) {
    if (!primaryUrls.has(source.url)) continue;
    try {
      const bundle = JSON.parse(readFileSync(source.path, "utf8")) as Readonly<{ claims?: readonly BundleClaim[] }>;
      const summary = bundle.claims?.find((claim) => claim.proposition?.predicate === "summary")?.proposition?.object;
      if (typeof summary === "string" && summary.trim() !== "") fullSummaries.set(source.url, summary.replace(/\s+/gu, " ").trim());
    } catch {
      // Keep the upstream bounded carrier. The Section will measure and
      // refuse thin evidence instead of silently asking a writer to pad it.
    }
  }
  if (fullSummaries.size === 0) return packet;
  return Object.freeze({
    ...packet,
    claims: Object.freeze(packet.claims.map((claim) => claim.predicate === "summary" && fullSummaries.has(claim.sourceUrl)
      ? Object.freeze({ ...claim, object: fullSummaries.get(claim.sourceUrl)! })
      : claim)),
  });
}

export function researchPacket(input: ResearchPacketInput): ResearchPacket {
  const packet = admittedPrimaryEvidence(producingContentResearchPacket({
    ...input,
    configPath: input.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG,
  }), input.sourceUrls);
  const mixedEditorialSources = packet.intakeSources.filter((source) => source.domain === "technologyreview.com"
    && /\b(?:building|foundation|enterprise|company|partner|transformation)\b/iu.test(`${source.title} ${source.summary ?? ""}`));
  if (mixedEditorialSources.length === 0) return packet;
  return Object.freeze({
    ...packet,
    editorialRisks: Object.freeze([
      ...packet.editorialRisks,
      Object.freeze({
        code: "mixed-editorial-sponsored-source-risk",
        severity: "warning" as const,
        message: `The packet includes ${mixedEditorialSources.map((source) => source.url).join(", ")} from an outlet that carries both independent editorial and branded single-subject profiles. Do not borrow the masthead's authority or imply editorial independence unless the source metadata establishes it; attribute the specific article and disclose uncertainty about sponsorship when material.`,
      }),
    ]),
  });
}
