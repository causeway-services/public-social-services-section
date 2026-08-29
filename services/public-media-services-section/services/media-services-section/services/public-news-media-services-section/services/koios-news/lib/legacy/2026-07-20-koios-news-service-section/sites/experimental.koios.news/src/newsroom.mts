import { randomUUID, timingSafeEqual } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { readJsonBody } from "@emsenn/metroplat/services/http/app";
import { parse as parseEavt, type EAVT } from "@emsenn/metroplat/codecs/text/json/jsonl/eavt";

import { jsonRepr, textRepr, type App, type Context, type Repr, type Resource } from "./http-compat.mjs";
import { type KoiosPost, koiosItems, koiosMasthead, loadPosts } from "./content.mjs";
import { readKoiosCableConfig } from "./cable.mjs";
import { demandReading, readSearchConsole } from "./demand.mjs";
import { DEFAULT_CABLE_STORE_DIR, projectDeskQueue } from "./desk.mjs";
import { viewCounts, viewStore, type ViewCounts } from "./views.mjs";

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const defaultPostsDir = resolve(packageRoot, "content/posts");
const defaultCableStoreRoot = DEFAULT_CABLE_STORE_DIR;

const REALM = "Koios.News newsroom";

export type KoiosNewsroomOptions = Readonly<{
  contentDir?: string;
  dataRoot?: string;
  cableStoreDir?: string;
  sharedKey?: string;
}>;

type NewsroomState = Readonly<{
  generatedAt: string;
  posts: readonly KoiosPost[];
  views: ViewCounts;
  desk: Awaited<ReturnType<typeof projectDeskQueue>>;
  demand: ReturnType<typeof demandReading>;
  wires: WireStoresReading;
  gateAudit: GateAuditReading;
  corrections: CorrectionRegisterReading;
}>;

type GateAuditRow = Readonly<{
  slug: string;
  title: string;
  public: boolean;
  gatesClear: boolean;
  standardsReviewedAt: string | null;
  referenceCount: number;
  correctionCount: number;
  claimProjection: KoiosPost["claims"]["kind"];
}>;

type GateAuditReading = Readonly<{
  kind: "koios.newsroom.gate-audit";
  generatedAt: string;
  count: number;
  clear: number;
  blocked: number;
  rows: readonly GateAuditRow[];
  primitives: readonly string[];
}>;

type CorrectionRegisterReading = Readonly<{
  kind: "koios.newsroom.corrections";
  generatedAt: string;
  count: number;
  articles: number;
  records: readonly Readonly<{
    id: string;
    slug: string;
    title: string;
    severity: string;
    code: string;
    message: string;
    gate?: string;
    href?: string;
  }>[];
  primitives: readonly string[];
}>;

type WireStoresReading = Readonly<{
  kind: "koios.newsroom.wire-stores";
  generatedAt: string;
  storeDir: string;
  configuredWires: readonly Readonly<{
    name: string;
    title: string;
    keyword: string;
    sources: number;
  }>[];
  bundles: Readonly<{
    count: number;
    byWire: Readonly<Record<string, number>>;
    recent: readonly Readonly<{
      entity: string;
      wire: string;
      title: string;
      url: string;
      fetchedAt?: string;
    }>[];
  }>;
  primitives: readonly string[];
}>;

type CockpitReading = Readonly<{
  kind: "koios.newsroom.cockpit";
  generatedAt: string;
  site: Readonly<{
    title: typeof koiosMasthead.title;
    publicUrl: typeof koiosMasthead.siteUrl;
    newsroomUrl: "https://newsroom.koios.news";
  }>;
  desk: NewsroomState["desk"];
  demand: NewsroomState["demand"];
  wires: WireStoresReading;
  gateAudit: GateAuditReading;
  corrections: CorrectionRegisterReading;
  faces: Readonly<{
    http: readonly string[];
    mcp: "/mcp";
  }>;
  primitives: readonly string[];
}>;

type JsonRpcRequest = Readonly<{
  jsonrpc?: unknown;
  id?: unknown;
  method?: unknown;
  params?: unknown;
}>;

type ToolDef = Readonly<{
  name: string;
  title: string;
  description: string;
  inputSchema: Readonly<Record<string, unknown>>;
  run: (state: NewsroomState) => unknown;
}>;

function envText(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === undefined || value === "" ? undefined : value;
}

function configuredKey(options: KoiosNewsroomOptions): string | undefined {
  return options.sharedKey ?? envText("KOIOS_NEWSROOM_KEY") ?? envText("NEWSROOM_KEY");
}

function keyFromRequest(ctx: Context): string | undefined {
  const header = ctx.req.headers["x-koios-newsroom-key"];
  if (typeof header === "string" && header.trim() !== "") return header.trim();
  const authorization = ctx.req.headers.authorization;
  if (typeof authorization === "string") {
    const match = /^Bearer\s+(.+)$/iu.exec(authorization);
    if (match !== null && match[1] !== undefined && match[1].trim() !== "") return match[1].trim();
  }
  const query = ctx.url.searchParams.get("key");
  return query?.trim() === "" ? undefined : query?.trim();
}

function sameSecret(left: string, right: string): boolean {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  return leftBytes.length === rightBytes.length && timingSafeEqual(leftBytes, rightBytes);
}

function authorize(ctx: Context, options: KoiosNewsroomOptions): true | Repr {
  const expected = configuredKey(options);
  if (expected === undefined) return textRepr("newsroom key is not configured\n", 503);
  const actual = keyFromRequest(ctx);
  if (actual !== undefined && sameSecret(actual, expected)) return true;
  return textRepr("unauthorized\n", {
    status: 401,
    headers: { "www-authenticate": `Bearer realm="${REALM}"` },
    cacheControl: "no-store",
  });
}

function json(value: unknown): Repr {
  return jsonRepr(value, { pretty: 2, cacheControl: "no-store" });
}

function html(value: string): Repr {
  return textRepr(value, {
    type: "text/html; charset=utf-8",
    cacheControl: "no-store",
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/gu, "&amp;")
    .replace(/</gu, "&lt;")
    .replace(/>/gu, "&gt;")
    .replace(/"/gu, "&quot;");
}

async function filesUnder(dir: string, suffix: string): Promise<readonly string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return Object.freeze([]);
  }
  const files: string[] = [];
  for (const entry of entries) {
    const full = resolve(dir, entry.name);
    if (entry.isDirectory()) files.push(...await filesUnder(full, suffix));
    else if (entry.isFile() && entry.name.endsWith(suffix)) files.push(full);
  }
  return Object.freeze(files.sort());
}

async function eavtRowsUnder(dir: string): Promise<readonly EAVT[]> {
  const rows: EAVT[] = [];
  for (const file of await filesUnder(dir, ".jsonl")) {
    rows.push(...parseEavt(await readFile(file, "utf8")));
  }
  return Object.freeze(rows);
}

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Readonly<Record<string, unknown>>
    : Object.freeze({});
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function articleTitle(value: unknown): string | undefined {
  const bundle = record(value);
  const item = record(bundle["item"]);
  const article = record(bundle["article"]);
  return text(item["title"]) ?? text(article["title"]);
}

function articleUrl(value: unknown): string | undefined {
  const bundle = record(value);
  const item = record(bundle["item"]);
  const provenance = record(bundle["provenance"]);
  return text(item["url"]) ?? text(provenance["itemUrl"]);
}

async function wireStoresReading(storeDir: string, generatedAt: string): Promise<WireStoresReading> {
  const config = await readKoiosCableConfig().catch(() => null);
  const configuredWires = Object.freeze((config?.newscable.wires ?? []).map((wire) => Object.freeze({
    name: wire.name,
    title: wire.title,
    keyword: wire.keyword,
    sources: wire.sources.length,
  })));
  const rows = await eavtRowsUnder(storeDir);
  const byEntity = new Map<string, { wire?: string; title?: string; url?: string; fetchedAt?: string }>();
  for (const [entity, attribute, value, time] of rows) {
    if (typeof entity !== "string" || typeof attribute !== "string") continue;
    const entry = byEntity.get(entity) ?? {};
    if (attribute === "koios.news.cable.wire") entry.wire = text(value);
    if (attribute === "koios.news.cable.title") entry.title = text(value);
    if (attribute === "koios.news.cable.url" || attribute === "koios.news.cable.item_url") entry.url = text(value);
    if (attribute === "koios.news.cable.bundle") {
      entry.title = entry.title ?? articleTitle(value);
      entry.url = entry.url ?? articleUrl(value);
    }
    if (typeof time === "string") entry.fetchedAt = time;
    byEntity.set(entity, entry);
  }
  const bundles = [...byEntity.entries()].flatMap(([entity, entry]) => {
    if (entry.wire === undefined || entry.title === undefined || entry.url === undefined) return [];
    return [Object.freeze({
      entity,
      wire: entry.wire,
      title: entry.title,
      url: entry.url,
      ...(entry.fetchedAt === undefined ? {} : { fetchedAt: entry.fetchedAt }),
    })];
  });
  const byWire: Record<string, number> = {};
  for (const bundle of bundles) byWire[bundle.wire] = (byWire[bundle.wire] ?? 0) + 1;
  return Object.freeze({
    kind: "koios.newsroom.wire-stores" as const,
    generatedAt,
    storeDir,
    configuredWires,
    bundles: Object.freeze({
      count: bundles.length,
      byWire: Object.freeze(Object.fromEntries(Object.entries(byWire).sort(([left], [right]) => left.localeCompare(right)))),
      recent: Object.freeze(bundles
        .sort((left, right) => (right.fetchedAt ?? "").localeCompare(left.fetchedAt ?? "") || left.entity.localeCompare(right.entity))
        .slice(0, 30)),
    }),
    primitives: Object.freeze([
      "@emsenn/metroplat/codecs/text/json/jsonl/eavt.parse",
      "@emsenn/metroplat/services/filesystem-store witness log layout",
      "Koios cable claim-state bundle projection",
    ]),
  });
}

function gateAudit(posts: readonly KoiosPost[], generatedAt: string): GateAuditReading {
  const rows = Object.freeze(posts.map((post): GateAuditRow => {
    const item = koiosItems([post], koiosMasthead)[0]!;
    return Object.freeze({
      slug: post.slug,
      title: post.frontMatter.title,
      public: item.isPublic,
      gatesClear: post.frontMatter.koios.gates_clear === true,
      standardsReviewedAt: post.frontMatter.koios.standards_reviewed_at ?? null,
      referenceCount: post.frontMatter.references.length,
      correctionCount: post.frontMatter.corrections.length,
      claimProjection: post.claims.kind,
    });
  }));
  return Object.freeze({
    kind: "koios.newsroom.gate-audit" as const,
    generatedAt,
    count: rows.length,
    clear: rows.filter((row) => row.gatesClear).length,
    blocked: rows.filter((row) => !row.gatesClear).length,
    rows,
    primitives: Object.freeze([
      "@emsenn/metroplat/carriers/article.articleCarrier",
      "KoiosPost claim projection",
      "frontMatter.koios.gates_clear as article.publication.gates_clear",
    ]),
  });
}

function corrections(posts: readonly KoiosPost[], generatedAt: string): CorrectionRegisterReading {
  const records = Object.freeze(posts.flatMap((post) => post.frontMatter.corrections.map((correction) => Object.freeze({
    id: `${post.slug}:${correction.code}`,
    slug: post.slug,
    title: post.frontMatter.title,
    severity: correction.severity,
    code: correction.code,
    message: correction.message,
    ...(correction.gate === undefined ? {} : { gate: correction.gate }),
    ...(correction.href === undefined ? {} : { href: correction.href }),
  }))));
  return Object.freeze({
    kind: "koios.newsroom.corrections" as const,
    generatedAt,
    count: records.length,
    articles: new Set(records.map((item) => item.slug)).size,
    records,
    primitives: Object.freeze([
      "@emsenn/metroplat/carriers/article.Article.corrections",
      "KoiosPost frontmatter correction projection",
    ]),
  });
}

async function newsroomState(options: KoiosNewsroomOptions): Promise<NewsroomState> {
  const generatedAt = new Date().toISOString();
  const contentDir = options.contentDir ?? envText("KOIOS_NEWS_CONTENT") ?? defaultPostsDir;
  const dataRoot = options.dataRoot ?? packageRoot;
  const cableStoreDir = options.cableStoreDir ?? envText("KOIOS_CABLE_STORE") ?? defaultCableStoreRoot;
  const posts = await loadPosts(contentDir);
  const views = viewCounts(viewStore(dataRoot));
  const searchConsole = await readSearchConsole(dataRoot);
  const [desk, wires] = await Promise.all([
    projectDeskQueue(dataRoot),
    wireStoresReading(cableStoreDir, generatedAt),
  ]);
  return Object.freeze({
    generatedAt,
    posts,
    views,
    desk,
    demand: demandReading({ posts, views, searchConsole, now: () => generatedAt }),
    wires,
    gateAudit: gateAudit(posts, generatedAt),
    corrections: corrections(posts, generatedAt),
  });
}

function cockpitReading(state: NewsroomState): CockpitReading {
  return Object.freeze({
    kind: "koios.newsroom.cockpit" as const,
    generatedAt: state.generatedAt,
    site: Object.freeze({
      title: koiosMasthead.title,
      publicUrl: koiosMasthead.siteUrl,
      newsroomUrl: "https://newsroom.koios.news" as const,
    }),
    desk: state.desk,
    demand: state.demand,
    wires: state.wires,
    gateAudit: state.gateAudit,
    corrections: state.corrections,
    faces: Object.freeze({
      http: Object.freeze(["/", "/cockpit.json", "/desk.json", "/demand.json", "/wires.json", "/gate-audit.json", "/corrections.json", "/mcp"]),
      mcp: "/mcp" as const,
    }),
    primitives: Object.freeze([
      "@emsenn/metroplat/services/http/app.Resource",
      "@emsenn/metroplat/services/http/app.jsonRepr",
      "@emsenn/metroplat/services/http/app.readJsonBody",
      "@emsenn/metroplat/codecs/text/json/jsonl/eavt",
      "@emsenn/metroplat/services/filesystem-store witness rows",
      "@emsenn/metroplat/calculus/predicating/positing charges",
      "@emsenn/metroplat/carriers/article",
      "@emsenn/metroplat/codecs/text/markdown/vault",
    ]),
  });
}

function table(headers: readonly string[], rows: readonly (readonly string[])[]): string {
  const head = headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("");
  const body = rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`).join("\n");
  return `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function cockpitHtml(state: NewsroomState): string {
  const demandRows = state.demand.demand.slice(0, 20).map((entry) => [
    String(entry.rank),
    entry.term,
    entry.beat,
    String(entry.score),
    String(entry.covered),
  ]);
  const deskRows = state.desk.open.slice(0, 30).map((item) => [
    item.source,
    item.charge,
    item.beat ?? "",
    item.title,
    item.metroplatCharge,
  ]);
  const wireRows = Object.entries(state.wires.bundles.byWire).map(([wire, count]) => [wire, String(count)]);
  const gateRows = state.gateAudit.rows.slice(0, 30).map((row) => [
    row.gatesClear ? "clear" : "blocked",
    row.public ? "public" : "withheld",
    row.slug,
    row.title,
    row.standardsReviewedAt ?? "",
  ]);
  const correctionRows = state.corrections.records.slice(0, 30).map((item) => [
    item.severity,
    item.code,
    item.slug,
    item.message,
  ]);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Koios.News newsroom</title>
  <style>
    body { margin: 0; background: #f7f7f4; color: #1f2328; font: 15px/1.5 ui-sans-serif, system-ui, sans-serif; }
    header, main { max-width: 1180px; margin: 0 auto; padding: 1rem; }
    header { border-bottom: 1px solid #d8d5cc; }
    h1, h2 { font-family: Georgia, Cambria, "Times New Roman", serif; }
    nav { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: .5rem; }
    a { color: #12655a; }
    section { border-top: 1px solid #d8d5cc; padding: 1rem 0; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); gap: .75rem; }
    .metric { background: #fff; border: 1px solid #d8d5cc; padding: .75rem; }
    .metric strong { display: block; font-size: 1.4rem; }
    table { width: 100%; border-collapse: collapse; background: #fff; }
    th, td { border-bottom: 1px solid #d8d5cc; padding: .45rem; text-align: left; vertical-align: top; }
    th { font-size: .78rem; text-transform: uppercase; letter-spacing: .04em; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
  </style>
</head>
<body>
  <header>
    <h1>Koios.News newsroom</h1>
    <p>Keyed internal cockpit over metroplat HTTP and MCP faces. Generated ${escapeHtml(state.generatedAt)}.</p>
    <nav>
      <a href="/cockpit.json">cockpit.json</a>
      <a href="/desk.json">desk.json</a>
      <a href="/demand.json">demand.json</a>
      <a href="/wires.json">wires.json</a>
      <a href="/gate-audit.json">gate-audit.json</a>
      <a href="/corrections.json">corrections.json</a>
      <a href="/mcp">mcp</a>
    </nav>
  </header>
  <main>
    <section class="metrics">
      <div class="metric"><strong>${state.desk.counts.open}</strong> M3 desk queue</div>
      <div class="metric"><strong>${state.demand.demand.length}</strong> M2 demand rows</div>
      <div class="metric"><strong>${state.wires.bundles.count}</strong> M1 wire bundles</div>
      <div class="metric"><strong>${state.gateAudit.blocked}</strong> S4 blocked gate rows</div>
      <div class="metric"><strong>${state.corrections.count}</strong> corrections</div>
    </section>
    <section><h2>M3 desk queue</h2>${deskRows.length === 0 ? "<p>No open desk work items.</p>" : table(["source", "charge", "beat", "title", "metroplat charge"], deskRows)}</section>
    <section><h2>M2 demand table</h2>${table(["rank", "term", "beat", "score", "covered"], demandRows)}</section>
    <section><h2>M1 wire stores</h2>${wireRows.length === 0 ? "<p>No wire bundles projected.</p>" : table(["wire", "bundles"], wireRows)}</section>
    <section><h2>S4 gate audit</h2>${table(["gate", "surface", "slug", "title", "reviewed"], gateRows)}</section>
    <section><h2>Corrections</h2>${correctionRows.length === 0 ? "<p>No correction records declared.</p>" : table(["severity", "code", "slug", "message"], correctionRows)}</section>
  </main>
</body>
</html>
`;
}

function toolDefinitions(): readonly ToolDef[] {
  const emptySchema = Object.freeze({ type: "object", additionalProperties: false });
  return Object.freeze([
    Object.freeze({ name: "read_cockpit", title: "Read cockpit", description: "Return the complete Koios.News newsroom cockpit reading.", inputSchema: emptySchema, run: cockpitReading }),
    Object.freeze({ name: "read_desk_queue", title: "Read M3 desk queue", description: "Return open M3 desk work items projected from Koios desk EAVT witnesses.", inputSchema: emptySchema, run: (state: NewsroomState) => state.desk }),
    Object.freeze({ name: "read_demand_table", title: "Read M2 demand table", description: "Return the Koios demand table and coverage settlement.", inputSchema: emptySchema, run: (state: NewsroomState) => state.demand }),
    Object.freeze({ name: "read_wire_stores", title: "Read M1 wire stores", description: "Return configured wires and projected wire claim bundles.", inputSchema: emptySchema, run: (state: NewsroomState) => state.wires }),
    Object.freeze({ name: "read_gate_audit", title: "Read S4 gate audit", description: "Return gate-clear, standards-review, reference, and correction audit rows.", inputSchema: emptySchema, run: (state: NewsroomState) => state.gateAudit }),
    Object.freeze({ name: "read_corrections", title: "Read corrections", description: "Return correction records declared in Koios article metadata.", inputSchema: emptySchema, run: (state: NewsroomState) => state.corrections }),
  ]);
}

function mcpResult(id: unknown, result: unknown): Readonly<Record<string, unknown>> {
  return Object.freeze({ jsonrpc: "2.0", id: id ?? null, result });
}

function mcpError(id: unknown, code: number, message: string): Readonly<Record<string, unknown>> {
  return Object.freeze({ jsonrpc: "2.0", id: id ?? null, error: Object.freeze({ code, message }) });
}

function textContent(value: unknown): readonly Readonly<{ type: "text"; text: string }>[] {
  return Object.freeze([Object.freeze({ type: "text" as const, text: `${JSON.stringify(value, null, 2)}\n` })]);
}

async function handleMcp(ctx: Context, options: KoiosNewsroomOptions): Promise<Repr> {
  const body = (await readJsonBody<JsonRpcRequest>(ctx.req, { maxBytes: 1_048_576 })).value;
  const id = body.id;
  if (body.jsonrpc !== "2.0" || typeof body.method !== "string") return json(mcpError(id, -32600, "invalid request"));
  if (body.method === "initialize") {
    return json(mcpResult(id, {
      protocolVersion: "2025-06-18",
      serverInfo: { name: "koios-newsroom", version: "0.0.0" },
      capabilities: { tools: {} },
    }));
  }
  if (body.method === "ping") return json(mcpResult(id, {}));
  if (body.method === "tools/list") {
    return json(mcpResult(id, {
      tools: toolDefinitions().map((tool) => Object.freeze({
        name: tool.name,
        title: tool.title,
        description: tool.description,
        inputSchema: tool.inputSchema,
      })),
    }));
  }
  if (body.method === "tools/call") {
    const params = record(body.params);
    const name = text(params["name"]);
    const tool = toolDefinitions().find((candidate) => candidate.name === name);
    if (tool === undefined) return json(mcpError(id, -32602, `no such tool: ${name ?? ""}`));
    const state = await newsroomState(options);
    return json(mcpResult(id, { content: textContent(tool.run(state)), structuredContent: tool.run(state) }));
  }
  return json(mcpError(id, -32601, "method not found"));
}

function keyedResource(options: KoiosNewsroomOptions, resource: Resource): Resource {
  return {
    ...resource,
    handler: async (ctx) => {
      const auth = authorize(ctx, options);
      if (auth !== true) return auth;
      return resource.handler(ctx);
    },
  };
}

export function createKoiosNewsroomApp(options: KoiosNewsroomOptions = {}): App {
  const resources: readonly Resource[] = Object.freeze([
    {
      id: "koios.newsroom.health",
      match: "/health",
      methods: ["GET", "HEAD"],
      produces: ["text/plain; charset=utf-8"],
      handler: () => textRepr("ok\n", { cacheControl: "no-store" }),
    },
    {
      id: "koios.newsroom.cockpit",
      match: "/",
      methods: ["GET", "HEAD"],
      produces: ["text/html; charset=utf-8"],
      handler: async () => html(cockpitHtml(await newsroomState(options))),
    },
    {
      id: "koios.newsroom.cockpit-json",
      match: "/cockpit.json",
      methods: ["GET", "HEAD"],
      produces: ["application/json; charset=utf-8"],
      handler: async () => json(cockpitReading(await newsroomState(options))),
    },
    {
      id: "koios.newsroom.desk-json",
      match: "/desk.json",
      methods: ["GET", "HEAD"],
      produces: ["application/json; charset=utf-8"],
      handler: async () => json((await newsroomState(options)).desk),
    },
    {
      id: "koios.newsroom.demand-json",
      match: "/demand.json",
      methods: ["GET", "HEAD"],
      produces: ["application/json; charset=utf-8"],
      handler: async () => json((await newsroomState(options)).demand),
    },
    {
      id: "koios.newsroom.wires-json",
      match: "/wires.json",
      methods: ["GET", "HEAD"],
      produces: ["application/json; charset=utf-8"],
      handler: async () => json((await newsroomState(options)).wires),
    },
    {
      id: "koios.newsroom.gate-audit-json",
      match: "/gate-audit.json",
      methods: ["GET", "HEAD"],
      produces: ["application/json; charset=utf-8"],
      handler: async () => json((await newsroomState(options)).gateAudit),
    },
    {
      id: "koios.newsroom.corrections-json",
      match: "/corrections.json",
      methods: ["GET", "HEAD"],
      produces: ["application/json; charset=utf-8"],
      handler: async () => json((await newsroomState(options)).corrections),
    },
    {
      id: "koios.newsroom.mcp",
      match: "/mcp",
      methods: ["GET", "POST"],
      produces: ["application/json; charset=utf-8"],
      handler: async (ctx: Context) => ctx.req.method === "GET"
        ? json({ kind: "koios.newsroom.mcp", endpoint: "/mcp", methods: ["initialize", "ping", "tools/list", "tools/call"] })
        : await handleMcp(ctx, options),
    },
  ]);
  return Object.freeze({ resources: resources.map((resource) => keyedResource(options, resource)), locals: { nonce: randomUUID() } });
}
