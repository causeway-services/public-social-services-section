#!/usr/bin/env node
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { computeClaimTopicDistribution } from "../src/topic-distribution.mjs";
import { recordLaunchState } from "../src/launch-state-record.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_STORE_ROOT = resolve(HERE, "..", "..", "..", "sites", "koios.news", "store");
const DEFAULT_DATA_ROOT = resolve(HERE, "..", "data");

const PRICING = Object.freeze({
  targetPricePerMonthUsd: 50,
  targetSubscriberCount: 20,
  comparables: [
    { name: "Stratechery Plus", pricePerMonthUsd: 15, note: "40,000+ paid subscribers", source: "https://readsom.com/newsletter/stratechery" },
    { name: "The Information", pricePerMonthUsd: 42.25, note: "$399/yr standard; Pro tier $749/yr", source: "https://www.readless.app/blog/the-information-price-per-month-2026" },
    { name: "Platformer", pricePerMonthUsd: 10, note: "~170K subscribers, 5% paid", source: "https://dupple.com/blog/best-tech-newsletters" },
    { name: "Zero Day (Kim Zetter)", pricePerMonthUsd: 10, note: "$25/mo Special Friends and Sponsors tier", source: "https://www.zetter-zeroday.com/about/" },
    { name: "beehiiv State of Paid Newsletters 2026", pricePerMonthUsd: null, note: "market default anchor $10/mo; niche premiums: investing $27/mo, finance $20/mo, business $15/mo; subscriber count does not materially move price, niche vertical does", source: "https://www.beehiiv.com/blog/the-state-of-paid-newsletters-2026" },
    { name: "The Maley Report", pricePerMonthUsd: 49, note: "actionable analyst briefing for a professional niche audience", source: "https://youngandtheinvested.com/best-stock-investment-newsletters/" },
    { name: "Financial Times Standard Digital", pricePerMonthUsd: 45, note: "FT Premium Digital (incl. analyst briefings) runs $75/mo", source: "https://www.gainify.io/blog/financial-newsletters" },
  ],
  rationale: "$50/mo sits above the $10/mo generic-newsletter anchor and inside the $42-75/mo band professional analyst briefings (The Information, The Maley Report, FT Premium Digital) actually charge; per beehiiv's 2026 data subscriber count near-zero effect on price at 20 subscribers, only niche and source discipline justify the premium, which this product supplies through machine-backed per-claim provenance a free feed does not surface.",
});

const FUNNEL = Object.freeze({
  measuredNiche: "collapse-tech (tech-infrastructure fragility / digital sovereignty / cybersecurity-geopolitics)",
  audienceCongregation: [
    { venue: "r/netsec, r/cybersecurity, r/blueteamsec (Reddit)", source: "https://infosecindustry.com/best-cybersecurity-subreddits/" },
    { venue: "TechPolicy.Press (adjacent publication covering the same digital-sovereignty/AI-governance beat)", source: "https://www.techpolicy.press/topic/geopolitics/" },
    { venue: "IAPP Navigate / Global Summit digital-sovereignty tracks", source: "https://iapp.org/news/a/reflecting-on-digital-sovereignty-discussions-at-navigate-2026" },
    { venue: "CSO Online, Security Boulevard (trade press)", source: "https://trainingcamp.com/articles/best-cybersecurity-forums-and-communities-to-follow-in-2026/" },
  ],
  firstMove: "Share issue #1 as a free value-first post in r/netsec or r/cybersecurity once it independently clears the founder's quality fence; no paywall link or solicitation in that post, only the source-disciplined analysis, to build a free reader base before any subscription ask.",
});

const FENCE = Object.freeze({
  solicited: false,
  charging: false,
  statement: "No subscriber has been solicited and no payment has been taken. The founder-imposed fence requires the sample issue to be genuinely good before any subscriber is solicited; that judgment is recorded in this package's README, not assumed here.",
});

/**
 * Parses `--store <path>` and `--data-root <path>` overrides from an argv
 * slice; both default to this package's real store and `data/` roots.
 * @param {string[]} argv `process.argv.slice(2)`.
 * @returns {{storeRoot: string, dataRoot: string}} The resolved roots.
 */
function rootsFrom(argv) {
  const flag = (name, fallback) => {
    const index = argv.indexOf(name);
    if (index === -1) return fallback;
    const value = argv[index + 1];
    if (!value) throw new TypeError(`${name} requires a path argument`);
    return resolve(value);
  };
  return {
    storeRoot: flag("--store", DEFAULT_STORE_ROOT),
    dataRoot: flag("--data-root", DEFAULT_DATA_ROOT),
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const { storeRoot, dataRoot } = rootsFrom(process.argv.slice(2));
    const topicDistribution = computeClaimTopicDistribution({ storeRoot });
    const recordedAt = new Date().toISOString();
    const record = { productLine: "koios-intelligence-briefing", recordedAt, topicDistribution, pricing: PRICING, funnel: FUNNEL, fence: FENCE };
    const receipt = recordLaunchState({ dataRoot, recordedAt, record });
    process.stdout.write(`${JSON.stringify({ receipt, record }, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`record-intelligence-briefing-launch-state: ${error.message}\n`);
    process.exitCode = 2;
  }
}
