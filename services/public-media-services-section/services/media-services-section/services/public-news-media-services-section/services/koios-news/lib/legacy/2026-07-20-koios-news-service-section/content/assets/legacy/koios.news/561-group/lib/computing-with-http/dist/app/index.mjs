import { parseContentType } from "../codecs/http/index.mjs";
import { decompress } from "../codecs/compression/index.mjs";
import { parseMultipartForm } from "../codecs/multipart/index.mjs";
import { sseCommentFrame, sseFrame, sseHeaders } from "../codecs/sse/index.mjs";
export function sse(req, res, onClose) {
    res.writeHead(200, sseHeaders());
    res.flushHeaders?.();
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    res.on("close", () => onClose?.());
    return {
        send(event, data, id) { res.write(sseFrame(event, data, id)); },
        comment(text) { res.write(sseCommentFrame(text)); },
        close() { res.end(); },
    };
}
export function writeSseEvent(sink, name, data, id) {
    try {
        sink.write(sseFrame(name, data, id));
        return true;
    }
    catch {
        return false;
    }
}
export function writeSseComment(sink, text = "") {
    try {
        sink.write(sseCommentFrame(text));
        return true;
    }
    catch {
        return false;
    }
}
export function createProjectedEventHub() {
    const subscribers = new Set();
    const topicSet = (topics) => {
        if (topics === undefined)
            return new Set();
        if (typeof topics === "string")
            return new Set(topics.split(",").map((item) => item.trim()).filter(Boolean));
        return new Set([...topics].map((item) => String(item).trim()).filter(Boolean));
    };
    const accepts = (sub, event) => sub.topics.size === 0 ||
        (event.topic !== undefined && sub.topics.has(String(event.topic))) ||
        (event.type !== undefined && sub.topics.has(String(event.type)));
    return {
        subscribe(sink, opts = {}) {
            const sub = { sink, topics: topicSet(opts.topics) };
            subscribers.add(sub);
            writeSseComment(sink, "ok");
            return () => { subscribers.delete(sub); };
        },
        publish(events) {
            const list = Array.isArray(events) ? events : [events];
            const dead = [];
            for (const sub of subscribers) {
                for (const event of list) {
                    if (!accepts(sub, event))
                        continue;
                    if (!writeSseEvent(sub.sink, String(event.type ?? "message"), event)) {
                        dead.push(sub);
                        break;
                    }
                }
            }
            for (const sub of dead)
                subscribers.delete(sub);
        },
        keepAlive() {
            const dead = [];
            for (const sub of subscribers)
                if (!writeSseComment(sub.sink, "ka"))
                    dead.push(sub);
            for (const sub of dead)
                subscribers.delete(sub);
            return subscribers.size;
        },
        size: () => subscribers.size,
    };
}
const WELL_KNOWN_TOKEN = /^[A-Za-z0-9._~-]+$/;
function assertWellKnownName(name) {
    if (!WELL_KNOWN_TOKEN.test(name) || name === "." || name === "..") {
        throw new TypeError(`invalid well-known name: ${name}`);
    }
}
function wellKnownBase(basePath) {
    if (!basePath)
        return "/.well-known";
    const trimmed = basePath.replace(/\/+$/, "");
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}
function wellKnownExactPath(basePath, name) {
    return `${basePath}/${name}`;
}
function escapeRegex(input) {
    return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function wellKnownPrefixRegex(path) {
    return new RegExp(`^${escapeRegex(path)}(?:/(?<remainder>.*))?$`);
}
function wellKnownEntryHandler(entry) {
    if (entry.handler)
        return entry.handler;
    if (!entry.repr)
        throw new TypeError(`well-known entry ${entry.name} needs a handler or repr`);
    const representation = entry.repr;
    return async (ctx) => {
        const remainder = ctx.params.remainder ?? "";
        return typeof representation === "function" ? await representation(remainder, ctx) : representation;
    };
}
export function wellKnown(entries, opts = {}) {
    const basePath = wellKnownBase(opts.basePath);
    const resources = entries.map((entry) => {
        assertWellKnownName(entry.name);
        const path = wellKnownExactPath(basePath, entry.name);
        const resource = {
            match: entry.prefix ? wellKnownPrefixRegex(path) : path,
            methods: entry.methods ?? ["GET", "HEAD"],
            handler: wellKnownEntryHandler(entry),
        };
        if (entry.produces)
            resource.produces = entry.produces;
        return resource;
    });
    return { resources };
}
export function jsonRepr(body, options = {}) {
    const opts = typeof options === "number" ? { status: options } : options;
    const indent = opts.pretty === true ? 2 : typeof opts.pretty === "number" ? opts.pretty : undefined;
    const serialized = JSON.stringify(body, null, indent) ?? "null";
    return repr({
        ...opts,
        type: opts.type ?? "application/json; charset=utf-8",
        body: opts.newline === false ? serialized : `${serialized}\n`,
    });
}
export function textRepr(body, options = {}) {
    const opts = typeof options === "number" ? { status: options } : options;
    return repr({
        ...opts,
        type: opts.type ?? "text/plain; charset=utf-8",
        body,
    });
}
export function htmlRepr(body, options = {}) {
    const opts = typeof options === "number" ? { status: options } : options;
    return repr({
        ...opts,
        type: opts.type ?? "text/html; charset=utf-8",
        body,
    });
}
export function emptyRepr(status = 204, options = {}) {
    return repr({ ...options, status });
}
export async function readBody(req, options = {}) {
    const opts = typeof options === "number" ? { maxBytes: options, maxEncodedBytes: options } : options;
    const maxBytes = opts.maxBytes ?? Infinity;
    const maxEncodedBytes = opts.maxEncodedBytes ?? maxBytes;
    const raw = await new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let overLimit = false;
        req.on("data", (chunk) => {
            if (overLimit)
                return;
            const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            size += buffer.length;
            if (size > maxEncodedBytes) {
                overLimit = true;
                reject(new RangeError(`request body exceeded ${maxEncodedBytes} bytes`));
                req.destroy();
                return;
            }
            chunks.push(buffer);
        });
        req.on("end", () => {
            if (!overLimit)
                resolve(Buffer.concat(chunks, size));
        });
        req.on("error", reject);
    });
    if (opts.decodeContentEncoding === false)
        return raw;
    return decodeContentEncodedBody(raw, opts.contentEncoding ?? req.headers?.["content-encoding"], maxBytes);
}
function parseContentCodings(value) {
    const raw = typeof value === "string"
        ? value
        : Array.isArray(value)
            ? value.join(",")
            : undefined;
    if (!raw)
        return [];
    const codings = [];
    for (const part of raw.split(",").map((item) => item.trim().toLowerCase()).filter(Boolean)) {
        if (part === "identity")
            continue;
        if (part === "br" || part === "gzip" || part === "deflate" || part === "zstd")
            codings.push(part);
        else
            throw new TypeError(`unsupported request content-encoding: ${part}`);
    }
    return Object.freeze(codings);
}
async function decodeContentEncodedBody(body, contentEncoding, maxBytes) {
    let decoded = body;
    const codings = parseContentCodings(contentEncoding);
    for (const coding of [...codings].reverse()) {
        decoded = await decompress(decoded, coding);
        if (decoded.length > maxBytes)
            throw new RangeError(`decoded request body exceeded ${maxBytes} bytes`);
    }
    return decoded;
}
export async function readTextBody(req, options = {}) {
    const contentType = parseContentType(options.contentType ?? req.headers["content-type"]);
    const charset = contentType?.params["charset"] ?? "utf-8";
    return decodeBody(await readBody(req, options), charset);
}
export async function readJsonBody(req, options = {}) {
    const text = await readTextBody(req, options);
    if (!text.trim())
        return options.empty;
    return JSON.parse(text);
}
export async function readFormBody(req, options = {}) {
    const contentType = parseContentType(options.contentType ?? req.headers["content-type"]);
    if (contentType !== null && contentType.type !== "application/x-www-form-urlencoded") {
        throw new TypeError(`expected application/x-www-form-urlencoded body, got ${contentType.type}`);
    }
    return new URLSearchParams(await readTextBody(req, options));
}
export async function readMultipartBody(req, options = {}) {
    const contentType = parseContentType(options.contentType ?? req.headers["content-type"]);
    if (contentType?.type !== "multipart/form-data") {
        throw new TypeError(`expected multipart/form-data body, got ${contentType?.type ?? "missing content-type"}`);
    }
    const boundary = contentType.params["boundary"];
    if (!boundary)
        throw new TypeError("multipart/form-data boundary is required");
    return parseMultipartForm(await readBody(req, options), boundary);
}
function decodeBody(body, charset) {
    const normalized = charset.toLowerCase();
    if (normalized === "utf-8" || normalized === "utf8")
        return body.toString("utf8");
    if (normalized === "us-ascii" || normalized === "ascii")
        return body.toString("ascii");
    if (normalized === "iso-8859-1" || normalized === "latin1")
        return body.toString("latin1");
    throw new TypeError(`unsupported request charset: ${charset}`);
}
function repr(options) {
    const out = {};
    if (options.status !== undefined)
        out.status = options.status;
    if (options.headers !== undefined)
        out.headers = options.headers;
    if (options.trailers !== undefined)
        out.trailers = options.trailers;
    if (options.type !== undefined)
        out.type = options.type;
    if (options.body !== undefined)
        out.body = options.body;
    if (options.cacheControl !== undefined)
        out.cacheControl = options.cacheControl;
    if (options.security !== undefined)
        out.security = options.security;
    if (options.etag !== undefined)
        out.etag = options.etag;
    if (options.lastModified !== undefined)
        out.lastModified = options.lastModified;
    return out;
}
//# sourceMappingURL=index.mjs.map