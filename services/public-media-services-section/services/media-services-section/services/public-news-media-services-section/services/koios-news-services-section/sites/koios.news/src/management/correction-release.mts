// Complete one already-authorized correction across Koios's public boundary.
// Correction law and editorial admission remain Koios-owned; Resource
// Brokerage Team alone carries the Cloudflare release authority.

import { appendKoiosAct, type JsonObject } from "./ledger.mts";
import { settlePrimaryStaticRelease, witnessPrimaryStaticRelease, type PrimaryReleaseSettlement } from "./cloudflare-primary-release-contract.mts";
import { closeCorrection, type CloseCorrectionInput, type CloseCorrectionResult } from "./corrections.mts";

export type CorrectionReleaseResult = Readonly<{
  kind: "koios.correction-publication-settlement";
  contract: "koios.news/correction-publication/v1";
  disposition: "released" | "release-obstructed";
  correction: CloseCorrectionResult;
  release: PrimaryReleaseSettlement;
}>;

export async function releaseClosedCorrection(input: Readonly<{
  correction: CloseCorrectionResult;
  outputDir: string;
  dataDir: string;
  now: string;
}>): Promise<CorrectionReleaseResult> {
  await appendKoiosAct({
    dataRoot: input.dataDir,
    ledger: "shadow-deliveries",
    instant: input.now,
    act: "candidate.projected",
    subject: input.correction.correctionId,
    data: {
      slug: input.correction.slug,
      manifestDigest: input.correction.manifestDigest,
      authority: "non-authoritative-cutover-candidate",
      profile: "cutover-candidate",
      purpose: "correction-publication",
      correctionId: input.correction.correctionId,
    },
  });
  const release = await settlePrimaryStaticRelease({
    assignmentId: input.correction.correctionId,
    slug: input.correction.slug,
    candidateDir: input.outputDir,
    dataDir: input.dataDir,
    now: input.now,
  });
  const disposition = release.accepted ? "released" : "release-obstructed";
  await appendKoiosAct({
    dataRoot: input.dataDir,
    ledger: "corrections-omissions",
    instant: input.now,
    act: release.accepted ? "correction.publication.released" : "correction.publication.release-obstructed",
    subject: input.correction.correctionId,
    data: {
      slug: input.correction.slug,
      manifestDigest: input.correction.manifestDigest,
      releaseManifestDigest: release.manifestDigest,
      provider: "urn:ame:resource-brokerage-team",
      contract: "cloudflare-primary-static-release/v1",
      providerOutcome: release.outcome,
      publicAuthority: release.accepted ? "cloudflare-worker:koios-news-primary" : "prior-cloudflare-worker-version",
      coldRedGatePublicOrigin: false,
    } as JsonObject,
  });
  return Object.freeze({
    kind: "koios.correction-publication-settlement",
    contract: "koios.news/correction-publication/v1",
    disposition,
    correction: input.correction,
    release,
  });
}

export async function closeAndReleaseCorrection(input: CloseCorrectionInput): Promise<CorrectionReleaseResult> {
  const correction = await closeCorrection(input);
  const settlement = await releaseClosedCorrection({
    correction,
    outputDir: input.outputDir,
    dataDir: input.dataDir ?? "data",
    now: input.closedAt,
  });
  if (settlement.release.accepted) {
    const witness = await witnessPrimaryStaticRelease({ slug: correction.slug, dataDir: input.dataDir ?? "data" });
    if (!witness.witnessed) throw new Error(`correction released but public witness failed: ${witness.reason ?? "unknown reason"}`);
  }
  return settlement;
}
