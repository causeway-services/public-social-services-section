import { type ContentFarmDeskEnqueueWitness, type ContentFarmDeskObstruction, type EditorialWorkItem } from "@emsenn/organizing-a-content-farm";
import { type KoiosPost } from "./content.mjs";
export type DeskWorkItem = EditorialWorkItem;
export type DeskWitness = ContentFarmDeskEnqueueWitness;
export type DeskObstruction = ContentFarmDeskObstruction;
/** The judgment: every withheld post is a candidate for the night's review. */
export declare function deskWorkItems(posts: readonly KoiosPost[]): readonly DeskWorkItem[];
type FetchLike = (url: string, init?: {
    headers?: Record<string, string>;
    method?: string;
    body?: string;
}) => Promise<{
    ok: boolean;
    status: number;
    json(): Promise<unknown>;
}>;
export type EnqueueOptions = Readonly<{
    hubBase: string;
    hubToken: string;
    at: string;
    contentDir?: string;
    fetchImpl?: FetchLike;
}>;
/** Deposit every withheld candidate the hub does not already hold open. */
export declare function enqueueCandidates(options: EnqueueOptions): Promise<DeskWitness | DeskObstruction>;
export {};
//# sourceMappingURL=desk.d.mts.map