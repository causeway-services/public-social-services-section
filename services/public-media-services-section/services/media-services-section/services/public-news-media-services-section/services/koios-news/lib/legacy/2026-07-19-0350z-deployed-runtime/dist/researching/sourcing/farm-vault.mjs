// researching/sourcing/farm-vault - Koios's content farm as an irrigated vault.
import { irrigatedContentFarmCorpusRoot, } from "@emsenn/organizing-a-content-farm";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mjs";
import { koiosFarmProperty } from "../../demand.mjs";
export function farmVaultReading(options = {}) {
    const configPath = options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG;
    return irrigatedContentFarmCorpusRoot({
        property: koiosFarmProperty(configPath),
        newscableConfigPath: configPath,
        ...(options.now === undefined ? {} : { now: options.now }),
    });
}
//# sourceMappingURL=farm-vault.mjs.map