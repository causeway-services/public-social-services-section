/**
 * settling/fixed-point — the least and greatest fixed points in both orders.
 *
 * For each order (knowledge, truth) the closure is run from two seeds — the
 * posit valuation for the least fixed point, and a top-saturated seed for the
 * greatest — yielding the extremal valuations and the gap between them. The four
 * extrema (knowledge/truth × least/greatest) are the complete fixed-point
 * structure a posit presheaf determines.
 */
import { chargeSide } from "../bilattice-charge.mjs";
import {} from "./closure.mjs";
import { fixedPointGap, fixedPointGapInput } from "./fixed-point-gap.mjs";
import { closePredicationValuationClosure, knowledgeValuationClosureOrder, predicationValuationClosureStageOrdinal, predicationValuationClosureProcess, truthValuationClosureOrder, } from "./valuation-closure.mjs";
import {} from "./sheaf.mjs";
const greatestSeedValuation = (freeFalsity) => (valuation) => Object.freeze({
    ...valuation,
    fibers: Object.freeze(valuation.fibers.map((fiber) => Object.freeze({
        ...fiber,
        assignments: Object.freeze(fiber.assignments.map((assignment) => Object.freeze({
            ...assignment,
            charge: Object.freeze({
                kind: "bilattice-charge.carrier",
                value: Object.freeze([
                    assignment.charge.evidence[0].length ? assignment.charge.value[0] : chargeSide("present"),
                    assignment.charge.evidence[1].length ? assignment.charge.value[1] : freeFalsity,
                ]),
                evidence: assignment.charge.evidence,
            }),
        }))),
    }))),
});
const fixedPointSeed = (order, bound, valuation) => Object.freeze({ kind: "predication.valuation.fixedPoint.seed", order, bound, valuation });
const sheafOfClosure = (closure) => Object.freeze({ kind: "predication.valuation.sheaf.carrier", section: closure.value });
const valuationClosureOrderOf = (name) => name === "knowledge" ? knowledgeValuationClosureOrder : truthValuationClosureOrder;
const greatestFreeFalsity = (name) => name === "knowledge" ? chargeSide("present") : chargeSide("absent");
const fixedPointOrderObject = (valuationClosureOrder) => Object.freeze({ kind: "predication.valuation.fixedPoint.orderObject", valuationClosureOrder });
const fixedPointBoundObject = (name) => Object.freeze({ kind: "predication.valuation.fixedPoint.boundObject", name });
class FixedPointComputation {
    positCarrier;
    constructor(positCarrier) {
        this.positCarrier = positCarrier;
    }
    order(name) {
        return fixedPointOrderObject(valuationClosureOrderOf(name));
    }
    seed(order, bound) {
        const source = this.positCarrier.traces[0];
        const valuation = bound.name === "least"
            ? source
            : greatestSeedValuation(greatestFreeFalsity(order.valuationClosureOrder.name))(source);
        return fixedPointSeed(order, bound, valuation);
    }
    extremum(order, boundName) {
        const bound = fixedPointBoundObject(boundName);
        const seed = this.seed(order, bound);
        const closure = closePredicationValuationClosure(predicationValuationClosureProcess(order.valuationClosureOrder, seed.valuation)).closure;
        const fixedPoint = closure.stabilization.kind === "ordinal.closure.stabilization:witness"
            ? Object.freeze({
                kind: "predication.valuation.fixedPoint:witness",
                order,
                bound,
                stabilizationStage: predicationValuationClosureStageOrdinal(closure.stabilization.ordinal),
                value: closure.stabilization.value,
            })
            : Object.freeze({ kind: "predication.valuation.fixedPoint-obstruction", order, bound, value: closure.stabilization.value });
        return Object.freeze({
            kind: "predication.valuation.fixedPoint.extremum",
            order,
            bound,
            seed,
            closure,
            fixedPoint,
            sheaf: sheafOfClosure(closure),
        });
    }
    orderCarrier(name) {
        const order = this.order(name);
        const least = this.extremum(order, "least");
        const greatest = this.extremum(order, "greatest");
        return Object.freeze({
            kind: "predication.valuation.fixedPoint.order",
            order,
            least,
            greatest,
            gap: fixedPointGap(fixedPointGapInput(order, least, greatest)),
        });
    }
    carrier() {
        return Object.freeze({
            kind: "predication.valuation.fixedPoint.carrier",
            knowledge: this.orderCarrier("knowledge"),
            truth: this.orderCarrier("truth"),
        });
    }
}
/** The complete fixed-point structure of a posit presheaf. */
export function fixedPoints(p) {
    return new FixedPointComputation(p).carrier();
}
//# sourceMappingURL=fixed-point.mjs.map