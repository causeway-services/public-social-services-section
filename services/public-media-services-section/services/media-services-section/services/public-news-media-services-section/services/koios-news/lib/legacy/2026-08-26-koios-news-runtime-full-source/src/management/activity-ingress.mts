import { readFileSync } from "node:fs";

export function readActivityStreamsObjectFromStdin(): Readonly<Record<string, unknown>> {
  const source = readFileSync(0, "utf8").trim();
  if (source === "") {
    throw new Error("Koios issue ingress requires one externally authored ActivityStreams object on stdin");
  }
  let value: unknown;
  try {
    value = JSON.parse(source);
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new Error(`Koios issue ingress received malformed JSON: ${reason}`);
  }
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Koios issue ingress requires one JSON object, not a scalar or array");
  }
  return Object.freeze(value as Record<string, unknown>);
}
