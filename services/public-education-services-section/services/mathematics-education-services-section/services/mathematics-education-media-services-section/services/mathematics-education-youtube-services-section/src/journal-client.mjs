import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { journalRecords, recordJournal } from "./journal.mjs";

const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
function root(value = undefined) { return resolve(value ?? process.env.MATHEMATICS_YOUTUBE_SETTLEMENT_ROOT ?? NODE_ROOT); }

export async function querySettlementRecords(category, { dataRoot, settlementRoot } = {}) {
  return journalRecords(root(dataRoot ?? settlementRoot), category);
}

export async function recordSettlementRecord({ category, recordedAt, record, dataRoot, settlementRoot }) {
  return recordJournal(root(dataRoot ?? settlementRoot), category, recordedAt, record);
}

export function createSettlementStore({ dataRoot, settlementRoot } = {}) {
  const settlement = root(dataRoot ?? settlementRoot);
  return { async record({ category, recordedAt, record }) { return recordJournal(settlement, category, recordedAt, record); } };
}
