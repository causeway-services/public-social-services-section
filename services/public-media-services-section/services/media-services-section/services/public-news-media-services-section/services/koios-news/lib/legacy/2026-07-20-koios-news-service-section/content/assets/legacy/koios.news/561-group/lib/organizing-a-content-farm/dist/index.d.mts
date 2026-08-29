/**
 * @emsenn/organizing-a-content-farm
 *
 * A content farm is a knowledge-vault specialization: it keeps a corpus and run
 * memory, receives newscables as wired input, and cultivates producing-content
 * farm outputs from that irrigated knowledge store.
 */
import { type Static } from "@sinclair/typebox";
import { type Tm } from "@emsenn/relating";
import type { Listing } from "@emsenn/organizing-a-knowledge-vault";
import type { FarmProperty } from "@emsenn/producing-content/content-farm";
import type { SourceRollReading } from "@emsenn/producing-content/organizing-a-newscable";
export * from "@emsenn/producing-content/content-farm";
export { sourceRollReading, sourceRollTerm, type SourceRollReading, type SourceRollSource, type SourceRollWire, } from "@emsenn/producing-content/organizing-a-newscable";
export declare const ContentFarmKnowledgeVaultSchema: import("@sinclair/typebox").TObject<{
    kind: import("@sinclair/typebox").TLiteral<"organizing.content-farm.knowledge-vault">;
    property: import("@sinclair/typebox").TString;
    contentDir: import("@sinclair/typebox").TString;
    dataDir: import("@sinclair/typebox").TString;
    vaultPath: import("@sinclair/typebox").TString;
    catalogTotal: import("@sinclair/typebox").TInteger;
    newscableConfigPath: import("@sinclair/typebox").TString;
    wireCount: import("@sinclair/typebox").TInteger;
    sourceCount: import("@sinclair/typebox").TInteger;
    seedCount: import("@sinclair/typebox").TInteger;
}>;
export type ContentFarmKnowledgeVault = Static<typeof ContentFarmKnowledgeVaultSchema>;
export declare const contentFarmKnowledgeVaultCarrier: import("@emsenn/relating").Carrier<unknown>;
export declare function contentFarmKnowledgeVault(input: Readonly<{
    property: FarmProperty;
    vault: Listing;
    newscable: SourceRollReading;
}>): ContentFarmKnowledgeVault;
export declare function contentFarmKnowledgeVaultTerm(input: ContentFarmKnowledgeVault): Tm;
//# sourceMappingURL=index.d.mts.map