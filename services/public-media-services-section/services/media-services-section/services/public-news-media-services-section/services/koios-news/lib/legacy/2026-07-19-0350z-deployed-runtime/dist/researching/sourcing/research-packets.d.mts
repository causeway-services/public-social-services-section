import { researchPacketJsonSchema, type ResearchPacket, type ResearchPacketClaim, type ResearchPacketInput as ProducingContentResearchPacketInput, type ResearchPacketRisk, type ResearchPacketSource } from "@emsenn/organizing-a-content-farm";
export { researchPacketJsonSchema, type ResearchPacket, type ResearchPacketClaim, type ResearchPacketRisk, type ResearchPacketSource, };
export type ResearchPacketInput = Omit<ProducingContentResearchPacketInput, "configPath"> & Readonly<{
    configPath?: string;
}>;
export declare function researchPacket(input: ResearchPacketInput): ResearchPacket;
//# sourceMappingURL=research-packets.d.mts.map