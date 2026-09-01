// edge/hotreload.ts — Zero-downtime hot reload via file-watching manifest swap.
//
// The "manifest" is a JSON file that describes which App module to load.
// On SIGHUP or file change, the manifest is re-read, the new module imported,
// and the App reference atomically swapped — in-flight requests complete on the old App.
//
// The swap is a Meme: {subject: "app", predicate: "reload", object: version}.
// A successfully loaded app becomes the live version.
import { watch } from "node:fs";
import { readFile } from "node:fs/promises";
import { witness, UtteranceLog } from "../internal/witness.mjs";
export function hotReload(opts) {
    const store = new UtteranceLog();
    let version = 0;
    let currentApp = { resources: [] };
    let watcher = null;
    async function loadApp(manifest) {
        // Dynamic import with cache-busting via URL query param
        const mod = await import(`${manifest.module}?v=${++version}`);
        return (mod.default ?? mod.app ?? {});
    }
    async function doReload() {
        const v = version + 1;
        try {
            const raw = await readFile(opts.manifestPath, "utf8");
            const manifest = JSON.parse(raw);
            const newApp = await loadApp(manifest);
            witness(store, { subject: "app", predicate: "reload", object: String(v) }, [true, false]);
            currentApp = newApp;
            opts.onReload?.(newApp, v);
        }
        catch (err) {
            opts.onError?.(err, v) ?? console.error("[hotreload] failed:", err);
        }
    }
    if (opts.watch !== false) {
        try {
            watcher = watch(opts.manifestPath, () => void doReload());
        }
        catch { /* file may not exist yet */ }
    }
    if (opts.sighup !== false) {
        process.on("SIGHUP", () => void doReload());
    }
    const middleware = async (ctx) => {
        // The middleware just calls through — the pipeline uses currentApp's resources.
        // To actually swap resources, callers update app.resources = reloadable.current().resources.
        const app = currentApp;
        for (const mw of app.middlewares ?? []) {
            const result = await mw(ctx);
            if (result === true)
                return true;
        }
        return;
    };
    return {
        current() { return currentApp; },
        middleware,
        async reload() { await doReload(); },
        stop() { if (watcher) {
            watcher.close();
            watcher = null;
        } },
    };
}
//# sourceMappingURL=hotreload.mjs.map