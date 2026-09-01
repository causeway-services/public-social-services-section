// admission.mts — the charge value boundary of the web tier, stated over
// @emsenn/animating trace carriers (and through them the relating topology bedrock).
// The exported names are kept stable for the many middleware call sites:
// positive/negative bits are the truth/falsity evidence sides.
import { chargeNameOfSides, chargeSidesOf } from "@emsenn/animating";
export function chargeValueFromBits(positive, negative) {
    return chargeNameOfSides(positive, negative);
}
export function chargeBits(value) {
    return chargeSidesOf(value);
}
export function chargeValueFromEvidence(items) {
    let positive = false;
    let negative = false;
    for (const item of items) {
        positive ||= Boolean(item.charge.value[0]);
        negative ||= Boolean(item.charge.value[1]);
    }
    return chargeValueFromBits(positive, negative);
}
//# sourceMappingURL=admission.mjs.map