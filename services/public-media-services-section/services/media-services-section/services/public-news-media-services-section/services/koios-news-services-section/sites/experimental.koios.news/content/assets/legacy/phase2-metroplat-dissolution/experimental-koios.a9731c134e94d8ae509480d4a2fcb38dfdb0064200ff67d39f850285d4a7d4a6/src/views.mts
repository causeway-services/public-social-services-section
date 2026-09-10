import { resolve } from "node:path";

import type { EAVT } from "@emsenn/metroplat/codecs/text/json/jsonl/eavt";
import {
  appendJsonl,
  readJsonl,
  type WitnessStore,
} from "@emsenn/metroplat/services/filesystem-store";

export type ViewAssertion = Readonly<{
  path: string;
  referrerHost: string;
  day: string;
}>;

export type ViewCounts = Readonly<Record<string, number>>;

const VIEW_FEED = "koios-news-view-hits";
const VIEW_ATTRIBUTE = "koios.news.view.referrer-host";

function feedPath(dir: string, feed: string, type: string): string {
  return resolve(dir, `${feed}.${type}`);
}

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function normalizePath(value: unknown): string | null {
  const raw = text(value);
  if (raw === undefined || raw.length > 2048) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || /[\u0000-\u001f\u007f]/u.test(raw)) return null;
  try {
    const url = new URL(raw, "https://koios.news");
    if (url.origin !== "https://koios.news") return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function normalizeReferrerHost(value: unknown): string | null {
  const raw = text(value);
  if (raw === undefined) return "";
  if (raw.length > 255 || /[\u0000-\u001f\u007f/?#]/u.test(raw)) return null;
  try {
    const url = new URL(raw.includes("://") ? raw : `https://${raw}`);
    const host = url.host.toLowerCase();
    return host.length === 0 ? "" : host;
  } catch {
    return null;
  }
}

function normalizeDay(value: unknown): string | null {
  const raw = text(value);
  return raw !== undefined && /^\d{4}-\d{2}-\d{2}$/u.test(raw) ? raw : null;
}

export function dayStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

export function viewAssertion(input: {
  path?: unknown;
  referrerHost?: unknown;
  day?: unknown;
}): ViewAssertion | null {
  const path = normalizePath(input.path);
  const referrerHost = normalizeReferrerHost(input.referrerHost);
  const day = normalizeDay(input.day);
  if (path === null || referrerHost === null || day === null) return null;
  return Object.freeze({ path, referrerHost, day });
}

export function viewAssertionRow(assertion: ViewAssertion): EAVT {
  return Object.freeze([
    assertion.path,
    VIEW_ATTRIBUTE,
    assertion.referrerHost,
    assertion.day,
  ] as const);
}

export function viewStore(dataRoot: string): WitnessStore {
  const root = resolve(dataRoot);
  return Object.freeze({
    logDir: resolve(root, "data/logs"),
    stateDir: resolve(root, "data/state"),
    recordDir: resolve(root, "data/record"),
  });
}

export function appendViewAssertion(store: WitnessStore, assertion: ViewAssertion): string {
  const path = feedPath(store.logDir, VIEW_FEED, "jsonl");
  appendJsonl(path, [viewAssertionRow(assertion)]);
  return path;
}

function isViewRow(value: unknown): value is EAVT {
  return Array.isArray(value) &&
    value.length === 4 &&
    typeof value[0] === "string" &&
    value[1] === VIEW_ATTRIBUTE &&
    typeof value[2] === "string" &&
    typeof value[3] === "string" &&
    viewAssertion({ path: value[0], referrerHost: value[2], day: value[3] }) !== null;
}

export function readViewAssertions(store: WitnessStore): readonly ViewAssertion[] {
  return Object.freeze(readJsonl<unknown>(feedPath(store.logDir, VIEW_FEED, "jsonl"))
    .filter(isViewRow)
    .map((row) => Object.freeze({
      path: row[0] as string,
      referrerHost: row[2] as string,
      day: row[3] as string,
    })));
}

export function viewCounts(store: WitnessStore): ViewCounts {
  const counts: Record<string, number> = {};
  for (const assertion of readViewAssertions(store)) {
    counts[assertion.path] = (counts[assertion.path] ?? 0) + 1;
  }
  return Object.freeze(Object.fromEntries(Object.entries(counts).sort(([left], [right]) => left.localeCompare(right))));
}
