import { createHash } from "node:crypto";
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import type { JsonObject } from "./ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "urn:ame:koios-news";
const PROVIDER = "urn:ame:resource-brokerage-team";
export const CLOUDFLARE_ATTENTION_CONTRACT = "cloudflare-worker-aggregate-attention/v1";

export type CloudflareAttentionReading = Readonly<{
  path: string;
  day: string;
  observedLoads: number;
  firstObservedAt: string;
  lastObservedAt: string;
  excludesRecognizedAutomatedUserAgents: boolean;
  storesReaderIdentifiers: false;
  storesReferrers: false;
}>;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as JsonObject)[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function digest(value: unknown): string { return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }

function providerRoot(): string {
  const supplied = process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT;
  if (supplied !== undefined) return realpathSync(resolve(supplied));
  const installedSibling = resolve(dirname(fileURLToPath(import.meta.url)), "../../../resource-brokerage-team");
  if (existsSync(join(installedSibling, "package.json"))) return realpathSync(installedSibling);
  const relativeProvider = "lib/emsenn/services/board-of-directors/services/executive-office/services/change-services-section/services/resource-brokerage-team";
  let at = realpathSync(process.cwd());
  while (true) {
    const candidate = join(at, relativeProvider);
    if (existsSync(join(candidate, "package.json"))) return candidate;
    const parent = dirname(at);
    if (parent === at) throw new Error("Koios could not discover its Cloudflare attention provider");
    at = parent;
  }
}

function invokeProvider(operation: "solicit-attention-service" | "invoke-attention-service", activity: unknown, now: string): JsonObject {
  const root = providerRoot();
  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as Readonly<{ bin?: Readonly<Record<string, string>> }>;
  const endpoint = pkg.bin?.[operation];
  if (endpoint === undefined) throw new Error(`Resource Brokerage Team does not advertise ${operation}`);
  const exchange = mkdtempSync(join(tmpdir(), "koios-attention-exchange-"));
  const input = join(exchange, "input.json"); const output = join(exchange, "output.json"); const error = join(exchange, "stderr.txt");
  writeFileSync(input, JSON.stringify(activity), "utf8");
  const inputFd = openSync(input, "r"); const outputFd = openSync(output, "w"); const errorFd = openSync(error, "w");
  try {
    const run = spawnSync(process.execPath, [resolve(root, endpoint), "--operation", operation, "--now", now], { cwd: root, stdio: [inputFd, outputFd, errorFd], timeout: 120_000, env: { PATH: process.env.PATH, NODE_PATH: process.env.NODE_PATH, NO_COLOR: "1" } });
    const stdout = readFileSync(output, "utf8"); const stderr = readFileSync(error, "utf8");
    let parsed: unknown;
    try { parsed = JSON.parse(stdout); } catch { throw new Error(`attention provider returned no typed result (status=${run.status}): ${stderr || stdout}`); }
    if (!object(parsed)) throw new Error("attention provider returned a non-object result");
    return parsed;
  } finally { closeSync(inputFd); closeSync(outputFd); closeSync(errorFd); rmSync(exchange, { recursive: true, force: true }); }
}

export function settleCloudflareAttention(input: Readonly<{ fromDay: string; throughDay: string; now: string }>): Readonly<{ accepted: boolean; outcome: JsonObject; readings: readonly CloudflareAttentionReading[] }> {
  const request = Object.freeze({ type: "CloudflareAggregateAttentionRequest", fromDay: input.fromDay, throughDay: input.throughDay, pathPrefix: "/posts/" });
  const source = Object.freeze({ "@context": CONTEXT, id: `urn:koios:attention-source:${digest(request)}`, type: "Create", actor: CUSTOMER, target: PROVIDER, object: { type: "Note", attachment: [request] } });
  const solicitation = Object.freeze({ "@context": CONTEXT, id: `urn:koios:attention-solicitation:${digest(source)}`, type: "Offer", actor: CUSTOMER, target: PROVIDER, object: { type: "ServiceSolicitation", sourceActivity: source } });
  const offer = invokeProvider("solicit-attention-service", solicitation, input.now);
  if (offer["type"] !== "Offer" || !object(offer["object"]) || offer["object"]["contract"] !== CLOUDFLARE_ATTENTION_CONTRACT) return Object.freeze({ accepted: false, outcome: offer, readings: Object.freeze([]) });
  const offered = offer["object"];
  const capability = Object.freeze({ type: "PurposeBoundCapability", issuer: CUSTOMER, holder: PROVIDER, invocationTarget: PROVIDER, parentOffer: offer["id"], requestDigest: offered["requestDigest"], bindings: offered["bindings"], effects: offered["effects"], singleUse: true });
  const invocation = Object.freeze({ "@context": CONTEXT, id: `urn:koios:attention-invocation:${digest({ offer: offer["id"], capability })}`, type: "Accept", actor: CUSTOMER, target: PROVIDER, inReplyTo: offer["id"], object: { type: "ServiceContract", contract: CLOUDFLARE_ATTENTION_CONTRACT, offer, bindings: offered["bindings"], capability } });
  const outcome = invokeProvider("invoke-attention-service", invocation, input.now);
  const payload = object(outcome["object"]) ? outcome["object"] : undefined;
  const accepted = outcome["type"] === "Accept" && payload?.["type"] === "CloudflareAggregateAttentionReceipt" && payload["disposition"] === "observed";
  const readings = accepted && Array.isArray(payload["readings"]) ? payload["readings"].filter(object) as CloudflareAttentionReading[] : [];
  return Object.freeze({ accepted, outcome, readings: Object.freeze(readings) });
}
