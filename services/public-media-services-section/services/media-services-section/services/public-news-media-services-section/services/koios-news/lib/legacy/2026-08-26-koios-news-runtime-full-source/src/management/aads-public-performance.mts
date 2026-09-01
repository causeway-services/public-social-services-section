export const AADS_PUBLIC_PERFORMANCE_CONTRACT = "aads-public-ad-unit-statistics/v1";

export type AAdsDailyPerformance = Readonly<{
  unitId: string;
  day: string;
  adRequests: number;
  paidImpressions: number;
  affiliateImpressions: number;
  fillRateBasisPoints: number;
  clicks: number;
  ctrBasisPoints: number;
  sourceUrl: string;
}>;

export type AAdsPublicUnitState = Readonly<{
  unitId: string;
  status: string;
  pageUrl: string;
  displayRateBasisPoints: number;
  estimatedDailyIncomeBtc: string;
  affiliateTrafficBasisPoints: number | null;
  sourceUrl: string;
}>;

export type AAdsSupplierHealth = Readonly<{
  kind: "koios.aads-supplier-health";
  disposition: "income-estimate-present" | "operational-zero-income" | "verification-obstructed";
  observedUnitCount: number;
  notFoundUnits: readonly string[];
  zeroIncomeUnits: readonly string[];
  affiliateOnlyUnits: readonly string[];
  requiredMoves: readonly string[];
  revenueObserved: false;
  factualWarrant: false;
}>;

export type AAdsInventoryRouting = Readonly<{
  kind: "koios.aads-inventory-routing";
  mode: "bootstrap-unobserved" | "provider-health-adapted";
  configuredUnits: readonly string[];
  activeUnits: readonly string[];
  excludedUnits: readonly Readonly<{ unitId: string; reason: string }>[];
  evidenceCount: number;
}>;

type LedgerLike = Readonly<Record<string, unknown>>;

function record(value: unknown): Readonly<Record<string, unknown>> {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Readonly<Record<string, unknown>> : Object.freeze({});
}

/**
 * Let observed supplier state alter future inventory routing. Before the first
 * observation the configured units remain a bootstrap assumption. Afterwards
 * an unobserved, missing, or zero-display unit cannot consume a placement.
 */
export function aAdsInventoryRouting(records: readonly LedgerLike[], configuredUnits: readonly string[]): AAdsInventoryRouting {
  const configured = Object.freeze([...new Set(configuredUnits.filter((unit) => /^\d+$/u.test(unit)))].sort());
  const latest = new Map<string, Readonly<Record<string, unknown>>>();
  for (const entry of [...records].sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))) {
    if (entry["act"] !== "advertising.aads-unit-state.observed") continue;
    const data = record(entry["data"]);
    const unitId = String(data["unitId"] ?? entry["subject"] ?? "");
    if (configured.includes(unitId)) latest.set(unitId, data);
  }
  if (latest.size === 0) return Object.freeze({ kind: "koios.aads-inventory-routing", mode: "bootstrap-unobserved", configuredUnits: configured, activeUnits: configured, excludedUnits: Object.freeze([]), evidenceCount: 0 });
  const activeUnits: string[] = [];
  const excludedUnits: Array<Readonly<{ unitId: string; reason: string }>> = [];
  for (const unitId of configured) {
    const state = latest.get(unitId);
    if (state === undefined) {
      excludedUnits.push(Object.freeze({ unitId, reason: "no-provider-state-in-current-routing-evidence" }));
      continue;
    }
    const status = String(state["status"] ?? "unknown");
    const displayRateBasisPoints = Number(state["displayRateBasisPoints"] ?? 0);
    if (/not found/iu.test(status) || !Number.isFinite(displayRateBasisPoints) || displayRateBasisPoints <= 0) {
      excludedUnits.push(Object.freeze({ unitId, reason: `provider-state:${status};display-rate-basis-points:${displayRateBasisPoints}` }));
      continue;
    }
    activeUnits.push(unitId);
  }
  return Object.freeze({ kind: "koios.aads-inventory-routing", mode: "provider-health-adapted", configuredUnits: configured, activeUnits: Object.freeze(activeUnits), excludedUnits: Object.freeze(excludedUnits), evidenceCount: latest.size });
}

function text(html: string): string {
  return html
    .replace(/<[^>]*>/gu, " ")
    .replace(/&nbsp;|&#160;/gu, " ")
    .replace(/&amp;/gu, "&")
    .replace(/&#39;|&apos;/gu, "'")
    .replace(/&quot;/gu, '"')
    .replace(/\s+/gu, " ")
    .trim();
}

function integer(value: string, field: string): number {
  const parsed = Number(value.replaceAll(",", ""));
  if (!Number.isSafeInteger(parsed) || parsed < 0) throw new Error(`AADS ${field} is not a non-negative integer: ${value}`);
  return parsed;
}

function basisPoints(value: string, field: string): number {
  const parsed = Number(value.replace(/%$/u, ""));
  if (!Number.isFinite(parsed) || parsed < 0) throw new Error(`AADS ${field} is not a non-negative percentage: ${value}`);
  return Math.round(parsed * 100);
}

export function parseAAdsPublicStats(html: string, unitId: string, sourceUrl: string): readonly AAdsDailyPerformance[] {
  const table = html.match(/<table class=['"]table-stats['"]>([\s\S]*?)<\/table>/u)?.[1];
  if (table === undefined) throw new Error(`AADS unit ${unitId} response has no public statistics table`);
  const readings: AAdsDailyPerformance[] = [];
  for (const row of table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gu)) {
    const rowHtml = row[1];
    if (rowHtml === undefined) continue;
    const cells = [...rowHtml.matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gu)].map((cell) => text(cell[1] ?? ""));
    if (cells.length !== 7 || !/^\d{4}-\d{2}-\d{2}$/u.test(cells[0] ?? "")) continue;
    readings.push(Object.freeze({
      unitId,
      day: cells[0]!,
      adRequests: integer(cells[1]!, "ad requests"),
      paidImpressions: integer(cells[2]!, "paid impressions"),
      affiliateImpressions: integer(cells[3]!, "affiliate impressions"),
      fillRateBasisPoints: basisPoints(cells[4]!, "fill rate"),
      clicks: integer(cells[5]!, "clicks"),
      ctrBasisPoints: basisPoints(cells[6]!, "CTR"),
      sourceUrl,
    }));
  }
  if (readings.length === 0) throw new Error(`AADS unit ${unitId} response has no daily statistics rows`);
  return Object.freeze(readings);
}

export async function readAAdsPublicStats(input: Readonly<{ unitId: string; fromDay: string; throughDay: string }>): Promise<readonly AAdsDailyPerformance[]> {
  if (!/^\d+$/u.test(input.unitId)) throw new Error("AADS unit id must contain only digits");
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(input.fromDay) || !/^\d{4}-\d{2}-\d{2}$/u.test(input.throughDay)) throw new Error("AADS statistics window must use YYYY-MM-DD days");
  const url = new URL(`https://aads.com/ad_units/${input.unitId}/stats`);
  url.searchParams.set("start_date", input.fromDay);
  url.searchParams.set("end_date", input.throughDay);
  const response = await fetch(url, {
    headers: { accept: "text/html", "user-agent": "Koios-News-Operations/1.0 (+https://koios.news/operations)" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`AADS unit ${input.unitId} public statistics returned HTTP ${response.status}`);
  return parseAAdsPublicStats(await response.text(), input.unitId, url.toString());
}

export function parseAAdsPublicUnitState(html: string, unitId: string, sourceUrl: string): AAdsPublicUnitState {
  const status = text(html.match(/trigger-sibling-tooltip['"]>([^<]+)</u)?.[1] ?? "");
  const page = html.match(/<span>Page URL:<\/span>[\s\S]*?<a\b[^>]*href=["']([^"']+)["'][^>]*>/u)?.[1];
  const displayRate = html.match(/\(display rate:\s*~([0-9.]+)%\)/u)?.[1];
  const estimated = text(html.match(/<span>Estimated daily income:<\/span>[\s\S]*?<nobr>([^<]+)<\/nobr>/u)?.[1] ?? "").replace(/\s*₿$/u, "");
  const affiliate = html.match(/([0-9.]+)% of traffic is used to display affiliate ads/iu)?.[1];
  if (status === "" || page === undefined || displayRate === undefined || !/^\d+(?:\.\d+)?$/u.test(estimated)) throw new Error(`AADS unit ${unitId} response has no public unit state`);
  return Object.freeze({
    unitId,
    status,
    pageUrl: page.replaceAll("&amp;", "&"),
    displayRateBasisPoints: basisPoints(`${displayRate}%`, "display rate"),
    estimatedDailyIncomeBtc: estimated,
    affiliateTrafficBasisPoints: affiliate === undefined ? null : basisPoints(`${affiliate}%`, "affiliate traffic"),
    sourceUrl,
  });
}

export async function readAAdsPublicUnitState(unitId: string): Promise<AAdsPublicUnitState> {
  if (!/^\d+$/u.test(unitId)) throw new Error("AADS unit id must contain only digits");
  const url = `https://aads.com/ad_units/${unitId}`;
  const response = await fetch(url, {
    headers: { accept: "text/html", "user-agent": "Koios-News-Operations/1.0 (+https://koios.news/operations)" },
    redirect: "follow",
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) throw new Error(`AADS unit ${unitId} public state returned HTTP ${response.status}`);
  return parseAAdsPublicUnitState(await response.text(), unitId, url);
}

export function aAdsSupplierHealth(states: readonly AAdsPublicUnitState[]): AAdsSupplierHealth {
  const notFoundUnits = states.filter((state) => /not found/iu.test(state.status) || state.displayRateBasisPoints === 0).map((state) => state.unitId);
  const zeroIncomeUnits = states.filter((state) => Number(state.estimatedDailyIncomeBtc) === 0).map((state) => state.unitId);
  const affiliateOnlyUnits = states.filter((state) => state.affiliateTrafficBasisPoints === 10_000).map((state) => state.unitId);
  const disposition = notFoundUnits.length > 0
    ? "verification-obstructed" as const
    : zeroIncomeUnits.length > 0
      ? "operational-zero-income" as const
      : "income-estimate-present" as const;
  return Object.freeze({
    kind: "koios.aads-supplier-health",
    disposition,
    observedUnitCount: states.length,
    notFoundUnits: Object.freeze(notFoundUnits),
    zeroIncomeUnits: Object.freeze(zeroIncomeUnits),
    affiliateOnlyUnits: Object.freeze(affiliateOnlyUnits),
    requiredMoves: Object.freeze([
      ...(notFoundUnits.length === 0 ? [] : ["repair each not-found unit's provider-side verification URL so it names a public Koios page carrying that exact unit"]),
      ...(zeroIncomeUnits.length === 0 ? [] : ["compare or add a monetization supplier rather than treating zero-paying affiliate fill as a content-quality verdict"]),
      "import an exact external revenue receipt before recognizing income",
    ]),
    revenueObserved: false,
    factualWarrant: false,
  });
}
