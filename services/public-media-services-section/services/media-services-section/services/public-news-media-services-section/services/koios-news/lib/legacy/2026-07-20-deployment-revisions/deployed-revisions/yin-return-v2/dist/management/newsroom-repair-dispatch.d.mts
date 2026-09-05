import { editorRequestsCarrierRepair } from "../draft-repair.mjs";
export { editorRequestsCarrierRepair };
export type NewsroomRepairDispatchResult = Readonly<{
    kind: "koios.newsroom-repair-dispatch";
    disposition: "replay-ready" | "refused" | "obstructed";
    predecessorAssignmentId: string;
    successorAssignmentId?: string;
    slug?: string;
    reason?: string;
    repairDemandDigest?: string;
    repairContextDigest?: string;
    providerSettlementDigest?: string;
}>;
export declare function dispatchNewsroomRepair(input: Readonly<{
    assignmentId: string;
    now?: string;
    dataDir?: string;
    contentDir?: string;
    socketPath?: string;
    pollMilliseconds?: number;
    timeoutMilliseconds?: number;
}>): Promise<NewsroomRepairDispatchResult>;
//# sourceMappingURL=newsroom-repair-dispatch.d.mts.map