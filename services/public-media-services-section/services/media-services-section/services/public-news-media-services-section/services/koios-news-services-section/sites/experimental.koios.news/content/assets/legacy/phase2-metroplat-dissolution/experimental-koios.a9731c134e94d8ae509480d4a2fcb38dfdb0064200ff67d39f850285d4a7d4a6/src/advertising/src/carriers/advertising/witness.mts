import { readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import type { EAVT } from "@emsenn/metroplat/codecs/text/json/jsonl/eavt";
import {
  appendWitnessesAtRoot,
  projectLogPathState,
  projectStatePathContent,
  readWitnessLogPath,
} from "@emsenn/metroplat/services/filesystem-store";

import {
  foldAdPerformance,
  type AdPerformanceEvent,
  type AdPerformanceReading,
  type AdvertisingProvider,
} from "../../../lib/advertising/index.mjs";
import {
  advertisingImpressionEventCarrier,
  advertisingPerformanceReadingCarrier,
} from "./index.mjs";

const AD_IMPRESSION_FEED = Object.freeze({
  name: "ad-impression",
  functional: Object.freeze([] as string[]),
  cellize(observation: AdPerformanceEvent, at: string): readonly EAVT[] {
    const entity = `ad-impression:${at}:${observation.provider}:${observation.path}`;
    return Object.freeze([
      Object.freeze([entity, "provider", observation.provider, at] as const),
      Object.freeze([entity, "path", observation.path, at] as const),
      Object.freeze([entity, "day", observation.day, at] as const),
      Object.freeze([entity, "kind", observation.kind, at] as const),
      Object.freeze([entity, "impressions", observation.impressions, at] as const),
      Object.freeze([entity, "clicks", observation.clicks, at] as const),
      Object.freeze([entity, "revenueMicros", observation.revenueMicros, at] as const),
      ...(observation.section === undefined ? [] : [Object.freeze([entity, "section", observation.section, at] as const)]),
      ...((observation.tags ?? []).map((tag) => Object.freeze([entity, "tag", tag, at] as const))),
    ]);
  },
});

function text(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed === "" ? undefined : trimmed;
}

function integer(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isInteger(value) && value >= 0) return value;
  if (typeof value === "string" && /^\d+$/u.test(value)) return Number.parseInt(value, 10);
  return undefined;
}

function normalizePath(value: unknown): string | null {
  const raw = text(value);
  if (raw === undefined || raw.length > 512) return null;
  if (!raw.startsWith("/") || raw.startsWith("//") || /[\u0000-\u001f\u007f]/u.test(raw)) return null;
  try {
    const url = new URL(raw, "https://koios.news");
    if (url.origin !== "https://koios.news") return null;
    return `${url.pathname}${url.search}`;
  } catch {
    return null;
  }
}

function normalizeProvider(value: unknown): AdvertisingProvider | null {
  return value === "adsense" || value === "a-ads" ? value : null;
}

function normalizeDay(value: unknown): string | null {
  const raw = text(value);
  return raw !== undefined && /^\d{4}-\d{2}-\d{2}$/u.test(raw) ? raw : null;
}

function normalizeTags(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const tags = value.flatMap((tag) => {
    const normalized = text(tag);
    return normalized === undefined ? [] : [normalized];
  });
  return tags.length === 0 ? undefined : Object.freeze(tags);
}

/** Returns a YYYY-MM-DD day string for an impression event. */
export function adDayStamp(now = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Normalizes an ad-impression request payload into an event. */
export function adPerformanceEvent(input: Readonly<Record<string, unknown>>, now = new Date()): AdPerformanceEvent | null {
  const provider = normalizeProvider(input.provider);
  const path = normalizePath(input.path);
  const day = normalizeDay(input.day) ?? adDayStamp(now);
  if (provider === null || path === null) return null;
  const event = Object.freeze({
    provider,
    path,
    day,
    kind: "impression" as const,
    at: now.toISOString(),
    ...(text(input.section) === undefined ? {} : { section: text(input.section) }),
    ...(normalizeTags(input.tags) === undefined ? {} : { tags: normalizeTags(input.tags) }),
    impressions: integer(input.impressions) ?? 1,
    clicks: integer(input.clicks) ?? 0,
    revenueMicros: integer(input.revenueMicros) ?? 0,
  });
  return advertisingImpressionEventCarrier.assert(event, "ad performance event") as AdPerformanceEvent;
}

/** Appends an ad-impression event and projects the returned log path. */
export function appendAdImpressionAtRoot(root: string, event: AdPerformanceEvent) {
  const append = appendWitnessesAtRoot(root, AD_IMPRESSION_FEED.name, AD_IMPRESSION_FEED.cellize(event, event.at), {
    at: event.at,
    subject: event.path,
  });
  const state = projectLogPathState(append.path, AD_IMPRESSION_FEED.functional);
  projectStatePathContent(state.path);
  return append;
}

function logPaths(root: string): readonly string[] {
  const found: string[] = [];
  const logsRoot = resolve(root, "data/logs");
  const visit = (dir: string): void => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const child = join(dir, entry.name);
      if (entry.isDirectory()) visit(child);
      else if (entry.isFile() && entry.name.endsWith(`-${AD_IMPRESSION_FEED.name}-log.jsonl`)) found.push(child);
    }
  };
  visit(logsRoot);
  return Object.freeze(found.sort((left, right) => left.localeCompare(right)));
}

function eventsFromRows(rows: readonly EAVT[]): readonly AdPerformanceEvent[] {
  const grouped = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const entity = row[0];
    const attribute = row[1];
    if (typeof entity !== "string" || typeof attribute !== "string") continue;
    const record = grouped.get(entity) ?? {};
    grouped.set(entity, record);
    if (attribute === "tag") {
      record.tags = Object.freeze([...(Array.isArray(record.tags) ? record.tags : []), row[2]]);
    } else {
      record[attribute] = row[2];
    }
    record.at = row[3];
  }
  return Object.freeze([...grouped.values()].flatMap((record) => {
    const event = {
      provider: record.provider,
      path: record.path,
      day: record.day,
      kind: record.kind,
      at: record.at,
      section: record.section,
      tags: record.tags,
      impressions: record.impressions,
      clicks: record.clicks,
      revenueMicros: record.revenueMicros,
    };
    return advertisingImpressionEventCarrier.validate(event) ? [event as AdPerformanceEvent] : [];
  }));
}

/** Reads all ad-impression logs under a data root. */
export function readAdPerformanceEventsAtRoot(root: string): readonly AdPerformanceEvent[] {
  return Object.freeze(logPaths(root).flatMap((path) => eventsFromRows(readWitnessLogPath(path).rows)));
}

/** Folds all ad-impression logs under a data root into a public reading. */
export function adPerformanceReadingAtRoot(root: string): AdPerformanceReading {
  return advertisingPerformanceReadingCarrier.assert(
    foldAdPerformance(readAdPerformanceEventsAtRoot(root)),
    "ad performance reading",
  ) as AdPerformanceReading;
}
