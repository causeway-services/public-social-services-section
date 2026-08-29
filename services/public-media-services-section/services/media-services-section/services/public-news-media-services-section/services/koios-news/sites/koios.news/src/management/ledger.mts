// Koios-owned boundary to package-local witness-journal custody. Models do not
// serialize these records. Callers supply typed fields; this boundary admits
// them into append-only byte custody and its explicit category index.

import { resolve } from "node:path";
import { EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const semanticId = (value) => identifyJsonSemanticContent({ objectKind: "rsc-quiescent.record", value, witnessRoot: EMPTY_WITNESS_ROOT }).token;
import { createSettlementStore } from "@red-cup-engineering/settlement-record-store-service";
// @ts-expect-error The filesystem binding export has no declaration carrier yet.
import { createFilesystemWitnessJournalBinding } from "@red-cup-engineering/witness-journal-document-service/filesystem-provider";

const KOIOS_ACTOR = "urn:ame:koios.news";
const SETTLEMENT_ACCOUNT = "KOIOS_WITNESS_JOURNAL_SETTLEMENT";

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
  "audience-product",
  "advertising",
  "internal-market",
  "revenue-cost",
] as const);

export type KoiosLedger = (typeof KOIOS_LEDGERS)[number];
export type JsonObject = Record<string, unknown>;

export function recordDigest(value: unknown): string {
  return semanticId(value);
}

function validInstant(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}

function assertLedger(ledger: KoiosLedger): void {
  if (!KOIOS_LEDGERS.includes(ledger)) throw new Error(`unadmitted Koios ledger: ${ledger}`);
}

function settlementAccount() {
  const settlement = process.env[SETTLEMENT_ACCOUNT];
  if (settlement === undefined || !/^eip155:[1-9][0-9]*:0x[0-9a-fA-F]{40}$/u.test(settlement)) {
    throw new Error(`${SETTLEMENT_ACCOUNT} must name Koios's admitted CAIP-10 settlement account`);
  }
  const [caip2, address] = settlement.split(/:(?=0x)/u) as [string, string];
  return Object.freeze({
    nodeId: "koios.news",
    actor: KOIOS_ACTOR,
    settlement,
    caip2,
    address,
    binding: Object.freeze({ profile: "koios-news/witness-journal-filesystem-custody/v1" }),
  });
}

/** The owned filesystem root for one supplied Koios data directory. */
export function ledgerCustodyRoot(dataRoot: string): string {
  return resolve(dataRoot, "witness-journal");
}

async function store(dataRoot: string) {
  const binding = await createFilesystemWitnessJournalBinding(ledgerCustodyRoot(dataRoot));
  return createSettlementStore({
    account: settlementAccount(),
    custody: binding.custody,
    categoryIndex: binding.categoryIndex,
  });
}

/** Append an already-shaped domain record without changing its public schema. */
export async function appendDatedRecord(input: Readonly<{
  dataRoot: string;
  ledger: KoiosLedger;
  instant: string;
  record: JsonObject;
}>): Promise<Readonly<{ networkReference: Readonly<Record<string, unknown>>; digest: string }>> {
  assertLedger(input.ledger);
  if (!validInstant(input.instant)) throw new Error(`ledger act requires an explicit UTC instant: ${input.instant}`);
  const digest = recordDigest(input.record);
  const receipt = await (await store(input.dataRoot)).record({
    category: input.ledger,
    recordedAt: input.instant,
    record: input.record,
  });
  return Object.freeze({ networkReference: receipt.reference, digest });
}

/** Shape and append one durable Koios boundary act. */
export async function appendKoiosAct(input: Readonly<{
  dataRoot: string;
  ledger: KoiosLedger;
  instant: string;
  act: string;
  subject: string;
  data?: JsonObject;
}>): Promise<Readonly<JsonObject>> {
  if (input.act.trim() === "") throw new Error("ledger act must be named");
  if (input.subject.trim() === "") throw new Error("ledger subject must be named");
  const body: JsonObject = {
    kind: "koios.ledger-act",
    node: "koios-news",
    ledger: input.ledger,
    recordedAt: input.instant,
    act: input.act,
    subject: input.subject,
    data: input.data ?? {},
  };
  const record = Object.freeze({ ...body, recordDigest: recordDigest(body) });
  await appendDatedRecord({ dataRoot: input.dataRoot, ledger: input.ledger, instant: input.instant, record });
  return record;
}

function records(value: unknown): readonly JsonObject[] {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return [];
  const record = value as JsonObject;
  return Object.freeze([record, ...Object.values(record).flatMap((child) => Array.isArray(child) ? child.flatMap(records) : records(child))]);
}

/** Read every intact record in one Koios-owned ledger in custody order. */
export async function readKoiosLedgerAsync(dataRoot: string, ledger: KoiosLedger): Promise<readonly Readonly<JsonObject>[]> {
  assertLedger(ledger);
  const values = await (await store(dataRoot)).records(ledger);
  return Object.freeze(values
    .filter((value: unknown): value is JsonObject => value !== null && typeof value === "object" && !Array.isArray(value))
    .map((value: JsonObject) => Object.freeze(value))
    .sort((left: JsonObject, right: JsonObject) => String(left["recordedAt"] ?? left["at"] ?? "").localeCompare(String(right["recordedAt"] ?? right["at"] ?? ""))));
}

/** Read the latest matching local act without treating malformed history as absent evidence for any other act. */
export async function latestKoiosActAsync(dataRoot: string, ledger: KoiosLedger, act: string): Promise<Readonly<JsonObject> | undefined> {
  return (await readKoiosLedgerAsync(dataRoot, ledger))
    .filter((record) => record["kind"] === "koios.ledger-act" && record["ledger"] === ledger && record["act"] === act)
    .at(-1);
}

/**
 * @deprecated Filesystem custody is asynchronous. Migrate callers to
 * readKoiosLedgerAsync rather than treating an incomplete local scan as evidence.
 */
export function readKoiosLedger(_dataRoot: string, _ledger: KoiosLedger): never {
  throw new Error("readKoiosLedger is retired: await readKoiosLedgerAsync for filesystem witness-journal custody");
}

/** @deprecated Use latestKoiosActAsync. */
export function latestKoiosAct(_dataRoot: string, _ledger: KoiosLedger, _act: string): never {
  throw new Error("latestKoiosAct is retired: await latestKoiosActAsync for filesystem witness-journal custody");
}

async function recordedExchangeIds(dataRoot: string): Promise<Set<string>> {
  const ids = new Set<string>();
  for (const record of await readKoiosLedgerAsync(dataRoot, "provider-usage")) {
    const data = record["data"] as JsonObject | undefined;
    if (typeof data?.["exchangeId"] === "string" && data["projectionVersion"] === 2) {
      ids.add(data["exchangeId"]);
    }
  }
  return ids;
}

/** Project provider-authored exchange receipts into Koios's own usage ledger. */
export async function appendProviderUsage(input: Readonly<{
  dataRoot: string;
  instant: string;
  providerResult: unknown;
  purpose: string;
  attribution?: JsonObject;
}>): Promise<readonly Readonly<JsonObject>[]> {
  const existing = await recordedExchangeIds(input.dataRoot);
  const projected: JsonObject[] = [];
  for (const parent of records(input.providerResult)) {
    const exchange = parent["providerExchange"];
    if (exchange === null || typeof exchange !== "object" || Array.isArray(exchange)) continue;
    const receipt = exchange as JsonObject;
    const exchangeId = receipt["id"];
    if (typeof exchangeId !== "string" || existing.has(exchangeId)) continue;
    const completion = receipt["completion"] as JsonObject | undefined;
    const cost = receipt["cost"] as JsonObject | undefined;
    const record = await appendKoiosAct({
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
        ...(input.attribution ?? {}),
      },
    });
    existing.add(exchangeId);
    projected.push(record);
  }
  return Object.freeze(projected);
}
