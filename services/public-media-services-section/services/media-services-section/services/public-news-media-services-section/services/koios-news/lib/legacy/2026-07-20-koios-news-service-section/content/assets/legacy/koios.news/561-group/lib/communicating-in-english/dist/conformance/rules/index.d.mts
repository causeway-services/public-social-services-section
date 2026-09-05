import type { Rule } from "../types.mjs";
export type { Rule } from "../types.mjs";
export { weaselRules } from "./weasel.mjs";
export { wordyRules } from "./wordy.mjs";
export { jargonRules } from "./jargon.mjs";
export { passiveRule } from "./passive.mjs";
export { clicheRules } from "./cliche.mjs";
export { doubletRules } from "./doublet.mjs";
export { spellingRules } from "./spelling.mjs";
export { nominalizationRules } from "./nominalization.mjs";
export { oneIdeaPerSentenceRule, expletiveOpeningRule, structureRules } from "./structure.mjs";
export { acronymRule, acronymRules } from "./acronym.mjs";
export { preferContractionsRule, avoidContractionsRule, contractionRules } from "./register.mjs";
export { abstractRules, ruleImplications } from "./implications.mjs";
/** All rules in the default corpus. */
export declare const allRules: readonly Rule[];
//# sourceMappingURL=index.d.mts.map