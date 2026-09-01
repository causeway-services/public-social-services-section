#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
import { isNiUri as isCanonicalSha256NiUri } from "@red-cup-engineering/ni-services-section";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { appendKoiosAct, latestKoiosAct, type JsonObject } from "./management/ledger.mts";
import type { StaticPublicationManifest } from "./administrating/deploying/static-shadow.mts";
import { inspectNavigation } from "./administrating/deploying/origin-portability.mts";

const PROVIDER = "urn:ame:resource-brokerage-team";

function argument(name: string): string | undefined { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
function artifactIdentity(value: Uint8Array | string): string {
  const carrier = typeof value === "string"
    ? { encoding: "utf8", text: value }
    : { encoding: "base64", bytes: Buffer.from(value).toString("base64") };
  return identifyJsonSemanticContent({ objectKind: "koios-news.preview-parity-artifact", value: carrier, witnessRoot: EMPTY_WITNESS_ROOT }).token;
}
function mediaType(value: string | null): string { return (value ?? "application/octet-stream").split(";", 1)[0]!.trim().toLowerCase(); }

const now = argument("--now");
if (now === undefined) throw new Error("preview parity requires --now with an explicit UTC instant");
const candidateOutputDir = resolve(argument("--candidate-out") ?? ".static/koios.news-candidate");
if (argument("--resource-grant") !== undefined) throw new Error("preview parity accepts only the delivered RMN effect witness");
const origin = new URL(argument("--preview") ?? "https://koios-news-shadow.morgan-sennhauser.workers.dev").origin;
const manifestBytes = readFileSync(join(candidateOutputDir, "manifest.json"));
const manifest = JSON.parse(manifestBytes.toString("utf8")) as StaticPublicationManifest;
if (manifest.profile !== "cutover-candidate" || manifest.authority !== "non-authoritative-cutover-candidate") throw new Error("preview parity requires a cutover-candidate manifest");
const bindings = Object.freeze({
  artifactManifestDigest: artifactIdentity(manifestBytes),
  livePublicationWitnessDigest: manifest.livePublicationWitnessDigest,
  deliveryPolicyDigest: artifactIdentity(readFileSync(join(candidateOutputDir, "_headers"))),
});
const delivery = latestKoiosAct(DEFAULT_DATA_DIR, "shadow-deliveries", "deployment.cloudflare-preview.delivered");
const delivered = delivery?.["data"] as JsonObject | undefined;
if (delivered === undefined || delivered["artifactManifestDigest"] !== bindings.artifactManifestDigest || delivered["livePublicationWitnessDigest"] !== bindings.livePublicationWitnessDigest || delivered["deliveryPolicyDigest"] !== bindings.deliveryPolicyDigest || delivered["hostname"] !== new URL(origin).hostname) throw new Error("latest preview delivery is not bound to this candidate and hostname");
const outcome = delivered["outcome"] as JsonObject | undefined;
const offeredBindings = (outcome?.["object"] as JsonObject | undefined)?.["bindings"] as JsonObject | undefined;
if (outcome?.["type"] !== "Accept" || outcome["actor"] !== PROVIDER || offeredBindings === undefined) throw new Error("preview delivery has no accepted provider binding packet");
const outcomeObject = outcome["object"] as JsonObject;
const effect = outcomeObject["effect"] as JsonObject | undefined;
const effectOutcome = effect?.["outcome"] as JsonObject | undefined;
if (effectOutcome?.["positiveEvidence"] !== true || effectOutcome["negativeEvidence"] !== false || !isCanonicalSha256NiUri(effect?.["witness"])) throw new Error("preview delivery lacks one positive RMN effect cover");
if (offeredBindings["artifactManifestDigest"] !== bindings.artifactManifestDigest || offeredBindings["livePublicationWitnessDigest"] !== bindings.livePublicationWitnessDigest || offeredBindings["deliveryPolicyDigest"] !== bindings.deliveryPolicyDigest || offeredBindings["hostname"] !== new URL(origin).hostname) throw new Error("provider bindings differ from the candidate or preview origin");

const artifacts = manifest.artifacts.filter((artifact) => artifact.route.startsWith("/"));
const comparisons: Array<Readonly<{ route: string; status: number; mediaType: string; bytes: number; digest: string; exact: boolean }>> = new Array(artifacts.length);
const navigationEdges: Array<Readonly<{ source: string; target: string }>> = [];
const navigationEscapes: Array<Readonly<{ source: string; target: string }>> = [];
let cursor = 0;
async function worker(): Promise<void> {
  while (true) {
    const index = cursor++;
    const artifact = artifacts[index];
    if (artifact === undefined) return;
    const response = await fetch(`${origin}${artifact.route}`, { redirect: "manual", headers: { accept: "*/*", "cache-control": "no-cache" } });
    const bytes = new Uint8Array(await response.arrayBuffer());
    const digest = artifactIdentity(bytes);
    const observedMediaType = mediaType(response.headers.get("content-type"));
    comparisons[index] = Object.freeze({ route: artifact.route, status: response.status, mediaType: observedMediaType, bytes: bytes.byteLength, digest, exact: response.status === 200 && observedMediaType === mediaType(artifact.mediaType) && bytes.byteLength === artifact.bytes && digest === artifact.digest });
    if (response.status === 200 && observedMediaType === "text/html") {
      const inspection = inspectNavigation(new TextDecoder().decode(bytes), `${origin}${artifact.route}`, manifest.canonicalOrigin);
      navigationEdges.push(...inspection.internalTargets.map((target) => Object.freeze({ source: artifact.route, target })));
      navigationEscapes.push(...inspection.canonicalEscapes.map((target) => Object.freeze({ source: artifact.route, target })));
    }
  }
}
await Promise.all(Array.from({ length: 48 }, () => worker()));
const mismatches = Object.freeze(comparisons.filter((comparison) => !comparison.exact));
navigationEdges.sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target));
navigationEscapes.sort((left, right) => left.source.localeCompare(right.source) || left.target.localeCompare(right.target));
const navigationTargets = Object.freeze([...new Set(navigationEdges.map((edge) => edge.target))].sort());
const navigationComparisons: Array<Readonly<{ target: string; status: number; finalTarget: string; redirects: readonly string[]; reachable: boolean }>> = new Array(navigationTargets.length);
let navigationCursor = 0;
async function navigationWorker(): Promise<void> {
  while (true) {
    const index = navigationCursor++;
    const target = navigationTargets[index];
    if (target === undefined) return;
    let current = new URL(target, origin);
    const redirects: string[] = [];
    let status = 0;
    let reachable = false;
    for (let hop = 0; hop <= 5; hop += 1) {
      const response = await fetch(current, { redirect: "manual", headers: { accept: "*/*", "cache-control": "no-cache" } });
      status = response.status;
      const location = response.headers.get("location");
      await response.body?.cancel();
      if (status === 200) { reachable = true; break; }
      if (status < 300 || status >= 400 || location === null || hop === 5) break;
      const next = new URL(location, current);
      redirects.push(next.href);
      if (next.origin !== origin) { current = next; break; }
      current = next;
    }
    navigationComparisons[index] = Object.freeze({ target, status, finalTarget: current.href, redirects: Object.freeze(redirects), reachable });
  }
}
await Promise.all(Array.from({ length: Math.min(48, Math.max(1, navigationTargets.length)) }, () => navigationWorker()));
const unreachableNavigation = Object.freeze(navigationComparisons.filter((comparison) => !comparison.reachable));
const rootResponse = await fetch(`${origin}/`, { redirect: "manual", headers: { "cache-control": "no-cache" } });
const headerLines = readFileSync(join(candidateOutputDir, "_headers"), "utf8").split("\n");
const rootRuleEnd = headerLines.slice(1).findIndex((line) => line !== "" && !/^\s/u.test(line));
const expectedHeaders = headerLines.slice(1, rootRuleEnd === -1 ? undefined : rootRuleEnd + 1).flatMap((line) => {
  const match = line.match(/^\s+([^:]+):\s*(.+)$/u); return match === null ? [] : [[match[1]!.toLowerCase(), match[2]!] as const];
});
const headerMismatches = Object.freeze(expectedHeaders.flatMap(([name, expected]) => rootResponse.headers.get(name) === expected ? [] : [{ name, expected, observed: rootResponse.headers.get(name) }]));
const previewNoindex = rootResponse.headers.get("x-robots-tag") === "noindex, nofollow, noarchive";
const report = Object.freeze({
  kind: "koios.cloudflare-preview-parity/v1",
  previewOrigin: origin,
  observedAt: now,
  ...bindings,
  providerDelivery: delivery?.["recordDigest"],
  effectWitness: effect["witness"],
  effectCompletion: effect["completion"],
  accountId: offeredBindings["accountId"],
  workerName: offeredBindings["workerName"],
  routeCount: artifacts.length,
  exactRouteCount: comparisons.length - mismatches.length,
  mismatches,
  navigationEdgeCount: navigationEdges.length,
  navigationTargetCount: navigationTargets.length,
  reachableNavigationTargetCount: navigationComparisons.length - unreachableNavigation.length,
  navigationEscapes,
  unreachableNavigation,
  originPortableNavigation: navigationEscapes.length === 0 && unreachableNavigation.length === 0,
  headerMismatches,
  previewNoindex,
  credentialObserved: false,
  settled: mismatches.length === 0 && navigationEscapes.length === 0 && unreachableNavigation.length === 0 && headerMismatches.length === 0 && previewNoindex,
});
if (!report.settled) throw new Error(`preview parity refused: ${JSON.stringify({ routeMismatches: mismatches.slice(0, 10), navigationEscapes: navigationEscapes.slice(0, 10), unreachableNavigation: unreachableNavigation.slice(0, 10), headerMismatches, previewNoindex })}`);
await appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-rmn-effect.accepted", subject: String(effect["witness"]), data: { ...bindings, hostname: new URL(origin).hostname, accountId: offeredBindings["accountId"], workerName: offeredBindings["workerName"], effectWitness: effect["witness"], effectCompletion: effect["completion"], providerDelivery: delivery?.["recordDigest"], credentialRecorded: false } });
await appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-preview.parity-proved", subject: origin, data: report });
process.stdout.write(`${JSON.stringify({ ...report, mismatches: [], navigationEscapes: [], unreachableNavigation: [], headerMismatches: [] })}\n`);
