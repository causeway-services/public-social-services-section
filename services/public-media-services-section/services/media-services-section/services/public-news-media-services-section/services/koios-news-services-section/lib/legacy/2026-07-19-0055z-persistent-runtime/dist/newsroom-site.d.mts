import { compost } from "@emsenn/organizing-a-content-farm";
import type { AssignmentWorkOrder as ContentAssignmentWorkOrder, OperatorManuscriptReading as ContentOperatorManuscriptReading, OperatorWorkQueueItem as ContentOperatorWorkQueueItem, OperatorWorkQueueLane as ContentOperatorWorkQueueLane, OperatorWorkQueueReading as ContentOperatorWorkQueueReading } from "@emsenn/organizing-a-content-farm";
import { type ContentMillRunRecord as MillRunRecord } from "@emsenn/organizing-a-content-mill";
import { type App } from "@emsenn/http-server";
import { type DemandEntry } from "./demand.mjs";
import { deskWorkItems } from "./desk.mjs";
export type KoiosNewsroomOptions = Readonly<{
    contentDir?: string;
    dataDir?: string;
}>;
export type PublicationGameReading = Readonly<{
    kind: "koios.publication-game";
    site: Readonly<{
        name: string;
        url: string;
        editor: string;
    }>;
    generatedAt: string;
    arena: Readonly<{
        property: string;
        beats: readonly string[];
        sourceCounts: Readonly<Record<string, number>>;
    }>;
    demand: Readonly<{
        next: DemandEntry | null;
        count: number;
        byBeat: Readonly<Record<string, readonly DemandEntry[]>>;
    }>;
    desk: Readonly<{
        reviewSkill: string;
        openCandidateCount: number;
        workItems: ReturnType<typeof deskWorkItems>;
    }>;
    runs: Readonly<{
        count: number;
        shipped: number;
        withheld: number;
        obstructed: number;
        recent: readonly Readonly<Record<string, unknown>>[];
    }>;
    compost: Readonly<{
        count: number;
        recent: ReturnType<typeof compost>;
    }>;
    surfaces: Readonly<{
        newsroom: string;
        demand: string;
        runs: string;
        views: string;
    }>;
}>;
export type OperatorManuscriptReading = ContentOperatorManuscriptReading;
export type OperatorAssignmentWorkOrder = ContentAssignmentWorkOrder;
export type OperatorWorkQueueLane = ContentOperatorWorkQueueLane;
export type OperatorWorkQueueItem = ContentOperatorWorkQueueItem;
export type OperatorWorkQueueReading = ContentOperatorWorkQueueReading;
/** Replay the mill's run trace. Unparseable lines are held aside, not folded. */
export declare function replayMillRuns(dataDir: string): readonly MillRunRecord[];
/** Create the newsroom.koios.news backend app: desk readings and operator tools. */
export declare function createKoiosNewsroomApp(options?: KoiosNewsroomOptions): App;
//# sourceMappingURL=newsroom-site.d.mts.map