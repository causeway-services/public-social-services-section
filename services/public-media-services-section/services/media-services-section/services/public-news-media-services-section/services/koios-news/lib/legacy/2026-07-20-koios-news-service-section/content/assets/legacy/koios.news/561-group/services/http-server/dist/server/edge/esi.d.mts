import { type EsiResolver } from "@emsenn/computing-with-http/codecs/esi";
import type { Middleware, Repr } from "../types.mjs";
export type EsiOptions = {
    ttlMs?: number;
    timeout?: number;
    maxDepth?: number;
    onError?: (src: string, err: unknown) => string;
    allowedHosts?: string[];
};
export declare function esi(opts?: EsiOptions): Middleware;
export declare function esiResource(handle: (req: unknown, ctx: Record<string, any>) => Repr | null | Promise<Repr | null>, resolve: EsiResolver, options?: {
    maxDepth?: number;
    onErrorStatus?: number;
    vary?: boolean;
}): (req: unknown, ctx: Record<string, any>) => Promise<import("@emsenn/computing-with-http/app").Repr | null>;
//# sourceMappingURL=esi.d.mts.map