// researching/sourcing/farm-vault - Koios's content farm as an irrigated vault.

import {
  irrigatedContentFarmCorpusRoot,
  type ContentFarmCorpusRoot,
} from "@red-cup-engineering/organizing-a-content-farm";

import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "../../config.mts";
import { koiosFarmProperty } from "../../demand.mts";

export type FarmVaultReading = ContentFarmCorpusRoot;

export function farmVaultReading(options: Readonly<{
  configPath?: string;
  now?: () => string;
}> = {}): FarmVaultReading {
  const configPath = options.configPath ?? DEFAULT_CONTENT_PRODUCTION_CONFIG;
  return irrigatedContentFarmCorpusRoot({
    property: koiosFarmProperty(configPath),
    newscableConfigPath: configPath,
    ...(options.now === undefined ? {} : { now: options.now }),
  });
}
