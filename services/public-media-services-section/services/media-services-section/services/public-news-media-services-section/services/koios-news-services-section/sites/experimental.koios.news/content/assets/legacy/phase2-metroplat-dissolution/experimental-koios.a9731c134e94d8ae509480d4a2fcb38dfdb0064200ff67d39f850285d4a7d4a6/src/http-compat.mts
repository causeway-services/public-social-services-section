import type { IncomingMessage } from "node:http";

export type Body = string | Uint8Array | ReadableStream<Uint8Array> | AsyncIterable<Uint8Array> | NodeJS.ReadableStream;

export type Repr = Readonly<{
  status?: number;
  headers?: Record<string, string | readonly string[]>;
  body?: Body;
  type?: string;
  etag?: string;
  lastModified?: Date;
  cacheControl?: string | Readonly<Record<string, string | number | boolean>>;
}>;

export type HandlerResult = Repr | Response | null | undefined | void;

export type Handler = (ctx: Context) => HandlerResult | Promise<HandlerResult>;

export type Resource = Readonly<{
  match: string | RegExp | ((path: string, ctx: Context) => boolean | Record<string, string> | null | undefined);
  route?: string;
  id?: string;
  name?: string;
  methods?: readonly string[];
  produces?: readonly string[];
  languages?: readonly string[];
  handler: Handler;
}>;

export type App = Readonly<{
  resources?: readonly Resource[];
  locals?: Readonly<Record<string, unknown>>;
}>;

export type Context = Readonly<{
  req: IncomingMessage;
  res: unknown;
  app: App;
  url: URL;
  params: Readonly<Record<string, string>>;
  locals: Record<string, unknown>;
  nonce: string;
  negotiatedType?: string;
  negotiatedLanguage?: string;
  resource?: Resource;
  route?: string;
  routeTemplate?: string;
  matchedRoute?: string;
  routeId?: string;
  routeName?: string;
  signal: AbortSignal;
  trace: Readonly<{
    kind: "web-server.request-trace";
    id: string;
    entries: readonly unknown[];
  }>;
  startedAt: number;
}>;

export type ReprOptions = Readonly<{
  status?: number;
  headers?: Record<string, string>;
  cacheControl?: string | Readonly<Record<string, string | number | boolean>>;
  etag?: string;
  lastModified?: Date;
}>;

export type JsonReprOptions = ReprOptions & Readonly<{
  type?: string;
  pretty?: boolean | number;
  newline?: boolean;
}>;

export type TextReprOptions = ReprOptions & Readonly<{
  type?: string;
}>;

function repr(input: Repr): Repr {
  return Object.freeze(input);
}

/** Returns a JSON response representation. */
export function jsonRepr(body: unknown, options: number | JsonReprOptions = {}): Repr {
  const opts = typeof options === "number" ? { status: options } : options;
  const indent = opts.pretty === true ? 2 : typeof opts.pretty === "number" ? opts.pretty : undefined;
  const serialized = JSON.stringify(body, null, indent) ?? "null";
  return repr({
    ...opts,
    type: opts.type ?? "application/json; charset=utf-8",
    body: opts.newline === false ? serialized : `${serialized}\n`,
  });
}

/** Returns a text response representation. */
export function textRepr(body: string, options: number | TextReprOptions = {}): Repr {
  const opts = typeof options === "number" ? { status: options } : options;
  return repr({
    ...opts,
    type: opts.type ?? "text/plain; charset=utf-8",
    body,
  });
}
