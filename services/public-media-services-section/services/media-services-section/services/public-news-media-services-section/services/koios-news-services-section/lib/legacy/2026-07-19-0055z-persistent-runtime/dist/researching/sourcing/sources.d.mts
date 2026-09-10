import { type SourceRollReading as CableSourceRollReading, type SourceRollSource as CableSourceRollSource, type SourceRollWire as CableSourceRollWire } from "@emsenn/organizing-a-newscable";
import type { SourceKind } from "./bibliography.mjs";
export type IntakeSourceClass = "general-news" | "specialist-news" | "formal-research" | "institutional" | "professional-society" | "policy-research" | "unknown";
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
export declare function sourceRollReading(options?: Readonly<{
    configPath?: string;
    now?: () => string;
}>): SourceRollReading;
//# sourceMappingURL=sources.d.mts.map