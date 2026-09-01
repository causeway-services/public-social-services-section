import { jsonRepr } from "./http.mjs";
/** Wrap a named map of async functions as a minimal JSON App.
 *  Each entry in `scripts` becomes GET /<key> → application/json.
 *  A GET /health endpoint is always included, listing the script names. */
export function serveScripts(scripts) {
    const names = Object.keys(scripts);
    return {
        resources: [
            {
                match: "/health",
                methods: ["GET"],
                produces: ["application/json"],
                handler: () => jsonRepr({ status: "ok", scripts: names }),
            },
            ...names.map((name) => ({
                match: `/${name}`,
                methods: ["GET"],
                produces: ["application/json"],
                handler: async (ctx) => {
                    const params = Object.fromEntries(ctx.url.searchParams.entries());
                    try {
                        return jsonRepr(await scripts[name](params));
                    }
                    catch (err) {
                        return jsonRepr({ error: err instanceof Error ? err.message : String(err) }, 500);
                    }
                },
            })),
        ],
    };
}
//# sourceMappingURL=serve-scripts.mjs.map