import { readFileSync } from "node:fs";
export function readActivityStreamsObjectFromStdin() {
    const source = readFileSync(0, "utf8").trim();
    if (source === "") {
        throw new Error("Koios issue ingress requires one externally authored ActivityStreams object on stdin");
    }
    let value;
    try {
        value = JSON.parse(source);
    }
    catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        throw new Error(`Koios issue ingress received malformed JSON: ${reason}`);
    }
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Koios issue ingress requires one JSON object, not a scalar or array");
    }
    return Object.freeze(value);
}
//# sourceMappingURL=activity-ingress.mjs.map