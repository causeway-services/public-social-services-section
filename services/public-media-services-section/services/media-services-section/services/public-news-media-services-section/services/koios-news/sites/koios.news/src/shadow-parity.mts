#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";

import { DEFAULT_DATA_DIR } from "./config.mts";
import { compareStaticShadowToLive } from "./administrating/deploying/shadow-parity.mts";
import { compareStaticPublicationProfiles } from "./administrating/deploying/static-profile-parity.mts";
import { compareCandidateToLiveSemantics } from "./administrating/deploying/candidate-live-semantics.mts";
import { latestLivePublicationWitness } from "./administrating/deploying/live-publication-witness.mts";
import { appendKoiosAct, latestKoiosAct, type JsonObject, type KoiosLedger } from "./management/ledger.mts";

import { argument } from "@red-cup-engineering/parse-javascript-argv-service";

const outputDir = resolve(argument("--out") ?? ".static/koios.news");
const candidateOutputDir = resolve(argument("--candidate-out") ?? ".static/koios.news-candidate");
const liveOrigin = argument("--live") ?? "https://koios.news";
const now = argument("--now");
const livePublicationWitness = latestLivePublicationWitness(DEFAULT_DATA_DIR);
const candidateManifestBytes = readFileSync(join(candidateOutputDir, "manifest.json"));
const candidateManifest = JSON.parse(candidateManifestBytes.toString("utf8")) as Readonly<{ profile?: unknown; livePublicationWitnessDigest?: unknown }>;
if (candidateManifest.profile !== "cutover-candidate" || candidateManifest.livePublicationWitnessDigest !== livePublicationWitness.witnessDigest) throw new Error("live parity requires a current cutover candidate built from the frozen live-publication witness");
const sha256 = (value: Uint8Array): string => `sha256:${createHash("sha256").update(value).digest("hex")}`;
const candidateBindings = Object.freeze({
  artifactManifestDigest: sha256(candidateManifestBytes),
  livePublicationWitnessDigest: livePublicationWitness.witnessDigest,
  deliveryPolicyDigest: sha256(readFileSync(join(candidateOutputDir, "_headers"))),
});
const shadowManifestBytes = readFileSync(join(outputDir, "manifest.json"));
const staticProfileParity = compareStaticPublicationProfiles({
  shadowOutputDir: outputDir,
  candidateOutputDir,
  shadowManifestDigest: sha256(shadowManifestBytes),
  candidateManifestDigest: candidateBindings.artifactManifestDigest,
});
function actData(ledger: KoiosLedger, act: string): Readonly<JsonObject> | undefined {
  const data = latestKoiosAct(DEFAULT_DATA_DIR, ledger, act)?.["data"];
  return data !== null && typeof data === "object" && !Array.isArray(data) ? data as JsonObject : undefined;
}
function boundAct(ledger: KoiosLedger, act: string): boolean {
  const data = actData(ledger, act);
  return data?.["artifactManifestDigest"] === candidateBindings.artifactManifestDigest
    && data["livePublicationWitnessDigest"] === candidateBindings.livePublicationWitnessDigest
    && data["deliveryPolicyDigest"] === candidateBindings.deliveryPolicyDigest;
}
const providerDryRunSettled = boundAct("shadow-deliveries", "deployment.provider-dry-run-settled");
const rollbackOrigin = latestKoiosAct(DEFAULT_DATA_DIR, "deployments", "deployment.rollback-origin-rehearsed");
const rollbackOriginData = rollbackOrigin?.["data"] as JsonObject | undefined;
const retainedOriginRollbackRehearsed = rollbackOriginData?.["livePublicationWitnessDigest"] === livePublicationWitness.witnessDigest;
const candidateLiveSemantics = await compareCandidateToLiveSemantics({ candidateOutputDir, liveOrigin });
const report = await compareStaticShadowToLive({
  outputDir,
  liveOrigin,
  livePublicationWitness,
  providerPackagingDryRunSettled: providerDryRunSettled,
  staticProfileParitySettled: staticProfileParity.candidateReadyForCutoverEvaluation,
  liveSemanticParitySettled: candidateLiveSemantics.settled,
  retainedOriginRollbackRehearsed,
  authorityEvidence: {
    providerEffectSeamAccepted: boundAct("deployments", "deployment.cloudflare-effect-seam.accepted"),
    previewDeliverySettled: boundAct("shadow-deliveries", "deployment.cloudflare-preview.delivered"),
    previewParitySettled: boundAct("deployments", "deployment.cloudflare-preview.parity-proved"),
    remoteRollbackRehearsed: boundAct("deployments", "deployment.rollback.remote-rehearsed"),
    mutableRoutesDisposed: boundAct("deployments", "deployment.mutable-routes.disposed"),
    cutoverAuthorized: boundAct("deployments", "deployment.cutover.authorized"),
  },
});
const boundReport = Object.freeze({ ...report, candidateBindings, candidateLiveSemantics, staticProfileParity: {
  shadowManifestDigest: staticProfileParity.shadowManifestDigest,
  candidateManifestDigest: staticProfileParity.candidateManifestDigest,
  routeSetsEqual: staticProfileParity.routeSetsEqual,
  exactArtifactCount: staticProfileParity.exactArtifactCount,
  intentionalDeltaCount: staticProfileParity.intentionalDeltaCount,
  unexpectedRoutes: staticProfileParity.unexpectedRoutes,
  candidateReadyForCutoverEvaluation: staticProfileParity.candidateReadyForCutoverEvaluation,
} });
if (process.argv.includes("--record")) {
  if (now === undefined) throw new Error("--record requires --now with an explicit UTC instant");
  await appendKoiosAct({
    dataRoot: DEFAULT_DATA_DIR,
    ledger: "deployments",
    instant: now,
    act: "deployment.parity-observed",
    subject: "vps-to-cloudflare-shadow",
    data: boundReport,
  });
}
process.stdout.write(`${JSON.stringify(boundReport)}\n`);
