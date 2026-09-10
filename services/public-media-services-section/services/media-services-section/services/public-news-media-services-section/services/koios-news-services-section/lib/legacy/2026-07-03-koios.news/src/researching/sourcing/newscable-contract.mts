// Koios's customer-side Chu/Hoare seam with the independently executable
// Newscable Source Broker. Provider values cross only through ActivityStreams;
// Koios admits them into its own RWIL and never copies the provider's store.

import { spawnSync } from "node:child_process";
import { constants, accessSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSettlementStore, querySettlementRecords } from "@lenticule-science/rwil-rdf-projection-service/client";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mjs";
import { recordDigest, type JsonObject } from "../../management/ledger.mjs";

const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "https://koios.news/activitypub/actor";
const PROVIDER_ACTOR = "https://newscable-source-broker.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/newscable-source-broker");
export const SOURCE_BUNDLE_CONTRACT = "ni:///sha-256;ebrZ90_nZRpBkxaSQgcdu4hUd_ReVnu8YtU7CQ9QhXg";
export const SOURCE_BUNDLE_RECALL_CONTRACT = "ni:///sha-256;5Sm8wCycvavhLrWtbOgB7y0xFjWIg38K1ZL0k1Q2ml4";

type SourceConfig = Readonly<Record<string, unknown>>;
type WireDemand = Readonly<{ name: string; sources: readonly SourceConfig[] }>;
type ProviderBundle = Readonly<{ wire: string; subject: string; digest: string; bundle: JsonObject }>;
type AdmissionDecision = Readonly<{ disposition: "admitted" | "duplicate" | "collision" | "refused"; reason: string; existingDigest?: string }>;

export type SourceBundleRefreshResult = Readonly<{
  contract: typeof SOURCE_BUNDLE_CONTRACT;
  deliveryDigest: string;
  offered: number;
  admitted: number;
  duplicates: number;
  collisions: number;
  refused: number;
  results: readonly Readonly<{ wire: string; written: number; skipped: number; errors: readonly string[] }>[];
  providerExchange: Readonly<JsonObject>;
  providerDelivery: Readonly<JsonObject>;
}>;

function validInstant(value: string): boolean { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value)); }
function record(value: unknown): JsonObject { if (value === null || typeof value !== "object" || Array.isArray(value)) throw new Error("provider returned a non-record value"); return value as JsonObject; }
function identifiedRecordDigest(value: JsonObject): string { const { id: _id, ...body } = value; return recordDigest(body); }
function store(dataDir: string) { const agentUrl = process.env.RWIL_RDF_AGENT; if (!agentUrl) throw new Error("RWIL_RDF_AGENT must name Koios's hired RWIL/RDF provider"); return createSettlementStore({ settlementRoot: SITE_ROOT, agentUrl }); }
async function witness(dataDir: string, law: string, kind: string, instant: string, value: JsonObject) { return store(dataDir).record({ category: `${law}.${kind}`, recordedAt: instant, record: value }); }

function wiresFromConfig(configPath: string): readonly WireDemand[] {
  const document = record(JSON.parse(readFileSync(configPath, "utf8"))); const newscable = record(document.newscable); const wires = Array.isArray(newscable.wires) ? newscable.wires : [];
  return Object.freeze(wires.flatMap((raw): WireDemand[] => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return [];
    const wire = raw as JsonObject; const name = String(wire.name ?? "");
    // A three-hour issue pulse needs the newest candidates from every source,
    // not the entire feed history. Keeping four items per source preserves the
    // breadth of all desks while bounding the provider's RWIL work and reply.
    const sources = Array.isArray(wire.sources) ? wire.sources
      .filter((source): source is SourceConfig => source !== null && typeof source === "object" && !Array.isArray(source))
      .map((source) => Object.freeze({ ...source, max: Math.min(Number.isInteger(source.max) ? Number(source.max) : 4, 4) })) : [];
    return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name) && sources.length > 0 ? [Object.freeze({ name, sources: Object.freeze(sources) })] : [];
  }));
}
function safeName(value: string, kind: string): string { if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)) throw new Error(`unsafe ${kind}: ${value}`); return value; }
function providerEndpoint(root: string, operation: string): string {
  const pkg = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8"))); const relative = record(pkg.bin)[operation];
  if (typeof relative !== "string" || relative.trim() === "") throw new Error(`newscable provider does not advertise ${operation}`);
  const endpoint = resolve(root, relative); if (!endpoint.startsWith(`${root}/`)) throw new Error(`newscable provider ${operation} endpoint escapes its membrane`); accessSync(endpoint, constants.R_OK); return endpoint;
}
function invokeProvider(root: string, operation: string, activity: JsonObject, instant: string): JsonObject {
  const result = spawnSync(process.execPath, [providerEndpoint(root, operation), operation, instant], { cwd: root, input: JSON.stringify(activity), encoding: "utf8", maxBuffer: 128 * 1024 * 1024, timeout: 10 * 60 * 1000, env: process.env });
  if (result.error) throw result.error; if (result.status !== 0) throw new Error(`newscable provider failed (${result.status}): ${result.stderr.trim()}`);
  const line = result.stdout.trim().split("\n").at(-1); if (!line) throw new Error("newscable provider returned no ActivityStreams result"); return record(JSON.parse(line));
}

export async function recallSourceBundles(input: Readonly<{ sourceUrls: readonly string[]; dataDir?: string; now?: string; providerRoot?: string }>): Promise<Readonly<JsonObject>> {
  const now = input.now ?? new Date().toISOString(); if (!validInstant(now)) throw new Error(`source recall requires an explicit UTC instant: ${now}`);
  const urls = Object.freeze([...new Set(input.sourceUrls.filter((url) => /^https?:\/\/[^\s]+$/iu.test(url)))].slice(0, 8)); if (!urls.length) throw new Error("source recall requires at least one exact public source URL");
  const dataDir = resolve(input.dataDir ?? "data"); const providerRoot = resolve(input.providerRoot ?? process.env.KOIOS_NEWSCABLE_SOURCE_BROKER_ROOT ?? DEFAULT_PROVIDER_ROOT);
  const demand = Object.freeze({ type: "SourceBundleRecallDemand", urls }); const source = Object.freeze({ "@context": CONTEXT, id: recordDigest({ type: "KoiosSourceBundleRecallDemand", demand }), type: "Create", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: demand });
  const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceSolicitation", sourceActivity: source }) });
  const offer = invokeProvider(providerRoot, "solicit-recall", solicitation as JsonObject, now); if (offer.type !== "Offer" || offer.actor !== PROVIDER_ACTOR || record(offer.object).contract !== SOURCE_BUNDLE_RECALL_CONTRACT) throw new Error(`newscable provider refused or changed source recall law: ${String(offer.summary ?? offer.type)}`);
  const acceptance = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceContract", offer }) });
  const response = invokeProvider(providerRoot, "invoke-recall", acceptance as JsonObject, now); if (response.type !== "Accept" || response.actor !== PROVIDER_ACTOR) throw new Error(`newscable provider refused source recall: ${String(response.summary ?? response.type)}`);
  const delivery = record(response.object); if (delivery.type !== "SourceBundleDelivery" || delivery.sourceMode !== "provider-rwil-recall" || delivery.law !== SOURCE_BUNDLE_RECALL_CONTRACT || !Array.isArray(delivery.bundles) || recordDigest(delivery.bundles) !== delivery.deliveryDigest) throw new Error("newscable recall delivery does not bind its provider-owned RWIL snapshot");
  await witness(dataDir, SOURCE_BUNDLE_RECALL_CONTRACT, "receipts", now, Object.freeze({ type: "KoiosSourceBundleRecallReceipt", law: SOURCE_BUNDLE_RECALL_CONTRACT, requestedUrls: urls, deliveryDigest: delivery.deliveryDigest, bundleCount: delivery.bundles.length, providerExchange: delivery.providerExchange, outcome: { positiveEvidence: true, negativeEvidence: false } }) as JsonObject);
  return Object.freeze(response);
}

async function admitBundle(bundle: ProviderBundle, admittedWires: ReadonlySet<string>, dataDir: string, now: string, heldBySubject: Map<string, JsonObject>): Promise<AdmissionDecision> {
  if (!admittedWires.has(safeName(bundle.wire, "wire name"))) return Object.freeze({ disposition: "refused", reason: "delivery names no Koios-declared wire" });
  const subject = safeName(bundle.subject, "bundle subject"); if (bundle.bundle.id !== bundle.digest || identifiedRecordDigest(bundle.bundle) !== bundle.digest) return Object.freeze({ disposition: "refused", reason: "RMN bundle identity mismatch" });
  if (bundle.bundle.subject !== subject || bundle.bundle.law !== SOURCE_BUNDLE_CONTRACT) return Object.freeze({ disposition: "refused", reason: "bundle subject or law differs from delivery" });
  const category = `${SOURCE_BUNDLE_CONTRACT}.admissions`; const key = `${bundle.wire}\u0000${subject}`; const prior = heldBySubject.get(key);
  if (prior) return prior.digest === bundle.digest ? Object.freeze({ disposition: "duplicate", reason: "exact semantic bundle already admitted", existingDigest: String(prior.digest) }) : Object.freeze({ disposition: "collision", reason: "subject already has a different monotone source report; prior evidence retained", existingDigest: String(prior.digest) });
  const admission = { type: "KoiosSourceBundleAdmission", law: SOURCE_BUNDLE_CONTRACT, wire: bundle.wire, subject, digest: bundle.digest, provider: PROVIDER_ACTOR, providerAccount: "eip155:31337:0x5fe8b73b37dc8fb3c2b5e36485da461615e166ae", bundle: bundle.bundle, outcome: { positiveEvidence: true, negativeEvidence: false } };
  await store(dataDir).record({ category, recordedAt: now, record: admission }); heldBySubject.set(key, admission);
  return Object.freeze({ disposition: "admitted", reason: "new source report admitted to Koios RWIL" });
}

export async function refreshSourceCorpus(input: Readonly<{ configPath?: string; dataDir?: string; now?: string; providerRoot?: string }> = {}): Promise<SourceBundleRefreshResult> {
  const now = input.now ?? new Date().toISOString(); if (!validInstant(now)) throw new Error(`source refresh requires an explicit UTC instant: ${now}`);
  const configPath = resolve(input.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG); const dataDir = resolve(input.dataDir ?? "data"); const providerRoot = resolve(input.providerRoot ?? process.env.KOIOS_NEWSCABLE_SOURCE_BROKER_ROOT ?? DEFAULT_PROVIDER_ROOT);
  const wireDemands = wiresFromConfig(configPath); const demand = Object.freeze({ type: "SourceBundleDemand", wires: wireDemands });
  const source = Object.freeze({ "@context": CONTEXT, id: recordDigest({ type: "KoiosSourceBundleDemand", demand }), type: "Create", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: demand });
  const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceSolicitation", demand: recordDigest(demand), sourceActivity: source, requestedEvidence: Object.freeze(["provider-authored-offer", "RMN-bundle-identities", "RWIL-receipt"]) }) });
  const offer = invokeProvider(providerRoot, "solicit-service", solicitation as JsonObject, now); if (offer.type !== "Offer" || offer.actor !== PROVIDER_ACTOR || record(offer.object).contract !== SOURCE_BUNDLE_CONTRACT) throw new Error(`newscable provider refused or changed source-bundle law: ${JSON.stringify(offer)}`);
  const acceptance = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceContract", offer }) });
  const response = invokeProvider(providerRoot, "invoke-service", acceptance as JsonObject, now); if (response.type !== "Accept" || response.actor !== PROVIDER_ACTOR) throw new Error(`newscable provider refused invocation: ${JSON.stringify(response)}`);
  const delivery = record(response.object); if (delivery.type !== "SourceBundleDelivery" || delivery.law !== SOURCE_BUNDLE_CONTRACT || !Array.isArray(delivery.bundles) || !Array.isArray(delivery.bundleManifest)) throw new Error("provider delivery does not bind its RMN source bundles");
  const bundles = delivery.bundles.map((value) => record(value) as ProviderBundle);
  const expectedManifest = bundles.map(({ wire, subject, digest }) => ({ wire, subject, digest }));
  if (recordDigest(expectedManifest) !== delivery.deliveryDigest || recordDigest(delivery.bundleManifest) !== delivery.deliveryDigest || JSON.stringify(delivery.bundleManifest) !== JSON.stringify(expectedManifest)) throw new Error("provider delivery manifest differs from its ordered RMN source bundles");
  const wireNames = new Set(wireDemands.map(({ name }) => name));
  const heldBySubject = new Map<string, JsonObject>();
  for (const held of querySettlementRecords(`${SOURCE_BUNDLE_CONTRACT}.admissions`) as readonly JsonObject[]) {
    if (typeof held.wire === "string" && typeof held.subject === "string") heldBySubject.set(`${held.wire}\u0000${held.subject}`, held);
  }
  const decisions: Array<Readonly<{ bundle: ProviderBundle; decision: AdmissionDecision }>> = []; for (const bundle of bundles) decisions.push(Object.freeze({ bundle, decision: await admitBundle(bundle, wireNames, dataDir, now, heldBySubject) }));
  const byDisposition = (disposition: AdmissionDecision["disposition"]) => decisions.filter(({ decision }) => decision.disposition === disposition);
  const providerResults = Array.isArray(delivery.results) ? delivery.results.flatMap((value) => value && typeof value === "object" && !Array.isArray(value) ? [value as JsonObject] : []) : [];
  const results = Object.freeze(wireDemands.map(({ name }) => { const held = decisions.filter(({ bundle }) => bundle.wire === name); const upstream = providerResults.find((value) => value.wire === name); return Object.freeze({ wire: name, written: held.filter(({ decision }) => decision.disposition === "admitted").length, skipped: held.filter(({ decision }) => decision.disposition === "duplicate").length, errors: Object.freeze([...(Array.isArray(upstream?.errors) ? upstream.errors.map(String) : []), ...held.filter(({ decision }) => ["collision", "refused"].includes(decision.disposition)).map(({ decision }) => decision.reason)]) }); }));
  const receipt = Object.freeze({ type: "KoiosSourceBundleSettlement", law: SOURCE_BUNDLE_CONTRACT, deliveryDigest: delivery.deliveryDigest, offered: bundles.length, admitted: byDisposition("admitted").length, duplicates: byDisposition("duplicate").length, collisions: byDisposition("collision").length, refused: byDisposition("refused").length, providerExchange: delivery.providerExchange, outcome: { positiveEvidence: true, negativeEvidence: false } });
  await witness(dataDir, SOURCE_BUNDLE_CONTRACT, "receipts", now, receipt as JsonObject);
  return Object.freeze({ contract: SOURCE_BUNDLE_CONTRACT, deliveryDigest: String(delivery.deliveryDigest), offered: bundles.length, admitted: byDisposition("admitted").length, duplicates: byDisposition("duplicate").length, collisions: byDisposition("collision").length, refused: byDisposition("refused").length, results, providerExchange: record(delivery.providerExchange), providerDelivery: Object.freeze(response) });
}
