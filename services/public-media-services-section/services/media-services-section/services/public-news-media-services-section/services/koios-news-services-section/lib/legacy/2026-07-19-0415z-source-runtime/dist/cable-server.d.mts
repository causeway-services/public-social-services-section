#!/usr/bin/env node
import { type StartResult } from "@emsenn/http-server";
export type ServeKoiosNewscableOptions = Readonly<{
    host?: string;
    port?: number;
    log?: (line: string) => void;
}>;
export declare function serveKoiosNewscable(options?: ServeKoiosNewscableOptions): Promise<StartResult & {
    host: string;
}>;
//# sourceMappingURL=cable-server.d.mts.map