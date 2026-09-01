#!/usr/bin/env node

import { resolve } from "node:path";

import { buildStaticPublication, verifyStaticPublication } from "./administrating/deploying/static-shadow.mts";
import { compareStaticPublicationProfiles } from "./administrating/deploying/static-profile-parity.mts";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mts";
import { DEFAULT_DATA_DIR } from "./config.mts";
import { appendKoiosAct } from "./management/ledger.mts";
import { DEFAULT_A_ADS_UNITS } from "./theme.mts";

function argument(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
}

const shadowOutputDir = resolve(argument("--shadow-out") ?? ".static/koios.news");
const candidateOutputDir = resolve(argument("--candidate-out") ?? ".static/koios.news-candidate");
const livePublicationWitness = latestLivePublicationWitness(DEFAULT_DATA_DIR);
const shadow = await buildStaticPublication({ outputDir: shadowOutputDir, profile: "shadow", replace: true, livePublicationWitness });
const candidate = await buildStaticPublication({ outputDir: candidateOutputDir, profile: "cutover-candidate", replace: true, livePublicationWitness });
verifyStaticPublication(shadow);
verifyStaticPublication(candidate);
const report = compareStaticPublicationProfiles({
  shadowOutputDir,
  candidateOutputDir,
  shadowManifestDigest: shadow.manifestDigest,
  candidateManifestDigest: candidate.manifestDigest,
});
if (!report.candidateReadyForCutoverEvaluation) throw new Error(`static publication profiles diverge unexpectedly: ${report.unexpectedRoutes.join(", ")}`);

if (process.argv.includes("--record")) {
  const now = argument("--now");
  if (now === undefined) throw new Error("--record requires --now with an explicit UTC instant");
  await appendKoiosAct({
    dataRoot: DEFAULT_DATA_DIR,
    ledger: "deployments",
    instant: now,
    act: "deployment.static-profiles-compared",
    subject: "vps-to-cloudflare-publication-profiles",
    data: {
      shadowManifestDigest: report.shadowManifestDigest,
      candidateManifestDigest: report.candidateManifestDigest,
      frozenLivePublicationWitnessDigest: livePublicationWitness.witnessDigest,
      routeSetsEqual: report.routeSetsEqual,
      exactArtifactCount: report.exactArtifactCount,
      intentionalDeltaCount: report.intentionalDeltaCount,
      unexpectedRoutes: report.unexpectedRoutes,
      candidateReadyForCutoverEvaluation: report.candidateReadyForCutoverEvaluation,
      authorityConferred: report.authorityConferred,
      previewPolicy: "public-preview-uses-noindex-shadow; production-indexable-candidate-remains-local-until-explicit-cutover",
    },
  });
  await appendKoiosAct({
    dataRoot: DEFAULT_DATA_DIR,
    ledger: "advertising",
    instant: now,
    act: "advertising.static-profile-witnessed",
    subject: candidate.manifestDigest,
    data: {
      contract: "a-ads-static-publication/v1",
      profile: "cutover-candidate",
      provider: "a-ads",
      units: DEFAULT_A_ADS_UNITS,
      placements: ["masthead", "home-lead", "article-banner", "footer"],
      privacyDeclared: true,
      providerFrameAllowedByCsp: true,
      adsTxt: "absent-no-provider-authored-seller-line",
      performanceReceipt: "not-yet-observed",
      revenueReceipt: "not-yet-observed",
      shadowAdvertisingSuspended: true,
    },
  });
  await appendKoiosAct({
    dataRoot: DEFAULT_DATA_DIR,
    ledger: "attention",
    instant: now,
    act: "attention.static-publication-suspended",
    subject: candidate.manifestDigest,
    data: {
      profiles: ["shadow", "cutover-candidate"],
      viewBeacon: false,
      hitRoute: "excluded",
      aggregateRoute: "excluded",
      privacyDeclared: true,
      resumptionCondition: "separately-contracted-accountable-attention-service-and-digest-bound-publication-act",
    },
  });
}

process.stdout.write(`${JSON.stringify({
  kind: report.kind,
  shadowManifestDigest: report.shadowManifestDigest,
  candidateManifestDigest: report.candidateManifestDigest,
  routeSetsEqual: report.routeSetsEqual,
  exactArtifactCount: report.exactArtifactCount,
  intentionalDeltaCount: report.intentionalDeltaCount,
  unexpectedRoutes: report.unexpectedRoutes,
  candidateReadyForCutoverEvaluation: report.candidateReadyForCutoverEvaluation,
  authorityConferred: report.authorityConferred,
})}\n`);
