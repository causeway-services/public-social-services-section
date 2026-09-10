// Settle the public headline as its own bounded attention product. Models
// contribute one prose line; Koios verifies the promise against the exact
// article body and alone mutates its manuscript carrier.

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_DIR, DEFAULT_DATA_DIR } from "../config.mts";
import type { EditorialCommission } from "./editorial-commissioning.mts";
import type { AssignmentReading } from "../researching/writing/assignments.mts";
import type { ResearchPacket } from "../researching/sourcing/research-packets.mts";
import { headlineCommissionPrompt, selectAccountableHeadline } from "../researching/writing/attention-headline.mts";
import { procureNewswireProse } from "../researching/writing/newswire-prose-contract.mts";
import { appendKoiosAct, recordDigest } from "./ledger.mts";

export type AccountableHeadlineSettlement = Readonly<{
  disposition: "settled" | "already-settled" | "obstructed" | "refused";
  assignmentId: string;
  slug: string;
  before: string;
  after: string;
  provider?: string;
  tier?: string;
  reason?: string;
}>;

function primarySourceTitle(packet: ResearchPacket, sourceUrl: string): string | undefined {
  return packet.intakeSources.find((source) => source.url === sourceUrl)?.title;
}

export async function settleAccountableHeadline(input: Readonly<{
  assignment: AssignmentReading;
  slug: string;
  packet: ResearchPacket;
  commission: EditorialCommission;
  licensedEditorialStateDigest: string;
  writingPolicyDigest: string;
  stylePolicyDigest: string;
  now?: string;
  contentDir?: string;
  dataDir?: string;
}>): Promise<AccountableHeadlineSettlement> {
  const now = input.now ?? new Date().toISOString();
  const contentDir = resolve(input.contentDir ?? DEFAULT_CONTENT_DIR);
  const dataDir = resolve(input.dataDir ?? DEFAULT_DATA_DIR);
  const path = resolve(contentDir, `${input.slug}.md`);
  const document = decodeFrontMatterDocument(readFileSync(path, "utf8"));
  const currentTitle = String(document.frontMatter["title"] ?? "").trim();
  const sourceTitle = primarySourceTitle(input.packet, input.assignment.sourceUrls[0] ?? "") ?? currentTitle;
  if (currentTitle !== "" && currentTitle !== sourceTitle) {
    return Object.freeze({ disposition: "already-settled", assignmentId: input.assignment.assignmentId, slug: input.slug, before: currentTitle, after: currentTitle });
  }
  try {
    const result = await procureNewswireProse({
      purpose: `Contribute an accountable publication headline for assignment ${input.assignment.assignmentId}.`,
      assignmentId: input.assignment.assignmentId,
      assignmentDigest: recordDigest(input.assignment),
      prompt: headlineCommissionPrompt({ assignmentTerm: input.assignment.term, sourceTitle, body: document.body, commission: input.commission }),
      licensedEditorialStateDigest: input.licensedEditorialStateDigest,
      researchPacketDigest: recordDigest(input.packet),
      writingPolicyDigest: input.writingPolicyDigest,
      stylePolicyDigest: input.stylePolicyDigest,
      requiredSourceUrls: input.packet.sourceUrls,
      shape: "headline",
      now,
      dataDir,
    });
    const selection = selectAccountableHeadline({ raw: result.text, fallback: sourceTitle, assignmentTerm: input.assignment.term, body: document.body, sourceUrls: input.packet.sourceUrls });
    if (!selection.accepted) {
      const reason = selection.findings.join("; ");
      await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: now, act: "attention-surface.headline-refused", subject: input.assignment.assignmentId, data: { slug: input.slug, commission: input.commission.genre, selection, provider: result.selectedProvider, tier: result.selectedTier, model: result.model, factualWarrant: false } });
      return Object.freeze({ disposition: "refused", assignmentId: input.assignment.assignmentId, slug: input.slug, before: currentTitle, after: currentTitle, provider: result.selectedProvider, tier: result.selectedTier, reason });
    }
    writeFileSync(path, encodeFrontMatterDocument(Object.freeze({
      ...document,
      frontMatter: Object.freeze({ ...document.frontMatter, title: selection.selected, tweet: selection.selected }),
    })), "utf8");
    await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: now, act: "attention-surface.headline-settled", subject: input.assignment.assignmentId, data: { slug: input.slug, commission: input.commission.genre, before: currentTitle, after: selection.selected, manuscriptDigest: recordDigest(readFileSync(path, "utf8")), provider: result.selectedProvider, tier: result.selectedTier, model: result.model, factualWarrant: false } });
    return Object.freeze({ disposition: "settled", assignmentId: input.assignment.assignmentId, slug: input.slug, before: currentTitle, after: selection.selected, provider: result.selectedProvider, tier: result.selectedTier });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    await appendKoiosAct({ dataRoot: dataDir, ledger: "audience-product", instant: now, act: "attention-surface.headline-obstructed", subject: input.assignment.assignmentId, data: { slug: input.slug, commission: input.commission.genre, before: currentTitle, reason: reason.slice(0, 1200), factualWarrant: false } });
    return Object.freeze({ disposition: "obstructed", assignmentId: input.assignment.assignmentId, slug: input.slug, before: currentTitle, after: currentTitle, reason });
  }
}
