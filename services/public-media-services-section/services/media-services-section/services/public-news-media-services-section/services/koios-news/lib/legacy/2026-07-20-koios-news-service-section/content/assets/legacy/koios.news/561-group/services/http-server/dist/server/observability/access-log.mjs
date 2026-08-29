// observability/access-log.ts — NCSA/Common/Combined access logging.
import { witness, UtteranceLog } from "../internal/witness.mjs";
import { clientIp as requestClientIp } from "../internal/net.mjs";
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function pad(value) {
    return String(value).padStart(2, "0");
}
export function commonLogDate(date = new Date()) {
    return `${pad(date.getUTCDate())}/${MONTHS[date.getUTCMonth()]}/${date.getUTCFullYear()}:` +
        `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} +0000`;
}
function isContext(info) {
    return "startedAt" in info && "url" in info && "locals" in info;
}
function lineParts(info) {
    if (isContext(info)) {
        return { ctx: info, status: info.res.statusCode, ms: Date.now() - info.startedAt }; // law-allow: wall-clock-as-data — request duration telemetry testimony
    }
    const ctx = info.ctx ?? {
        req: info.req,
        res: info.res,
        app: {},
        url: new URL(info.req.url ?? "/", "http://localhost/"),
        params: {},
        locals: {},
        trace: { kind: "web-server.request-trace", id: "access-log", entries: [] },
        startedAt: Date.now(), // law-allow: wall-clock-as-data — request duration telemetry testimony (fallback start)
    };
    return { ctx, status: info.status ?? info.res.statusCode, ms: info.ms ?? Date.now() - ctx.startedAt }; // law-allow: wall-clock-as-data — request duration telemetry testimony
}
function headerText(value) {
    if (Array.isArray(value))
        return value.join(",");
    return value === undefined ? "-" : String(value);
}
export function formatAccessLog(info, options = {}) {
    const { ctx, status, ms } = lineParts(info);
    const { req, res } = ctx;
    const method = req.method ?? "GET";
    const url = req.url ?? "/";
    const version = `HTTP/${req.httpVersion ?? "1.1"}`;
    const ip = requestClientIp(req) || "-";
    const bytes = headerText(res.getHeader("content-length"));
    if (typeof options.format === "function")
        return options.format(ctx, ms, status);
    const format = options.format ?? "combined";
    if (format === "short")
        return `${ip} ${method} ${url} ${status} ${bytes} ${ms.toFixed(1)}ms`;
    let line = `${ip} - - [${commonLogDate()}] "${method} ${url} ${version}" ${status} ${bytes}`;
    if (format === "combined") {
        line += ` "${headerText(req.headers["referer"])}" "${headerText(req.headers["user-agent"])}"`;
    }
    line += ` ${ms.toFixed(1)}ms`;
    return line;
}
function writeAccessLine(store, write, info, options) {
    const { ctx, status } = lineParts(info);
    if (options.skip?.(ctx, status))
        return;
    const line = formatAccessLog(info, options);
    witness(store, { subject: ctx.req.url ?? "/", predicate: "access", object: line }, [true, false]); // store append order is the trace
    write(line);
}
export function accessLog(first = {}, second = {}) {
    const store = new UtteranceLog();
    if (typeof first === "function") {
        const write = first;
        const options = second;
        return (info) => writeAccessLine(store, write, info, options);
    }
    const options = first;
    const write = options.write ?? ((line) => process.stdout.write(`${line}\n`));
    return (ctx) => {
        const started = Date.now(); // law-allow: wall-clock-as-data — request duration telemetry testimony (start mark)
        const originalEnd = ctx.res.end.bind(ctx.res);
        ctx.res.end = function patchedEnd(...args) {
            writeAccessLine(store, write, { req: ctx.req, res: ctx.res, ctx, status: ctx.res.statusCode, ms: Date.now() - started }, options); // law-allow: wall-clock-as-data — request duration telemetry testimony
            return originalEnd(...args);
        };
    };
}
//# sourceMappingURL=access-log.mjs.map