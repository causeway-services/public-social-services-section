// researching/sourcing — the intake side of Koios.News.
//
// Sourcing reads the publication property as declared in
// producing-content.config.json: beats, source endpoints, and seed terms. It
// does not fetch or rank by itself; it gives the newsroom a stable reading of
// what the farm is allowed to listen to.

import { koiosFarmProperty, SEED_KEYWORDS, type SeedKeyword } from "../../demand.mjs";
import {
  beatSourceReading as farmBeatSourceReading,
  contentFarmSourcingDepartment,
  type BeatSourceReading as FarmBeatSourceReading,
  type ContentFarmSourcingDepartment,
} from "@red-cup-engineering/organizing-a-content-farm";
import { farmVaultReading, type FarmVaultReading } from "./farm-vault.mjs";
import { researchPacket, type ResearchPacket } from "./research-packets.mjs";
import { sourceRollReading, type SourceRollReading } from "./sources.mjs";

export type BeatSourceReading = FarmBeatSourceReading;

export type SourcingDepartmentReading = ContentFarmSourcingDepartment;

function seedTermsForBeat(seeds: readonly SeedKeyword[], beat: string): readonly string[] {
  return Object.freeze(seeds
    .filter((seed) => seed.beat === beat)
    .map((seed) => seed.term));
}

function mutableSourceRoll(roll: SourceRollReading): ContentFarmSourcingDepartment["sourceRoll"] {
  return {
    ...roll,
    wires: roll.wires.map((wire) => ({
      ...wire,
      sources: wire.sources.map((source) => ({ ...source })),
    })),
    byClass: { ...roll.byClass },
    bySourceKind: { ...roll.bySourceKind },
    constraints: [...roll.constraints],
  };
}

export function sourcingDepartmentReading(): SourcingDepartmentReading {
  const property = koiosFarmProperty();
  const seeds = SEED_KEYWORDS;
  const farmCorpusRoot = farmVaultReading();
  const beats = Object.entries(property.beatSources)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([beat, sources]): BeatSourceReading => farmBeatSourceReading({
      beat,
      sourceCount: sources.length,
      sources: sources.map((source) => String(source)),
      seedTerms: [...seedTermsForBeat(seeds, beat)],
    }));
  return contentFarmSourcingDepartment({
    property: property.name,
    farmCorpus: farmCorpusRoot.farmCorpus,
    farmCorpusRoot,
    beats,
    sourceRoll: mutableSourceRoll(sourceRollReading()),
    researchPacketPolicy: {
      route: "/operators/research-packets.json?term={term}&beat={beat}",
      assignmentRoute: "/operators/assignments/{assignmentId}/research.json",
      note: "Research packets fold local wire evidence for a term and beat, then expose source URLs and candidate CSL references without writing manuscripts.",
    },
    submissionDesk: {
      route: "/operators/sourcing/submit-source",
      note: "Submit one specific source material; the desk appraises beat fit, and if it belongs in a Koios beat, works it into a draft candidate through the same cultivation cycle every article runs through.",
    },
    sourceCount: beats.reduce((sum, beat) => sum + beat.sourceCount, 0),
    seedCount: seeds.length,
  });
}

export {
  farmVaultReading,
} from "./farm-vault.mjs";
export {
  researchPacket,
} from "./research-packets.mjs";
export {
  sourceRollReading,
} from "./sources.mjs";
export type {
  FarmVaultReading,
} from "./farm-vault.mjs";
export type {
  ResearchPacket,
} from "./research-packets.mjs";
export type {
  SourceRollReading,
} from "./sources.mjs";

export {
  desksReading,
} from "./desks.mjs";
export type {
  DesksReading,
  DeskReading,
  DesksOptions,
} from "./desks.mjs";

export {
  keywordDiscoveryReading,
  googleTrendsProbe,
  readBeatIntake,
} from "./discovery.mjs";
export type {
  KeywordDiscoveryReading,
  KeywordDiscoveryOptions,
  CoverageGap,
  CandidateKeyword,
  CandidateSource,
  TrendSignal,
  TrendsReading,
  TrendProbeResult,
  TrendProbeItem,
} from "./discovery.mjs";

export {
  appraiseSubmission,
  gatherRelatedSources,
  isOutOfFrame,
  submitSource,
  syndicationItemFromSubmission,
} from "./source-submission.mjs";
export type {
  SubmittedSource,
  SubmitSourceOptions,
  SubmissionAppraisal,
  BeatFitScore,
  GatheredSources,
  SourceSubmissionJudgment,
  SourceSubmissionCultivated,
  SourceSubmissionOutOfFrame,
} from "./source-submission.mjs";

export {
  koiosSourceCyclePlan,
  runKoiosSourceCycle,
  sourceCycleRepairPacketsReading,
} from "./source-cycle.mjs";
export type {
  KoiosSourceCyclePlan,
  KoiosSourceCycleReading,
  KoiosSourceCycleOptions,
  SourceCycleRepairPacket,
  SourceCycleRepairPacketsReading,
  SourceCycleRepairTask,
} from "./source-cycle.mjs";
