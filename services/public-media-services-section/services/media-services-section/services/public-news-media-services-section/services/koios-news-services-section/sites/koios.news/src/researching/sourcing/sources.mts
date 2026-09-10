// researching/sourcing/sources — the configured Koios intake source roll.
//
// Bibliography readings show what published articles cite. This Koios face adds
// editorial classification to the upstream producing-content cable source roll:
// configured feeds, their beat, role, source class, and local wire evidence.

import {
  sourceRollReading as cableSourceRollReading,
  type SourceRollClassifier,
  type SourceRollReading as CableSourceRollReading,
  type SourceRollSource as CableSourceRollSource,
  type SourceRollWire as CableSourceRollWire,
} from "@red-cup-engineering/organizing-a-newscable";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mts";
import type { SourceKind } from "./bibliography.mts";

export type IntakeSourceClass =
  | "general-news"
  | "specialist-news"
  | "formal-research"
  | "institutional"
  | "professional-society"
  | "policy-research"
  | "unknown";

export type IntakeSourceReading = Omit<CableSourceRollSource, "sourceKind" | "sourceClass"> & Readonly<{
  sourceKind: SourceKind;
  sourceClass: IntakeSourceClass;
}>;

export type IntakeWireReading = Omit<CableSourceRollWire, "sources"> & Readonly<{
  sources: readonly IntakeSourceReading[];
}>;

export type SourceRollReading = Omit<CableSourceRollReading, "wires"> & Readonly<{
  wires: readonly IntakeWireReading[];
}>;

const classify: SourceRollClassifier = ({ domain }): Readonly<{ sourceKind: SourceKind; sourceClass: IntakeSourceClass; editorialRole: string }> => {
  switch (domain) {
    case "nature.com":
    case "pnas.org":
    case "science.org":
    case "arxiv.org":
    case "nber.org":
      return Object.freeze({
        sourceKind: "academic-journal" as const,
        sourceClass: "formal-research" as const,
        editorialRole: "Formal or pre-publication research signal for claims that need more than headline-level support.",
      });
    case "federalreserve.gov":
      return Object.freeze({
        sourceKind: "professional-journal" as const,
        sourceClass: "institutional" as const,
        editorialRole: "Institutional primary-source signal for monetary, banking, payment, and macroeconomic policy.",
      });
    case "spectrum.ieee.org":
      return Object.freeze({
        sourceKind: "professional-journal" as const,
        sourceClass: "professional-society" as const,
        editorialRole: "Professional engineering signal for technical systems, infrastructure, robotics, and AI practice.",
      });
    case "carbonbrief.org":
    case "insideclimatenews.org":
    case "grist.org":
    case "npr.org":
    case "bellingcat.com":
      return Object.freeze({
        sourceKind: "independent-website" as const,
        sourceClass: "specialist-news" as const,
        editorialRole: "Specialist journalism signal with beat expertise and public-interest framing.",
      });
    case "isdglobal.org":
    case "gnet-research.org":
    case "crisisgroup.org":
    case "warontherocks.com":
      return Object.freeze({
        sourceKind: "professional-journal" as const,
        sourceClass: "policy-research" as const,
        editorialRole: "Strategic-analysis signal from a research institute or policy publication: terrorism, extremism, conflict, and geopolitics studied as a field, not breaking-news wire.",
      });
    case "coindesk.com":
    case "theblock.co":
    case "technologyreview.com":
    case "theregister.com":
    case "arstechnica.com":
      return Object.freeze({
        sourceKind: "commercial-website" as const,
        sourceClass: "specialist-news" as const,
        editorialRole: "Specialist trade/news signal for technology, crypto, and infrastructure market movements.",
      });
    case "theguardian.com":
    case "aljazeera.com":
    case "nytimes.com":
      return Object.freeze({
        sourceKind: "commercial-website" as const,
        sourceClass: "general-news" as const,
        editorialRole: "General newsroom signal for public events, politics, business, and cross-beat developments.",
      });
    default:
      return Object.freeze({
        sourceKind: "unknown" as const,
        sourceClass: "unknown" as const,
        editorialRole: "Configured intake source; classification has not been curated yet.",
      });
  }
};

export function sourceRollReading(options: Readonly<{ configPath?: string; now?: () => string }> = {}): SourceRollReading {
  const roll = cableSourceRollReading({
    configPath: options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG,
    ...(options.now === undefined ? {} : { now: options.now }),
    classify,
    constraints: Object.freeze([
      "This is configured intake, not an endorsement of every item a source publishes.",
      "The wire store is append-only and idempotent; present counts describe locally owned evidence bundles.",
      "Classification is editorial metadata for operators and readers; article bibliographies still cite exact source URLs.",
    ]),
  });
  return {
    ...roll,
    wires: roll.wires.map((wire): IntakeWireReading => ({
      ...wire,
      sources: wire.sources as unknown as readonly IntakeSourceReading[],
    })),
  } as SourceRollReading;
}
