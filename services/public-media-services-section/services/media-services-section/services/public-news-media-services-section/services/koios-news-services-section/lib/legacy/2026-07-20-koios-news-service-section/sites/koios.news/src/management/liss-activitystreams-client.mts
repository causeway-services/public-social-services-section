// Koios-side carrier for the exact LISS inference ActivityStreams contract.
// This is not an ActivityPub implementation or a reusable public-protocol
// server.  LISS owns the service semantics and the host-local Unix socket;
// Koios sends one already-shaped contractual activity and receives one reply.

import { connect } from "node:net";
import { join, resolve } from "node:path";

import type { JsonObject } from "./ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const LISS = "urn:ame:logical-inference-service-section";

export type LissActivityStreamsClientOptions = Readonly<{
  socketPath?: string;
  timeoutMilliseconds?: number;
  maxResponseBytes?: number;
}>;

function defaultSocketPath(): string {
  const runtime = process.env["XDG_RUNTIME_DIR"]
    ?? (process.platform !== "win32" && typeof process.getuid === "function"
      ? `/run/user/${process.getuid()}`
      : join(process.env["HOME"] ?? "/tmp", ".local", "run"));
  return resolve(process.env["LISS_INFERENCE_SOCKET"] ?? join(runtime, "liss-inference", "inference.sock"));
}

function positiveInteger(value: number | undefined, fallback: number, maximum: number, label: string): number {
  const effective = value ?? fallback;
  if (!Number.isInteger(effective) || effective < 1 || effective > maximum) throw new TypeError(`${label} must be an integer from 1 to ${maximum}`);
  return effective;
}

function isActivity(value: unknown): value is JsonObject {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (value as JsonObject)["@context"] === CONTEXT
    && typeof (value as JsonObject)["type"] === "string";
}

export async function exchangeLissActivity(
  activity: Readonly<JsonObject>,
  options: LissActivityStreamsClientOptions = {},
): Promise<Readonly<JsonObject>> {
  if (!isActivity(activity) || activity["target"] !== LISS || typeof activity["id"] !== "string") {
    throw new TypeError("Koios may send only an identified ActivityStreams activity addressed to LISS");
  }
  const socketPath = resolve(options.socketPath ?? defaultSocketPath());
  const timeoutMilliseconds = positiveInteger(options.timeoutMilliseconds, 30_000, 3_600_000, "LISS timeout");
  const maxResponseBytes = positiveInteger(options.maxResponseBytes, 16 * 1024 * 1024, 64 * 1024 * 1024, "LISS response bound");
  const socket = connect({ path: socketPath, allowHalfOpen: true });
  const chunks: Buffer[] = [];
  let received = 0;
  let timer: NodeJS.Timeout | undefined;
  try {
    await new Promise<void>((resolveConnect, rejectConnect) => {
      const failed = (error: Error) => { socket.off("connect", ready); rejectConnect(error); };
      const ready = () => { socket.off("error", failed); resolveConnect(); };
      socket.once("error", failed);
      socket.once("connect", ready);
    });
    timer = setTimeout(() => socket.destroy(new Error("LISS ActivityStreams exchange timed out")), timeoutMilliseconds);
    socket.on("data", (chunk: Buffer) => {
      received += chunk.length;
      if (received > maxResponseBytes) socket.destroy(new Error("LISS ActivityStreams response exceeded its byte bound"));
      else chunks.push(Buffer.from(chunk));
    });
    socket.end(`${JSON.stringify(activity)}\n`);
    await new Promise<void>((resolveEnd, rejectEnd) => {
      socket.once("end", resolveEnd);
      socket.once("error", rejectEnd);
    });
  } finally {
    if (timer !== undefined) clearTimeout(timer);
    if (!socket.destroyed) socket.destroy();
  }
  const lines = Buffer.concat(chunks).toString("utf8").split("\n").filter((line) => line.trim() !== "");
  if (lines.length !== 1) throw new Error(`LISS exchange returned ${lines.length} records; exactly one is required`);
  const response: unknown = JSON.parse(lines[0]!);
  if (!isActivity(response) || response["actor"] !== LISS || response["target"] !== activity["actor"] || response["inReplyTo"] !== activity["id"]) {
    throw new Error("LISS returned an unbound or malformed ActivityStreams response");
  }
  return Object.freeze(response);
}
