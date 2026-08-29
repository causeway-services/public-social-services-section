import { type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
import { sourceOriginalityFindings } from "../researching/writing/editing/source-originality.mjs";
import { type StandardsFinding } from "../researching/writing/editing/standards.mjs";
type CircuitDisposition = "published" | "refused" | "obstructed";
export declare function editorialRepairBudgetExhausted(input: Readonly<{
    repairs: number;
    maxRepairs: number;
    boundedEditorToolRepair: boolean;
}>): boolean;
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
    sourceOriginalityRevalidation?: Readonly<{
        refusalDigest: string;
        priorMechanismDigest: string | null;
        currentMechanismDigest: string;
    }>;
}>;
export declare function admitsSourceOriginalityRevalidation(dataDir: string, assignmentId: string, grant: NonNullable<NewsroomCircuitInput["sourceOriginalityRevalidation"]>): boolean;
export type DeterministicAdmissionRefusal = Readonly<{
    failureLayer: "writer-model" | "deterministic-gates";
    replayFrom: "writer-model" | "deterministic-gates";
    findingCodes: readonly string[];
    reason: string;
}>;
/**
 * Keep checkable manuscript defects out of the independent Editor's context
 * window. A short or script-corrupted body requires a new writer act; any
 * other error surviving Koios's deterministic form settlement means the gate
 * or its carrier adapter needs attention. Warnings remain editorial context.
 */
export declare function deterministicAdmissionRefusal(findings: readonly StandardsFinding[]): DeterministicAdmissionRefusal | undefined;
export declare function newsroomSourceOriginalityFindings(body: string, packet: ResearchPacket): ReturnType<typeof sourceOriginalityFindings>;
export declare function runNewsroomCircuit(input?: NewsroomCircuitInput): Promise<NewsroomCircuitResult>;
export declare function runNewsroomCircuitSafely(input?: NewsroomCircuitInput, runner?: (input: NewsroomCircuitInput) => Promise<NewsroomCircuitResult>): Promise<NewsroomCircuitResult>;
export {};
//# sourceMappingURL=newsroom-circuit.d.mts.map