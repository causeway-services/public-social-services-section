// Publication-owned issue initiation.
//
// One exact ActivityStreams pulse becomes one existing/new assignment or one
// typed refusal. The controller owns attention and assignment formation only.
// It does not draft, edit, publish, deploy, select an inference provider, or
// write any provider's territory.

import { createHash } from "node:crypto";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

import { decodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";

import {
  DEFAULT_CONTENT_DIR,
  DEFAULT_CONTENT_PRODUCTION_CONFIG,
  DEFAULT_DATA_DIR,
} from "../config.mjs";
import { loadPosts, type KoiosPost } from "../content.mjs";
import { latestManuscriptRepairDirective } from "../draft-repair.mjs";
import { buildSourceCorroborationIndex, corroboratingSourceUrlsForNomination, readBeatIntake, sourceDrivenNominations, type SourceDrivenNomination, type TrendProbeResult } from "../researching/sourcing/discovery.mjs";
import { procureAdmissibleResearchPacket, readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mjs";
import { recallSourceBundles, refreshSourceCorpus } from "../researching/sourcing/newscable-contract.mjs";
import { procurePriorResearchForIssue } from "../researching/sourcing/prior-research-contract.mjs";
import { procurePublicWebSourceText } from "../researching/sourcing/public-web-source-contract.mjs";
import { procurePublicSourceDiscovery, PublicSourceDiscoveryRefusal } from "../researching/sourcing/public-source-discovery-contract.mjs";
import { researchPacket, type ResearchPacket } from "../researching/sourcing/research-packets.mjs";
import { createAssignment, previewAssignment, readActionableAssignments, readAssignment, readAssignmentCommission, readAssignmentControls, readAssignmentDispositions, readAssignments, recordAssignmentControl, recordAssignmentDisposition, type AssignmentReading } from "../researching/writing/assignments.mjs";
import { sourceOriginalityMechanismDigest } from "../researching/writing/editing/source-originality.mjs";
import { appendDatedRecord, appendKoiosAct, latestKoiosAct, ledgerRootPath, readKoiosLedger, recordDigest, type JsonObject } from "./ledger.mjs";
import { inspectNewsroomLearning, type LearningReading } from "./newsroom-learning.mjs";
import { buyKeywordOpportunityResearch, type KeywordOpportunityBrief } from "./keyword-opportunity-service.mjs";
import { operatingBeatForProduct, planAudienceProducts, productClassFor, productPerformanceReading, resourceEnvelopeForProduct, type AudienceProductReading, type ProductClass } from "./audience-product-planning.mjs";
import { commissionForAssignment } from "./editorial-commissioning.mjs";

export const ACTIVITYSTREAMS_CONTEXT = "https://www.w3.org/ns/activitystreams";
const manuscriptByteDigest = (value: string): string => `sha256:${createHash("sha256").update(value).digest("hex")}`;
export const PUBLICATION_ACTOR = "https://koios.news/activitypub/actor";
export const ISSUE_CONTROLLER_CONTRACT = "koios.news/publication-issue-pulse/v1";
export const NEWSROOM_RUNNER = "https://koios.news/a2a/newsroom-runner";
export const SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION = 3;
export type RepairCommodity = "source-intelligence" | "manuscript-repair";
export type SourceOriginalityRevalidation = Readonly<{
  assignmentId: string;
  slug: string;
  refusalDigest: string;
  priorMechanismDigest: string | null;
  currentMechanismDigest: string;
}>;

const BEATS = new Set(["technology", "economy", "culture", "politics", "war", "environment", "degrowth", "decolonization", "sports"]);
const DEMAND_GLUE = new Set(["and", "for", "from", "into", "of", "on", "the", "to", "with"]);
const BARE_NAVIGATIONAL_TRENDS = new Set(["abc", "ap", "bbc", "cbs", "cnbc", "cnn", "fox", "google", "msn", "nbc", "news", "nytimes", "reuters", "yahoo"]);
const EVENT_GLUE = new Set(["a", "an", "and", "as", "at", "by", "for", "from", "in", "into", "is", "of", "on", "the", "to", "with"]);

/** Preserve evidence-first allocation without letting one scarce provider
 * starve an independently executable repair market. The latest attempted
 * commodity yields to the other whenever both have actionable inventory.
 * Settlement acts provide migration evidence for runtimes predating the
 * explicit commodity-selection witness. */
export function repairCommodityOrder(events: readonly Readonly<JsonObject>[]): readonly RepairCommodity[] {
  const latest = events
    .flatMap((entry): readonly Readonly<{ recordedAt: string; commodity: RepairCommodity }>[] => {
      const recordedAt = typeof entry["recordedAt"] === "string" ? entry["recordedAt"] : "";
      const data = entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"])
        ? entry["data"] as JsonObject
        : undefined;
      if (entry["act"] === "newsroom.repair.commodity-selected" && ["source-intelligence", "manuscript-repair"].includes(String(data?.["commodity"] ?? ""))) {
        return [Object.freeze({ recordedAt, commodity: data!["commodity"] as RepairCommodity })];
      }
      if (entry["act"] === "source-intelligence.replay-settled") return [Object.freeze({ recordedAt, commodity: "source-intelligence" as const })];
      if (entry["act"] === "newsroom.repair-replay.settled") return [Object.freeze({ recordedAt, commodity: "manuscript-repair" as const })];
      return [];
    })
    .sort((left, right) => left.recordedAt.localeCompare(right.recordedAt))
    .at(-1)?.commodity;
  return latest === "source-intelligence"
    ? Object.freeze(["manuscript-repair", "source-intelligence"])
    : Object.freeze(["source-intelligence", "manuscript-repair"]);
}

export type PublicationIssuePolicy = Readonly<{
  kind: "koios.news.publication-issue-policy";
  version: 1;
  permittedBeats: readonly string[];
  maxIssuesPerPulse: 1;
  maxOpenAssignments: number;
  minimumHoursBetweenNewIssues: number;
  freshnessWindowDays: number;
  selectionMode: "source-driven" | "measured-demand-and-source";
  sourceRefreshAuthorized: boolean;
  triggerAuthorities: readonly Readonly<{ actor: string; capability: string }>[];
  sensitiveBeats: readonly string[];
  law: readonly string[];
}>;

export type IssuePulseSettlement = Readonly<Record<string, unknown>>;

type Candidate = Readonly<{
  origin: "measured-demand" | "source-desk" | "keyword-research";
  term: string;
  beat: string;
  priority: number;
  summary: string;
  angle: string;
  sourceUrls: readonly string[];
  packet: ResearchPacket;
  evidence: Readonly<{ views: number; impressions: number; clicks: number; covered: boolean }>;
  title?: string;
  nomination?: SourceDrivenNomination;
  sourceStatus: "owned-source-candidate" | "source-discovery-required";
  keywordOpportunity?: Readonly<JsonObject>;
}>;

/** Bound provider spending without letting one product band monopolize every
 * attempted slot. Portfolio slots are evaluated first; score-ranked overflow
 * then fills the remaining bounded attempts. A refused reach lead therefore
 * releases causal room for core and depth journalism in the same pulse. */
export function boundedCandidateEvaluationSlate<T extends Pick<Candidate, "sourceUrls">>(candidates: readonly T[], reading: AudienceProductReading, maximum = 6): readonly T[] {
  if (!Number.isInteger(maximum) || maximum < 1) return Object.freeze([]);
  const entries = candidates.map((candidate, index) => Object.freeze({ candidate, reading: reading.rankedCandidates[index] }));
  const selected: T[] = [];
  const admitted = new Set<number>();
  const add = (index: number): void => {
    if (index < 0 || index >= entries.length || admitted.has(index) || selected.length >= maximum) return;
    admitted.add(index);
    selected.push(entries[index]!.candidate);
  };
  for (const slot of reading.portfolio.slots) {
    if (slot.candidateIndex === undefined) continue;
    add(entries.findIndex((entry) => entry.reading?.candidateIndex === slot.candidateIndex));
    add(entries.findIndex((entry) => entry.reading !== undefined
      && resourceEnvelopeForProduct(entry.reading.productClass).band === slot.intendedBand
      && independentSourceDomainCount(entry.candidate.sourceUrls) >= resourceEnvelopeForProduct(entry.reading.productClass).independentSourceFloor));
  }
  for (let index = 0; index < entries.length && selected.length < maximum; index += 1) add(index);
  return Object.freeze(selected);
}

/** Preserve exploration breadth before audience allocation. Source body depth
 * ranks candidates within a product, but it must not let verbose feeds erase
 * an entire product line before the product planner can compare it. */
export function diversifySourceNominations(
  nominations: readonly SourceDrivenNomination[],
  options: Readonly<{ maximumPerProduct?: number; maximumTotal?: number }> = {},
): readonly SourceDrivenNomination[] {
  const maximumPerProduct = options.maximumPerProduct ?? 12;
  const maximumTotal = options.maximumTotal ?? 96;
  const counts = new Map<ProductClass, number>();
  const selected: SourceDrivenNomination[] = [];
  for (const nomination of nominations) {
    const product = productClassFor({ term: nomination.term, beat: nomination.beat, title: nomination.title, sourceUrls: [nomination.url] });
    const count = counts.get(product) ?? 0;
    if (count >= maximumPerProduct) continue;
    counts.set(product, count + 1);
    selected.push(nomination);
    if (selected.length >= maximumTotal) break;
  }
  return Object.freeze(selected);
}

function opportunityBeat(term: string, suggestedBeat: string | undefined, permitted: ReadonlySet<string>): string | undefined {
  if (suggestedBeat !== undefined && permitted.has(suggestedBeat)) return suggestedBeat;
  const product = productClassFor({ term, ...(suggestedBeat === undefined ? {} : { beat: suggestedBeat }) });
  const preferred = product === "sports" ? "sports"
    : product === "entertainment-celebrity" || product === "culture" ? "culture"
      : product === "politics-power" || product === "investigations" ? "politics"
        : product === "business-consumer" || product === "service-utility" ? "economy"
          : product === "technology-science" ? "technology"
            : product === "environment" ? "environment"
              : "culture";
  if (permitted.has(preferred)) return preferred;
  return [...permitted][0];
}

function trafficPriority(value: string | undefined): number {
  if (value === undefined) return 18;
  const match = value.replace(/,/gu, "").match(/([0-9]+(?:\.[0-9]+)?)\s*([KMB])?/iu);
  if (match === null) return 20;
  const multiplier = match[2]?.toUpperCase() === "B" ? 1_000_000_000 : match[2]?.toUpperCase() === "M" ? 1_000_000 : match[2]?.toUpperCase() === "K" ? 1_000 : 1;
  const volume = Number(match[1]) * multiplier;
  return Number.isFinite(volume) ? Math.min(30, 10 + Math.log10(Math.max(1, volume)) * 4) : 20;
}

function sourceDiscoveryProcurementPacket(term: string, beat: string, configPath: string): ResearchPacket {
  // The upstream packet constructor treats absent or unmatched source URLs as
  // a request to search all owned intake. That is correct for reporting, but
  // false for an opportunity whose entire purpose is to buy source custody.
  // Project an explicit zero-evidence carrier so environment-specific wire
  // holdings can never silently turn audience demand into factual warrant.
  const carrier = researchPacket({ term, beat, sourceUrls: [], limit: 3, configPath });
  return Object.freeze({
    ...carrier,
    sourceCount: 0,
    selectedCount: 0,
    intakeSources: Object.freeze([]),
    claims: Object.freeze([]),
    warrant: Object.freeze({
      ...carrier.warrant,
      supportClaimCount: 0,
      refutationClaimCount: 0,
      uncertainClaimCount: 0,
      sourceDomainCount: 0,
      sourceDomains: Object.freeze([]),
      note: "No source custody exists yet. This carrier authorizes a bounded discovery purchase and supplies no factual warrant.",
    }),
    editorialRisks: Object.freeze([
      Object.freeze({ code: "no-local-wire-evidence", severity: "warning" as const, message: "No source has been admitted; do not write from demand alone." }),
      Object.freeze({ code: "demand-is-not-evidence", severity: "note" as const, message: "The term and beat justify a source-discovery purchase only; they support no factual claim." }),
    ]),
    sourceUrls: Object.freeze([]),
    candidateReferences: Object.freeze([]),
    context: Object.freeze([]),
  });
}

/** Convert Keyword Research's unserved opportunities into procurement plans.
 * These are deliberately source-empty and cannot become assignments until
 * Journalism Commissioning separately buys discovery, retrieval, and packet
 * admission. */
export function keywordOpportunityCandidates(input: Readonly<{
  brief: KeywordOpportunityBrief;
  permittedBeats: ReadonlySet<string>;
  configPath: string;
}>): readonly Candidate[] {
  const candidates: Candidate[] = [];
  const seen = new Set<string>();
  const add = (term: string, suggestedBeat: string | undefined, priority: number, opportunity: JsonObject): void => {
    const normalized = term.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
    const words = normalized.split(/\s+/u).filter(Boolean);
    const navigational = words.length === 1 && (BARE_NAVIGATIONAL_TRENDS.has(words[0] ?? "") || /\.(?:com|net|org)$/iu.test(term.trim()));
    if (normalized === "" || words.every((word) => word.length <= 2) || navigational || seen.has(normalized)) return;
    const beat = opportunityBeat(term, suggestedBeat, input.permittedBeats);
    if (beat === undefined) return;
    seen.add(normalized);
    const product = productClassFor({ term, beat });
    const angle = product === "service-utility"
      ? "Answer the public query directly with current eligibility, deadline, cost, location, or action details from admitted sources."
      : product === "entertainment-celebrity"
        ? "Report what happened, why audiences care, and what remains unconfirmed without laundering publicity into fact."
        : "Establish the current event from newly acquired independent sources before adding warranted context.";
    candidates.push(Object.freeze({
      origin: "keyword-research",
      term,
      beat,
      priority,
      summary: `Commission current reporting for the unserved audience opportunity “${term}”; the demand signal selects attention and supplies no factual claim.`,
      angle,
      sourceUrls: Object.freeze([]),
      packet: sourceDiscoveryProcurementPacket(term, beat, input.configPath),
      evidence: Object.freeze({ views: 0, impressions: 0, clicks: 0, covered: false }),
      title: term,
      sourceStatus: "source-discovery-required",
      keywordOpportunity: Object.freeze(opportunity),
    }));
  };
  for (const trend of input.brief.discovery.trends.novel.slice(0, 12)) {
    add(trend.term, trend.beat, trafficPriority(trend.traffic), { kind: "google-trends-opportunity", source: input.brief.discovery.trends.source ?? "google-trends", term: trend.term, traffic: trend.traffic ?? null, alreadyCovered: trend.alreadyCovered, briefDigest: input.brief.briefDigest, factualWarrant: false });
  }
  for (const keyword of input.brief.discovery.candidateKeywords.slice(0, 12)) {
    add(keyword.phrase, keyword.beat, Math.min(30, keyword.score), { kind: "owned-intake-keyword-opportunity", phrase: keyword.phrase, beat: keyword.beat, documentFrequency: keyword.documentFrequency, sourceBreadth: keyword.sourceBreadth, score: keyword.score, evidenceTitles: keyword.evidence, briefDigest: input.brief.briefDigest, factualWarrant: false });
  }
  return Object.freeze(candidates);
}

/** A thin demand term may buy discovery, but it may not remain the event
 * spine of a commission. Promote it only from provider-authored search-result
 * metadata; the later retrieved texts still carry all factual warrant. */
export function resolvedKeywordEventTerm(original: string, candidates: readonly Readonly<JsonObject>[]): string {
  const normalizedOriginal = original.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
  for (const candidate of candidates) {
    const title = candidate["title"];
    if (typeof title !== "string") continue;
    const bounded = title.replace(/\s+/gu, " ").trim();
    const normalized = bounded.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
    const words = normalized.split(/\s+/u).filter(Boolean);
    const directoryShaped = /\b(?:address|phone number|email & more|criminal records|people search|profiles?)\b/iu.test(bounded);
    if (bounded.length < 12 || bounded.length > 240 || words.length < 4 || normalized === normalizedOriginal || directoryShaped) continue;
    return bounded;
  }
  return original;
}

function eventTerms(value: string): readonly string[] {
  return Object.freeze([...new Set(value.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length >= 4 && !EVENT_GLUE.has(word)))]);
}

/** Search results are leads, not corroboration. Before Koios buys retrieval,
 * require provider-authored metadata to preserve enough of the concrete event
 * spine that the candidate could independently report the same occurrence. */
export function sourceDiscoveryCandidateSupportsEvent(candidate: Readonly<JsonObject>, event: string): boolean {
  const title = candidate["title"];
  if (typeof title !== "string") return false;
  const required = eventTerms(event);
  if (required.length === 0) return false;
  const observed = new Set(eventTerms(title));
  const shared = required.filter((term) => observed.has(term)).length;
  return shared >= Math.min(2, required.length) && shared / required.length >= 0.25;
}

function validInstant(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/u.test(value) && !Number.isNaN(Date.parse(value));
}

function jsonlFiles(root: string): readonly string[] {
  try {
    return Object.freeze(readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
      ? jsonlFiles(join(root, entry.name))
      : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []));
  } catch { return Object.freeze([]); }
}

function priorSettlement(dataDir: string, demandDigest: string): IssuePulseSettlement | undefined {
  for (const path of [...jsonlFiles(ledgerRootPath(dataDir, "contract-events"))].sort().reverse()) {
    try {
      for (const line of readFileSync(path, "utf8").split("\n").filter(Boolean).reverse()) {
        const value = JSON.parse(line) as JsonObject;
        const data = value["data"] as JsonObject | undefined;
        if (value["kind"] === "koios.ledger-act"
          && value["act"] === "issue.controller.settled"
          && value["subject"] === demandDigest
          && data?.["response"] !== null
          && typeof data?.["response"] === "object"
          && !Array.isArray(data["response"])) return data["response"] as IssuePulseSettlement;
      }
    } catch { /* malformed history cannot erase another valid settlement */ }
  }
  return undefined;
}

function inspectPolicy(value: unknown): PublicationIssuePolicy | undefined {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return undefined;
  const policy = value as Record<string, unknown>;
  const permitted = Array.isArray(policy["permittedBeats"]) ? policy["permittedBeats"] : [];
  const sensitive = Array.isArray(policy["sensitiveBeats"]) ? policy["sensitiveBeats"] : [];
  const triggerAuthorities = Array.isArray(policy["triggerAuthorities"]) ? policy["triggerAuthorities"] : [];
  const law = Array.isArray(policy["law"]) ? policy["law"] : [];
  if (policy["kind"] !== "koios.news.publication-issue-policy"
    || policy["version"] !== 1
    || policy["maxIssuesPerPulse"] !== 1
    || !Number.isInteger(policy["maxOpenAssignments"]) || Number(policy["maxOpenAssignments"]) < 1
    || typeof policy["minimumHoursBetweenNewIssues"] !== "number" || policy["minimumHoursBetweenNewIssues"] < 0
    || typeof policy["freshnessWindowDays"] !== "number" || policy["freshnessWindowDays"] <= 0 || policy["freshnessWindowDays"] > 30
    || !["source-driven", "measured-demand-and-source"].includes(String(policy["selectionMode"] ?? ""))
    || typeof policy["sourceRefreshAuthorized"] !== "boolean"
    || !triggerAuthorities.every((authority) => authority !== null
      && typeof authority === "object"
      && !Array.isArray(authority)
      && typeof (authority as Record<string, unknown>)["actor"] === "string"
      && String((authority as Record<string, unknown>)["actor"]).trim() !== ""
      && typeof (authority as Record<string, unknown>)["capability"] === "string"
      && String((authority as Record<string, unknown>)["capability"]).trim() !== "")
    || permitted.length === 0 || !permitted.every((beat) => typeof beat === "string" && BEATS.has(beat))
    || !sensitive.every((beat) => typeof beat === "string" && permitted.includes(beat))
    || !law.every((entry) => typeof entry === "string" && entry.trim() !== "")) return undefined;
  return policy as PublicationIssuePolicy;
}

function issueDemand(activity: Readonly<Record<string, unknown>>): Readonly<{
  pulseId: string;
  policy: PublicationIssuePolicy;
  policyDigest: string;
}> | undefined {
  const object = activity["object"];
  if (object === null || typeof object !== "object" || Array.isArray(object)) return undefined;
  const demand = object as Record<string, unknown>;
  const policy = inspectPolicy(demand["policy"]);
  if (demand["type"] !== "NewsroomIssueDemand" || typeof demand["pulseId"] !== "string" || demand["pulseId"].trim() === "" || policy === undefined || typeof demand["policyDigest"] !== "string") return undefined;
  return Object.freeze({ pulseId: demand["pulseId"], policy, policyDigest: demand["policyDigest"] });
}

export type AdmittedIssuePulseIdentity = Readonly<{
  actor: string;
  capability: string;
  pulseId: string;
  policyDigest: string;
  activityDigest: string;
}>;

/** Pure authority check for work, such as resuming a pending release, which
 * must happen before the issue controller is allowed to form new work. */
export function inspectAdmittedIssuePulse(activity: Readonly<Record<string, unknown>>): AdmittedIssuePulseIdentity | undefined {
  if (activity["@context"] !== ACTIVITYSTREAMS_CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION_ACTOR) return undefined;
  const demand = issueDemand(activity);
  if (demand === undefined || recordDigest(demand.policy) !== demand.policyDigest) return undefined;
  const actor = activity["actor"];
  const capability = activity["capability"];
  if (typeof actor !== "string" || typeof capability !== "string" || !demand.policy.triggerAuthorities.some((authority) => authority.actor === actor && authority.capability === capability)) return undefined;
  return Object.freeze({ actor, capability, pulseId: demand.pulseId, policyDigest: demand.policyDigest, activityDigest: recordDigest(activity) });
}

function response(activity: Readonly<Record<string, unknown>>, now: string, type: "Accept" | "Reject", object: JsonObject): IssuePulseSettlement {
  return Object.freeze({
    "@context": ACTIVITYSTREAMS_CONTEXT,
    type,
    actor: PUBLICATION_ACTOR,
    target: activity["actor"],
    published: now,
    object: Object.freeze({ type: "IssuePulseSettlement", contract: ISSUE_CONTROLLER_CONTRACT, ...object }),
  });
}

export function reservedSourceUrls(assignments: readonly AssignmentReading[], posts: readonly KoiosPost[], sourceReuseReleasedAssignments: ReadonlySet<string>): ReadonlySet<string> {
  const urls = new Set<string>();
  for (const assignment of assignments) {
    // A terminal refusal ends this work order; it does not by itself settle
    // the source asset. Keep its event reserved while source intelligence or
    // another typed repair is outstanding. Only an explicit release act may
    // return those URLs to issue selection.
    if (sourceReuseReleasedAssignments.has(assignment.assignmentId)) continue;
    for (const url of assignment.sourceUrls) urls.add(url);
  }
  for (const post of posts) {
    const references = post.document.frontMatter["references"];
    if (!Array.isArray(references)) continue;
    for (const value of references) {
      if (value !== null && typeof value === "object" && !Array.isArray(value)) {
        const url = (value as Record<string, unknown>)["URL"];
        if (typeof url === "string") urls.add(url);
      }
    }
  }
  return urls;
}

function sourceReuseReleasedAssignmentIds(dataDir: string): ReadonlySet<string> {
  return new Set(readKoiosLedger(dataDir, "contract-events").flatMap((entry) => {
    if (typeof entry["subject"] !== "string" || entry["data"] === null || typeof entry["data"] !== "object" || Array.isArray(entry["data"])) return [];
    return (entry["data"] as JsonObject)["sourceReuseReleased"] === true ? [entry["subject"]] : [];
  }));
}

export function independentSourceDomainCount(urls: readonly string[]): number {
  const domains = new Set<string>();
  for (const value of urls) {
    try { domains.add(new URL(value).hostname.toLowerCase().replace(/^www\./u, "")); }
    catch { /* malformed source URLs cannot satisfy a commission */ }
  }
  return domains.size;
}

export function admittedIndependentSourceDomainCount(packet: Pick<ResearchPacket, "intakeSources">): number {
  return independentSourceDomainCount(packet.intakeSources.map((source) => source.url));
}

function meetsCommissionSourceFloor(input: Readonly<{ term: string; beat: string; title?: string; sourceUrls: readonly string[] }>): boolean {
  const commission = commissionForAssignment({ term: input.term, beat: input.beat, ...(input.title === undefined ? {} : { title: input.title }) });
  return independentSourceDomainCount(input.sourceUrls) >= commission.evidenceBudget.minimumIndependentSources;
}

export function sourceUrlsMeetingDomainFloor(existing: readonly string[], discovered: readonly string[], requiredDomains: number): readonly string[] {
  const selected = [...new Set(existing)];
  const targetCount = Math.min(6, Math.max(selected.length, requiredDomains + 2));
  const domains = new Set<string>();
  for (const url of selected) {
    try { domains.add(new URL(url).hostname.toLowerCase().replace(/^www\./u, "")); }
    catch { /* malformed source URLs cannot buy source depth */ }
  }
  for (const url of discovered) {
    // Purchase bounded retrieval fallbacks even after the nominal domain
    // floor is represented in search metadata. Search results frequently
    // obstruct at the text boundary; two URLs are not two acquired sources.
    if (selected.length >= targetCount) break;
    try {
      const domain = new URL(url).hostname.toLowerCase().replace(/^www\./u, "");
      if (domains.has(domain)) continue;
      selected.push(url);
      domains.add(domain);
    } catch { /* malformed discovery candidates are not purchased for retrieval */ }
  }
  return Object.freeze(selected);
}

function distinctiveTerms(term: string): readonly string[] {
  return Object.freeze([...new Set(term.toLowerCase().split(/[^a-z0-9]+/u).filter((word) => word.length > 2 && !DEMAND_GLUE.has(word)))]);
}

export function packetSupportsAssignment(term: string, packet: ResearchPacket): boolean {
  const required = distinctiveTerms(term);
  if (required.length < 2) return false;
  return packet.intakeSources.some((source) => {
    const evidence = `${source.title} ${source.summary ?? ""}`.toLowerCase();
    return required.every((word) => evidence.includes(word));
  });
}

export function assignmentSourceUrls(term: string, packet: ResearchPacket): readonly string[] {
  const required = distinctiveTerms(term);
  const ranked = packet.intakeSources.map((source) => {
    const evidence = `${source.title} ${source.summary ?? ""}`.toLowerCase();
    return Object.freeze({ source, support: required.filter((word) => evidence.includes(word)).length });
  }).sort((left, right) => right.support - left.support || right.source.score - left.source.score);
  if ((ranked[0]?.support ?? 0) < required.length) return Object.freeze([]);
  const contextFloor = Math.max(2, Math.ceil(required.length / 2));
  const urls: string[] = [];
  for (const { source, support } of ranked) {
    if (urls.length > 0 && support < contextFloor) continue;
    if (!urls.includes(source.url)) urls.push(source.url);
    if (urls.length >= 3) break;
  }
  return Object.freeze(urls);
}

function packetForAssignment(assignment: AssignmentReading, configPath: string): ResearchPacket {
  const broad = researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls: assignment.sourceUrls, configPath });
  const sourceUrls = assignmentSourceUrls(assignment.term, broad);
  return researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: 3, configPath });
}

function cadenceRefusal(dataDir: string, policy: PublicationIssuePolicy, now: string): Readonly<{ code: string; reason: string }> | undefined {
  const last = latestKoiosAct(dataDir, "contract-events", "newsroom.circuit.completed");
  const lastAt = typeof last?.["recordedAt"] === "string" ? Date.parse(last["recordedAt"]) : Number.NaN;
  if (!Number.isFinite(lastAt)) return undefined;
  const nextAt = lastAt + policy.minimumHoursBetweenNewIssues * 3_600_000;
  if (Date.parse(now) >= nextAt) return undefined;
  return Object.freeze({ code: "cadence-window-open", reason: `publication policy permits the next new issue at ${new Date(nextAt).toISOString()}` });
}

function hasCurrentRepairJudgment(dataDir: string, contentDir: string, reading: LearningReading): boolean {
  if (reading.slug === null) return false;
  try {
    const manuscript = readFileSync(resolve(contentDir, `${reading.slug}.md`), "utf8");
    latestManuscriptRepairDirective({ dataDir, assignmentId: reading.assignmentId, slug: reading.slug, manuscript });
    return true;
  } catch {
    return false;
  }
}

/** A headline repair is executable from the staged customer asset itself; it
 * must not require an Editor judgment about prose that already passed the
 * writer contract. Bind selection to the exact body the circuit preserved. */
function hasCurrentStagedBody(dataDir: string, contentDir: string, reading: LearningReading): boolean {
  if (reading.slug === null) return false;
  const stage = readKoiosLedger(dataDir, "contract-events")
    .filter((entry) => entry["act"] === "newsroom.circuit.body-staged" && entry["subject"] === reading.assignmentId)
    .filter((entry) => entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"]))
    .map((entry) => entry["data"] as JsonObject)
    .filter((data) => data["slug"] === reading.slug && typeof data["bodyDigest"] === "string")
    .at(-1);
  if (stage === undefined) return false;
  try {
    const document = decodeFrontMatterDocument(readFileSync(resolve(contentDir, `${reading.slug}.md`), "utf8"));
    return recordDigest(document.body) === stage["bodyDigest"];
  } catch {
    return false;
  }
}

/** Re-open only the exact manuscript refused by an older originality gate.
 * This purchases no new prose; it lets changed deterministic law reconsider
 * its own prior result once. */
export function selectSourceOriginalityRevalidationBacklog(
  dataDir: string,
  now: string,
  contentDir = DEFAULT_CONTENT_DIR,
): SourceOriginalityRevalidation | undefined {
  const events = readKoiosLedger(dataDir, "contract-events");
  const currentMechanismDigest = sourceOriginalityMechanismDigest();
  const readings = new Map(inspectNewsroomLearning({ dataDir, pulseId: `source-originality-revalidation:${now}`, now }).readings.map((reading) => [reading.assignmentId, reading]));
  const refusals = events
    .filter((entry) => entry["act"] === "newsroom.circuit.source-originality-refused" && typeof entry["subject"] === "string")
    .sort((left, right) => String(right["recordedAt"] ?? "").localeCompare(String(left["recordedAt"] ?? "")));
  const consideredAssignments = new Set<string>();
  for (const refusal of refusals) {
    const assignmentId = String(refusal["subject"]);
    if (consideredAssignments.has(assignmentId)) continue;
    consideredAssignments.add(assignmentId);
    const reading = readings.get(assignmentId);
    if (reading === undefined || !["refused", "obstructed"].includes(reading.outcome) || reading.slug === null) continue;
    const data = refusal["data"] !== null && typeof refusal["data"] === "object" && !Array.isArray(refusal["data"])
      ? refusal["data"] as JsonObject : undefined;
    const slug = typeof data?.["slug"] === "string" ? data["slug"] : reading.slug;
    const path = resolve(contentDir, `${slug}.md`);
    let currentManuscriptDigest: string;
    try { currentManuscriptDigest = manuscriptByteDigest(readFileSync(path, "utf8")); }
    catch { continue; }
    if (data?.["manuscriptDigest"] !== currentManuscriptDigest) continue;
    const priorMechanismDigest = typeof data?.["gateMechanismDigest"] === "string" ? data["gateMechanismDigest"] : null;
    if (priorMechanismDigest === currentMechanismDigest) continue;
    const refusalDigest = recordDigest(refusal);
    const alreadySettled = events.some((entry) => entry["act"] === "newsroom.source-originality-gate-revalidation.settled"
      && entry["subject"] === assignmentId
      && entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"])
      && (entry["data"] as JsonObject)["revalidationAdmitted"] === true
      && (entry["data"] as JsonObject)["refusalDigest"] === refusalDigest
      && (entry["data"] as JsonObject)["gateMechanismDigest"] === currentMechanismDigest);
    if (alreadySettled) continue;
    return Object.freeze({ assignmentId, slug, refusalDigest, priorMechanismDigest, currentMechanismDigest });
  }
  return undefined;
}

function repairSourceDepth(input: Readonly<{ dataDir: string; reading: LearningReading }>): Readonly<{
  packetDigest: string;
  productClass: ProductClass;
  actualIndependentSources: number;
  requiredIndependentSources: number;
  meetsFloor: boolean;
}> | undefined {
  const current = readAdmissibleResearchPacket(input.dataDir, input.reading.assignmentId);
  if (current === undefined) return undefined;
  const packet = current as unknown as JsonObject;
  const packetDigest = recordDigest(current);
  const term = typeof packet?.["term"] === "string" ? packet["term"] : "";
  const beat = typeof packet?.["beat"] === "string" ? packet["beat"] : "culture";
  const intake = Array.isArray(packet?.["intakeSources"]) ? packet["intakeSources"] : [];
  const lead = intake.find((entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry)) as JsonObject | undefined;
  const title = typeof lead?.["title"] === "string" ? lead["title"] : undefined;
  const sourceUrls = intake.flatMap((entry) => entry !== null && typeof entry === "object" && !Array.isArray(entry) && typeof (entry as JsonObject)["url"] === "string" ? [String((entry as JsonObject)["url"])] : []);
  const productClass = productClassFor({ term, beat, sourceUrls });
  // The exact assignment, not a source publisher's headline, owns the
  // commission. Letting a lead title reclassify it can silently lower the
  // evidence floor that the writer and Licensed Editorial State will enforce.
  const requiredIndependentSources = commissionForAssignment({ term, beat }).evidenceBudget.minimumIndependentSources;
  const actualIndependentSources = independentSourceDomainCount(sourceUrls);
  return Object.freeze({ packetDigest, productClass, actualIndependentSources, requiredIndependentSources, meetsFloor: actualIndependentSources >= requiredIndependentSources });
}

/** Select the evidentiary repair that must precede any further prose spend.
 * This projects an existing source-depth refusal into an executable learning
 * move while leaving discovery, retrieval, and admission to their providers. */
export function selectSourceIntelligenceBacklog(dataDir: string, now: string, contentDir = DEFAULT_CONTENT_DIR): LearningReading | undefined {
  const events = readKoiosLedger(dataDir, "contract-events");
  const dispositions = readAssignmentDispositions(dataDir);
  const pulse = inspectNewsroomLearning({ dataDir, pulseId: `source-intelligence-repair-selection:${now}`, now });
  const readings = new Map(pulse.readings.map((reading) => [reading.assignmentId, reading]));
  const eventCandidates = events
    .filter((entry) => typeof entry["subject"] === "string" && (
      entry["act"] === "newsroom.repair.source-depth-refused"
      || (entry["act"] === "newsroom.circuit.replan-required"
        && entry["data"] !== null
        && typeof entry["data"] === "object"
        && !Array.isArray(entry["data"])
        && ["sources", "source-intelligence"].includes(String((entry["data"] as JsonObject)["failureLayer"] ?? "")))
    ))
    .sort((left, right) => String(right["recordedAt"] ?? "").localeCompare(String(left["recordedAt"] ?? "")));
  const candidateIds = [...new Set([
    ...eventCandidates.map((event) => String(event["subject"])),
    ...pulse.readings.filter((reading) => ["refused", "obstructed"].includes(reading.outcome) && ["replay-source-intelligence", "repair-draft", "replay-writer"].includes(reading.proposedMove)).map((reading) => reading.assignmentId).sort(),
  ])];
  for (const assignmentId of candidateIds) {
    // A terminal newsroom refusal is the authority under which source
    // intelligence may form a successor. Only source intelligence's own
    // exhausted-market disposition closes this commodity; treating every
    // terminal newsroom act as exhaustion would sever the repair circuit.
    if (dispositions.get(assignmentId)?.contract === "koios.news/source-intelligence-exhaustion/v1") continue;
    // Source procurement cannot resurrect a prose lineage that has already
    // exhausted the newsroom's bounded repair budget.
    if (assignmentId.split(":repair:").length - 1 >= 3) continue;
    const readySuccessorReplay = events
      .filter((entry) => entry["act"] === "source-intelligence.replay-settled" && entry["subject"] === assignmentId)
      .filter((entry) => entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"]))
      .map((entry) => entry["data"] as JsonObject)
      .some((data) => data["disposition"] === "ready" && typeof data["successorAssignmentId"] === "string" && data["successorAssignmentId"] !== "");
    // Forming a successor discharges the predecessor assignment, not merely
    // the packet digest that happened to be current at formation time. Packet
    // admissions are monotone projections and may later expose a deeper
    // packet for the predecessor; that cannot lawfully reactivate work whose
    // responsibility has already crossed into its successor's own circuit.
    if (readySuccessorReplay) continue;
    const reading = readings.get(assignmentId);
    if (reading === undefined) continue;
    const directlyEvidentiary = reading.proposedMove === "replay-source-intelligence";
    if (!directlyEvidentiary && (reading.slug === null || !hasCurrentRepairJudgment(dataDir, contentDir, reading))) continue;
    const depth = repairSourceDepth({ dataDir, reading });
    if (depth === undefined || (!directlyEvidentiary && depth.meetsFloor)) continue;
    const refusalRecorded = events.some((entry) => entry["act"] === "newsroom.repair.source-depth-refused" && entry["subject"] === assignmentId && entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"]) && (entry["data"] as JsonObject)["packetDigest"] === depth.packetDigest && (entry["data"] as JsonObject)["requiredIndependentSources"] === depth.requiredIndependentSources);
    if (!refusalRecorded) appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.source-depth-refused", subject: assignmentId, data: { failureLayer: "source-intelligence", proposedMove: "replay-source-intelligence", packetDigest: depth.packetDigest, productClass: depth.productClass, actualIndependentSources: depth.actualIndependentSources, requiredIndependentSources: depth.requiredIndependentSources, reason: "the bound packet does not meet the assignment commission; source intelligence must deepen it before another prose purchase", providerInvocation: false, customerMutation: false } });
    const latestReplay = events
      .filter((entry) => entry["act"] === "source-intelligence.replay-settled" && entry["subject"] === assignmentId)
      .filter((entry) => entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"]))
      .filter((entry) => (entry["data"] as JsonObject)["predecessorPacketDigest"] === depth.packetDigest)
      .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
      .at(-1);
    const replayData = latestReplay === undefined ? undefined : latestReplay["data"] as JsonObject;
    if (replayData?.["disposition"] === "refused" && replayData["mechanismVersion"] === SOURCE_INTELLIGENCE_REPLAY_MECHANISM_VERSION) {
      if (replayData["retryable"] !== true) continue;
      const nextRetryAt = typeof replayData["nextRetryAt"] === "string" ? Date.parse(replayData["nextRetryAt"]) : Number.NaN;
      if (Number.isFinite(nextRetryAt) && Date.parse(now) < nextRetryAt) continue;
    }
    return Object.freeze({ ...reading, failureLayer: "source-intelligence", proposedMove: "replay-source-intelligence" });
  }
  return undefined;
}

/** Select only a repair service demand that can be executed against the
 * manuscript as it exists now. A historical failure whose manuscript has
 * since changed is evidence for learning, but it is no longer a commodity a
 * repair provider can lawfully accept. */
export function selectRepairableBacklog(dataDir: string, now: string, contentDir = DEFAULT_CONTENT_DIR): LearningReading | undefined {
  const events = readKoiosLedger(dataDir, "contract-events");
  const inferenceReceipts = readKoiosLedger(dataDir, "provider-usage")
    .filter((entry) => entry["act"] === "inference.consumed")
    .filter((entry) => entry["data"] !== null && typeof entry["data"] === "object" && !Array.isArray(entry["data"]));
  const completedRepairs = new Set(events.flatMap((entry) => {
    if (entry["act"] !== "newsroom.repair-replay.settled") return [];
    const data = entry["data"];
    if (data === null || typeof data !== "object" || Array.isArray(data)) return [];
    if (!["released", "published"].includes(String((data as JsonObject)["disposition"] ?? ""))) return [];
    return [String((data as JsonObject)["predecessorAssignmentId"] ?? "")];
  }).filter(Boolean));
  const repairAttempts = new Map<string, Set<string>>();
  for (const entry of events) {
    if (entry["act"] !== "newsroom.repair-replay.settled") continue;
    const data = entry["data"];
    if (data === null || typeof data !== "object" || Array.isArray(data)) continue;
    const predecessor = String((data as JsonObject)["predecessorAssignmentId"] ?? "");
    const successor = String((data as JsonObject)["successorAssignmentId"] ?? "");
    const settlementAt = Date.parse(String(entry["recordedAt"] ?? ""));
    // Historical dispatches could record the provider receipt and then lose
    // its digest while forming a customer refusal. Recover capacity from the
    // owning resource ledger only when the exact assignment and settlement
    // instants coincide; do not turn unrelated inference into repair spend.
    const witnessedInference = predecessor !== "" && Number.isFinite(settlementAt) && inferenceReceipts.some((receipt) => {
      const receiptData = receipt["data"] as JsonObject;
      const receiptAt = Date.parse(String(receipt["recordedAt"] ?? ""));
      return receiptData["assignmentId"] === predecessor
        && Number.isFinite(receiptAt)
        && receiptAt <= settlementAt
        && settlementAt - receiptAt <= 5 * 60_000;
    });
    const capacityConsumed = (data as JsonObject)["capacityConsumed"] === true || successor !== "" || witnessedInference;
    if (predecessor !== "" && capacityConsumed) {
      const lineage = predecessor.split(":repair:")[0]!;
      const attempts = repairAttempts.get(lineage) ?? new Set<string>();
      attempts.add(String((data as JsonObject)["settlementDigest"] ?? recordDigest(entry)));
      repairAttempts.set(lineage, attempts);
    }
  }
  const pulse = inspectNewsroomLearning({ dataDir, pulseId: `issue-repair-selection:${now}`, now });
  const priority = new Map([["repair-headline", 0], ["repair-draft", 1], ["replay-writer", 2]]);
  const candidates = pulse.readings
    .filter((reading) => ["refused", "obstructed"].includes(reading.outcome))
    .filter((reading) => priority.has(reading.proposedMove))
    .filter((reading) => !completedRepairs.has(reading.assignmentId))
    .filter((reading) => reading.proposedMove === "repair-headline"
      ? hasCurrentStagedBody(dataDir, contentDir, reading)
      : hasCurrentRepairJudgment(dataDir, contentDir, reading))
    .sort((left, right) => (priority.get(left.proposedMove) ?? 99) - (priority.get(right.proposedMove) ?? 99) || left.assignmentId.localeCompare(right.assignmentId));
  for (const reading of candidates) {
    const lineage = reading.assignmentId.split(":repair:")[0]!;
    const attempts = repairAttempts.get(lineage)?.size ?? 0;
    let baseBudget = 3;
    try {
      const assignment = readAssignment(dataDir, reading.assignmentId, loadPosts(contentDir));
      baseBudget = Math.min(3, (readAssignmentCommission(dataDir, lineage) ?? commissionForAssignment(assignment)).resourceEnvelope.maximumDraftRepairs);
    } catch { /* legacy learning may not have an assignment-state projection */ }
    const latestOriginalityRefusal = events
      .filter((entry) => entry["act"] === "newsroom.circuit.source-originality-refused" && entry["subject"] === reading.assignmentId)
      .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
      .at(-1);
    const originalityData = latestOriginalityRefusal !== undefined && latestOriginalityRefusal["data"] !== null
      && typeof latestOriginalityRefusal["data"] === "object" && !Array.isArray(latestOriginalityRefusal["data"])
      ? latestOriginalityRefusal["data"] as JsonObject
      : undefined;
    const originalityFindingCount = Number(originalityData?.["findingCount"] ?? (Array.isArray(originalityData?.["findings"]) ? originalityData["findings"].length : 0));
    // A successful full replay that leaves only one or two exact originality
    // findings has produced a narrower commodity, not repeated the old
    // failure. Admit one bounded refinement without raising the ordinary
    // product-class budget or permitting an unbounded rewrite loop.
    const lineageDepth = reading.assignmentId.split(":repair:").length - 1;
    const gateRefinementAllowance = Number.isInteger(originalityFindingCount) && originalityFindingCount >= 1 && originalityFindingCount <= 2 ? 1 : 0;
    // A successor formed by one bounded commodity (for example a headline
    // repair) may expose one different downstream editorial defect. Admit one
    // successor refinement, but never compound allowances or exceed depth 2.
    const successorRefinementAllowance = lineageDepth === 1 ? 1 : 0;
    const refinementAllowance = Math.max(gateRefinementAllowance, successorRefinementAllowance);
    const budget = Math.min(3, baseBudget + refinementAllowance);
    if (lineageDepth >= budget || attempts >= budget) {
      const alreadyRecorded = events.some((entry) => entry["act"] === "newsroom.repair.economically-exhausted"
        && entry["subject"] === lineage
        && entry["data"] !== null
        && typeof entry["data"] === "object"
        && !Array.isArray(entry["data"])
        && (entry["data"] as JsonObject)["budget"] === budget
        && (entry["data"] as JsonObject)["attempts"] === attempts);
      if (!alreadyRecorded) appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.economically-exhausted", subject: lineage, data: { assignmentId: reading.assignmentId, attempts, lineageDepth, baseBudget, gateRefinementAllowance, successorRefinementAllowance, budget, proposedMove: reading.proposedMove, providerInvocation: false, queueReleased: true } });
      continue;
    }
    const depth = repairSourceDepth({ dataDir, reading });
    if (depth === undefined || depth.meetsFloor) return reading;
    const alreadyRecorded = events.some((entry) => entry["act"] === "newsroom.repair.source-depth-refused"
      && entry["subject"] === reading.assignmentId
      && entry["data"] !== null
      && typeof entry["data"] === "object"
      && !Array.isArray(entry["data"])
      && (entry["data"] as JsonObject)["packetDigest"] === depth.packetDigest
      && (entry["data"] as JsonObject)["requiredIndependentSources"] === depth.requiredIndependentSources);
    if (!alreadyRecorded) appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "newsroom.repair.source-depth-refused", subject: reading.assignmentId, data: {
      failureLayer: "source-intelligence",
      proposedMove: "replay-source-intelligence",
      packetDigest: depth.packetDigest,
      productClass: depth.productClass,
      actualIndependentSources: depth.actualIndependentSources,
      requiredIndependentSources: depth.requiredIndependentSources,
      reason: "the bound packet no longer meets the current product commission; source intelligence must deepen it before another prose purchase",
      providerInvocation: false,
      customerMutation: false,
    } });
  }
  return undefined;
}

/** A completed circuit is the terminal witness even when an older
 * assignment-state projection missed its corresponding transition. Queue
 * capacity follows the causal record, not a stale projection. */
export function completedCircuitAssignmentIds(dataDir: string): ReadonlySet<string> {
  return new Set(readKoiosLedger(dataDir, "contract-events").flatMap((entry) => (
    entry["act"] === "newsroom.circuit.completed" && typeof entry["subject"] === "string"
      ? [entry["subject"]]
      : []
  )));
}

/** Make the issue policy's bounded work-in-progress limit operational. The
 * publication, not Clockkeeper or Codex, activates the best ready inventory
 * and defers overflow without destroying it. A later pulse promotes the next
 * candidate after the active assignment reaches a terminal disposition. */
export function settleOpenAssignmentPortfolio(input: Readonly<{
  dataDir: string;
  posts?: readonly KoiosPost[];
  completedAssignmentIds?: ReadonlySet<string>;
  permittedBeats: ReadonlySet<string>;
  maximum: number;
  now: string;
}>): Readonly<{ active: readonly string[]; deferred: readonly string[]; changed: readonly string[] }> {
  const posts = input.posts ?? [];
  const completed = input.completedAssignmentIds ?? new Set<string>();
  const terminal = readAssignmentDispositions(input.dataDir);
  const priorControls = readAssignmentControls(input.dataDir);
  const candidates = readAssignments(input.dataDir, posts)
    .filter((assignment) => ["assigned", "drafted"].includes(assignment.status))
    .filter((assignment) => !completed.has(assignment.assignmentId) && !terminal.has(assignment.assignmentId) && input.permittedBeats.has(assignment.beat))
    .sort((left, right) => Number(right.status === "drafted") - Number(left.status === "drafted") || right.priority - left.priority || left.createdAt.localeCompare(right.createdAt) || left.assignmentId.localeCompare(right.assignmentId));
  const maximum = Math.max(1, Math.floor(input.maximum));
  const active = candidates.slice(0, maximum).map(({ assignmentId }) => assignmentId);
  const activeSet = new Set(active);
  const deferred = candidates.slice(maximum).map(({ assignmentId }) => assignmentId);
  const changed: string[] = [];
  for (const assignment of candidates) {
    const state = activeSet.has(assignment.assignmentId) ? "active" as const : "deferred" as const;
    if (priorControls.get(assignment.assignmentId)?.state === state) continue;
    recordAssignmentControl(input.dataDir, {
      assignmentId: assignment.assignmentId,
      state,
      reason: state === "active" ? "selected for the bounded publication work-in-progress portfolio" : `deferred behind the ${maximum}-assignment publication work-in-progress limit`,
      authority: "koios.news/publication-operations",
      contract: "koios.news/open-assignment-portfolio/v1",
    }, input.now);
    changed.push(assignment.assignmentId);
  }
  if (changed.length > 0) appendKoiosAct({ dataRoot: input.dataDir, ledger: "contract-events", instant: input.now, act: "assignment.open-portfolio.settled", subject: recordDigest({ active, deferred }), data: { contract: "koios.news/open-assignment-portfolio/v1", maximum, active, deferred, changed, customerMutation: true } });
  return Object.freeze({ active: Object.freeze(active), deferred: Object.freeze(deferred), changed: Object.freeze(changed) });
}

async function selectCandidates(input: Readonly<{
  policy: PublicationIssuePolicy;
  configPath: string;
  dataDir: string;
  contentDir: string;
  now: string;
  assignments: readonly AssignmentReading[];
  posts: readonly KoiosPost[];
  orderId: string;
}>): Promise<Readonly<{
  candidates: readonly Candidate[];
  productReading: AudienceProductReading;
  attentionProbe: TrendProbeResult;
  keywordResearch: Readonly<{ brief: KeywordOpportunityBrief; internalMarketSettlement: Readonly<JsonObject> }>;
}>> {
  const permitted = new Set(input.policy.permittedBeats);
  const used = reservedSourceUrls(input.assignments, input.posts, sourceReuseReleasedAssignmentIds(input.dataDir));
  const selected: Candidate[] = [];
  const seenPrimaryUrls = new Set<string>();
  const keywordResearch = await buyKeywordOpportunityResearch({ orderId: input.orderId, now: input.now, dataDir: input.dataDir, contentDir: input.contentDir, configPath: input.configPath });
  if (input.policy.selectionMode === "measured-demand-and-source") {
    for (const candidate of keywordResearch.brief.measuredDemand) {
      if (!permitted.has(candidate.beat)) continue;
      const packet = researchPacket({ term: candidate.term, beat: candidate.beat, configPath: input.configPath });
      if (packet.selectedCount === 0 || !packetSupportsAssignment(candidate.term, packet)) continue;
      const sourceUrls = assignmentSourceUrls(candidate.term, packet);
      const primaryUrl = sourceUrls[0];
      if (primaryUrl === undefined || sourceUrls.every((url) => used.has(url)) || seenPrimaryUrls.has(primaryUrl)) continue;
      seenPrimaryUrls.add(primaryUrl);
      selected.push(Object.freeze({
        origin: "measured-demand",
        term: candidate.term,
        beat: candidate.beat,
        priority: candidate.score,
        summary: `Report the ${candidate.term} story for the ${candidate.beat} beat from Koios-owned wire evidence.`,
        angle: "Preserve the source warrant while connecting the event to its larger systems.",
        sourceUrls,
        packet: researchPacket({ term: candidate.term, beat: candidate.beat, sourceUrls, limit: 3, configPath: input.configPath }),
        evidence: { views: candidate.evidence.views, impressions: candidate.evidence.impressions, clicks: candidate.evidence.clicks, covered: candidate.evidence.covered > 0 },
        sourceStatus: "owned-source-candidate",
      }));
      if (selected.length >= 6) break;
    }
  }

  const intake = await readBeatIntake(input.configPath);
  const corroborationIndex = buildSourceCorroborationIndex(intake);
  const sourceNominations = diversifySourceNominations(await sourceDrivenNominations({
    configPath: input.configPath,
    intake,
    excludedUrls: used,
    now: input.now,
    maxAgeDays: input.policy.freshnessWindowDays,
    // The provider's evidence-depth ordering is useful within a product but
    // entertainment and other terse feeds appear much deeper in that order.
    // Admit a broad read-only pool, then preserve bounded product breadth.
    limit: 240,
  }));
  for (const nomination of sourceNominations) {
    if (!permitted.has(nomination.beat)) continue;
    const primary = researchPacket({ term: nomination.term, beat: nomination.beat, sourceUrls: [nomination.url], configPath: input.configPath });
    const sourceUrls = corroboratingSourceUrlsForNomination({ nomination, intake, index: corroborationIndex, now: input.now, maxAgeDays: input.policy.freshnessWindowDays, limit: 3 });
    const primaryUrl = sourceUrls[0];
    if (primaryUrl === undefined || seenPrimaryUrls.has(primaryUrl) || !packetSupportsAssignment(nomination.term, primary)) continue;
    seenPrimaryUrls.add(primaryUrl);
    selected.push(Object.freeze({
      origin: "source-desk",
      term: nomination.term,
      beat: nomination.beat,
      priority: nomination.priority,
      summary: `Report the source-desk nomination “${nomination.title}” from Koios-owned wire evidence.`,
      angle: "Establish the nominated event first. Add systems interpretation only where the admitted sources warrant it.",
      sourceUrls,
      packet: researchPacket({ term: nomination.term, beat: nomination.beat, sourceUrls: [nomination.url], limit: 3, configPath: input.configPath }),
      evidence: { views: 0, impressions: 0, clicks: 0, covered: false },
      title: nomination.title,
      nomination,
      sourceStatus: "owned-source-candidate",
    }));
  }
  const selectedTerms = new Set(selected.map((candidate) => candidate.term.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim()));
  for (const opportunity of keywordOpportunityCandidates({ brief: keywordResearch.brief, permittedBeats: permitted, configPath: input.configPath })) {
    const normalized = opportunity.term.toLowerCase().replace(/[^a-z0-9]+/gu, " ").trim();
    if (selectedTerms.has(normalized)) continue;
    selectedTerms.add(normalized);
    selected.push(opportunity);
  }
  const attentionProbe = keywordResearch.brief.trendProbe;
  const discovery = keywordResearch.brief.discovery;
  const productPlan = planAudienceProducts({
    candidates: selected,
    posts: input.posts,
    trends: [...discovery.trends.novel, ...discovery.trends.reinforcing],
    performance: productPerformanceReading({
      posts: input.posts,
      attention: readKoiosLedger(input.dataDir, "attention"),
      revenueCost: readKoiosLedger(input.dataDir, "revenue-cost"),
      providerUsage: readKoiosLedger(input.dataDir, "provider-usage"),
    }),
    now: input.now,
  });
  return Object.freeze({ candidates: productPlan.candidates, productReading: productPlan.reading, attentionProbe, keywordResearch });
}

export async function settleIssuePulse(activity: Readonly<Record<string, unknown>>, options: Readonly<{
  now?: string;
  dataDir?: string;
  contentDir?: string;
  configPath?: string;
}> = {}): Promise<IssuePulseSettlement> {
  const now = options.now ?? new Date().toISOString();
  if (!validInstant(now)) throw new Error(`issue controller requires an explicit UTC instant: ${now}`);
  const dataDir = resolve(options.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(options.contentDir ?? DEFAULT_CONTENT_DIR);
  const configPath = resolve(options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG);
  const demandDigest = recordDigest(activity);
  const prior = priorSettlement(dataDir, demandDigest);
  if (prior !== undefined) {
    appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "issue.controller.replayed", subject: demandDigest, data: { contract: ISSUE_CONTROLLER_CONTRACT, originalResponseDigest: recordDigest(prior) } });
    return prior;
  }

  const demand = issueDemand(activity);
  let settled: IssuePulseSettlement | undefined;
  if (activity["@context"] !== ACTIVITYSTREAMS_CONTEXT || activity["type"] !== "Create" || activity["target"] !== PUBLICATION_ACTOR) {
    settled = response(activity, now, "Reject", { code: "wrong-boundary", reason: "pulse must be an ActivityStreams Create<NewsroomIssueDemand> addressed to the publication" });
  } else if (demand === undefined) {
    settled = response(activity, now, "Reject", { code: "invalid-demand", reason: "pulse must carry an exact publication issue policy and pulse identifier" });
  } else if (recordDigest(demand.policy) !== demand.policyDigest) {
    settled = response(activity, now, "Reject", { code: "policy-mismatch", reason: "publication policy bytes do not match the supplied policy digest", pulseId: demand.pulseId });
  } else if (typeof activity["actor"] !== "string"
    || typeof activity["capability"] !== "string"
    || !demand.policy.triggerAuthorities.some((authority) => authority.actor === activity["actor"] && authority.capability === activity["capability"])) {
    settled = response(activity, now, "Reject", {
      code: "unauthorized-trigger",
      reason: "pulse actor and capability are not admitted by the exact publication issue policy",
      pulseId: demand.pulseId,
      policyDigest: demand.policyDigest,
    });
  } else {
    const posts = loadPosts(contentDir);
    const completedCircuits = completedCircuitAssignmentIds(dataDir);
    let assignments: readonly AssignmentReading[] = readAssignments(dataDir, posts).filter((assignment) => !completedCircuits.has(assignment.assignmentId));
    const permitted = new Set(demand.policy.permittedBeats);
    const portfolio = settleOpenAssignmentPortfolio({ dataDir, posts, completedAssignmentIds: completedCircuits, permittedBeats: permitted, maximum: demand.policy.maxOpenAssignments, now });
    const open = readActionableAssignments(dataDir, posts).filter((assignment) => !completedCircuits.has(assignment.assignmentId) && permitted.has(assignment.beat));
    let assignment: AssignmentReading | undefined;
    let packet: ResearchPacket | undefined;
    let selectionOrigin = "existing-open-assignment";
    let sourceRefresh: JsonObject | undefined;
    let sourceRefreshDelivery: Readonly<JsonObject> | undefined;

    assignment = open.sort((left, right) => right.priority - left.priority || left.createdAt.localeCompare(right.createdAt))[0];
    if (assignment !== undefined && portfolio.changed.length > 0) selectionOrigin = "settled-open-assignment-portfolio";

    if (settled === undefined && assignment !== undefined) {
      const commission = readAssignmentCommission(dataDir, assignment.assignmentId);
      const currentProductClass = productClassFor({ term: assignment.term, beat: assignment.beat, sourceUrls: assignment.sourceUrls });
      if (commission !== undefined && commission.productClass !== currentProductClass) {
        recordAssignmentDisposition(dataDir, {
          assignmentId: assignment.assignmentId,
          disposition: "refused",
          reason: `the current audience-product law classifies this assignment as ${currentProductClass}, not its inherited ${commission.productClass} commission`,
          authority: "koios.news/audience-product-planning",
          contract: "koios.news/product-reclassification/v1",
        }, now);
        appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "assignment.product-reclassified", subject: assignment.assignmentId, data: { priorProductClass: commission.productClass, currentProductClass, priorCommissionDigest: recordDigest(commission), sourceReuseReleased: true, providerInvocation: false, queueReleased: true } });
        // A stale commission may not consume the whole publication slot. Its
        // refusal releases the source and queue, then this same issue pulse
        // continues under current product law (subject to the ordinary cadence
        // and source-intelligence gates).
        assignment = undefined;
        assignments = readAssignments(dataDir, posts).filter((candidate) => !completedCircuits.has(candidate.assignmentId));
        selectionOrigin = "product-reclassification-recovery";
      }
    }

    if (settled === undefined && assignment === undefined) {
      const cadence = cadenceRefusal(dataDir, demand.policy, now);
      if (cadence !== undefined) {
        settled = response(activity, now, "Reject", { ...cadence, pulseId: demand.pulseId, policyDigest: demand.policyDigest });
      } else {
        if (settled === undefined && demand.policy.sourceRefreshAuthorized) {
          try {
            const refreshed = await refreshSourceCorpus({ configPath, dataDir, now });
            sourceRefreshDelivery = refreshed.providerDelivery;
            sourceRefresh = { contract: refreshed.contract, deliveryDigest: refreshed.deliveryDigest, offered: refreshed.offered, admitted: refreshed.admitted, duplicates: refreshed.duplicates, collisions: refreshed.collisions, refused: refreshed.refused };
          } catch (error) {
            settled = response(activity, now, "Reject", { code: "source-refresh-refused", reason: error instanceof Error ? error.message.slice(0, 800) : String(error).slice(0, 800), pulseId: demand.pulseId, policyDigest: demand.policyDigest });
          }
        }
        if (settled === undefined) {
          const selection = await selectCandidates({ policy: demand.policy, configPath, dataDir, contentDir, now, assignments, posts, orderId: `${demand.pulseId}:keyword-research` });
          appendDatedRecord({
            dataRoot: dataDir,
            ledger: "audience-product",
            instant: now,
            record: Object.freeze({
              ...selection.productReading,
              pulseId: demand.pulseId,
              policyDigest: demand.policyDigest,
              attentionProbe: selection.attentionProbe,
              keywordResearch: {
                contract: selection.keywordResearch.brief.contract,
                briefDigest: selection.keywordResearch.brief.briefDigest,
                internalMarketSettlement: selection.keywordResearch.internalMarketSettlement,
              },
            }) as JsonObject,
          });
          const candidates = selection.candidates;
          if (candidates.length === 0) {
            settled = response(activity, now, "Reject", { code: "no-fresh-warranted-candidate", reason: "owned demand and admitted source custody produced no unused assignment with a fully supported event spine", pulseId: demand.pulseId, policyDigest: demand.policyDigest, ...(sourceRefresh === undefined ? {} : { sourceRefresh }) });
          } else {
            const failures: JsonObject[] = [];
            let retryableDiscoveryObstruction: string | undefined;
            for (const selected of boundedCandidateEvaluationSlate(candidates, selection.productReading, 6)) {
              const productDecision = selection.productReading.rankedCandidates.find((reading) => reading.term === selected.term && reading.beat === selected.beat);
              let resolvedProductClass = productDecision?.productClass ?? productClassFor({ term: selected.term, beat: selected.beat, ...(selected.title === undefined ? {} : { title: selected.title }), sourceUrls: selected.sourceUrls });
              let assignmentBeat = operatingBeatForProduct(resolvedProductClass, selected.beat);
              let assignmentTerm = selected.term;
              let assignmentTitle = selected.title;
              let commission = commissionForAssignment({ term: assignmentTerm, beat: assignmentBeat, ...(assignmentTitle === undefined ? {} : { title: assignmentTitle }) });
              let commissionedSourceUrls = [...selected.sourceUrls];
              let sourceDiscovery: Readonly<{ delivery: Readonly<JsonObject>; candidates: readonly Readonly<JsonObject>[]; candidateUrls: readonly string[] }> | undefined;
              if (sourceRefreshDelivery !== undefined && !meetsCommissionSourceFloor({ term: selected.term, beat: assignmentBeat, ...(selected.title === undefined ? {} : { title: selected.title }), sourceUrls: commissionedSourceUrls })) {
                if (retryableDiscoveryObstruction !== undefined) {
                  const failure = Object.freeze({ prospectiveAssignmentId: null, term: selected.term, beat: assignmentBeat, selectionOrigin: selected.origin, reason: `source discovery carrier remains retryably unavailable: ${retryableDiscoveryObstruction}`, failureLayer: "source-discovery" });
                  failures.push(failure);
                  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "source-intelligence.candidate-refused", subject: `urn:koios:unformed-assignment:${recordDigest({ pulseId: demand.pulseId, term: selected.term, beat: assignmentBeat })}`, data: failure });
                  continue;
                }
                const primaryUrl = commissionedSourceUrls[0];
                const source = selected.packet.intakeSources.find((entry) => entry.url === primaryUrl) ?? selected.packet.intakeSources[0];
                const leadPublished = selected.nomination?.sourcePublished ?? source?.published;
                const leadSummary = selected.nomination?.summary ?? source?.summary;
                const boundedLeadPublished = typeof leadPublished === "string" && leadPublished.trim() !== "" ? leadPublished.trim().slice(0, 100) : undefined;
                const boundedLeadSummary = typeof leadSummary === "string" && leadSummary.trim() !== "" ? leadSummary.trim().slice(0, 4_000) : undefined;
                const queryHints = selected.origin === "keyword-research"
                  ? Object.freeze([`${selected.term} why trending ${now.slice(0, 10)}`, `${selected.term} latest news`, `${selected.term} current event`])
                  : Object.freeze([selected.term, `${selected.term} public records`, `${selected.term} independent reporting`]);
                try {
                  sourceDiscovery = procurePublicSourceDiscovery({
                    requestId: `${demand.pulseId}:source-discovery:${recordDigest({ term: selected.term, beat: assignmentBeat, primaryUrl }).replace(/^sha256:/u, "").slice(0, 16)}`,
                    lead: Object.freeze({
                      title: selected.title ?? source?.title ?? selected.term,
                      ...(primaryUrl === undefined ? {} : { url: primaryUrl }),
                      ...(boundedLeadPublished === undefined ? {} : { published: boundedLeadPublished }),
                      ...(boundedLeadSummary === undefined ? {} : { summary: boundedLeadSummary }),
                    }),
                    queryHints,
                    excludedUrls: Object.freeze([...commissionedSourceUrls]),
                    maximumCandidates: 6,
                    now,
                    dataDir,
                  });
                  if (selected.origin === "keyword-research") {
                    assignmentTerm = resolvedKeywordEventTerm(selected.term, sourceDiscovery.candidates);
                    assignmentTitle = assignmentTerm === selected.term ? selected.title : assignmentTerm;
                    resolvedProductClass = productClassFor({ term: assignmentTerm, beat: selected.beat, ...(assignmentTitle === undefined ? {} : { title: assignmentTitle }), sourceUrls: sourceDiscovery.candidateUrls });
                    assignmentBeat = operatingBeatForProduct(resolvedProductClass, selected.beat);
                    commission = commissionForAssignment({ term: assignmentTerm, beat: assignmentBeat, ...(assignmentTitle === undefined ? {} : { title: assignmentTitle }) });
                  }
                  const relevantCandidates = sourceDiscovery.candidates.filter((candidate) => sourceDiscoveryCandidateSupportsEvent(candidate, assignmentTerm));
                  const relevantUrls = relevantCandidates.flatMap((candidate) => typeof candidate["url"] === "string" ? [candidate["url"]] : []);
                  commissionedSourceUrls = [...sourceUrlsMeetingDomainFloor(selected.sourceUrls, relevantUrls, commission.evidenceBudget.minimumIndependentSources)];
                  if (!meetsCommissionSourceFloor({ term: assignmentTerm, beat: assignmentBeat, ...(assignmentTitle === undefined ? {} : { title: assignmentTitle }), sourceUrls: commissionedSourceUrls })) throw new Error(`discovery found no ${commission.evidenceBudget.minimumIndependentSources}-domain reporting set whose titles preserve the concrete event spine`);
                } catch (error) {
                  if (error instanceof PublicSourceDiscoveryRefusal && error.retryable) retryableDiscoveryObstruction = `${error.code}: ${error.message}`;
                  const reason = error instanceof Error ? error.message.slice(0, 1200) : String(error).slice(0, 1200);
                  const failure = Object.freeze({ prospectiveAssignmentId: null, term: selected.term, beat: assignmentBeat, selectionOrigin: selected.origin, reason, failureLayer: "source-discovery", ...(error instanceof PublicSourceDiscoveryRefusal ? { providerCode: error.code, retryable: error.retryable } : {}) });
                  failures.push(failure);
                  appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "source-intelligence.candidate-refused", subject: `urn:koios:unformed-assignment:${recordDigest({ pulseId: demand.pulseId, term: selected.term, beat: assignmentBeat })}`, data: failure });
                  continue;
                }
              }
              const assignmentInput = {
                term: assignmentTerm,
                beat: assignmentBeat,
                priority: selected.priority,
                summary: assignmentTerm === selected.term ? selected.summary : `Report the concrete event “${assignmentTerm}” discovered while serving the audience demand “${selected.term}”; demand selected attention and supplies no factual claim.`,
                angle: selected.angle,
                assignee: "koios-news/writer",
                sourceUrls: commissionedSourceUrls,
                evidence: selected.evidence,
              } as const;
              const prospective = previewAssignment(dataDir, assignmentInput, posts, now);
              try {
                if (sourceRefreshDelivery === undefined) throw new Error("the issue pulse carries no exact Newscable provider delivery for source-intelligence composition");
                const issueTerms = [...new Set([prospective.term, prospective.beat, ...prospective.term.split(/[^a-z0-9]+/iu).filter((term) => term.length >= 5)])].slice(0, 10);
                const priorResearch = procurePriorResearchForIssue({ assignmentId: prospective.assignmentId, terms: issueTerms, dataDir, now, maxFiles: 8, requireProviderDelivery: true });
                const recalledEvidence = selected.sourceUrls.length === 0
                  ? sourceRefreshDelivery
                  : await recallSourceBundles({ sourceUrls: selected.sourceUrls, dataDir, now });
                const publicWebEvidence = procurePublicWebSourceText({ assignmentId: prospective.assignmentId, sourceUrls: prospective.sourceUrls, currentEvidence: recalledEvidence, now, dataDir });
                const admitted = await procureAdmissibleResearchPacket({ assignment: prospective, currentEvidence: recalledEvidence, ...(publicWebEvidence === undefined ? {} : { publicWebEvidence }), priorResearch, commission, now, dataDir, maximumAgeHours: demand.policy.freshnessWindowDays * 24 });
                if (!packetSupportsAssignment(prospective.term, admitted.packet)) throw new Error("the admitted packet does not support the whole proposed assignment lens");
                const admittedAssignmentInput = Object.freeze({ ...assignmentInput, sourceUrls: Object.freeze([...admitted.packet.sourceUrls]) });
                const admittedProspective = previewAssignment(dataDir, admittedAssignmentInput, posts, now);
                if (admittedProspective.assignmentId !== prospective.assignmentId) throw new Error("assignment identity changed when corroborating source custody was attached");
                const created = createAssignment(dataDir, admittedAssignmentInput, posts, now);
                if (created.assignment.assignmentId !== admittedProspective.assignmentId) throw new Error("assignment identity changed between source-intelligence settlement and assignment creation");
                selectionOrigin = selected.origin;
                assignment = created.assignment;
                assignments = readAssignments(dataDir, posts);
                packet = admitted.packet;
                appendDatedRecord({ dataRoot: dataDir, ledger: "assignments", instant: now, record: Object.freeze({ kind: "koios.assignment-selection", at: now, contract: ISSUE_CONTROLLER_CONTRACT, created: created.created, assignmentId: assignment.assignmentId, selectionOrigin, policyDigest: demand.policyDigest, researchPacketContract: "ni:///sha-256;UEbmiI0qGL7BZDmWudlPOHE52M8POyitL1vY2IQi_ho", packetDigest: admitted.packetDigest, refusedCandidateCount: failures.length, commission, resolvedProductClass, ...(selected.keywordOpportunity === undefined ? {} : { keywordOpportunity: selected.keywordOpportunity }), ...(sourceDiscovery === undefined ? {} : { sourceDiscoveryContract: "ni:///sha-256;otqx16XpWh1j0spvQvtPTgcKzL_cNWrQFF3qk3U8Ii0", sourceDiscoveryDeliveryDigest: (sourceDiscovery.delivery["object"] as JsonObject | undefined)?.["deliveryDigest"] ?? null }), ...(productDecision === undefined ? {} : { productDecision }) }) as JsonObject });
                appendDatedRecord({ dataRoot: dataDir, ledger: "source-claims", instant: now, record: Object.freeze({ kind: "koios.assignment-research-packet", at: now, assignmentId: assignment.assignmentId, selectionOrigin, contract: "ni:///sha-256;UEbmiI0qGL7BZDmWudlPOHE52M8POyitL1vY2IQi_ho", ...(selected.nomination === undefined ? {} : { nomination: selected.nomination }), packet }) as JsonObject });
                break;
              } catch (error) {
                const reason = error instanceof Error ? error.message.slice(0, 1200) : String(error).slice(0, 1200);
                const failure = Object.freeze({ prospectiveAssignmentId: prospective.assignmentId, term: prospective.term, beat: prospective.beat, selectionOrigin: selected.origin, reason });
                failures.push(failure);
                appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "source-intelligence.candidate-refused", subject: prospective.assignmentId, data: failure });
              }
            }
            if (assignment === undefined) {
              settled = response(activity, now, "Reject", {
                code: "source-intelligence-refused",
                reason: `source intelligence refused ${failures.length} bounded candidates without forming an assignment; first refusal: ${String(failures[0]?.["reason"] ?? "unknown provider obstruction")}`,
                pulseId: demand.pulseId,
                policyDigest: demand.policyDigest,
                failures,
                requiredMove: "refresh evidence or repair the earliest shared provider obstruction before the next pulse",
              });
            }
          }
        }
      }
    } else if (settled === undefined && assignment !== undefined) {
      packet = readAdmissibleResearchPacket(dataDir, assignment.assignmentId) ?? packetForAssignment(assignment, configPath);
    }

    if (settled === undefined && assignment !== undefined && packet !== undefined) {
      if (packet.selectedCount === 0 || !packetSupportsAssignment(assignment.term, packet)) {
        recordAssignmentDisposition(dataDir, {
          assignmentId: assignment.assignmentId,
          disposition: "refused",
          reason: "the assignment's admitted evidence no longer supports its whole lens",
          authority: "koios.news/source-intelligence",
          contract: "koios.news/assignment-evidence-admission/v1",
        }, now);
        appendKoiosAct({ dataRoot: dataDir, ledger: "contract-events", instant: now, act: "assignment.evidence-refused", subject: assignment.assignmentId, data: { packetDigest: recordDigest(packet), term: assignment.term, beat: assignment.beat, queueReleased: true } });
        settled = response(activity, now, "Reject", { code: "assignment-evidence-no-longer-admissible", reason: "the open assignment no longer projects a source packet supporting its whole lens", pulseId: demand.pulseId, assignmentId: assignment.assignmentId, policyDigest: demand.policyDigest });
      } else {
        const packetDigest = recordDigest(packet);
        settled = response(activity, now, "Accept", {
          disposition: "assigned",
          pulseId: demand.pulseId,
          policyDigest: demand.policyDigest,
          assignmentId: assignment.assignmentId,
          assignmentDigest: recordDigest(assignment),
          packetDigest,
          sourceUrls: [...assignment.sourceUrls],
          selectionOrigin,
          openAssignmentCount: readActionableAssignments(dataDir, posts).filter((candidate) => !completedCircuits.has(candidate.assignmentId)).length,
          ...(sourceRefresh === undefined ? {} : { sourceRefresh }),
          next: Object.freeze({ type: "IssueWorkDemand", target: NEWSROOM_RUNNER, assignmentId: assignment.assignmentId, requiredContract: "ni:///sha-256;JeFirv0GtdnxsMK55Mimwdc1_J2y94vFtSMwnw2sePE", packetDigest }),
        });
      }
    }
  }

  if (settled === undefined) throw new Error("issue controller reached no typed settlement");
  appendKoiosAct({
    dataRoot: dataDir,
    ledger: "contract-events",
    instant: now,
    act: "issue.controller.settled",
    subject: demandDigest,
    data: {
      contract: ISSUE_CONTROLLER_CONTRACT,
      disposition: settled["type"] === "Accept" ? "assigned" : "refused",
      responseDigest: recordDigest(settled),
      response: settled,
      resourceAccounting: { execution: "deterministic-local", marginalPriceUsd: "unmeasured", leaderContributedCoordination: "not-observed-by-runtime" },
    },
  });
  return settled;
}
