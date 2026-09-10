// Before a projected candidate can cross the public Cloudflare boundary,
// settle any unresolved headline fallback, re-run exact-manuscript editorial
// judgment, and project a new candidate. A failed surface move never releases
// the older candidate behind it.

import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mts";
import { loadPosts } from "../content.mts";
import { koiosFarmProperty } from "../demand.mts";
import { buildStaticPublication, verifyStaticPublication } from "../administrating/deploying/static-shadow.mts";
import { latestLivePublicationWitness } from "../administrating/deploying/live-publication-witness.mts";
import { readAssignment, readAssignmentCommission } from "../researching/writing/assignments.mts";
import { readAdmissibleResearchPacket } from "../researching/sourcing/admissible-research-packet-contract.mts";
import { researchPacket } from "../researching/sourcing/research-packets.mts";
import { procureLicensedEditorialState } from "../researching/sourcing/licensed-editorial-state-contract.mts";
import { judgeManuscriptUnderContract } from "../researching/writing/editing/market-editorial.mts";
import { reviewPublicationAdmission } from "../researching/writing/editing/standards.mts";
import { commissionForAssignment } from "./editorial-commissioning.mts";
import { settleAccountableHeadline } from "./accountable-headline-settlement.mts";
import { appendKoiosAct, recordDigest } from "./ledger.mts";
import type { PendingPrimaryRelease } from "./cloudflare-primary-release-contract.mts";

const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

export type PendingAttentionSurfaceSettlement = Readonly<{
  disposition: "clear" | "reprojected" | "refused" | "obstructed";
  assignmentId: string;
  slug: string;
  reason?: string;
  candidate?: PendingPrimaryRelease["candidate"];
}>;

export async function settlePendingAttentionSurfaces(input: Readonly<{
  pending: PendingPrimaryRelease;
  now?: string;
  dataDir?: string;
  contentDir?: string;
}>): Promise<PendingAttentionSurfaceSettlement> {
  const now = input.now ?? new Date().toISOString();
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const manuscriptPath = resolve(contentDir, `${input.pending.slug}.md`);
  const before = readFileSync(manuscriptPath, "utf8");
  try {
    const assignment = readAssignment(dataDir, input.pending.assignmentId, loadPosts(contentDir));
    const commission = readAssignmentCommission(dataDir, assignment.assignmentId)
      ?? commissionForAssignment({ term: assignment.term, beat: assignment.beat });
    const packet = readAdmissibleResearchPacket(dataDir, assignment.assignmentId)
      ?? researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls: assignment.sourceUrls, limit: Math.max(4, assignment.sourceUrls.length) });
    const licensed = await procureLicensedEditorialState({
      assignment: {
        assignmentId: assignment.assignmentId,
        term: assignment.term,
        beat: assignment.beat,
        summary: assignment.summary ?? `Report the ${assignment.term} story from admitted source evidence.`,
        angle: assignment.angle ?? "Establish the reported event before adding only source-licensed systems interpretation.",
        sourceUrls: assignment.sourceUrls,
      },
      researchPacket: packet,
      commission,
      now,
    });
    const headline = await settleAccountableHeadline({
      assignment,
      slug: input.pending.slug,
      packet,
      commission,
      licensedEditorialStateDigest: licensed.stateDigest,
      writingPolicyDigest: recordDigest(JSON.parse(readFileSync(join(SITE_ROOT, "lib", "law", "accountable-attention-and-publication.json"), "utf8"))),
      stylePolicyDigest: recordDigest(koiosFarmProperty().voice),
      now,
      contentDir,
      dataDir,
    });
    if (headline.disposition === "already-settled") {
      return Object.freeze({ disposition: "clear", assignmentId: assignment.assignmentId, slug: input.pending.slug });
    }
    if (headline.disposition !== "settled") {
      return Object.freeze({ disposition: headline.disposition, assignmentId: assignment.assignmentId, slug: input.pending.slug, reason: headline.reason ?? "accountable headline did not settle" });
    }
    const judgment = await judgeManuscriptUnderContract({ slug: input.pending.slug, now: new Date().toISOString() });
    if (!judgment.publishable) {
      writeFileSync(manuscriptPath, before, "utf8");
      const reason = `exact-manuscript editor ${judgment.disposition}: ${judgment.summary}`;
      await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: new Date().toISOString(), act: "attention-surface.settlement-refused", subject: assignment.assignmentId, data: { slug: input.pending.slug, reason, restoredPriorManuscript: true } });
      return Object.freeze({ disposition: "refused", assignmentId: assignment.assignmentId, slug: input.pending.slug, reason });
    }
    const admission = reviewPublicationAdmission(contentDir, input.pending.slug);
    if (!admission.publishable) throw new Error("accepted headline manuscript did not regain exact publication admission");
    const witness = latestLivePublicationWitness(dataDir);
    const candidate = await buildStaticPublication({ outputDir: input.pending.candidate.outputDir, replace: true, profile: "cutover-candidate", livePublicationWitness: witness });
    const verification = verifyStaticPublication(candidate);
    await appendKoiosAct({ dataRoot: dataDir, ledger: "shadow-deliveries", instant: new Date().toISOString(), act: "candidate.projected", subject: assignment.assignmentId, data: { slug: input.pending.slug, manifestDigest: verification.manifestDigest, routeCount: verification.routeCount, authority: "non-authoritative-cutover-candidate", profile: verification.profile, attentionSurfaceSettlement: true, priorManifestDigest: input.pending.candidate.manifestDigest } });
    return Object.freeze({ disposition: "reprojected", assignmentId: assignment.assignmentId, slug: input.pending.slug, candidate: Object.freeze({ outputDir: candidate.outputDir, manifestDigest: verification.manifestDigest }) });
  } catch (error) {
    if (readFileSync(manuscriptPath, "utf8") !== before) writeFileSync(manuscriptPath, before, "utf8");
    const reason = error instanceof Error ? error.message : String(error);
    await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: new Date().toISOString(), act: "attention-surface.settlement-obstructed", subject: input.pending.assignmentId, data: { slug: input.pending.slug, reason: reason.slice(0, 1200), restoredPriorManuscript: true } });
    return Object.freeze({ disposition: "obstructed", assignmentId: input.pending.assignmentId, slug: input.pending.slug, reason });
  }
}
