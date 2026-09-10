import { type StartResult } from "@emsenn/http-server";
import { type KoiosSiteOptions } from "./index.mjs";
export type ServeKoiosNewsOptions = KoiosSiteOptions & Readonly<{
    host?: string;
    port?: number;
    log?: (line: string) => void;
}>;
export type ServeKoiosNewsResult = StartResult & Readonly<{
    host: string;
}>;
export declare function serveKoiosNewsOptionsFromEnv(): {
    host: string;
    port: number;
} & KoiosSiteOptions;
export declare function serveKoiosNews(options?: ServeKoiosNewsOptions): Promise<ServeKoiosNewsResult>;
//# sourceMappingURL=server.d.mts.map