export type EsiResolver = (src: string, ctx: Record<string, any>) => unknown | Promise<unknown>;
/** The representation-shaped fragment the resolver may return (structurally, a Repr). */
export type EsiFragment = Readonly<{
    status?: number;
    type?: string;
    body?: unknown;
}>;
export declare class EsiIncludeError extends Error {
    readonly src: string | null;
    readonly alt: string | null;
    constructor(src: string | null, alt: string | null);
}
export declare function hasEsi(html: unknown): boolean;
export declare function processEsi(html: unknown, ctx: Record<string, any> | undefined, resolve: EsiResolver, options?: {
    maxDepth?: number;
    vars?: Record<string, unknown>;
}): Promise<string>;
//# sourceMappingURL=transclusion.d.mts.map