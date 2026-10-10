import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describeEbookEditionSource, fabricateEbookEdition } from "@red-cup-engineering/ebook-production-services-section/scripts/fabricate-ebook-edition.mjs";

const NODE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const WORK_ORDER_PATH = join(NODE_ROOT, "content", "edition-work-orders", "the-agent-operators-handbook.md");

function sha256(value) { return `sha256:${createHash("sha256").update(value).digest("hex")}`; }
function span(lines, statement) {
  const line = lines.indexOf(statement);
  if (line === -1) throw new Error(`Handbook edition work order is missing: ${statement}`);
  return { type: "ArtifactFabricationSourceSpan", startLine: line + 1, endLine: line + 1 };
}

export function handbookEditionWorkOrder(editionInputDigest) {
  const text = readFileSync(WORK_ORDER_PATH, "utf8");
  const lines = text.split("\n");
  const clause = (statement) => span(lines, statement);
  const sourceSpan = { type: "ArtifactFabricationSourceSpan", startLine: 1, endLine: lines.length };
  const requirement = "Produce EPUB and screen PDF from the declared edition input.";
  const prohibition = "Do not treat renderer success as editorial proof acceptance, sale authorization, public listing permission, EPUB conformance, accessibility conformance, or print readiness.";
  const authorityBoundary = "Treat editorial proof acceptance, release authority, payment, and public listing permission as separate from technical fabrication.";
  const epubStandard = "EPUB 3.3 conformance requires a separately recorded assay.";
  const fixedProfile = "Use only the epub-screen-pdf-v1 fixed renderer profile.";
  const editorialAcceptance = "Editorial proof acceptance remains an external review obligation.";
  const epubAcceptance = "EPUB conformance assay remains an external assay obligation.";
  const constraintIds = ["authority-boundary", "epub-33", "fixed-profile"];
  const acceptanceObligationIds = ["editorial-proof", "epub-conformance"];
  const projections = ["epub", "screen-pdf"].map((id) => ({
    type: "ArtifactFabricationProjection", version: 1, id, target: id,
    configuration: { profile: "epub-screen-pdf-v1", editionInputDigest },
    sourceSpan: clause(id === "epub" ? "EPUB projection." : "Screen-PDF projection."),
  }));
  return {
    type: "ArtifactFabricationSpecificationCandidate", version: 1,
    source: { type: "ArtifactFabricationSource", version: 1, identity: { type: "ArtifactFabricationSourceIdentity", id: "the-agent-operators-handbook-edition-work-order" }, provenance: { type: "ArtifactFabricationSourceProvenance", locator: "content/edition-work-orders/the-agent-operators-handbook.md", digest: sha256(text), sourceSpan } },
    artifact: { type: "FabricatedArtifactIdentity", version: 1, id: "the-agent-operators-handbook-edition", kind: "ebook-edition" },
    requirements: [{ type: "ArtifactFabricationRequirement", version: 1, id: "digital-edition", statement: requirement, sourceSpan: clause(requirement) }],
    prohibitions: [{ type: "ArtifactFabricationProhibition", version: 1, id: "no-implied-acceptance", statement: prohibition, sourceSpan: clause(prohibition) }],
    openQuestions: [],
    constraints: [
      { type: "ArtifactFabricationConstraint", version: 1, id: "authority-boundary", kind: "law", authority: "Binding Generations publishing program", revision: "2026-09-02", locator: "561-group-enterprise-project-management-services-section/content/text/documents/articles/specifications/2026-09-02-binding-generations-publishing-program.md", applicability: "Handbook edition", statement: authorityBoundary, sourceSpan: clause(authorityBoundary) },
      { type: "ArtifactFabricationConstraint", version: 1, id: "epub-33", kind: "standard", authority: "W3C", revision: "EPUB 3.3", locator: "w3.org/TR/epub-33/", applicability: "EPUB projection", statement: epubStandard, sourceSpan: clause(epubStandard) },
      { type: "ArtifactFabricationConstraint", version: 1, id: "fixed-profile", kind: "operational", authority: "Ebook Production Services Section", revision: "0.2.1", locator: "@red-cup-engineering/ebook-production-services-section", applicability: "digital projections", statement: fixedProfile, sourceSpan: clause(fixedProfile) },
    ],
    projections,
    acceptanceObligations: [
      { type: "ArtifactFabricationAcceptanceObligation", version: 1, id: "editorial-proof", kind: "review", statement: editorialAcceptance, sourceSpan: clause(editorialAcceptance) },
      { type: "ArtifactFabricationAcceptanceObligation", version: 1, id: "epub-conformance", kind: "assay", statement: epubAcceptance, sourceSpan: clause(epubAcceptance) },
    ],
    traceability: ["digital-edition", "no-implied-acceptance"].map((requirementId) => ({ type: "ArtifactFabricationTrace", version: 1, requirementId, constraintIds, projectionIds: ["epub", "screen-pdf"], acceptanceObligationIds })),
  };
}

/** Builds the Handbook using its actual work order and leaves external acceptance pending. */
export async function buildEbook(options = {}) {
  const source = {
    slug: options.slug ?? "the-agent-operators-handbook",
    title: options.title ?? "The Agent Operator's Handbook",
    subtitle: options.subtitle ?? "A Field Guide to Dispatching, Steering, and Recovering Multiple AI Coding Agents at Once",
    author: options.author ?? "561 Group",
    bookDir: options.bookDir ?? join(NODE_ROOT, "content/books", options.slug ?? "the-agent-operators-handbook"),
    distDir: options.distDir ?? join(NODE_ROOT, "dist", options.slug ?? "the-agent-operators-handbook"),
  };
  const description = describeEbookEditionSource(source);
  if (description.type === "EbookEditionSourceDescriptionRefusal") return description;
  return fabricateEbookEdition(handbookEditionWorkOrder(description.editionInputDigest), source);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  buildEbook().then((result) => {
    console.log(JSON.stringify(result, null, 2));
    if (result.status === "refused" || result.status === "failed") process.exitCode = 1;
  }).catch((error) => { console.error(error); process.exitCode = 1; });
}
