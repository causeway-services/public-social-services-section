import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// The service contract owns the provider boundary. The separately packaged
// producing-content dependency supplies the already-paid ingest mechanism;
// the portable-carrier assay proves this settlement has no ambient monorepo
// path dependency at runtime.
import { ingestWire } from "@emsenn/producing-content/cable";

export const ACTOR = "https://newscable-source-broker.invalid/activitypub/actor";
export const CONTEXT = "https://www.w3.org/ns/activitystreams";
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_ROOT = resolve(process.env["NEWSCABLE_SOURCE_BROKER_DATA_ROOT"] ?? join(ROOT, "data"));

function canonical(value) {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value !== null && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function digest(value) {
  return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
}

function validInstant(value) {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}

function event(instant, value) {
  const day = instant.slice(0, 10);
  const [year, month, date] = day.split("-");
  const path = join(DATA_ROOT, "events", year, month, date, `${day}-newscable-source-broker-events.jsonl`);
  mkdirSync(dirname(path), { recursive: true });
  appendFileSync(path, `${JSON.stringify(value)}\n`, "utf8");
}

function refusal(activity, reason, instant) {
  const result = Object.freeze({ "@context": CONTEXT, type: "Reject", actor: ACTOR, target: activity?.actor, object: activity, published: instant, summary: reason });
  event(instant, { kind: "provider.refusal", reason, activityDigest: digest(activity) });
  return result;
}

function demandFrom(activity) {
  const source = activity?.object?.sourceActivity;
  const demand = source?.object;
  if (source?.type !== "Create" || demand?.type !== "SourceBundleDemand" || !Array.isArray(demand.wires)) return undefined;
  return { source, demand };
}

function admittedWires(demand) {
  return demand.wires.flatMap((wire) => {
    if (!wire || typeof wire !== "object" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(String(wire.name ?? "")) || !Array.isArray(wire.sources)) return [];
    const sources = wire.sources.filter((source) => source && typeof source === "object" && typeof source.adapter === "string" && (typeof source.url === "string" || typeof source.query === "string"));
    return sources.length === 0 ? [] : [{ name: wire.name, sources }];
  });
}

export function solicitSourceBundleService(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Offer" || activity?.target !== ACTOR || activity?.object?.type !== "ServiceSolicitation") return refusal(activity, "solicitation must be an ActivityStreams Offer<ServiceSolicitation> addressed to this provider", instant);
  const found = demandFrom(activity);
  if (found === undefined || admittedWires(found.demand).length === 0) return refusal(activity, "demand carries no admitted syndication wires", instant);
  const demandDigest = digest(found.demand);
  const offer = Object.freeze({
    "@context": CONTEXT,
    id: `urn:newscable-source-broker:offer:${demandDigest.replace(/^sha256:/u, "")}`,
    type: "Offer",
    actor: ACTOR,
    target: activity.actor,
    published: instant,
    object: Object.freeze({
      type: "ServiceOffer",
      service: "source-bundle-refresh",
      contract: "newscable-source-broker/source-bundle-service/v1",
      demandDigest,
      sourceActivity: found.source,
      capability: Object.freeze({ type: "AttenuatedCapability", effect: "fetch-declared-syndication-sources", demandDigest }),
      price: Object.freeze({ amount: 0, currency: "USD" }),
    }),
  });
  event(instant, { kind: "provider.offer", offerId: offer.id, demandDigest });
  return offer;
}

function bundleFiles(root) {
  try { return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? bundleFiles(join(root, entry.name)) : entry.name.endsWith(".json") ? [join(root, entry.name)] : []); }
  catch { return []; }
}

export async function invokeSourceBundleService(activity, instant = new Date().toISOString()) {
  if (!validInstant(instant)) throw new Error(`explicit UTC instant required: ${instant}`);
  const contract = activity?.object;
  const offer = contract?.offer;
  if (activity?.["@context"] !== CONTEXT || activity?.type !== "Accept" || activity?.target !== ACTOR || contract?.type !== "ServiceContract" || offer?.actor !== ACTOR || offer?.object?.service !== "source-bundle-refresh") return refusal(activity, "invocation must accept this provider's exact source-bundle offer", instant);
  const source = offer.object.sourceActivity;
  const demand = source?.object;
  if (digest(demand) !== offer.object.demandDigest || offer.object.capability?.demandDigest !== offer.object.demandDigest) return refusal(activity, "offer demand or capability digest changed", instant);
  const wires = admittedWires(demand);
  if (wires.length === 0) return refusal(activity, "accepted demand carries no admitted wires", instant);
  const exchangeId = digest({ offer: offer.id, instant }).replace(/^sha256:/u, "").slice(0, 24);
  const exchangeRoot = join(DATA_ROOT, "exchanges", instant.slice(0, 10).replaceAll("-", "/"), exchangeId);
  const results = [];
  const deliveries = [];
  for (const wire of wires) {
    const storeDir = join(exchangeRoot, wire.name);
    const result = await ingestWire(wire.name, storeDir, wire.sources, { onSkip: () => undefined });
    results.push(result);
    for (const path of bundleFiles(storeDir)) {
      const bundle = JSON.parse(readFileSync(path, "utf8"));
      deliveries.push(Object.freeze({ wire: wire.name, subject: bundle.subject, digest: digest(bundle), bundle }));
    }
  }
  deliveries.sort((left, right) => left.wire.localeCompare(right.wire) || left.subject.localeCompare(right.subject));
  const deliveryDigest = digest(deliveries);
  const providerExchange = Object.freeze({ exchangeId, provider: "newscable-source-broker", service: "source-bundle-refresh", price: { amount: 0, currency: "USD" }, demandDigest: offer.object.demandDigest, deliveryDigest, bundleCount: deliveries.length, recordedAt: instant });
  const response = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: ACTOR, target: activity.actor, published: instant, object: Object.freeze({ type: "SourceBundleDelivery", deliveryDigest, bundles: Object.freeze(deliveries), results: Object.freeze(results), providerExchange }) });
  event(instant, { kind: "provider.delivery", ...providerExchange });
  return response;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const command = process.argv[2];
  const instant = process.argv[3] ?? new Date().toISOString();
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  const activity = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  const result = command === "solicit-service"
    ? solicitSourceBundleService(activity, instant)
    : command === "invoke-service"
      ? await invokeSourceBundleService(activity, instant)
      : refusal(activity, `unknown command: ${command}`, instant);
  process.stdout.write(`${JSON.stringify(result)}\n`);
}
