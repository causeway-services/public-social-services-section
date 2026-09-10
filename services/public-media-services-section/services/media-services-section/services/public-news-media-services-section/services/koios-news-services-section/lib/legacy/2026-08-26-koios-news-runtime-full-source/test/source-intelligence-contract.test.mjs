import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import { procureAdmissibleResearchPacket, readAdmissibleResearchPacket } from "../dist/researching/sourcing/admissible-research-packet-contract.mjs";
import { appendDatedRecord, recordDigest } from "../dist/management/ledger.mjs";
import { commissionForAssignment } from "../dist/management/editorial-commissioning.mjs";

const NOW = "2026-07-18T18:00:00.000Z";
const PRIMARY = "https://example.test/revival";
const SECONDARY = "https://example.net/revival-analysis";

function bundle(subject, url, title, summary) {
  const value = {
    subject,
    claims: [
      { id: `${subject}:title`, proposition: { predicate: "title", object: title }, force: "reports", status: "supported", provenance: { citation: url }, time: { asserted: "2026-07-18T12:00:00Z" } },
      { id: `${subject}:url`, proposition: { predicate: "url", object: url }, force: "reports", status: "supported", provenance: { citation: url }, time: { asserted: "2026-07-18T12:00:00Z" } },
      { id: `${subject}:published`, proposition: { predicate: "published", object: "2026-07-18T12:00:00Z" }, force: "reports", status: "supported", provenance: { citation: url }, time: { asserted: "2026-07-18T12:00:00Z" } },
      { id: `${subject}:summary`, proposition: { predicate: "summary", object: summary }, force: "reports", status: "supported", provenance: { citation: url }, time: { asserted: "2026-07-18T12:00:00Z" } },
    ],
  };
  return { wire: "technology", subject, digest: recordDigest(value), bundle: value };
}

test("Koios hires the Section to compose independently contracted current and prior evidence", async () => {
  const territory = mkdtempSync(join(tmpdir(), "koios-source-intelligence-customer-"));
  const dataDir = join(territory, "data");
  process.env["KOIOS_NEWS_SERVICE_SECTION_DATA_ROOT"] = join(territory, "section-data");
  const bundles = [
    bundle("revival", PRIMARY, "Example project revival begins", "The Example project revival began under new leadership and published a tested roadmap."),
    bundle("revival-analysis", SECONDARY, "Example project revival analysis", "Maintainers analyzed the Example project revival and its compatibility work."),
  ];
  const currentEvidence = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Accept",
    actor: "https://newscable-source-broker.invalid/activitypub/actor",
    object: { type: "SourceBundleDelivery", deliveryDigest: recordDigest(bundles), bundles, results: [], providerExchange: { provider: "newscable-source-broker", price: { amount: 0, currency: "USD" } } },
  };
  const contextualBundle = { type: "ContextualBundle", sourceCount: 1, sources: [{ path: "/provider/prior.md", digest: "sha256:prior", snippets: [{ text: "Earlier research distinguishes custody transfer from a cosmetic project relaunch." }] }] };
  const gapBundle = { type: "GapBundle", gapCount: 0, gaps: [] };
  const providerDelivery = {
    "@context": "https://www.w3.org/ns/activitystreams",
    type: "Accept",
    actor: "urn:ame:corpus-management-team",
    object: { id: "urn:sha256:projection", type: "PriorResearchProjectionResult", contextualBundle, contextualBundleDigest: recordDigest(contextualBundle), gapBundle, gapBundleDigest: recordDigest(gapBundle), filesystemReads: 0 },
  };
  const assignment = {
    kind: "producing-content.assignment",
    assignmentId: "technology-example-revival",
    term: "Example project revival",
    beat: "technology",
    createdAt: NOW,
    status: "assigned",
    priority: 10,
    sourceUrls: [PRIMARY, SECONDARY],
  };
  const priorResearch = {
    contract: "corpus-management-team/recovering-prior-research/v1",
    assignmentId: assignment.assignmentId,
    sourceRecovery: "urn:sha256:source-recovery",
    contextualBundleDigest: recordDigest(contextualBundle),
    gapBundleDigest: recordDigest(gapBundle),
    contextualBundle,
    gapBundle,
    providerResultDigest: recordDigest(providerDelivery),
    providerDelivery,
    filesystemReads: 0,
  };
  const commission = commissionForAssignment({ term: assignment.term, beat: assignment.beat });
  const result = await procureAdmissibleResearchPacket({ assignment, currentEvidence, priorResearch, commission, now: NOW, dataDir, maximumAgeHours: 48 });
  assert.equal(result.packet.selectedCount, 2);
  assert.equal(result.custody.priorResearch.treatment, "context-only");
  assert.equal(result.packet.claims.some((claim) => claim.object.includes("custody transfer")), false);
  assert.equal(readAdmissibleResearchPacket(dataDir, assignment.assignmentId)?.kind, "producing-content.farm.research-packet");
  const successorAssignmentId = `${assignment.assignmentId}:repair:fixture`;
  appendDatedRecord({
    dataRoot: dataDir,
    ledger: "assignments",
    instant: NOW,
    record: {
      kind: "koios.assignment-successor-witness",
      at: NOW,
      predecessorAssignmentId: assignment.assignmentId,
      assignment: { ...assignment, assignmentId: successorAssignmentId },
    },
  });
  assert.equal(recordDigest(readAdmissibleResearchPacket(dataDir, successorAssignmentId)), result.packetDigest);
});
