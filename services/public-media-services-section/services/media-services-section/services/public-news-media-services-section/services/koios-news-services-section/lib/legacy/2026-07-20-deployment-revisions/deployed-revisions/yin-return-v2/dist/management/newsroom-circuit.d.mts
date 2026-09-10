import { type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
import { sourceOriginalityFindings } from "../researching/writing/editing/source-originality.mjs";
type CircuitDisposition = "published" | "refused" | "obstructed";
export type NewsroomCircuitResult = Readonly<{
    kind: "koios.newsroom-circuit";
    disposition: CircuitDisposition;
    assignmentId?: string;
    slug?: string;
    reason?: string;
    transitions: readonly string[];
    candidate?: Readonly<{
        manifestDigest: string;
        routeCount: number;
        outputDir: string;
        profile: "cutover-candidate";
    }>;
    learning?: Readonly<{
        evidenceDigest: string;
        proposedMove: string;
    }>;
}>;
export type NewsroomCircuitInput = Readonly<{
    assignmentId?: string;
    now?: string;
    maxRepairs?: number;
    outputDir?: string;
    dataDir?: string;
    contentDir?: string;
}>;
export declare function newsroomSourceOriginalityFindings(body: string, packet: ResearchPacket): ReturnType<typeof sourceOriginalityFindings>;
export declare function runNewsroomCircuit(input?: NewsroomCircuitInput): Promise<NewsroomCircuitResult>;
export declare function runNewsroomCircuitSafely(input?: NewsroomCircuitInput, runner?: (input: NewsroomCircuitInput) => Promise<NewsroomCircuitResult>): Promise<NewsroomCircuitResult>;
export {};
//# sourceMappingURL=newsroom-circuit.d.mts.map