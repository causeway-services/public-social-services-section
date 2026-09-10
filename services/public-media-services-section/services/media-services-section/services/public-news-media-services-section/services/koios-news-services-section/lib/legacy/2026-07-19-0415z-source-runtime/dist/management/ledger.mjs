// Koios-owned append boundary for the separately versioned data store.
// Models do not serialize these records. Callers supply typed fields and this
// module owns the dated path, canonical digest, and newline-delimited carrier.
import { createHash } from "node:crypto";
import { appendFileSync, mkdirSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
export const KOIOS_LEDGERS = Object.freeze([
    "assignments",
    "source-claims",
    "research-lessons",
    "editorial-authority",
    "editorial-judgments",
    "corrections-omissions",
    "contract-events",
    "provider-usage",
    "deployments",
    "shadow-deliveries",
    "attention",
    "advertising",
    "revenue-cost",
]);
export const KOIOS_LEDGER_CARRIERS = Object.freeze({
    "assignments": "state",
    "source-claims": "ledgers",
    "research-lessons": "records",
    "editorial-authority": "ledgers",
    "editorial-judgments": "records",
    "corrections-omissions": "journals",
    "contract-events": "journals",
    "provider-usage": "ledgers",
    "deployments": "journals",
    "shadow-deliveries": "ledgers",
    "attention": "journals",
    "advertising": "ledgers",
    "revenue-cost": "ledgers",
});
function canonical(value) {
    if (Array.isArray(value))
        return `[${value.map(canonical).join(",")}]`;
    if (value !== null && typeof value === "object") {
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    }
    return JSON.stringify(value);
}
export function recordDigest(value) {
    return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`;
}
function validInstant(value) {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}
export function datedLedgerPath(dataRoot, ledger, instant) {
    if (!KOIOS_LEDGERS.includes(ledger))
        throw new Error(`unadmitted Koios ledger: ${ledger}`);
    if (!validInstant(instant))
        throw new Error(`ledger act requires an explicit UTC instant: ${instant}`);
    const day = instant.slice(0, 10);
    const [year, month, date] = day.split("-");
    return join(ledgerRootPath(dataRoot, ledger), year, month, date, `${day}-koios-news-${ledger}.jsonl`);
}
export function ledgerRootPath(dataRoot, ledger) {
    if (!KOIOS_LEDGERS.includes(ledger))
        throw new Error(`unadmitted Koios ledger: ${ledger}`);
    return join(resolve(dataRoot), KOIOS_LEDGER_CARRIERS[ledger], ledger);
}
/** Append an already-shaped domain record without changing its public schema. */
export function appendDatedRecord(input) {
    const path = datedLedgerPath(input.dataRoot, input.ledger, input.instant);
    const digest = recordDigest(input.record);
    mkdirSync(dirname(path), { recursive: true });
    appendFileSync(path, `${JSON.stringify(input.record)}\n`, "utf8");
    return Object.freeze({ path, digest });
}
/** Shape and append one durable Koios boundary act. */
export function appendKoiosAct(input) {
    if (input.act.trim() === "")
        throw new Error("ledger act must be named");
    if (input.subject.trim() === "")
        throw new Error("ledger subject must be named");
    const body = {
        kind: "koios.ledger-act",
        node: "koios-news",
        ledger: input.ledger,
        recordedAt: input.instant,
        act: input.act,
        subject: input.subject,
        data: input.data ?? {},
    };
    const record = Object.freeze({ ...body, recordDigest: recordDigest(body) });
    appendDatedRecord({ dataRoot: input.dataRoot, ledger: input.ledger, instant: input.instant, record });
    return record;
}
function records(value) {
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return [];
    const record = value;
    return Object.freeze([record, ...Object.values(record).flatMap((child) => Array.isArray(child) ? child.flatMap(records) : records(child))]);
}
function jsonlFiles(root) {
    try {
        return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
            ? jsonlFiles(join(root, entry.name))
            : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []));
    }
    catch {
        return [];
    }
}
/** Read every intact record in one Koios-owned ledger in carrier order. */
export function readKoiosLedger(dataRoot, ledger) {
    return Object.freeze([...jsonlFiles(ledgerRootPath(dataRoot, ledger))].sort().flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).flatMap((line) => {
                try {
                    const value = JSON.parse(line);
                    return value !== null && typeof value === "object" && !Array.isArray(value)
                        ? [Object.freeze(value)]
                        : [];
                }
                catch {
                    return [];
                }
            });
        }
        catch {
            return [];
        }
    }));
}
/** Read the latest matching local act without treating malformed history as absent evidence for any other act. */
export function latestKoiosAct(dataRoot, ledger, act) {
    return jsonlFiles(ledgerRootPath(dataRoot, ledger)).flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).flatMap((line) => {
                const record = JSON.parse(line);
                return record["kind"] === "koios.ledger-act" && record["ledger"] === ledger && record["act"] === act ? [record] : [];
            });
        }
        catch {
            return [];
        }
    }).sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? ""))).at(-1);
}
function recordedExchangeIds(dataRoot) {
    const ids = new Set();
    for (const path of jsonlFiles(ledgerRootPath(dataRoot, "provider-usage"))) {
        try {
            for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean)) {
                const record = JSON.parse(line);
                const data = record["data"];
                if (typeof data?.["exchangeId"] === "string" && data["projectionVersion"] === 2)
                    ids.add(data["exchangeId"]);
            }
        }
        catch { /* malformed prior evidence is not silently rewritten */ }
    }
    return ids;
}
/** Project provider-authored exchange receipts into Koios's own usage ledger. */
export function appendProviderUsage(input) {
    const existing = recordedExchangeIds(input.dataRoot);
    const projected = [];
    for (const parent of records(input.providerResult)) {
        const exchange = parent["providerExchange"];
        if (exchange === null || typeof exchange !== "object" || Array.isArray(exchange))
            continue;
        const receipt = exchange;
        const exchangeId = receipt["id"];
        if (typeof exchangeId !== "string" || existing.has(exchangeId))
            continue;
        const completion = receipt["completion"];
        const cost = receipt["cost"];
        const record = appendKoiosAct({
            dataRoot: input.dataRoot,
            ledger: "provider-usage",
            instant: input.instant,
            act: "inference.consumed",
            subject: exchangeId,
            data: {
                exchangeId,
                projectionVersion: 2,
                supersedesProjectionVersion: 1,
                purpose: input.purpose,
                provider: parent["selectedProvider"] ?? parent["actor"] ?? "provider-recorded",
                model: completion?.["model"] ?? "provider-recorded-model",
                outcome: receipt["outcome"] ?? parent["disposition"] ?? "provider-recorded",
                cost: cost ?? {},
                usage: completion?.["usage"] ?? {},
                modelUsage: completion?.["modelUsage"] ?? {},
                receiptPath: receipt["recordPath"] ?? null,
                packetDigest: receipt["packetDigest"] ?? null,
            },
        });
        existing.add(exchangeId);
        projected.push(record);
    }
    return Object.freeze(projected);
}
//# sourceMappingURL=ledger.mjs.map