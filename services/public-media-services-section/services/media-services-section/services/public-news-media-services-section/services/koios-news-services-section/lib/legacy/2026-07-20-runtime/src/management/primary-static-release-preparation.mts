import { resolve } from "node:path";

import { buildStaticPublication, verifyStaticPublication } from "../administrating/deploying/static-shadow.mjs";
import { latestLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mjs";
import { appendKoiosAct } from "./ledger.mjs";
import type { PendingPrimaryRelease } from "./cloudflare-primary-release-contract.mjs";

export async function preparePrimaryStaticRelease(input: Readonly<{ assignmentId: string; slug: string; candidateDir: string; dataDir: string; now?: string }>): Promise<PendingPrimaryRelease> {
  const now = input.now ?? new Date().toISOString();
  const witness = latestLivePublicationWitness(input.dataDir);
  const outputDir = resolve(input.candidateDir);
  const candidate = await buildStaticPublication({ outputDir, replace: true, profile: "cutover-candidate", livePublicationWitness: witness });
  const verification = verifyStaticPublication(candidate);
  appendKoiosAct({ dataRoot: input.dataDir, ledger: "shadow-deliveries", instant: now, act: "candidate.projected", subject: input.assignmentId, data: { slug: input.slug, manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, authority: "non-authoritative-cutover-candidate", profile: verification.profile, livePublicationWitnessDigest: witness.witnessDigest, reprojectedForPrimaryRelease: true } });
  return Object.freeze({ assignmentId: input.assignmentId, slug: input.slug, candidate: Object.freeze({ outputDir, manifestDigest: verification.manifestDigest }) });
}
