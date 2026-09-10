import { type StartResult } from "@emsenn/http-server";
import { type KoiosNewsroomOptions } from "./newsroom-site.mjs";
export type ServeKoiosNewsroomOptions = KoiosNewsroomOptions & Readonly<{
    host?: string;
    port?: number;
    log?: (line: string) => void;
}>;
export declare function serveKoiosNewsroom(options?: ServeKoiosNewsroomOptions): Promise<StartResult & {
    host: string;
}>;
//# sourceMappingURL=newsroom-server.d.mts.map