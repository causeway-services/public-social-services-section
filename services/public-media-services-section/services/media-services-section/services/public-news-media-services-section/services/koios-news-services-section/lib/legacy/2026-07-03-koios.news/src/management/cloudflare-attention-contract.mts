import { randomUUID } from "node:crypto";
import { closeSync, existsSync, mkdtempSync, openSync, readFileSync, readdirSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import type { JsonObject } from "./ledger.mjs";
import { SITE_ACCOUNT } from "./settlement-account.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const CUSTOMER = "urn:ame:koios.news";
const PROVIDER = "urn:ame:resource-brokerage-team";
export const CLOUDFLARE_ATTENTION_CONTRACT = "cloudflare-worker-aggregate-attention/v3";

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

function object(value: unknown): value is JsonObject { return value !== null && typeof value === "object" && !Array.isArray(value); }
function providerAccount(root: string): string {
  const files = readdirSync(join(root, "content", "evm", "accounts")).filter((name) => /^eip155-[1-9][0-9]*\.json$/u.test(name));
  if (files.length !== 1) throw new Error("Resource Brokerage Team must publish exactly one active settlement account binding");
  const binding = JSON.parse(readFileSync(join(root, "content", "evm", "accounts", files[0]!), "utf8")) as { account?: { caip10?: unknown } };
  if (typeof binding.account?.caip10 !== "string") throw new Error("Resource Brokerage Team account binding lacks CAIP-10");
  return binding.account.caip10;
}

function providerRoot(): string {
  const supplied = process.env.KOIOS_RESOURCE_BROKERAGE_TEAM_ROOT;
  if (supplied !== undefined) return realpathSync(resolve(supplied));
  const installedSibling = resolve(dirname(fileURLToPath(import.meta.url)), "../../../resource-brokerage-team");
  if (existsSync(join(installedSibling, "package.json"))) return realpathSync(installedSibling);
  const relativeProvider = "lib/emsenn/services/561-group/services/board-of-directors/services/executive-office/services/change-services-section/services/resource-brokerage-team";
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
    const run = spawnSync(process.execPath, [resolve(root, endpoint), "--operation", operation, "--now", now], { cwd: root, stdio: [inputFd, outputFd, errorFd], timeout: 120_000, env: Object.fromEntries(Object.entries({ PATH: process.env.PATH, NODE_PATH: process.env.NODE_PATH, NO_COLOR: "1", RESOURCE_BROKERAGE_PROVIDER_CAIP10: providerAccount(root), RMN_CONFORMANCE_AGENT: process.env.RMN_CONFORMANCE_AGENT, RWIL_RDF_AGENT: process.env.RWIL_RDF_AGENT }).filter(([, value]) => value !== undefined)) });
    const stdout = readFileSync(output, "utf8"); const stderr = readFileSync(error, "utf8");
    let parsed: unknown;
    try { parsed = JSON.parse(stdout); } catch { throw new Error(`attention provider returned no typed result (status=${run.status}): ${stderr || stdout}`); }
    if (!object(parsed)) throw new Error("attention provider returned a non-object result");
    return parsed;
  } finally { closeSync(inputFd); closeSync(outputFd); closeSync(errorFd); rmSync(exchange, { recursive: true, force: true }); }
}

export function settleCloudflareAttention(input: Readonly<{ fromDay: string; throughDay: string; now: string }>): Readonly<{ accepted: boolean; outcome: JsonObject; readings: readonly CloudflareAttentionReading[] }> {
  const request = Object.freeze({ type: "CloudflareAggregateAttentionRequest", fromDay: input.fromDay, throughDay: input.throughDay, pathPrefix: "/posts/", expiresAt: new Date(Date.parse(input.now) + 45 * 60_000).toISOString(), caller: SITE_ACCOUNT.caip10, parentEffect: null });
  const source = Object.freeze({ "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Create", actor: CUSTOMER, target: PROVIDER, object: { type: "Note", attachment: [request] } });
  const solicitation = Object.freeze({ "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Offer", actor: CUSTOMER, target: PROVIDER, object: { type: "ServiceSolicitation", sourceActivity: source } });
  const offer = invokeProvider("solicit-attention-service", solicitation, input.now);
  if (offer["type"] !== "Offer" || !object(offer["object"]) || offer["object"]["contract"] !== CLOUDFLARE_ATTENTION_CONTRACT) return Object.freeze({ accepted: false, outcome: offer, readings: Object.freeze([]) });
  const offered = offer["object"];
  const invocation = Object.freeze({ "@context": CONTEXT, id: `urn:uuid:${randomUUID()}`, type: "Accept", actor: CUSTOMER, target: PROVIDER, inReplyTo: offer["id"], object: { type: "ServiceContract", contract: CLOUDFLARE_ATTENTION_CONTRACT, offer, bindings: offered["bindings"] } });
  const outcome = invokeProvider("invoke-attention-service", invocation, input.now);
  const payload = object(outcome["object"]) ? outcome["object"] : undefined;
  const returnedEffect = payload?.["effect"];
  const accepted = outcome["type"] === "Accept" && payload?.["type"] === "CloudflareAggregateAttentionReceipt" && payload["disposition"] === "observed";
  if (outcome["type"] === "Accept" && !object(returnedEffect)) throw new Error("Resource Brokerage Team accepted attention reading without the contracted RMN effect witness");
  const readings = accepted && Array.isArray(payload["readings"]) ? payload["readings"].filter(object) as CloudflareAttentionReading[] : [];
  return Object.freeze({ accepted, outcome, readings: Object.freeze(readings) });
}
