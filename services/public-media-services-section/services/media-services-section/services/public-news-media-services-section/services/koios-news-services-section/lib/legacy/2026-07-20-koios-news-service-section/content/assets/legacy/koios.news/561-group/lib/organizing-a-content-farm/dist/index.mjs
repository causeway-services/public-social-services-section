/**
 * @emsenn/organizing-a-content-farm
 *
 * A content farm is a knowledge-vault specialization: it keeps a corpus and run
 * memory, receives newscables as wired input, and cultivates producing-content
 * farm outputs from that irrigated knowledge store.
 */
import { Type } from "@sinclair/typebox";
import { carrierFrom, carrierToTerm } from "@emsenn/relating";
import { jsonResource } from "@emsenn/relating/writing";
export * from "@emsenn/producing-content/content-farm";
export { sourceRollReading, sourceRollTerm, } from "@emsenn/producing-content/organizing-a-newscable";
export const ContentFarmKnowledgeVaultSchema = Type.Object({
    kind: Type.Literal("organizing.content-farm.knowledge-vault"),
    property: Type.String({ minLength: 1 }),
    contentDir: Type.String({ minLength: 1 }),
    dataDir: Type.String({ minLength: 1 }),
    vaultPath: Type.String({ minLength: 1 }),
    catalogTotal: Type.Integer({ minimum: 0 }),
    newscableConfigPath: Type.String({ minLength: 1 }),
    wireCount: Type.Integer({ minimum: 0 }),
    sourceCount: Type.Integer({ minimum: 0 }),
    seedCount: Type.Integer({ minimum: 0 }),
}, {
    $id: "organizing/content-farm/knowledge-vault",
    title: "ContentFarmKnowledgeVault",
    additionalProperties: false,
});
export const contentFarmKnowledgeVaultCarrier = carrierFrom(ContentFarmKnowledgeVaultSchema);
export function contentFarmKnowledgeVault(input) {
    return contentFarmKnowledgeVaultCarrier.assert({
        kind: "organizing.content-farm.knowledge-vault",
        property: input.property.name,
        contentDir: input.property.contentDir,
        dataDir: input.property.dataDir,
        vaultPath: input.vault.path,
        catalogTotal: input.vault.entries.length,
        newscableConfigPath: input.newscable.configPath,
        wireCount: input.newscable.wireCount,
        sourceCount: input.newscable.sourceCount,
        seedCount: input.property.seeds.length,
    }, "content farm knowledge vault");
}
export function contentFarmKnowledgeVaultTerm(input) {
    return carrierToTerm(jsonResource(contentFarmKnowledgeVaultCarrier.assert(input), "content farm knowledge vault"));
}
//# sourceMappingURL=index.mjs.map