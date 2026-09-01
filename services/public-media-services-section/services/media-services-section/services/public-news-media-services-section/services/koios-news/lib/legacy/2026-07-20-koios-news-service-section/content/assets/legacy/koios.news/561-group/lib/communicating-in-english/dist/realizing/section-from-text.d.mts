import type { SectionSpec } from "./types.mjs";
import type { CompiledBundle } from "@emsenn/communicating/speaking/listening/algebra";
/** Parse prose with the listening layer and lift its role/polarity/tense reading into a settled section. */
export declare function sectionFromText(text: string, bundle?: CompiledBundle): SectionSpec;
export default sectionFromText;
//# sourceMappingURL=section-from-text.d.mts.map