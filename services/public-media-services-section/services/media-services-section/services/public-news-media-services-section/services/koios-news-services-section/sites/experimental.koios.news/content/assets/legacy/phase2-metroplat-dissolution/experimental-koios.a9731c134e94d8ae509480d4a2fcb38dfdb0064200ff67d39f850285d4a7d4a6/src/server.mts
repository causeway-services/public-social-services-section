import { randomUUID } from "node:crypto";
import {
  createServer,
  type IncomingMessage,
  type OutgoingHttpHeaders,
  type ServerResponse,
} from "node:http";
import { fileURLToPath } from "node:url";

import {
  type App,
  type Context,
  type HandlerResult,
  type Repr,
  type Resource,
  textRepr,
} from "./http-compat.mjs";

import { process as metroplatProcess } from "@emsenn/metroplat/services";
import { createKoiosSurfaceResources } from "./surface.mjs";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));

export type KoiosServerOptions = Readonly<{
  port?: number;
  host?: string;
  dataRoot?: string;
}>;

export function createKoiosApp(dataRoot = packageRoot): App {
  return Object.freeze({
    resources: [
    {
      match: "/health",
      methods: ["GET", "HEAD"],
      produces: ["text/plain; charset=utf-8"],
      handler: () => textRepr("ok\n", 200),
    },
      ...createKoiosSurfaceResources({ dataRoot }),
    ],
  });
}

export const app: App = createKoiosApp();

function routeMatches(resource: Resource, path: string, ctx: Context): false | Record<string, string> {
  if (typeof resource.match === "string") return resource.match === path ? {} : false;
  if (resource.match instanceof RegExp) {
    const match = resource.match.exec(path);
    if (match === null) return false;
    return { ...(match.groups ?? {}) };
  }
  const matched = resource.match(path, ctx);
  if (matched === true) return {};
  if (matched && typeof matched === "object") return matched;
  return false;
}

function allowsMethod(resource: Resource, method: string): boolean {
  return resource.methods === undefined || resource.methods.includes(method);
}

function createContext(app: App, req: IncomingMessage, res: ServerResponse, requestUrl: URL): Context {
  return {
    req,
    res,
    app,
    url: requestUrl,
    params: {},
    locals: { ...(app.locals ?? {}) },
    nonce: randomUUID(),
    signal: AbortSignal.timeout(30_000),
    trace: { kind: "web-server.request-trace", id: randomUUID(), entries: [] },
    startedAt: Date.now(),
  };
}

async function dispatch(app: App, req: IncomingMessage, res: ServerResponse): Promise<Repr> {
  const requestUrl = new URL(req.url ?? "/", "http://localhost");
  const method = req.method ?? "GET";
  const baseCtx = createContext(app, req, res, requestUrl);

  for (const resource of app.resources ?? []) {
    const params = routeMatches(resource, requestUrl.pathname, baseCtx);
    if (params === false) continue;
    if (!allowsMethod(resource, method)) return textRepr("method not allowed\n", 405);
    const ctx: Context = {
      ...baseCtx,
      params,
      resource,
      route: resource.route,
      routeTemplate: typeof resource.match === "string" ? resource.match : undefined,
      matchedRoute: requestUrl.pathname,
      routeId: resource.id,
      routeName: resource.name,
      negotiatedType: resource.produces?.[0],
    };
    return normalizeResult(await resource.handler(ctx));
  }

  return textRepr("not found\n", 404);
}

function normalizeResult(result: HandlerResult): Repr {
  if (result === null || result === undefined) return textRepr("", 204);
  if (result instanceof Response) {
    return {
      status: result.status,
      headers: Object.fromEntries(result.headers),
      body: result.body === null ? undefined : result.body,
    };
  }
  return result;
}

function writeRepr(req: IncomingMessage, res: ServerResponse, repr: Repr): void {
  const status = repr.status ?? 200;
  const headers: OutgoingHttpHeaders = {};
  for (const [key, value] of Object.entries(repr.headers ?? {})) {
    headers[key] = typeof value === "string" ? value : [...value];
  }
  if (repr.type !== undefined) headers["content-type"] = repr.type;
  if (repr.etag !== undefined) headers.etag = repr.etag;
  if (repr.lastModified !== undefined) headers["last-modified"] = repr.lastModified.toUTCString();
  if (repr.cacheControl !== undefined) {
    headers["cache-control"] = typeof repr.cacheControl === "string"
      ? repr.cacheControl
      : Object.entries(repr.cacheControl)
          .map(([key, value]) => value === true ? key : `${key}=${value}`)
          .join(", ");
  }

  res.writeHead(status, headers);
  if (req.method === "HEAD" || repr.body === undefined) {
    res.end();
    return;
  }
  if (typeof repr.body === "string" || Buffer.isBuffer(repr.body)) {
    res.end(repr.body);
    return;
  }
  if (isReadableBody(repr.body)) {
    repr.body.pipe(res);
    return;
  }
  if (Symbol.asyncIterator in repr.body) {
    void (async () => {
      for await (const chunk of repr.body as AsyncIterable<Uint8Array>) res.write(chunk);
      res.end();
    })();
    return;
  }
  res.end();
}

function isReadableBody(body: unknown): body is NodeJS.ReadableStream {
  return typeof body === "object" &&
    body !== null &&
    "pipe" in body &&
    typeof (body as { pipe?: unknown }).pipe === "function";
}

function envText(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value === "" ? undefined : value;
}

function envPort(): number {
  const raw = envText("KOIOS_NEWS_PORT") ?? envText("PORT") ?? "18802";
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
    throw new Error(`invalid Koios.News port: ${raw}`);
  }
  return parsed;
}

function envHost(): string {
  return envText("KOIOS_NEWS_HOST") ?? envText("HOST") ?? "127.0.0.1";
}

export function start(options: KoiosServerOptions = {}): void {
  const port = options.port ?? envPort();
  const host = options.host ?? envHost();
  const serverApp = createKoiosApp(options.dataRoot ?? packageRoot);
  const server = createServer((req, res) => {
    void dispatch(serverApp, req, res)
      .then((repr) => writeRepr(req, res, repr))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "internal server error";
        writeRepr(req, res, textRepr(`${message}\n`, 500));
      });
  });

  server.listen(port, host, () => {
    process.stdout.write(`koios.news listening on http://${host}:${port}\n`);
  });
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dataRoot = metroplatProcess.processDataRootConfig({
    defaultRoot: packageRoot,
    envName: "KOIOS_NEWS_DATA_ROOT",
    configEnvName: "KOIOS_NEWS_CONFIG",
    configFileName: "koios.news.config.json",
    legacyEnvNames: Object.freeze(["KOIOS_NEWS_DATA", "KOIOS_NEWS_DATA_DIR", "METROPLAT_DATA"]),
  }).dataRoot;
  start({ dataRoot });
}
