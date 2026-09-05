// researching/sourcing/research-packets - Koios' default research-packet fiber.
//
// The packet itself is a producing-content carrier: term/beat demand selects
// attention, owned wire bundles provide source-bound evidence, and the packet
// gives writers the cited cut available for a manuscript. Koios only supplies
// its default content-production config path.

import {
  researchPacket as producingContentResearchPacket,
  researchPacketJsonSchema,
  type ResearchPacket,
  type ResearchPacketClaim,
  type ResearchPacketInput as ProducingContentResearchPacketInput,
  type ResearchPacketRisk,
  type ResearchPacketSource,
} from "@emsenn/organizing-a-content-farm";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mjs";

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

export function researchPacket(input: ResearchPacketInput): ResearchPacket {
  return producingContentResearchPacket({
    ...input,
    configPath: input.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG,
  });
}
