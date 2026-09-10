type CircuitDisposition = "published" | "refused" | "obstructed";
export type NewsroomCircuitResult = Readonly<{
    kind: "koios.newsroom-circuit";
    disposition: CircuitDisposition;
    assignmentId?: string;
    slug?: string;
    reason?: string;
    transitions: readonly string[];
    shadow?: Readonly<{
        manifestDigest: string;
        routeCount: number;
        outputDir: string;
    }>;
    learning?: Readonly<{
        evidenceDigest: string;
        proposedMove: string;
    }>;
}>;
export declare function runNewsroomCircuit(input?: Readonly<{
    assignmentId?: string;
    now?: string;
    maxRepairs?: number;
    outputDir?: string;
}>): Promise<NewsroomCircuitResult>;
export {};
//# sourceMappingURL=newsroom-circuit.d.mts.map