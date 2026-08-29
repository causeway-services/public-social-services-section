// newsroom-server.mts — serve the newsroom backend (newsroom.koios.news):
// env-configured, graceful, read-only desk readings on port 18803.
import process from "node:process";
import { pathToFileURL } from "node:url";
import { installGracefulShutdown, start } from "@emsenn/http-server";
import { createKoiosNewsroomApp } from "./newsroom-site.mjs";
const DEFAULT_HOST = "127.0.0.1";
const DEFAULT_PORT = 18_803;
export async function serveKoiosNewsroom(options = {}) {
    const host = options.host ?? process.env.KOIOS_NEWSROOM_HOST ?? process.env.HOST ?? DEFAULT_HOST;
    const port = options.port ?? envPort() ?? DEFAULT_PORT;
    const dataDir = process.env.KOIOS_NEWS_DATA;
    const running = await start(createKoiosNewsroomApp({
        ...(dataDir ? { dataDir } : {}),
        ...options,
    }), { host, port });
    installGracefulShutdown(running, {
        onClosed: () => options.log?.("Koios.News newsroom stopped"),
        onError: (error) => options.log?.(`Koios.News newsroom shutdown failed: ${error instanceof Error ? error.message : String(error)}`),
    });
    options.log?.(`Koios.News newsroom listening at https://newsroom.koios.news/ on ${host}:${running.port}`);
    return { ...running, host };
}
function envPort() {
    const raw = process.env.KOIOS_NEWSROOM_PORT;
    if (raw === undefined)
        return undefined;
    const parsed = Number.parseInt(raw, 10);
    if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 65_535) {
        throw new Error(`Invalid KOIOS_NEWSROOM_PORT: ${raw}`);
    }
    return parsed;
}
function isMain() {
    return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
}
if (isMain()) {
    serveKoiosNewsroom({ log: (line) => console.log(line) }).catch((error) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}
//# sourceMappingURL=newsroom-server.mjs.map