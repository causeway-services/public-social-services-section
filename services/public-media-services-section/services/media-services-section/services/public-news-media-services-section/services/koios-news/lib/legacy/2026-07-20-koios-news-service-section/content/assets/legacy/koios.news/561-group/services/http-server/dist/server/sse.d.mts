import type { IncomingMessage, ServerResponse } from "node:http";
import { type SseWriter } from "./http.mjs";
export { createProjectedEventHub, writeSseComment, writeSseEvent, type SseSink, type TopicEvent, } from "@emsenn/computing-with-http/app";
export type SseHub = {
    subscribe(req: IncomingMessage, res: ServerResponse, opts?: {
        topics?: readonly string[];
    }): SseWriter;
    publish(event: string, data: unknown, opts?: {
        topic?: string;
        id?: string;
    }): void;
    subscribers: number;
    size: number;
    close(): void;
};
export declare function createSseHub(opts?: {
    heartbeatMs?: number;
}): SseHub;
//# sourceMappingURL=sse.d.mts.map