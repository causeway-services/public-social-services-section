// platform/router.ts — URLPattern-style middleware router and resource builder.
import { sendWebResponse } from "../internal/web-bridge.mjs";
import { requestValidation, responseValidationOpenApiMetadata, responseValidationReport, } from "./validation.mjs";
const METHODS = ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"];
function decodeParam(value) {
    try {
        return decodeURIComponent(value);
    }
    catch {
        return value;
    }
}
function compilePattern(pathname) {
    const names = [];
    let wildcardIndex = 0;
    let re = "";
    let i = 0;
    const escapeLiteral = (s) => s.replace(/[.+^${}()|[\]\\]/g, "\\$&");
    while (i < pathname.length) {
        const ch = pathname[i];
        if (ch === ":") {
            let j = i + 1;
            while (j < pathname.length && /[A-Za-z0-9_]/.test(pathname[j]))
                j++;
            const name = pathname.slice(i + 1, j);
            if (!name) {
                re += escapeLiteral(ch);
                i += 1;
                continue;
            }
            const optional = pathname[j] === "?";
            names.push(name);
            if (optional) {
                if (re.endsWith("/"))
                    re = `${re.slice(0, -1)}(?:/([^/]+))?`;
                else
                    re += "([^/]+)?";
                i = j + 1;
            }
            else {
                re += "([^/]+)";
                i = j;
            }
        }
        else if (ch === "*") {
            names.push(String(wildcardIndex++));
            re += "(.*)";
            i += 1;
        }
        else if (ch === "(") {
            let depth = 1;
            let j = i + 1;
            while (j < pathname.length && depth > 0) {
                if (pathname[j] === "\\") {
                    j += 2;
                    continue;
                }
                if (pathname[j] === "(")
                    depth++;
                else if (pathname[j] === ")")
                    depth--;
                j++;
            }
            names.push(String(wildcardIndex++));
            re += pathname.slice(i, j);
            i = j;
        }
        else {
            re += escapeLiteral(ch);
            i += 1;
        }
    }
    const rx = new RegExp(`^${re}/?$`);
    return {
        exec(path) {
            const m = rx.exec(path);
            if (!m)
                return null;
            const groups = {};
            names.forEach((name, index) => {
                const value = m[index + 1];
                if (value !== undefined)
                    groups[name] = decodeParam(value);
            });
            return groups;
        },
    };
}
function joinPath(prefix, pathname) {
    if (!prefix)
        return pathname || "/";
    const a = prefix.endsWith("/") ? prefix.slice(0, -1) : prefix;
    const b = pathname.startsWith("/") ? pathname : `/${pathname}`;
    return (a + b).replace(/\/+$/, "") || "/";
}
async function dispatch(chain, ctx) {
    let index = -1;
    async function run(i) {
        if (i <= index)
            throw new Error("router: next() called multiple times");
        index = i;
        const fn = chain[i];
        if (!fn)
            return undefined;
        let nextResult = undefined;
        let nextCalled = false;
        const next = async () => {
            nextCalled = true;
            nextResult = await run(i + 1);
            return nextResult;
        };
        const result = await fn(ctx, next);
        if (result !== undefined && result !== null)
            return result;
        return nextCalled ? nextResult : undefined;
    }
    return run(0);
}
function isRepr(value) {
    return typeof value === "object" && value !== null && !(value instanceof Response);
}
function responseBodyBuffer(body) {
    if (body === undefined)
        return Buffer.alloc(0);
    if (Buffer.isBuffer(body))
        return body;
    if (body instanceof Uint8Array)
        return Buffer.from(body);
    return Buffer.from(String(body));
}
function responseProblem(title, issues) {
    return {
        status: 500,
        type: "application/problem+json; charset=utf-8",
        cacheControl: { noStore: true },
        body: JSON.stringify({
            type: "urn:561-group:web-server:problem:response-validation",
            title,
            status: 500,
            issues,
        }),
    };
}
function lowerHeaders(headers) {
    const out = {};
    if (!headers)
        return out;
    if (headers instanceof Headers) {
        for (const [name, value] of headers)
            out[name.toLowerCase()] = value;
        return out;
    }
    for (const [name, value] of Object.entries(headers)) {
        out[name.toLowerCase()] = Array.isArray(value) ? value.join(", ") : value;
    }
    return out;
}
function parseObservedBody(body, contentType) {
    if (body === undefined)
        return undefined;
    if (typeof body !== "string" && !Buffer.isBuffer(body) && !(body instanceof Uint8Array))
        return undefined;
    const text = Buffer.isBuffer(body) || body instanceof Uint8Array ? Buffer.from(body).toString("utf8") : body;
    if (/^application\/(?:[^+]+\+)?json(?:;|$)/i.test(contentType ?? "")) {
        try {
            return text ? JSON.parse(text) : undefined;
        }
        catch {
            return text;
        }
    }
    return text;
}
function isProblemType(contentType) {
    return /^application\/problem\+json(?:;|$)/i.test(contentType ?? "");
}
async function validateRouteResult(ctx, options, result) {
    if (!options.responses || result === undefined || result === null)
        return result;
    if (isRepr(result)) {
        const status = result.status ?? 200;
        const headers = lowerHeaders(result.headers);
        const contentType = result.type ?? headers["content-type"];
        if (isProblemType(contentType))
            return result;
        const report = responseValidationReport({
            trace: ctx.trace,
            spec: options.responses,
            response: {
                status,
                headers,
                ...(contentType !== undefined ? { contentType } : {}),
                body: parseObservedBody(result.body, contentType),
            },
        });
        if (!report.valid)
            return responseProblem(`Invalid response ${report.invalidArea ?? "contract"}`, report.issues);
        return result;
    }
    if (result instanceof Response) {
        const headers = lowerHeaders(result.headers);
        const contentType = result.headers.get("content-type") ?? undefined;
        if (isProblemType(contentType))
            return result;
        const text = result.body === null ? undefined : await result.clone().text();
        const report = responseValidationReport({
            trace: ctx.trace,
            spec: options.responses,
            response: {
                status: result.status,
                headers,
                ...(contentType !== undefined ? { contentType } : {}),
                body: parseObservedBody(text, contentType),
            },
        });
        if (!report.valid)
            return responseProblem(`Invalid response ${report.invalidArea ?? "contract"}`, report.issues);
    }
    return result;
}
function sendRepr(req, res, repr) {
    const { status = 200, type, body = "", headers = {}, etag } = repr;
    const out = { ...headers };
    if (type)
        out["content-type"] = type;
    if (etag)
        out.etag = etag;
    if (repr.lastModified)
        out["last-modified"] = repr.lastModified.toUTCString();
    const vary = repr.vary;
    if (vary)
        out.vary = vary;
    const links = repr.links;
    if (links?.length) {
        out.link = links.map(({ href, rel, type: linkType }) => {
            return `<${href}>; rel="${rel}"${linkType ? `; type="${linkType}"` : ""}`;
        }).join(", ");
    }
    const empty = status === 204 || status === 304;
    if (req.method === "HEAD" || empty) {
        if (!empty)
            out["content-length"] = String(responseBodyBuffer(body).length);
        res.writeHead(status, out);
        res.end();
        return;
    }
    const buf = responseBodyBuffer(body);
    out["content-length"] = String(buf.length);
    res.writeHead(status, out);
    res.end(buf);
}
function requestPath(req, ctx) {
    const path = ctx.path;
    if (path)
        return path;
    return ctx.url?.pathname ?? new URL(req.url ?? "/", ctx.base ?? "http://localhost/").pathname;
}
function isRouteOptions(value) {
    return typeof value === "object" && value !== null && !Array.isArray(value) && !(value instanceof Response);
}
function routeHandlers(options, handlers) {
    const out = [];
    if (options.validation) {
        const validation = requestValidation(options.validation);
        out.push(async (ctx, next) => {
            const result = await validation(ctx);
            if (result !== undefined && result !== null && result !== false)
                return result;
            return next();
        });
    }
    out.push(...(options.middlewares ?? []));
    out.push(...handlers);
    return out;
}
function splitRouteArgs(args) {
    const [first, ...rest] = args;
    if (isRouteOptions(first)) {
        return { options: first, handlers: rest };
    }
    return { options: {}, handlers: args };
}
function mergeOpenApiMetadata(base, extra) {
    return Object.freeze({
        ...extra,
        ...base,
        responses: Object.freeze({
            ...(extra.responses ?? {}),
            ...(base.responses ?? {}),
        }),
    });
}
function routeOpenApi(options) {
    const generated = options.responses ? responseValidationOpenApiMetadata(options.responses) : Object.freeze({ responses: Object.freeze({}) });
    if (options.openapi !== undefined) {
        if (!options.responses || options.openapi === false)
            return options.openapi;
        if (isOpenApiOperation(options.openapi))
            return mergeOpenApiMetadata(options.openapi, generated);
        return Object.freeze(Object.fromEntries(Object.entries(options.openapi).map(([method, operation]) => [
            method,
            mergeOpenApiMetadata(operation, generated),
        ])));
    }
    if (options.validation || options.responses)
        return generated;
    return undefined;
}
function isOpenApiOperation(value) {
    return Boolean(value && typeof value === "object" && ("responses" in value ||
        "summary" in value ||
        "description" in value ||
        "operationId" in value ||
        "tags" in value ||
        "requestBody" in value));
}
export class Router {
    store;
    prefix;
    appMiddlewares;
    constructor(opts = {}, store = { routes: [], middlewares: [] }, prefix = opts.prefix ?? "") {
        this.store = store;
        this.prefix = prefix;
        this.appMiddlewares = opts.middlewares ?? [];
    }
    add(methods, path, args) {
        if (typeof path !== "string")
            throw new TypeError("router: pattern must be a string");
        const { options, handlers } = splitRouteArgs(args);
        if (handlers.length === 0)
            throw new TypeError(`router: ${path} registered with no handler`);
        const pattern = joinPath(this.prefix, path);
        this.store.routes.push({
            methods: methods ? new Set(methods.map((method) => method.toUpperCase())) : null,
            pattern,
            matcher: compilePattern(pattern),
            handlers: routeHandlers(options, handlers),
            options,
        });
        return this;
    }
    get(path, ...handlers) { return this.add(["GET", "HEAD"], path, handlers); }
    head(path, ...handlers) { return this.add(["HEAD"], path, handlers); }
    post(path, ...handlers) { return this.add(["POST"], path, handlers); }
    put(path, ...handlers) { return this.add(["PUT"], path, handlers); }
    patch(path, ...handlers) { return this.add(["PATCH"], path, handlers); }
    delete(path, ...handlers) { return this.add(["DELETE"], path, handlers); }
    options(path, ...handlers) { return this.add(["OPTIONS"], path, handlers); }
    all(path, ...handlers) { return this.add(null, path, handlers); }
    on(methods, path, ...handlers) {
        return this.add([methods].flat().map((method) => method.toUpperCase()), path, handlers);
    }
    use(...args) {
        if (typeof args[0] === "string") {
            const [scope, ...handlers] = args;
            const pattern = joinPath(this.prefix, joinPath(scope, "*"));
            for (const handler of handlers) {
                this.store.middlewares.push({ scope: pattern, matcher: compilePattern(pattern), handler });
            }
            return this;
        }
        const scope = this.prefix ? joinPath(this.prefix, "*") : null;
        const matcher = scope ? compilePattern(scope) : null;
        for (const handler of args) {
            this.store.middlewares.push({ scope, matcher, handler });
        }
        return this;
    }
    group(prefix, fn) {
        const sub = new Router({}, this.store, joinPath(this.prefix, prefix));
        if (fn) {
            fn(sub);
            return this;
        }
        return sub;
    }
    route(methodsOrPrefix, pathOrRouter, ...handlers) {
        if (Array.isArray(methodsOrPrefix)) {
            if (typeof pathOrRouter !== "string" || handlers.length === 0)
                throw new TypeError("router.route: expected methods, path, handler");
            return this.add(methodsOrPrefix, pathOrRouter, handlers);
        }
        if (!(pathOrRouter instanceof Router))
            throw new TypeError("router.route: expected a Router to mount");
        const mountPrefix = joinPath(this.prefix, methodsOrPrefix);
        const snapshot = pathOrRouter._drain();
        for (const route of snapshot.routes) {
            const pattern = joinPath(mountPrefix, route.pattern);
            this.store.routes.push({ ...route, pattern, matcher: compilePattern(pattern) });
        }
        for (const mw of snapshot.middlewares) {
            const scope = mw.scope ? joinPath(mountPrefix, mw.scope) : joinPath(mountPrefix, "*");
            this.store.middlewares.push({ ...mw, scope, matcher: compilePattern(scope) });
        }
        return this;
    }
    mount(prefix, router) {
        return this.route(prefix, router);
    }
    handler(path, method = "GET") {
        const allowed = new Set();
        let pathMatched = false;
        const normalized = method.toUpperCase();
        for (const route of this.store.routes) {
            const params = route.matcher.exec(path);
            if (!params)
                continue;
            pathMatched = true;
            if (route.methods === null) {
                for (const m of METHODS)
                    allowed.add(m);
            }
            else {
                for (const m of route.methods)
                    allowed.add(m);
            }
            if (route.methods === null || route.methods.has(normalized)) {
                return { route, params, allowed, pathMatched };
            }
        }
        return { route: null, params: null, allowed, pathMatched };
    }
    collectMiddleware(path) {
        const handlers = [];
        for (const mw of this.store.middlewares) {
            if (!mw.matcher || mw.matcher.exec(path))
                handlers.push(mw.handler);
        }
        return handlers;
    }
    middleware() {
        return (async (...args) => {
            const ctx = args.length === 1 ? args[0] : args[2];
            const req = args.length === 1 ? ctx.req : args[0];
            const res = args.length === 1 ? ctx.res : args[1];
            const path = requestPath(req, ctx);
            const method = (req.method ?? "GET").toUpperCase();
            const { route, params, allowed, pathMatched } = this.handler(path, method);
            if (!route) {
                if (pathMatched) {
                    if (allowed.has("GET"))
                        allowed.add("HEAD");
                    res.writeHead(405, { allow: [...allowed].join(", "), "content-type": "text/plain; charset=utf-8" });
                    res.end("Method Not Allowed");
                    return true;
                }
                return false;
            }
            Object.assign(ctx.params, params);
            const result = await validateRouteResult(ctx, route.options, await dispatch([...this.collectMiddleware(path), ...route.handlers], ctx));
            if (result === undefined || result === null) {
                if (!res.writableEnded && !res.headersSent) {
                    res.writeHead(204);
                    res.end();
                }
                return true;
            }
            if (result instanceof Response)
                await sendWebResponse(res, result, req.method === undefined ? {} : { method: req.method });
            else if (isRepr(result))
                sendRepr(req, res, result);
            return true;
        });
    }
    toResources() {
        return this.store.routes.map((route) => {
            const openapi = routeOpenApi(route.options);
            const resource = {
                match: route.pattern,
                route: route.pattern,
                ...(route.options.id !== undefined ? { id: route.options.id } : {}),
                ...(route.options.name !== undefined ? { name: route.options.name } : {}),
                ...(route.options.produces !== undefined ? { produces: route.options.produces } : {}),
                ...(route.options.languages !== undefined ? { languages: route.options.languages } : {}),
                handler: async (ctx) => {
                    const result = await validateRouteResult(ctx, route.options, await dispatch([...this.collectMiddleware(ctx.url.pathname), ...route.handlers], ctx));
                    return result === undefined || result === null ? { status: 204 } : result;
                },
            };
            if (route.methods)
                resource.methods = [...route.methods];
            return {
                ...resource,
                ...(route.options.validation !== undefined ? { validation: route.options.validation } : {}),
                ...(route.options.responses !== undefined ? { responses: route.options.responses } : {}),
                ...(openapi !== undefined ? { openapi } : {}),
            };
        });
    }
    toApp(overrides = {}) {
        const extra = overrides.middlewares ?? [];
        return {
            ...overrides,
            middlewares: [this.middleware(), ...this.appMiddlewares, ...extra],
            resources: [...this.toResources(), ...(overrides.resources ?? [])],
        };
    }
    _drain() {
        const prefix = this.prefix;
        const owns = (pattern) => !prefix || pattern === prefix || pattern?.startsWith(`${prefix}/`);
        return {
            routes: this.store.routes
                .filter((route) => owns(route.pattern))
                .map((route) => ({
                methods: route.methods ? new Set(route.methods) : null,
                pattern: prefix && route.pattern.startsWith(prefix) ? (route.pattern.slice(prefix.length) || "/") : route.pattern,
                handlers: route.handlers,
                options: route.options,
            })),
            middlewares: this.store.middlewares
                .filter((mw) => owns(mw.scope))
                .map((mw) => ({
                scope: mw.scope && prefix && mw.scope.startsWith(prefix) ? (mw.scope.slice(prefix.length) || "/") : mw.scope,
                handler: mw.handler,
            })),
        };
    }
}
export function router(opts = {}) {
    return new Router(opts);
}
export function crud(base, handlers) {
    const resources = [];
    if (handlers.list || handlers.create) {
        resources.push({
            match: base,
            methods: [handlers.list ? "GET" : "", handlers.create ? "POST" : ""].filter(Boolean),
            handler: async (ctx) => {
                if (ctx.req.method === "GET" && handlers.list) {
                    const items = await handlers.list(ctx);
                    ctx.res.setHeader("Content-Type", "application/json");
                    ctx.res.writeHead(200).end(JSON.stringify(items));
                }
                else if (ctx.req.method === "POST" && handlers.create) {
                    const item = await handlers.create(ctx);
                    ctx.res.setHeader("Content-Type", "application/json");
                    ctx.res.writeHead(201).end(JSON.stringify(item));
                }
            },
        });
    }
    if (handlers.get || handlers.update || handlers.destroy) {
        resources.push({
            match: `${base}/:id`,
            methods: [
                handlers.get ? "GET" : "",
                handlers.update ? "PUT" : "",
                handlers.update ? "PATCH" : "",
                handlers.destroy ? "DELETE" : "",
            ].filter(Boolean),
            handler: async (ctx) => {
                const m = ctx.req.method ?? "GET";
                if ((m === "GET" || m === "HEAD") && handlers.get) {
                    const item = await handlers.get(ctx);
                    if (!item) {
                        ctx.res.writeHead(404).end("Not Found");
                        return;
                    }
                    ctx.res.setHeader("Content-Type", "application/json");
                    ctx.res.writeHead(200).end(JSON.stringify(item));
                }
                else if ((m === "PUT" || m === "PATCH") && handlers.update) {
                    const item = await handlers.update(ctx);
                    ctx.res.setHeader("Content-Type", "application/json");
                    ctx.res.writeHead(200).end(JSON.stringify(item));
                }
                else if (m === "DELETE" && handlers.destroy) {
                    await handlers.destroy(ctx);
                    ctx.res.writeHead(204).end();
                }
            },
        });
    }
    return resources;
}
//# sourceMappingURL=router.mjs.map