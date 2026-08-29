import type { App, Resource, Handler, Middleware } from "../types.mjs";
export type PagesOptions = {
    dir: string;
    extensions?: string[];
    prefix?: string;
};
export type PagesSiteOptions = {
    dir: string;
    types?: Readonly<Record<string, string>>;
    maxBuffer?: number;
    base?: string;
};
export type PageModule = {
    handler: Handler;
    methods?: string[];
    default?: Handler;
};
export type RedirectRule = {
    from: string;
    to: string;
    status: number;
    force: boolean;
};
export type HeaderRule = {
    pattern: string;
    headers: Array<[string, string]>;
};
export declare function loadPages(opts: PagesOptions): Promise<Resource[]>;
/** Build an App from a pages directory. */
export declare function pagesApp(opts: PagesOptions): Promise<App>;
/** Middleware that dynamically re-scans pages on each request (dev mode). */
export declare function devPages(opts: PagesOptions): App["onRequest"];
export declare function pagesSite(options: PagesSiteOptions): App & {
    app: App;
    middlewares: Middleware[];
    resources: Resource[];
};
//# sourceMappingURL=pages.d.mts.map