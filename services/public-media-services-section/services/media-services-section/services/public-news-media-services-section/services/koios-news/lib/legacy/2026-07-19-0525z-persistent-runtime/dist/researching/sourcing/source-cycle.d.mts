import { type ContentFarmCandidateState, type ContentFarmRepairPacket, type ContentFarmRepairPacketsReading, type ContentFarmRepairTask, type ContentFarmRepairTaskKind, type ContentFarmSourceCyclePlan, type ContentFarmSourceCycleReading, type ContentFarmSourceCycleWirePlan, type SourceCycleCandidateDraftInternalLinkGuidance, type SourceCycleCandidateReferenceNormalization, type ViewCountsReading, type FetchLike } from "@emsenn/organizing-a-content-farm";
export type SourceWirePlan = ContentFarmSourceCycleWirePlan;
export type KoiosSourceCyclePlan = ContentFarmSourceCyclePlan;
export type KoiosSourceCycleReading = ContentFarmSourceCycleReading;
export type KoiosSourceCycleOptions = Readonly<{
    configPath?: string;
    fetchImpl?: FetchLike;
    env?: Readonly<Record<string, string | undefined>>;
    views?: ViewCountsReading;
    now?: () => string;
    onSkip?: (message: string) => void;
}>;
export type SourceCycleRepairTaskKind = ContentFarmRepairTaskKind;
export type SourceCycleRepairTask = ContentFarmRepairTask;
export type SourceCycleCandidateState = ContentFarmCandidateState;
export type SourceCycleRepairPacket = ContentFarmRepairPacket;
export type SourceCycleRepairPacketsReading = ContentFarmRepairPacketsReading;
export declare function sourceCycleRepairPacketsReading(input: Readonly<{
    runs: readonly unknown[];
    contentDir?: string;
    limit?: number;
}>): SourceCycleRepairPacketsReading;
export declare function normalizeCandidateReferences(path: string): SourceCycleCandidateReferenceNormalization;
export declare function enrichCandidateDraftInternalLinkGuidance(path: string, contentDir?: string): SourceCycleCandidateDraftInternalLinkGuidance;
export declare function koiosSourceCyclePlan(options?: Pick<KoiosSourceCycleOptions, "configPath">): KoiosSourceCyclePlan;
export declare function runKoiosSourceCycle(options?: KoiosSourceCycleOptions): Promise<KoiosSourceCycleReading>;
//# sourceMappingURL=source-cycle.d.mts.map