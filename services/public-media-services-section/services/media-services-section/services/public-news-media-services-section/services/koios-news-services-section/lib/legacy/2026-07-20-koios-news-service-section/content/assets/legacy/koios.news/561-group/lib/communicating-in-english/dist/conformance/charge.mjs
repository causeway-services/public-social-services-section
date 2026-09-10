import { mark, negate, witnessedPotential, } from "@emsenn/relating-experimental";
const isMark = (value) => typeof value === "object" && value !== null && "kind" in value && value.kind === "utterance.mark";
const witnessMark = (witness) => isMark(witness) ? witness : mark(witness);
export const compliant = (witness) => witnessedPotential(witnessMark(witness));
export const violation = (witness) => negate(compliant(witness));
//# sourceMappingURL=charge.mjs.map