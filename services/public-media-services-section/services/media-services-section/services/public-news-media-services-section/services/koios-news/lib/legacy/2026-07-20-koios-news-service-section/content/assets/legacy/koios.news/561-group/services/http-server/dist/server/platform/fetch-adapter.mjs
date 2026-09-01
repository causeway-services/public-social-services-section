// platform/fetch-adapter.ts — WHATWG Fetch <-> Node.js HTTP adapters.
import { Readable } from "node:stream";
import { handler } from "../pipeline.mjs";
import { bodyForbidden, pipeCompressed, planWebResponseCompression, writeContentCodingNotAcceptable, } from "../internal/web-response-compression.mjs";
import { applyTrailerHeader, immediateResponseTrailers, resolveResponseTrailers, writeResponseTrailers, } from "../internal/trailers.mjs";
function requestHasBody(method) {
    const normalized = (method ?? "GET").toUpperCase();
    return normalized !== "GET" && normalized !== "HEAD";
}
function absoluteUrl(req, ctx = {}) {
    if (ctx.url instanceof URL)
        return ctx.url.href;
    const host = req.headers.host ?? "localhost";
    const proto = String(req.headers["x-forwarded-proto"] ?? "http").split(",")[0]?.trim() || "http";
    const base = ctx.base ?? `${proto}://${host}/`;
    return new URL(req.url ?? "/", base).href;
}
function headersFrom(req) {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers ?? {})) {
        if (name.startsWith(":"))
            continue;
        if (Array.isArray(value)) {
            for (const item of value)
                headers.append(name, item);
        }
        else if (value !== undefined) {
            headers.append(name, value);
        }
    }
    return headers;
}
export function toWebRequest(req, ctx = {}) {
    const method = (req.method ?? "GET").toUpperCase();
    const init = {
        method,
        headers: headersFrom(req),
        ...(ctx.signal ? { signal: ctx.signal } : {}),
    };
    if (requestHasBody(method)) {
        init.body = Readable.toWeb(req);
        init.duplex = "half";
    }
    return new Request(absoluteUrl(req, ctx), init);
}
function setResponseHeaders(res, headers) {
    for (const [name, value] of headers) {
        if (name.toLowerCase() === "set-cookie")
            continue;
        try {
            res.setHeader(name, value);
        }
        catch { }
    }
    const getSetCookie = headers.getSetCookie;
    const cookies = typeof getSetCookie === "function" ? getSetCookie.call(headers) : [];
    if (cookies.length) {
        try {
            res.setHeader("set-cookie", cookies);
        }
        catch { }
    }
}
export function sendWebResponse(first, second, options = {}) {
    const responseFirst = first instanceof Response;
    const response = responseFirst ? first : second;
    const res = responseFirst ? second : first;
    return new Promise((resolve) => {
        const status = response.status ?? 200;
        setResponseHeaders(res, response.headers ?? new Headers());
        const isHead = (options.method ?? "").toUpperCase() === "HEAD";
        const body = response.body;
        const headers = {};
        for (const [name, value] of response.headers ?? new Headers())
            headers[name] = value;
        const immediateTrailers = immediateResponseTrailers(response);
        applyTrailerHeader(headers, immediateTrailers);
        const plan = planWebResponseCompression(status, headers, options);
        if (plan.kind === "not-acceptable") {
            writeContentCodingNotAcceptable(headers);
        }
        if (!Object.keys(headers).some((name) => name.toLowerCase() === "content-length")) {
            try {
                res.removeHeader("content-length");
            }
            catch { }
        }
        for (const [name, value] of Object.entries(headers)) {
            if (name.toLowerCase() === "set-cookie")
                continue;
            try {
                res.setHeader(name, value);
            }
            catch { }
        }
        if (plan.kind === "not-acceptable") {
            try {
                res.writeHead(406);
            }
            catch { }
            res.end(isHead ? undefined : "Not Acceptable");
            resolve();
            return;
        }
        if (!body || isHead || bodyForbidden(status)) {
            try {
                res.writeHead(status, response.statusText || undefined);
            }
            catch {
                try {
                    res.writeHead(status);
                }
                catch { }
            }
            res.end();
            resolve();
            return;
        }
        try {
            res.writeHead(status, response.statusText || undefined);
        }
        catch {
            try {
                res.writeHead(status);
            }
            catch { }
        }
        const nodeStream = pipeCompressed(Readable.fromWeb(body), plan);
        const finish = () => resolve();
        const fail = () => {
            try {
                res.destroy();
            }
            catch { }
            resolve();
        };
        nodeStream.on("error", fail);
        nodeStream.on("end", () => {
            void resolveResponseTrailers(response).then((trailers) => {
                writeResponseTrailers(res, trailers);
                res.end();
            }).catch(fail);
        });
        res.on("error", () => {
            try {
                nodeStream.destroy();
            }
            catch { }
            resolve();
        });
        res.on("close", () => {
            if (!res.writableFinished) {
                try {
                    nodeStream.destroy();
                }
                catch { }
            }
        });
        res.on("finish", finish);
        nodeStream.pipe(res, { end: false });
    });
}
function fetchMiddleware(fetchHandler, options = {}) {
    const { passThrough = false, onError } = options;
    return (async (...args) => {
        const ctx = args.length === 1 ? args[0] : args[2];
        const req = args.length === 1 ? ctx.req : args[0];
        const res = args.length === 1 ? ctx.res : args[1];
        let response;
        try {
            response = await fetchHandler(toWebRequest(req, ctx), ctx);
        }
        catch (error) {
            try {
                onError?.(error, req);
            }
            catch { }
            if (!res.headersSent) {
                res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
                res.end("Internal Server Error");
            }
            else {
                try {
                    res.end();
                }
                catch { }
            }
            return true;
        }
        if (response == null) {
            if (passThrough)
                return false;
            if (!res.headersSent) {
                res.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
                res.end("Not Found");
            }
            return true;
        }
        if (!(response instanceof Response)) {
            try {
                onError?.(new TypeError("fetch handler must return a Response"), req);
            }
            catch { }
            if (!res.headersSent) {
                res.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
                res.end("Internal Server Error");
            }
            else {
                try {
                    res.end();
                }
                catch { }
            }
            return true;
        }
        const sendOptions = {
            ...(req.method === undefined ? {} : { method: req.method }),
            ...(req.headers["accept-encoding"] === undefined ? {} : { acceptEncoding: req.headers["accept-encoding"] }),
            ...(req.headers.range === undefined ? {} : { range: req.headers.range }),
        };
        await sendWebResponse(res, response, sendOptions);
        return true;
    });
}
function appToFetch(app) {
    const h = handler(app);
    return async (request) => {
        const chunks = [];
        const status = { code: 200, message: "OK" };
        const responseHeaders = new Headers();
        let resolveResponse = () => { };
        const responsePromise = new Promise((resolve) => {
            resolveResponse = resolve;
        });
        const nodeReq = Object.assign(request.body ? Readable.fromWeb(request.body) : Readable.from([]), {
            method: request.method,
            url: `${new URL(request.url).pathname}${new URL(request.url).search}`,
            headers: {},
            httpVersion: "1.1",
            socket: { remoteAddress: "127.0.0.1" },
            webAbortSignal: request.signal,
        });
        request.headers.forEach((value, key) => {
            nodeReq.headers[key] = value;
        });
        const nodeRes = {
            statusCode: 200,
            statusMessage: "OK",
            headersSent: false,
            writableEnded: false,
            setHeader(name, value) {
                if (Array.isArray(value)) {
                    responseHeaders.delete(name);
                    for (const item of value)
                        responseHeaders.append(name, item);
                }
                else {
                    responseHeaders.set(name, String(value));
                }
            },
            getHeader(name) {
                return responseHeaders.get(name) ?? undefined;
            },
            hasHeader(name) {
                return responseHeaders.has(name);
            },
            removeHeader(name) {
                responseHeaders.delete(name);
            },
            writeHead(code, messageOrHeaders, maybeHeaders) {
                status.code = code;
                if (typeof messageOrHeaders === "string")
                    status.message = messageOrHeaders;
                const headers = typeof messageOrHeaders === "object" ? messageOrHeaders : maybeHeaders;
                for (const [name, value] of Object.entries(headers ?? {}))
                    responseHeaders.set(name, String(value));
                this.headersSent = true;
                return this;
            },
            write(chunk) {
                chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                return true;
            },
            end(chunk) {
                if (chunk !== undefined)
                    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
                this.writableEnded = true;
                resolveResponse(new Response(Buffer.concat(chunks), {
                    status: status.code,
                    statusText: status.message,
                    headers: responseHeaders,
                }));
                return this;
            },
            on() { return this; },
            once() { return this; },
        };
        h(nodeReq, nodeRes);
        return responsePromise;
    };
}
export function fromFetch(input, options = {}) {
    if (typeof input === "function")
        return fetchMiddleware(input, options);
    return appToFetch(input);
}
//# sourceMappingURL=fetch-adapter.mjs.map