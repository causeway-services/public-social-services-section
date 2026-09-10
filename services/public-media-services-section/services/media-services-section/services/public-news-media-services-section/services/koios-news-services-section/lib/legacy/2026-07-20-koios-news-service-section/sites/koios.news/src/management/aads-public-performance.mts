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
