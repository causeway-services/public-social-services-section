import { type JsonObject } from "../../management/ledger.mjs";
import type { AssignmentReading } from "../writing/assignments.mjs";
import type { ResearchPacket } from "./research-packets.mjs";
import type { PriorResearchContext } from "./prior-research-contract.mjs";
type JsonRecord = Record<string, unknown>;
export declare class AdmissibleResearchPacketRefusal extends Error {
    readonly code: string;
    readonly diagnosis: Readonly<JsonRecord>;
    constructor(code: string, message: string, diagnosis: Readonly<JsonRecord>);
}
export declare function readAdmissibleResearchPacket(dataDir: string, assignmentId: string): ResearchPacket | undefined;
export declare function procureAdmissibleResearchPacket(input: Readonly<{
    assignment: AssignmentReading;
    currentEvidence: Readonly<JsonObject>;
    priorResearch: PriorResearchContext;
    now: string;
    dataDir: string;
    maximumAgeHours: number;
    providerRoot?: string;
}>): Promise<Readonly<{
    packet: ResearchPacket;
    packetDigest: string;
    custody: Readonly<JsonObject>;
    custodyDigest: string;
    providerExchange: Readonly<JsonObject>;
}>>;
export {};
//# sourceMappingURL=admissible-research-packet-contract.d.mts.map