#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const semanticId = (value) => identifyJsonSemanticContent({ objectKind: "rsc-quiescent.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import { createSettlementStore, querySettlementRecords } from "./record-journal.mjs";
import { acquireSyndicationSource, sourceBundle } from "./syndication.mjs";

export const ACTOR = "https://newscable-source-broker.invalid/activitypub/actor";
export const CONTEXT = "https://www.w3.org/ns/activitystreams";
export const CONTRACT = "ni:///sha-256;R9WmY-YxEjhb7ASTSmA3SnRlQtkkWQ0dw1Hr4bO24ck";
export const RECALL_CONTRACT = "ni:///sha-256;49ZwW9BwpycKPNf5ak4ueZMobpUHZ7GZ5Qit8k_eR_Y";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ADMITTED_CARRIERS = new Set(["rss", "arxiv", "newswire"]);

function dataRoot() { return resolve(process.env.NEWSCABLE_SOURCE_BROKER_DATA_ROOT ?? join(ROOT, "data")); }
function store() { return createSettlementStore({ settlementRoot: dataRoot() }); }
export function digest(value) { return semanticId(value); }
function validInstant(value) { return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value)); }
async function record(contract, kind, instant, value) { return store().record({ category: `${contract}.${kind}`, recordedAt: instant, record: value }); }

async function refusal(activity, reason, instant, contract = CONTRACT) {
  const result = Object.freeze({ "@context": CONTEXT, id: digest({ type: "NewscableRefusal", activity, reason, instant }), type: "Reject", actor: ACTOR, target: activity?.actor, object: activity, published: instant, summary: reason });
  await record(contract, "events", instant, { type: "NewscableProviderEvent", disposition: "refused", reason, activity: digest(activity), outcome: { positiveEvidence: false, negativeEvidence: true } });
  return result;
}

function demandFrom(activity) {
  const source = activity?.object?.sourceActivity; const demand = source?.object;
  return source?.type === "Create" && demand?.type === "SourceBundleDemand" && Array.isArray(demand.wires) ? { source, demand } : undefined;
}
function admittedWires(demand) {
  const wires = demand.wires.flatMap((wire) => {
    if (!wire || typeof wire !== "object" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(String(wire.name ?? "")) || !Array.isArray(wire.sources)) return [];
    const sources = wire.sources.filter((source) => source && typeof source === "object" && ADMITTED_CARRIERS.has(source.adapter) && (typeof source.url === "string" || typeof source.query === "string")).slice(0, 16);
    return sources.length === 0 ? [] : [{ name: wire.name, sources: Object.freeze(sources) }];
  }).slice(0, 16);
  return Object.freeze(wires);
}
function recallDemandFrom(activity) {
  const source = activity?.object?.sourceActivity; const demand = source?.object;
  if (source?.type !== "Create" || demand?.type !== "SourceBundleRecallDemand" || !Array.isArray(demand.urls)) return undefined;
  const urls = [...new Set(demand.urls.filter((url) => typeof url === "string" && /^https?:\/\/[^\s]+$/iu.test(url)))];
  return urls.length > 0 && urls.length <= 8 && urls.length === demand.urls.length ? { source, demand, urls: Object.freeze(urls) } : undefined;
}

async function recallSnapshot(urls) {
  const root = dataRoot(), latest = new Map();
  const records = [
    ...querySettlementRecords(`${CONTRACT}.bundles`, { root }),
    ...querySettlementRecords(`${CONTRACT}.legacy-bundle-imports`, { root }),
  ];
  for (const requestedUrl of urls) {
    for (const held of records) {
      const deliveries = held?.type === "SourceBundleDelivery" || held?.type === "SourceBundleRecord" ? [held]
        : Array.isArray(held?.bundles) ? held.bundles : [];
      for (const delivery of deliveries) {
        const url = delivery?.bundle?.source?.url;
        if (url !== requestedUrl || typeof delivery.subject !== "string" || typeof delivery.observedAt !== "string") continue;
        const prior = latest.get(url);
        if (prior && (prior.observedAt > delivery.observedAt || (prior.observedAt === delivery.observedAt && prior.digest.localeCompare(delivery.digest) >= 0))) continue;
        latest.set(url, delivery);
      }
    }
  }
  return Object.freeze(urls.flatMap((url) => latest.get(url) ?? []));
}

export async function solicitSourceBundleService(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Offer" || activity?.target !== ACTOR || activity?.object?.type !== "ServiceSolicitation") return refusal(activity, "solicitation must be an ActivityStreams Offer<ServiceSolicitation> addressed to this provider", instant);
  const found = demandFrom(activity); if (!found || admittedWires(found.demand).length === 0) return refusal(activity, "demand carries no admitted bounded syndication sources", instant);
  const demandDigest = digest(found.demand);
  const offer = Object.freeze({ "@context": CONTEXT, id: digest({ type: "SourceBundleOfferIdentity", provider: ACTOR, demandDigest }), type: "Offer", actor: ACTOR, target: activity.actor, published: instant, object: Object.freeze({ type: "ServiceOffer", service: "source-bundle-refresh", demandDigest, sourceActivity: found.source, capability: Object.freeze({ type: "AttenuatedCapability", effect: "fetch-declared-syndication-sources", demandDigest }), price: Object.freeze({ amount: 0, currency: "USD" }) }) });
  await record(CONTRACT, "events", instant, { type: "NewscableProviderEvent", disposition: "offered", offer: offer.id, demandDigest, outcome: { positiveEvidence: true, negativeEvidence: false } });
  return offer;
}

export async function solicitSourceBundleRecall(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Offer" || activity?.target !== ACTOR || activity?.object?.type !== "ServiceSolicitation") return refusal(activity, "recall solicitation must be an ActivityStreams Offer<ServiceSolicitation> addressed to this provider", instant, RECALL_CONTRACT);
  const found = recallDemandFrom(activity); if (!found) return refusal(activity, "recall demand must carry one to eight exact public source URLs", instant, RECALL_CONTRACT);
  const snapshot = await recallSnapshot(found.urls); if (snapshot.length === 0) return refusal(activity, "provider WitnessJournal holds no bundle for the declared source URLs", instant, RECALL_CONTRACT);
  const demandDigest = digest(found.demand); const snapshotDigest = digest(snapshot);
  const offer = Object.freeze({ "@context": CONTEXT, id: digest({ type: "SourceBundleRecallOfferIdentity", provider: ACTOR, demandDigest, snapshotDigest }), type: "Offer", actor: ACTOR, target: activity.actor, published: instant, object: Object.freeze({ type: "ServiceOffer", service: "source-bundle-recall", demandDigest, sourceActivity: found.source, snapshot, snapshotDigest, capability: Object.freeze({ type: "AttenuatedCapability", effect: "read-provider-witness-journal-by-exact-url", demandDigest, snapshotDigest }), price: Object.freeze({ amount: 0, currency: "USD" }) }) });
  await record(RECALL_CONTRACT, "events", instant, { type: "NewscableProviderEvent", disposition: "offered", offer: offer.id, demandDigest, snapshotDigest, bundleCount: snapshot.length, outcome: { positiveEvidence: true, negativeEvidence: false } });
  return offer;
}

export async function invokeSourceBundleRecall(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  const serviceContract = activity?.object; const offer = serviceContract?.offer; const offered = offer?.object;
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Accept" || activity?.target !== ACTOR || serviceContract?.type !== "ServiceContract" || offer?.actor !== ACTOR || offered?.service !== "source-bundle-recall") return refusal(activity, "invocation must accept this provider's exact source-bundle recall offer", instant, RECALL_CONTRACT);
  const demand = offered.sourceActivity?.object; const snapshot = offered.snapshot;
  if (digest(demand) !== offered.demandDigest || !Array.isArray(snapshot) || digest(snapshot) !== offered.snapshotDigest || offered.capability?.demandDigest !== offered.demandDigest || offered.capability?.snapshotDigest !== offered.snapshotDigest) return refusal(activity, "recall offer demand, snapshot, or capability identity changed", instant, RECALL_CONTRACT);
  const deliveryDigest = digest(snapshot);
  const providerExchange = Object.freeze({ exchangeId: digest({ type: "SourceBundleRecallExchangeIdentity", offer: offer.id, instant }), provider: "newscable-source-broker", providerAccount: "eip155:31337:0x5fe8b73b37dc8fb3c2b5e36485da461615e166ae", service: "source-bundle-recall", price: Object.freeze({ amount: 0, currency: "USD" }), demandDigest: offered.demandDigest, deliveryDigest, bundleCount: snapshot.length, networkRequests: 0, customerTerritoryMutation: false, recordedAt: instant });
  const response = Object.freeze({ "@context": CONTEXT, id: digest({ type: "SourceBundleRecallAcceptance", exchange: providerExchange.exchangeId, deliveryDigest }), type: "Accept", actor: ACTOR, target: activity.actor, published: instant, object: Object.freeze({ type: "SourceBundleDelivery", sourceMode: "provider-witness-journal-recall", deliveryDigest, bundles: snapshot, results: Object.freeze([]), providerExchange }) });
  await record(RECALL_CONTRACT, "events", instant, { type: "NewscableProviderEvent", disposition: "settled", ...providerExchange, outcome: { positiveEvidence: true, negativeEvidence: false } });
  return response;
}

export async function invokeSourceBundleService(activity, instant = new Date().toISOString(), io = {}) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  const serviceContract = activity?.object; const offer = serviceContract?.offer; const offered = offer?.object;
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Accept" || activity?.target !== ACTOR || serviceContract?.type !== "ServiceContract" || offer?.actor !== ACTOR || offered?.service !== "source-bundle-refresh") return refusal(activity, "invocation must accept this provider's exact source-bundle offer", instant);
  const demand = offered.sourceActivity?.object;
  if (digest(demand) !== offered.demandDigest || offered.capability?.demandDigest !== offered.demandDigest) return refusal(activity, "offer demand or capability identity changed", instant);
  const wires = admittedWires(demand); if (wires.length === 0) return refusal(activity, "accepted demand carries no admitted bounded syndication sources", instant);
  const results = []; const deliveries = []; const provider = store();
  for (const wire of wires) {
    let written = 0; const errors = [];
    for (const source of wire.sources) try {
      const items = await acquireSyndicationSource(source, io);
      for (const value of items) {
        const bundle = sourceBundle(value, { wire: wire.name, asserted: instant, witness: ACTOR });
        const delivery = Object.freeze({ type: "SourceBundleRecord", wire: wire.name, subject: bundle.subject, digest: bundle.id, bundle, observedAt: instant });
        const receipt = await provider.record({ category: `${CONTRACT}.bundles`, recordedAt: instant, record: delivery });
        if (receipt.appended) written += 1;
        deliveries.push(delivery);
      }
    } catch (error) { errors.push(`${source.adapter}: ${error instanceof Error ? error.message : String(error)}`); }
    results.push(Object.freeze({ wire: wire.name, written, skipped: 0, errors: Object.freeze(errors) }));
  }
  deliveries.sort((left, right) => left.wire.localeCompare(right.wire) || left.subject.localeCompare(right.subject) || left.digest.localeCompare(right.digest));
  // Every bundle already carries an RMN identity over its complete content.
  // Bind the ordered identity manifest instead of normalizing the entire
  // nested corpus again; the customer verifies the manifest against delivery.
  const bundleManifest = Object.freeze(deliveries.map(({ wire, subject, digest: bundleDigest }) => Object.freeze({ wire, subject, digest: bundleDigest })));
  const deliveryDigest = digest(bundleManifest);
  const providerExchange = Object.freeze({ exchangeId: digest({ type: "SourceBundleExchangeIdentity", offer: offer.id, instant }), provider: "newscable-source-broker", providerAccount: "eip155:31337:0x5fe8b73b37dc8fb3c2b5e36485da461615e166ae", service: "source-bundle-refresh", price: Object.freeze({ amount: 0, currency: "USD" }), demandDigest: offered.demandDigest, deliveryDigest, bundleCount: deliveries.length, networkRequests: wires.reduce((count, wire) => count + wire.sources.length, 0), customerTerritoryMutation: false, recordedAt: instant });
  const response = Object.freeze({ "@context": CONTEXT, id: digest({ type: "SourceBundleAcceptance", exchange: providerExchange.exchangeId, deliveryDigest }), type: "Accept", actor: ACTOR, target: activity.actor, published: instant, object: Object.freeze({ type: "SourceBundleDelivery", deliveryDigest, bundleManifest, bundles: Object.freeze(deliveries), results: Object.freeze(results), providerExchange }) });
  await record(CONTRACT, "events", instant, { type: "NewscableProviderEvent", disposition: "settled", ...providerExchange, outcome: { positiveEvidence: true, negativeEvidence: false } });
  return response;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2]; const instant = process.argv[3] ?? new Date().toISOString(); const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const activity = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const result = command === "solicit-service" ? await solicitSourceBundleService(activity, instant)
    : command === "invoke-service" ? await invokeSourceBundleService(activity, instant)
      : command === "solicit-recall" ? await solicitSourceBundleRecall(activity, instant)
        : command === "invoke-recall" ? await invokeSourceBundleRecall(activity, instant)
          : await refusal(activity, `unknown command: ${command}`, instant);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
