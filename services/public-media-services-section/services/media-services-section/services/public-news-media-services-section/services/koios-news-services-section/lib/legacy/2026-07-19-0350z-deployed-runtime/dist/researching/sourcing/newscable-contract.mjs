// Koios's customer-side newscable treaty.
//
// The provider fetches declared sources and returns immutable bundles from its
// own exchange store. Only this module can admit those values into Koios's
// corpus. Importing provider code is deliberately avoided: the executable
// boundary is an ActivityStreams exchange over stdin/stdout.
import { spawnSync } from "node:child_process";
import { constants } from "node:fs";
import { accessSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mjs";
import { appendDatedRecord, appendKoiosAct, recordDigest } from "../../management/ledger.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "https://koios.news/activitypub/actor";
const PROVIDER_ACTOR = "https://newscable-source-broker.invalid/activitypub/actor";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const DEFAULT_PROVIDER_ROOT = resolve(SITE_ROOT, "../../services/newscable-source-broker");
function validInstant(value) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}
function record(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        throw new Error("provider returned a non-record value");
    return value;
}
function wiresFromConfig(configPath) {
    const document = record(JSON.parse(readFileSync(configPath, "utf8")));
    const newscable = record(document["newscable"]);
    const wires = Array.isArray(newscable["wires"]) ? newscable["wires"] : [];
    return Object.freeze(wires.flatMap((raw) => {
        if (raw === null || typeof raw !== "object" || Array.isArray(raw))
            return [];
        const wire = raw;
        const name = String(wire["name"] ?? "");
        const sources = Array.isArray(wire["sources"])
            ? wire["sources"].filter((source) => source !== null && typeof source === "object" && !Array.isArray(source))
            : [];
        return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name) && sources.length > 0 ? [Object.freeze({ name, sources: Object.freeze(sources) })] : [];
    }));
}
function providerEndpoint(root, operation) {
    const packageJson = record(JSON.parse(readFileSync(join(root, "package.json"), "utf8")));
    const bins = record(packageJson["bin"]);
    const relative = bins[operation];
    if (typeof relative !== "string" || relative.trim() === "")
        throw new Error(`newscable provider does not advertise ${operation}`);
    const endpoint = resolve(root, relative);
    if (!endpoint.startsWith(`${root}/`))
        throw new Error(`newscable provider ${operation} endpoint escapes its membrane`);
    accessSync(endpoint, constants.R_OK);
    return endpoint;
}
function invokeProvider(root, command, activity, instant) {
    const result = spawnSync(process.execPath, [providerEndpoint(root, command), command, instant], {
        cwd: root,
        input: JSON.stringify(activity),
        encoding: "utf8",
        maxBuffer: 128 * 1024 * 1024,
        timeout: 10 * 60 * 1000,
    });
    if (result.error !== undefined)
        throw result.error;
    if (result.status !== 0)
        throw new Error(`newscable provider failed (${result.status}): ${result.stderr.trim()}`);
    const line = result.stdout.trim().split("\n").at(-1);
    if (line === undefined)
        throw new Error("newscable provider returned no ActivityStreams result");
    return record(JSON.parse(line));
}
function safeName(value, kind) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value))
        throw new Error(`unsafe ${kind}: ${value}`);
    return value;
}
function wireStores(configPath) {
    const document = record(JSON.parse(readFileSync(configPath, "utf8")));
    const newscable = record(document["newscable"]);
    const wires = Array.isArray(newscable["wires"]) ? newscable["wires"] : [];
    const base = dirname(resolve(configPath));
    return new Map(wires.flatMap((raw) => {
        if (raw === null || typeof raw !== "object" || Array.isArray(raw))
            return [];
        const wire = raw;
        const name = safeName(String(wire["name"] ?? ""), "wire name");
        const relative = typeof wire["store"] === "string" ? wire["store"] : join("store", name);
        const storeDir = resolve(base, relative);
        const rel = storeDir.slice(base.length + 1);
        if (storeDir === base || rel.startsWith(".."))
            throw new Error(`wire store escapes Koios membrane: ${relative}`);
        return [[name, storeDir]];
    }));
}
function admitBundle(bundle, stores) {
    const storeDir = stores.get(safeName(bundle.wire, "wire name"));
    if (storeDir === undefined)
        return Object.freeze({ disposition: "refused", reason: "delivery names no Koios-declared wire" });
    const subject = safeName(bundle.subject, "bundle subject");
    if (recordDigest(bundle.bundle) !== bundle.digest)
        return Object.freeze({ disposition: "refused", reason: "canonical bundle digest mismatch" });
    if (bundle.bundle["subject"] !== subject)
        return Object.freeze({ disposition: "refused", reason: "bundle subject differs from delivery subject" });
    const path = join(storeDir, `${subject}.json`);
    mkdirSync(storeDir, { recursive: true });
    try {
        writeFileSync(path, `${JSON.stringify(bundle.bundle, null, 2)}\n`, { encoding: "utf8", flag: "wx" });
        return Object.freeze({ disposition: "admitted", reason: "new subject admitted under exclusive create" });
    }
    catch (error) {
        if (error.code !== "EEXIST")
            throw error;
        const existing = record(JSON.parse(readFileSync(path, "utf8")));
        const existingDigest = recordDigest(existing);
        return existingDigest === bundle.digest
            ? Object.freeze({ disposition: "duplicate", reason: "exact bundle already held", existingDigest })
            : Object.freeze({ disposition: "collision", reason: "subject already held with different immutable bytes; existing corpus value retained", existingDigest });
    }
}
export function refreshSourceCorpus(input = {}) {
    const now = input.now ?? new Date().toISOString();
    if (!validInstant(now))
        throw new Error(`source refresh requires an explicit UTC instant: ${now}`);
    const configPath = resolve(input.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG);
    const dataDir = resolve(input.dataDir ?? "data");
    const providerRoot = resolve(input.providerRoot ?? process.env["KOIOS_NEWSCABLE_SOURCE_BROKER_ROOT"] ?? DEFAULT_PROVIDER_ROOT);
    const demand = Object.freeze({ type: "SourceBundleDemand", wires: wiresFromConfig(configPath) });
    const source = Object.freeze({ "@context": CONTEXT, id: `urn:koios:source-demand:${recordDigest(demand).replace(/^sha256:/u, "")}`, type: "Create", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: demand });
    const solicitation = Object.freeze({ "@context": CONTEXT, type: "Offer", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceSolicitation", demand: recordDigest(demand), sourceActivity: source, requestedEvidence: Object.freeze(["provider-authored-offer", "immutable-bundle-digests", "zero-price-receipt"]) }) });
    const offer = invokeProvider(providerRoot, "solicit-service", solicitation, now);
    if (offer["type"] !== "Offer" || offer["actor"] !== PROVIDER_ACTOR)
        throw new Error(`newscable provider refused solicitation: ${JSON.stringify(offer)}`);
    const acceptance = Object.freeze({ "@context": CONTEXT, type: "Accept", actor: KOIOS_ACTOR, target: PROVIDER_ACTOR, published: now, object: Object.freeze({ type: "ServiceContract", offer }) });
    const response = invokeProvider(providerRoot, "invoke-service", acceptance, now);
    if (response["type"] !== "Accept" || response["actor"] !== PROVIDER_ACTOR)
        throw new Error(`newscable provider refused invocation: ${JSON.stringify(response)}`);
    const delivery = record(response["object"]);
    if (delivery["type"] !== "SourceBundleDelivery" || !Array.isArray(delivery["bundles"]))
        throw new Error("provider response is not a source bundle delivery");
    const bundles = delivery["bundles"].map((value) => record(value));
    if (recordDigest(bundles) !== delivery["deliveryDigest"])
        throw new Error("provider delivery digest does not match returned bundles");
    const stores = wireStores(configPath);
    const decisions = bundles.map((bundle) => Object.freeze({ bundle, decision: admitBundle(bundle, stores) }));
    const admitted = decisions.filter(({ decision }) => decision.disposition === "admitted");
    const duplicates = decisions.filter(({ decision }) => decision.disposition === "duplicate");
    const collisions = decisions.filter(({ decision }) => decision.disposition === "collision");
    const refused = decisions.filter(({ decision }) => decision.disposition === "refused");
    const providerExchange = record(delivery["providerExchange"]);
    const providerResults = Array.isArray(delivery["results"]) ? delivery["results"].flatMap((value) => value !== null && typeof value === "object" && !Array.isArray(value) ? [value] : []) : [];
    const upstreamErrors = Object.freeze(providerResults.flatMap((result) => Array.isArray(result["errors"])
        ? result["errors"].map((error) => Object.freeze({ wire: String(result["wire"] ?? "unknown"), error: String(error) }))
        : []));
    const results = Object.freeze([...stores.entries()].map(([wire, storeDir]) => {
        const wireDecisions = decisions.filter(({ bundle }) => bundle.wire === wire);
        const upstream = providerResults.find((result) => result["wire"] === wire);
        const upstreamErrors = Array.isArray(upstream?.["errors"]) ? upstream["errors"].map(String) : [];
        return Object.freeze({
            wire,
            storeDir,
            written: wireDecisions.filter(({ decision }) => decision.disposition === "admitted").length,
            skipped: wireDecisions.filter(({ decision }) => decision.disposition === "duplicate" || decision.disposition === "collision").length,
            errors: Object.freeze([...upstreamErrors, ...wireDecisions.filter(({ decision }) => decision.disposition === "refused").map(({ bundle, decision }) => `refused bundle ${bundle.subject}: ${decision.reason}`)]),
        });
    }));
    appendDatedRecord({
        dataRoot: dataDir,
        ledger: "source-claims",
        instant: now,
        record: Object.freeze({ kind: "koios.source-bundle-admission", at: now, contract: "newscable-source-broker/source-bundle-service/v1", deliveryDigest: delivery["deliveryDigest"], offered: bundles.length, admitted: admitted.map(({ bundle, decision }) => ({ wire: bundle.wire, subject: bundle.subject, digest: bundle.digest, reason: decision.reason })), duplicates: duplicates.map(({ bundle, decision }) => ({ wire: bundle.wire, subject: bundle.subject, digest: bundle.digest, reason: decision.reason })), collisions: collisions.map(({ bundle, decision }) => ({ wire: bundle.wire, subject: bundle.subject, incomingDigest: bundle.digest, existingDigest: decision.existingDigest, reason: decision.reason })), refused: refused.map(({ bundle, decision }) => ({ wire: bundle.wire, subject: bundle.subject, digest: bundle.digest, reason: decision.reason })), upstreamErrors }),
    });
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newscable.source-bundles.settled", subject: String(providerExchange["exchangeId"] ?? delivery["deliveryDigest"]), data: { provider: "newscable-source-broker", contract: "newscable-source-broker/source-bundle-service/v1", deliveryDigest: delivery["deliveryDigest"], offered: bundles.length, admitted: admitted.length, duplicates: duplicates.length, collisions: collisions.length, refused: refused.length, upstreamErrorCount: upstreamErrors.length, price: providerExchange["price"] ?? { amount: 0, currency: "USD" } } });
    appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: now, act: "provider.service.consumed", subject: String(providerExchange["exchangeId"] ?? delivery["deliveryDigest"]), data: { purpose: "refresh-source-corpus", provider: "newscable-source-broker", service: "source-bundle-refresh", deliveryDigest: delivery["deliveryDigest"], price: providerExchange["price"] ?? { amount: 0, currency: "USD" } } });
    return Object.freeze({ contract: "newscable-source-broker/source-bundle-service/v1", deliveryDigest: String(delivery["deliveryDigest"]), offered: bundles.length, admitted: admitted.length, duplicates: duplicates.length, collisions: collisions.length, refused: refused.length, results, providerExchange, providerDelivery: Object.freeze(response) });
}
//# sourceMappingURL=newscable-contract.mjs.map