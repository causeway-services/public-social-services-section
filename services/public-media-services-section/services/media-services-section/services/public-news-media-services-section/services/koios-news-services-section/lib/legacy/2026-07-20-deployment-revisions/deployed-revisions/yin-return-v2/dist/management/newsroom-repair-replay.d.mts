export type NewsroomRepairReplaySettlement = Readonly<Record<string, unknown>>;
/** Exact executable bytes that decide, form, route, and verify one prose
 * repair. A changed digest means a later repair is not the same purchase and
 * may lawfully cross an otherwise active anti-thrashing cooldown once. */
export declare function newsroomRepairMechanismDigest(): string;
export declare function settleNewsroomRepairReplay(input: Readonly<{
    assignmentId: string;
    now?: string;
    dataDir?: string;
    contentDir?: string;
    outputDir?: string;
    socketPath?: string;
}>): Promise<NewsroomRepairReplaySettlement>;
//# sourceMappingURL=newsroom-repair-replay.d.mts.map