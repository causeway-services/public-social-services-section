// sse.ts — SSE hub backed by UtteranceLog pub/sub.
//
// Each subscriber is a Meme: {subject: subscriberId, predicate: "topic", object: topicName}.
// publish() stores event Memes and fans out to matching subscribers.
// The UtteranceLog gives us an append-only audit log of all events published.
import { witness, UtteranceLog } from "./internal/witness.mjs";
import { sse } from "./http.mjs";
import { writeSseComment, writeSseEvent, } from "@emsenn/computing-with-http/app";
export { createProjectedEventHub, writeSseComment, writeSseEvent, } from "@emsenn/computing-with-http/app";
export function createSseHub(opts = {}) {
    const store = new UtteranceLog();
    const heartbeatMs = opts.heartbeatMs ?? 30_000;
    const subs = new Map();
    let subCounter = 0;
    let eventCounter = 0;
    let heartbeat;
    function stopHeartbeat() {
        if (!heartbeat)
            return;
        clearInterval(heartbeat);
        heartbeat = undefined;
    }
    function startHeartbeat() {
        if (heartbeat || heartbeatMs <= 0)
            return;
        heartbeat = setInterval(() => {
            const dead = [];
            for (const [id, { writer }] of subs) {
                try {
                    writer.comment("heartbeat");
                }
                catch {
                    dead.push(id);
                }
            }
            for (const id of dead)
                reap(id);
        }, heartbeatMs);
        heartbeat.unref?.();
    }
    function reap(id) {
        if (!subs.delete(id))
            return;
        witness(store, { subject: id, predicate: "status", object: "closed" }, [false, true]); // sub id is the counter ordinal
        if (!subs.size)
            stopHeartbeat();
    }
    return {
        get subscribers() { return subs.size; },
        get size() { return subs.size; },
        subscribe(req, res, subOpts = {}) {
            const id = `sub-${++subCounter}`;
            const topics = subOpts.topics?.length ? new Set(subOpts.topics) : null;
            witness(store, { subject: id, predicate: "status", object: "open" }, [true, false]);
            if (topics) {
                for (const topic of topics) {
                    witness(store, { subject: id, predicate: "topic", object: topic }, [true, false]);
                }
            }
            const writer = sse(req, res, () => reap(id));
            subs.set(id, { writer, topics });
            startHeartbeat();
            return writer;
        },
        publish(event, data, pubOpts = {}) {
            const { topic, id } = pubOpts;
            const eventId = `event-${++eventCounter}`; // ordinal identity; wall-clock identity collided same-ms publishes
            witness(store, { subject: eventId, predicate: "event", object: event }, [true, false]);
            if (topic) {
                witness(store, { subject: eventId, predicate: "topic", object: topic }, [true, false]);
            }
            const dead = [];
            for (const [subId, sub] of subs) {
                if (sub.topics && (topic == null || !sub.topics.has(topic)))
                    continue;
                try {
                    sub.writer.send(event, data, id);
                }
                catch {
                    dead.push(subId);
                }
            }
            for (const d of dead)
                reap(d);
        },
        close() {
            for (const id of [...subs.keys()]) {
                const sub = subs.get(id);
                try {
                    sub?.writer.close();
                }
                catch { }
                reap(id);
            }
            stopHeartbeat();
        },
    };
}
//# sourceMappingURL=sse.mjs.map