import type { IncomingMessage, ServerResponse } from "node:http";
import type { App, Context } from "./types.mjs";
export declare function contextFor(req: IncomingMessage, res: ServerResponse, app: App): Context;
export declare function handler(app: App): (req: IncomingMessage, res: ServerResponse) => void;
//# sourceMappingURL=pipeline.d.mts.map