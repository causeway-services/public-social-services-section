#!/usr/bin/env node
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { DEFAULT_DATA_DIR } from "./config.mjs";
import { appendKoiosAct, latestKoiosAct, recordDigest } from "./management/ledger.mjs";
import { inspectNavigation } from "./administrating/deploying/origin-portability.mjs";
const LMT = "urn:ame:leader-movement-team";
const PROVIDER = "urn:ame:resource-brokerage-team";
function argument(name) { const index = process.argv.indexOf(name); return index === -1 ? undefined : process.argv[index + 1]; }
function sha256(value) { return `sha256:${createHash("sha256").update(value).digest("hex")}`; }
function canonical(value) { if (Array.isArray(value))
    return `[${value.map(canonical).join(",")}]`; if (value !== null && typeof value === "object")
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`; return JSON.stringify(value); }
function mediaType(value) { return (value ?? "application/octet-stream").split(";", 1)[0].trim().toLowerCase(); }
const now = argument("--now");
if (now === undefined)
    throw new Error("preview parity requires --now with an explicit UTC instant");
const candidateOutputDir = resolve(argument("--candidate-out") ?? ".static/koios.news-candidate");
const grantPath = argument("--resource-grant");
if (grantPath === undefined)
    throw new Error("preview parity requires the exact --resource-grant used for delivery");
const origin = new URL(argument("--preview") ?? "https://koios-news-shadow.morgan-sennhauser.workers.dev").origin;
const manifestBytes = readFileSync(join(candidateOutputDir, "manifest.json"));
const manifest = JSON.parse(manifestBytes.toString("utf8"));
if (manifest.profile !== "cutover-candidate" || manifest.authority !== "non-authoritative-cutover-candidate")
    throw new Error("preview parity requires a cutover-candidate manifest");
const bindings = Object.freeze({
    artifactManifestDigest: sha256(manifestBytes),
    livePublicationWitnessDigest: manifest.livePublicationWitnessDigest,
    deliveryPolicyDigest: sha256(readFileSync(join(candidateOutputDir, "_headers"))),
});
const delivery = latestKoiosAct(DEFAULT_DATA_DIR, "shadow-deliveries", "deployment.cloudflare-preview.delivered");
const delivered = delivery?.["data"];
if (delivered === undefined || delivered["artifactManifestDigest"] !== bindings.artifactManifestDigest || delivered["livePublicationWitnessDigest"] !== bindings.livePublicationWitnessDigest || delivered["deliveryPolicyDigest"] !== bindings.deliveryPolicyDigest || delivered["hostname"] !== new URL(origin).hostname)
    throw new Error("latest preview delivery is not bound to this candidate and hostname");
const outcome = delivered["outcome"];
const offeredBindings = outcome?.["object"]?.["bindings"];
if (outcome?.["type"] !== "Accept" || outcome["actor"] !== PROVIDER || offeredBindings === undefined)
    throw new Error("preview delivery has no accepted provider binding packet");
const grant = JSON.parse(readFileSync(resolve(grantPath), "utf8"));
if (grant["type"] !== "InvocationResourceGrant" || grant["issuer"] !== LMT || grant["holder"] !== PROVIDER || grant["invocationTarget"] !== PROVIDER)
    throw new Error("preview grant has the wrong type issuer holder or target");
if (grant["invocation"] !== outcome["inReplyTo"] || canonical(grant["bindings"]) !== canonical(offeredBindings) || canonical(grant["effects"]) !== canonical(offeredBindings["effects"]))
    throw new Error("preview grant does not bind the delivered provider invocation");
if (offeredBindings["artifactManifestDigest"] !== bindings.artifactManifestDigest || offeredBindings["livePublicationWitnessDigest"] !== bindings.livePublicationWitnessDigest || offeredBindings["deliveryPolicyDigest"] !== bindings.deliveryPolicyDigest || offeredBindings["hostname"] !== new URL(origin).hostname)
    throw new Error("provider bindings differ from the candidate or preview origin");
const artifacts = manifest.artifacts.filter((artifact) => artifact.route.startsWith("/"));
const comparisons = new Array(artifacts.length);
const navigationEdges = [];
const navigationEscapes = [];
let cursor = 0;
async function worker() {
    while (true) {
        const index = cursor++;
        const artifact = artifacts[index];
        if (artifact === undefined)
            return;
        const response = await fetch(`${origin}${artifact.route}`, { redirect: "manual", headers: { accept: "*/*", "cache-control": "no-cache" } });
        const bytes = new Uint8Array(await response.arrayBuffer());
        const digest = sha256(bytes);
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
const navigationComparisons = new Array(navigationTargets.length);
let navigationCursor = 0;
async function navigationWorker() {
    while (true) {
        const index = navigationCursor++;
        const target = navigationTargets[index];
        if (target === undefined)
            return;
        let current = new URL(target, origin);
        const redirects = [];
        let status = 0;
        let reachable = false;
        for (let hop = 0; hop <= 5; hop += 1) {
            const response = await fetch(current, { redirect: "manual", headers: { accept: "*/*", "cache-control": "no-cache" } });
            status = response.status;
            const location = response.headers.get("location");
            await response.body?.cancel();
            if (status === 200) {
                reachable = true;
                break;
            }
            if (status < 300 || status >= 400 || location === null || hop === 5)
                break;
            const next = new URL(location, current);
            redirects.push(next.href);
            if (next.origin !== origin) {
                current = next;
                break;
            }
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
    const match = line.match(/^\s+([^:]+):\s*(.+)$/u);
    return match === null ? [] : [[match[1].toLowerCase(), match[2]]];
});
const headerMismatches = Object.freeze(expectedHeaders.flatMap(([name, expected]) => rootResponse.headers.get(name) === expected ? [] : [{ name, expected, observed: rootResponse.headers.get(name) }]));
const previewNoindex = rootResponse.headers.get("x-robots-tag") === "noindex, nofollow, noarchive";
const report = Object.freeze({
    kind: "koios.cloudflare-preview-parity/v1",
    previewOrigin: origin,
    observedAt: now,
    ...bindings,
    providerDelivery: delivery?.["recordDigest"],
    resourceGrant: grant["id"],
    resourceGrantDigest: recordDigest(grant),
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
if (!report.settled)
    throw new Error(`preview parity refused: ${JSON.stringify({ routeMismatches: mismatches.slice(0, 10), navigationEscapes: navigationEscapes.slice(0, 10), unreachableNavigation: unreachableNavigation.slice(0, 10), headerMismatches, previewNoindex })}`);
appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-resource-grant.accepted", subject: String(grant["id"]), data: { ...bindings, hostname: new URL(origin).hostname, accountId: offeredBindings["accountId"], workerName: offeredBindings["workerName"], resourceGrant: grant["id"], resourceGrantDigest: recordDigest(grant), providerDelivery: delivery?.["recordDigest"], credentialRecorded: false } });
appendKoiosAct({ dataRoot: DEFAULT_DATA_DIR, ledger: "deployments", instant: now, act: "deployment.cloudflare-preview.parity-proved", subject: origin, data: report });
process.stdout.write(`${JSON.stringify({ ...report, mismatches: [], navigationEscapes: [], unreachableNavigation: [], headerMismatches: [] })}\n`);
//# sourceMappingURL=preview-parity.mjs.map