/**
 * positing/logic/bilattice-linear-logic — multiplicative linear logic over FOUR.
 *
 * Fusion (tensor ⊗), residuum (linear implication ⊸), negation, and par on the
 * four charge values, computed coordinate-wise over the truth/falsity sides:
 * fusion is side-product on truth and side-implication on falsity; residuum is
 * its adjoint. The multiplicative unit is `stable`; `absurd`/`potential`/`active`
 * are the consistent values. Self-contained over the charge algebra.
 */
import { charge, chargeSide, chargeValue, joinTruthValue, sameChargeValue, valueOf, } from "../bilattice-charge.mjs";
const sidePresent = (side) => side.name === "present";
const sideMeet = (left, right) => sidePresent(left) && sidePresent(right) ? chargeSide("present") : chargeSide("absent");
const sideProduct = sideMeet;
const sideImplication = (left, right) => sidePresent(left) && !sidePresent(right) ? chargeSide("absent") : chargeSide("present");
const coordinates = (value) => charge(value).value;
const valueFromCoordinates = (truth, falsity) => valueOf(Object.freeze({
    kind: "bilattice-charge.carrier",
    value: Object.freeze([truth, falsity]),
    evidence: Object.freeze([Object.freeze([]), Object.freeze([])]),
}));
/** The multiplicative unit: the "stable" value. */
export const linearMultiplicativeUnit = chargeValue("stable");
/** The consistent charge values: absurd, potential, active. */
export const consistentChargeValues = Object.freeze([chargeValue("absurd"), chargeValue("potential"), chargeValue("active")]);
/** Multiplicative conjunction (tensor ⊗) of two charge values. */
export function linearFusionValue(left, right) {
    const [leftTruth, leftFalsity] = coordinates(left);
    const [rightTruth, rightFalsity] = coordinates(right);
    return valueFromCoordinates(sideProduct(leftTruth, rightTruth), sideMeet(sideImplication(leftTruth, rightFalsity), sideImplication(rightTruth, leftFalsity)));
}
/** Linear implication (residuum ⊸) of two charge values. */
export function linearResiduumValue(left, right) {
    const [leftTruth, leftFalsity] = coordinates(left);
    const [rightTruth, rightFalsity] = coordinates(right);
    return valueFromCoordinates(sideMeet(sideImplication(leftTruth, rightTruth), sideImplication(rightFalsity, leftFalsity)), sideProduct(leftTruth, rightFalsity));
}
/** Linear negation: the residuum against the multiplicative unit. */
export function linearNegationValue(value) {
    return linearResiduumValue(value, linearMultiplicativeUnit);
}
/** Multiplicative disjunction (par ⅋): the De Morgan dual of fusion. */
export function linearParValue(left, right) {
    return linearNegationValue(linearFusionValue(linearNegationValue(left), linearNegationValue(right)));
}
/** Whether a charge value is consistent (truth and falsity not both present). */
export function chargeConsistency(value) {
    const [truth, falsity] = coordinates(value);
    return !(sidePresent(truth) && sidePresent(falsity))
        ? Object.freeze({ kind: "bilattice.linearLogic.chargeConsistency:witness", value })
        : Object.freeze({ kind: "bilattice.linearLogic.chargeConsistency-obstruction", value });
}
/** Check the fusion/residuation adjunction at (left, right, bound) in the truth order. */
export function truthOrderResiduation(left, right, bound) {
    const residualBound = linearResiduumValue(right, bound);
    const fusionBound = joinTruthValue(linearFusionValue(left, right), bound);
    const residualOrder = joinTruthValue(left, residualBound);
    const fusionLeqBound = sameChargeValue(fusionBound, bound);
    const leftLeqResidual = sameChargeValue(residualOrder, residualBound);
    return fusionLeqBound === leftLeqResidual
        ? Object.freeze({ kind: "bilattice.linearLogic.truthOrderResiduation:witness", left, right, bound, fusionBound, residualBound })
        : Object.freeze({ kind: "bilattice.linearLogic.truthOrderResiduation-obstruction", left, right, bound, fusionBound, residualBound });
}
//# sourceMappingURL=bilattice-linear-logic.mjs.map