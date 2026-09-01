import type { IncomingMessage, ServerResponse } from "node:http";
import type { App, Context, Resource, Repr } from "../types.mjs";
import type { OpenApiMetadata } from "./openapi.mjs";
import { type RequestValidationSpec, type ResponseValidationSpec } from "./validation.mjs";
export type RouterOptions = {
    prefix?: string;
    middlewares?: App["middlewares"];
};
export type RouterContext = Context & {
    params: Record<string, string>;
    path?: string;
    base?: string;
    query?: URLSearchParams;
};
export type RouterResult = Repr | Response | void | null | undefined;
export type RouterNext = () => Promise<RouterResult>;
export type RouterHandler = (ctx: RouterContext, next: RouterNext) => RouterResult | Promise<RouterResult>;
export type RouterRouteOptions = {
    id?: string;
    name?: string;
    produces?: readonly string[];
    languages?: readonly string[];
    middlewares?: readonly RouterHandler[];
    validation?: RequestValidationSpec;
    responses?: ResponseValidationSpec;
    openapi?: OpenApiMetadata | Readonly<Record<string, OpenApiMetadata>> | false;
};
export type RouterRouteArgument = RouterHandler | RouterRouteOptions;
export type RouterMiddleware = {
    (ctx: Context): Promise<boolean>;
    (req: IncomingMessage, res: ServerResponse, ctx: Context): Promise<boolean>;
};
export type RouterMatch = {
    route: RouteSnapshot | null;
    params: Record<string, string> | null;
    allowed: Set<string>;
    pathMatched: boolean;
};
export type RouteSnapshot = {
    methods: Set<string> | null;
    pattern: string;
    handlers: RouterHandler[];
    options: RouterRouteOptions;
};
export type CrudHandlers<T> = {
    list?: (ctx: Context) => Promise<T[]>;
    get?: (ctx: Context) => Promise<T | null>;
    create?: (ctx: Context) => Promise<T>;
    update?: (ctx: Context) => Promise<T>;
    destroy?: (ctx: Context) => Promise<void>;
};
type Matcher = {
    exec(path: string): Record<string, string> | null;
};
type RouteEntry = RouteSnapshot & {
    matcher: Matcher;
};
type MiddlewareEntry = {
    scope: string | null;
    matcher: Matcher | null;
    handler: RouterHandler;
};
type Store = {
    routes: RouteEntry[];
    middlewares: MiddlewareEntry[];
};
export declare class Router {
    private readonly store;
    private readonly prefix;
    private readonly appMiddlewares;
    constructor(opts?: RouterOptions, store?: Store, prefix?: string);
    private add;
    get(path: string, ...handlers: RouterRouteArgument[]): this;
    head(path: string, ...handlers: RouterRouteArgument[]): this;
    post(path: string, ...handlers: RouterRouteArgument[]): this;
    put(path: string, ...handlers: RouterRouteArgument[]): this;
    patch(path: string, ...handlers: RouterRouteArgument[]): this;
    delete(path: string, ...handlers: RouterRouteArgument[]): this;
    options(path: string, ...handlers: RouterRouteArgument[]): this;
    all(path: string, ...handlers: RouterRouteArgument[]): this;
    on(methods: string | string[], path: string, ...handlers: RouterRouteArgument[]): this;
    use(...handlers: RouterHandler[]): this;
    use(scope: string, ...handlers: RouterHandler[]): this;
    group(prefix: string, fn: (router: Router) => void): this;
    group(prefix: string): Router;
    route(methods: string[], path: string, ...handlers: RouterRouteArgument[]): this;
    route(prefix: string, router: Router): this;
    mount(prefix: string, router: Router): this;
    handler(path: string, method?: string): RouterMatch;
    private collectMiddleware;
    middleware(): RouterMiddleware;
    toResources(): Resource[];
    toApp(overrides?: App): App;
    _drain(): {
        routes: RouteSnapshot[];
        middlewares: Array<{
            scope: string | null;
            handler: RouterHandler;
        }>;
    };
}
export declare function router(opts?: RouterOptions): Router;
export declare function crud<T>(base: string, handlers: CrudHandlers<T>): Resource[];
export {};
//# sourceMappingURL=router.d.mts.map