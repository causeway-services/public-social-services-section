import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createSemanticRecordJournal } from "@red-cup-engineering/eavt/semantic-record";
import { runJavascriptNodeOperation } from "@red-cup-engineering/javascript-node-services-section/operation";

const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ACTOR = "urn:ame:artificial-intelligence-curriculum-enterprise";
const OBJECT_KIND = "emsweb.artificial-intelligence-curriculum.enterprise-launch-record";
const CATEGORY = "artificial-intelligence-curriculum.multi-agent-operating-discipline-cohort-launch";

/**
 * @param {{ dataRoot?: string }} [options]
 * @returns {ReturnType<typeof createSemanticRecordJournal>}
 */
function journal(options = {}) {
  return createSemanticRecordJournal({
    root: resolve(options.dataRoot ?? NODE_ROOT),
    objectKind: OBJECT_KIND,
  });
}

/**
 * @param {{ dataRoot?: string, recordedAt?: string }} [options]
 * @returns {ReturnType<ReturnType<typeof createSemanticRecordJournal>["record"]>}
 */
export function recordCohortLaunch(options = {}) {
  const recordedAt = options.recordedAt ?? new Date().toISOString();
  const record = {
    type: "MultiAgentOperatingDisciplineCohortLaunchRecord",
    provider: ACTOR,
    courseId: "multi-agent-operating-discipline-for-teams",
    courseRevision: 1,
    recordedAt,
    offer: {
      format: "live, synchronous, cohort-taught",
      sessions: 5,
      seatsMin: 10,
      seatsMax: 20,
      priceUsdPerSeat: 349,
      priceRangeStated: { min: 200, max: 500 },
    },
    pricingRationale: {
      comparables: [
        { name: "Claude Code in Practice (Maven, boring-bot)", priceUsd: 2000, sessions: 10, url: "https://maven.com/boring-bot/claude-code-in-practice" },
        { name: "Agentic AI for Claude Builders (Maven, James Gray)", priceUsd: 1500, weeks: 5, url: "https://maven.com/james-gray/claude" },
        { name: "8-week applied-LLM cohort (Maven, Hamel Husain, via roundup)", priceUsdMin: 750, priceUsdMax: 1500, url: "https://pecollective.com/blog/best-prompt-engineering-courses/" },
        { name: "The AI Engineer Certification (AI Makerspace, Maven)", priceUsd: 4000, url: "https://aimakerspace.io/the-ai-engineer-certification/" },
        { name: "Harness Engineering Workshop (Vizuara)", priceUsdApprox: 700, url: "https://harnessengineering.vizuara.ai/" },
      ],
      note: "priceUsdPerSeat (349) is this session's own estimate, positioned below every cited comparable's per-session cost; every comparable price traces to its cited url.",
    },
    funnel: {
      firstMove: "r/ClaudeCode",
      channels: [
        { name: "r/ClaudeCode", scaleNote: "approximately 395,000 members", url: "https://gummysearch.com/r/ClaudeCode/" },
        { name: "r/ClaudeAI", scaleNote: "part of a 740,000-member Claude-focused Reddit community", url: "https://www.clauder-navi.com/en/claude-2026-reddit" },
        { name: "Anthropic developer community (Discord + Reddit)", scaleNote: "thousands of developers, 33 countries, 67 cities", url: "https://claude.com/community" },
        { name: "Latent Space (newsletter, Discord, podcast)", scaleNote: "200,000+ subscribers / 10,000,000+ views across channels", url: "https://www.latent.space/" },
        { name: "Maven's own discovery surface", scaleNote: "hosts every priced comparable above", url: "https://maven.com/courses/claude-code" },
      ],
    },
    firstDollarPath: {
      engineeringDeliveredThisChange: [
        "course revision JSON",
        "5 lesson-brief JSONs",
        "landing/offer copy with pricing rationale and funnel research",
        "this launch-state record",
      ],
      handsOutstanding: [
        "founder recording/live-teaching the five sessions on camera",
        "creating an account on the chosen cohort-hosting platform or payment processor",
        "posting the first-move funnel content to r/ClaudeCode",
        "setting real session dates",
      ],
      paymentRailsDecision: {
        chosen: "named-rails checkout (conventional processor or cohort-hosting platform checkout)",
        rejected: "x402/pseudonymous rails",
        reason: "a synchronous paid cohort with real seats needs named buyer identity, refunds, and support; x402 is built for agent-to-agent micropayments, not this shape",
      },
    },
    fences: [
      "no Hive auto-posting performed or authorized by this record",
      "no charge has been or will be made from this record",
      "the offer is not represented as ready to sell",
    ],
    risks: [
      "agent-dispatch-discipline-plugin's public GitHub release is queued go-public work, not yet done (2026-08-31 23:50 goal-stack roadmap record)",
      "audience-building (plugin public release, founder social presence) precedes this cohort's own launch",
      "no checkout exists yet; nothing above is buyable",
      "first cohort, no completion track record",
    ],
  };
  return journal(options).record({
    category: CATEGORY,
    recordedAt,
    record,
    charge: { support: true, refutation: false },
    relation: { subject: ACTOR, predicate: "offers", object: record.courseId },
  });
}

if (import.meta.main) {
  const result = await runJavascriptNodeOperation({ name: "record-cohort-launch", description: "recordCohortLaunch — the record-cohort-launch operation.", operation: recordCohortLaunch }, { arguments: process.argv.slice(2), standardInput: process.stdin, standardOutput: process.stdout });
  process.exitCode = result.exitCode;
}
