/**
 * positing/fiber — the predication fiber algebra and the `posit` morphism.
 *
 * Value enters predication by evidence. A `Meme` binds one cell to a charge; a
 * `FiberAlgebra` collects the charged cells over one predicate; a `Valuation` is
 * one fiber per predicate over a base. A `PredicateFiber` reads a charge value at
 * each subject/object pair, and the generators (converse, subject/object
 * projection, specialization) move fibers along the base with pullback / ∃ / ∀.
 * `posit` values a predication site as fibers and exposes the initial presheaf
 * trace settlement closes over.
 *
 * Coincidence is structural (the package's boundary-first stance); the linear
 * connectives come from positing/logic directly, not a heavy barrel.
 */
import { cellCoincides, entitySet, isCell, predicateCoincides, termCoincides, } from "../predication.mjs";
import { bottom, charge, chargeValue, isCharge, joinKnowledge, joinKnowledgeValue, joinTruthValue, meetKnowledgeValue, meetTruthValue, sameChargeValue, valueOf, witnessedPotential, } from "./bilattice-charge.mjs";
import { linearFusionValue, linearResiduumValue } from "./logic/bilattice-linear-logic.mjs";
import { presheaf } from "./settling/sheaf.mjs";
/** The knowledge order: absurd bottom, stable top. */
export function knowledgeOrder() {
    return Object.freeze({
        kind: "predication.fiber.order",
        name: "knowledge",
        join: joinKnowledgeValue,
        meet: meetKnowledgeValue,
        bottom: chargeValue("absurd"),
        top: chargeValue("stable"),
    });
}
/** The truth order: active bottom, potential top. */
export function truthOrder() {
    return Object.freeze({
        kind: "predication.fiber.order",
        name: "truth",
        join: joinTruthValue,
        meet: meetTruthValue,
        bottom: chargeValue("active"),
        top: chargeValue("potential"),
    });
}
const predicateFiberCellsCoincide = (left, right) => termCoincides(left[0], right[0]) && termCoincides(left[1], right[1]);
/** Compare two predicate fiber cells by term coincidence. */
export function predicateFiberCellIdentity(left, right) {
    return predicateFiberCellsCoincide(left, right)
        ? Object.freeze({ kind: "predication.fiber.cellIdentity:witness", left, right })
        : Object.freeze({ kind: "predication.fiber.cellIdentity-obstruction", left, right });
}
/** Construct a meme binding a cell to a charge. */
export function meme(cell, charge) {
    return Object.freeze({ kind: "predication.fiber.meme", cell, charge });
}
/** Type guard for a meme. */
export function isMeme(value) {
    const kind = "kind" in value ? value.kind : undefined;
    const cell = "cell" in value ? value.cell : undefined;
    const charge = "charge" in value ? value.charge : undefined;
    return kind === "predication.fiber.meme"
        && typeof cell === "object" && cell !== null
        && typeof charge === "object" && charge !== null
        && isCell(cell) && isCharge(charge);
}
/** Every ordered subject/object pair over an entity set. */
export function allCells(entities) {
    return Object.freeze(entities.entities.flatMap((subject) => entities.entities.map((object) => Object.freeze([subject, object]))));
}
/** Build a predicate fiber from a label, entities, and a charge-value reader. */
export function predicateFiber(label, entities, read, cells = allCells(entities), readCharge) {
    const values = cells.map((fiberCell) => Object.freeze({ cell: fiberCell, value: read(fiberCell[0], fiberCell[1]) }));
    const at = (subject, object) => values.find((entry) => predicateFiberCellsCoincide(entry.cell, [subject, object]))?.value ?? chargeValue("absurd");
    return Object.freeze(readCharge === undefined
        ? { kind: "predication.fiber.predicate", label, entities, cells: Object.freeze([...cells]), at }
        : { kind: "predication.fiber.predicate", label, entities, cells: Object.freeze([...cells]), at, chargeAt: readCharge });
}
/** Project a fiber algebra into a predicate fiber. */
export function fiberFromAlgebra(algebra) {
    const entities = algebra.entities;
    const entries = algebra.assignments.map((assignment) => Object.freeze({
        cell: Object.freeze([assignment.cell.subject, assignment.cell.object]),
        charge: assignment.charge,
    }));
    const chargeOf = (subject, object) => entries.find((entry) => predicateFiberCellsCoincide(entry.cell, [subject, object]))?.charge ?? charge(chargeValue("absurd"));
    return predicateFiber(algebra.predicate, entities, (subject, object) => valueOf(chargeOf(subject, object)), allCells(entities), chargeOf);
}
function cellwiseLinear(operation, left, right, cells = left.cells) {
    return predicateFiber(left.label, left.entities, (subject, object) => operation(left.at(subject, object), right.at(subject, object)), cells);
}
function samePredicateFiber(left, right, cells = left.cells) {
    return cells.every(([subject, object]) => sameChargeValue(left.at(subject, object), right.at(subject, object)));
}
/** The cellwise linear fusion of two predicate fibers. */
export function predicationFiberLinearFusion(left, right, cells = left.cells) {
    return cellwiseLinear(linearFusionValue, left, right, cells);
}
/** The cellwise linear residuum of two predicate fibers. */
export function predicationFiberLinearResiduum(left, right, cells = left.cells) {
    return cellwiseLinear(linearResiduumValue, left, right, cells);
}
/** Whether the left fiber is below the right under the truth order. */
export function leqTruthPredicateFiber(left, right, cells = left.cells) {
    const order = truthOrder();
    return cells.every(([subject, object]) => sameChargeValue(order.join(left.at(subject, object), right.at(subject, object)), right.at(subject, object)));
}
/** Whether a generator's pullback commutes with linear fusion. */
export function generatorPreservesLinearFusion(generator, left, right) {
    const pulledFusion = generator.pullback(predicationFiberLinearFusion(left, right, generator.domain));
    const fusionOfPullbacks = predicationFiberLinearFusion(generator.pullback(left), generator.pullback(right), generator.codomain);
    return samePredicateFiber(pulledFusion, fusionOfPullbacks, generator.codomain);
}
/** Whether a generator's pullback commutes with linear residuum. */
export function generatorPreservesLinearResiduum(generator, left, right) {
    const pulledResiduum = generator.pullback(predicationFiberLinearResiduum(left, right, generator.domain));
    const residuumOfPullbacks = predicationFiberLinearResiduum(generator.pullback(left), generator.pullback(right), generator.codomain);
    return samePredicateFiber(pulledResiduum, residuumOfPullbacks, generator.codomain);
}
/** The Frobenius reciprocity law for a generator over an order. */
export function generatorSatisfiesLinearFusionFrobenius(generator, order, alpha, phi) {
    const left = generator.exists(order, predicationFiberLinearFusion(generator.pullback(alpha), phi, generator.codomain));
    const right = predicationFiberLinearFusion(alpha, generator.exists(order, phi), generator.domain);
    return samePredicateFiber(left, right, generator.domain);
}
const foldJoin = (order, values) => values.reduce((acc, item) => order.join(acc, item), order.bottom);
const foldMeet = (order, values) => values.reduce((acc, item) => order.meet(acc, item), order.top);
/** The converse generator: swaps subject and object. */
export function converse(entities) {
    const cells = allCells(entities);
    return Object.freeze({
        kind: "predication.fiber.generator",
        generator: "converse",
        domain: cells,
        codomain: cells,
        pullback: (source) => predicateFiber(source.label, source.entities, (subject, object) => source.at(object, subject), cells),
        exists: (_order, source) => predicateFiber(source.label, source.entities, (subject, object) => source.at(object, subject), cells),
        forall: (_order, source) => predicateFiber(source.label, source.entities, (subject, object) => source.at(object, subject), cells),
    });
}
/** The subject-projection generator. */
export function subjectProjection(entities) {
    const cells = allCells(entities);
    return Object.freeze({
        kind: "predication.fiber.generator",
        generator: "subject-projection",
        domain: cells,
        codomain: cells,
        pullback: (source) => predicateFiber(source.label, source.entities, (subject) => source.at(subject, subject), cells),
        exists: (order, source) => predicateFiber(source.label, source.entities, (subject, object) => termCoincides(subject, object) ? foldJoin(order, source.entities.entities.map((item) => source.at(subject, item))) : order.bottom, cells),
        forall: (order, source) => predicateFiber(source.label, source.entities, (subject, object) => termCoincides(subject, object) ? foldMeet(order, source.entities.entities.map((item) => source.at(subject, item))) : order.top, cells),
    });
}
/** The object-projection generator. */
export function objectProjection(entities) {
    const cells = allCells(entities);
    return Object.freeze({
        kind: "predication.fiber.generator",
        generator: "object-projection",
        domain: cells,
        codomain: cells,
        pullback: (source) => predicateFiber(source.label, source.entities, (_subject, object) => source.at(object, object), cells),
        exists: (order, source) => predicateFiber(source.label, source.entities, (subject, object) => termCoincides(subject, object) ? foldJoin(order, source.entities.entities.map((item) => source.at(item, object))) : order.bottom, cells),
        forall: (order, source) => predicateFiber(source.label, source.entities, (subject, object) => termCoincides(subject, object) ? foldMeet(order, source.entities.entities.map((item) => source.at(item, object))) : order.top, cells),
    });
}
/** The specialization generator restricting an ambient cell set to a support subset. */
export function specialization(entities, support, ambient = allCells(entities)) {
    return Object.freeze({
        kind: "predication.fiber.generator",
        generator: "specialization",
        domain: ambient,
        codomain: Object.freeze([...support]),
        pullback: (source) => predicateFiber(source.label, source.entities, (subject, object) => source.at(subject, object), support),
        exists: (order, source) => predicateFiber(source.label, source.entities, (subject, object) => support.some((cell) => predicateFiberCellsCoincide(cell, [subject, object])) ? source.at(subject, object) : order.bottom, ambient),
        forall: (order, source) => predicateFiber(source.label, source.entities, (subject, object) => support.some((cell) => predicateFiberCellsCoincide(cell, [subject, object])) ? source.at(subject, object) : order.top, ambient),
    });
}
/** Build the fibered valuation carrier from a site: each cell witnessed-potential by its subject. */
export function fiberCarrier(predication) {
    const fibers = predication.cells.predicates.predicates.map((predicate) => {
        const cells = predication.cells.cells
            .filter((c) => predicateCoincides(c.predicate, predicate))
            .map((c) => meme(c, witnessedPotential(c.subject.mark)));
        return Object.freeze({
            kind: "predication.fiber.algebra",
            predicate,
            entities: predication.cells.entities,
            assignments: Object.freeze(cells),
        });
    });
    return Object.freeze({
        kind: "predication.fiber.carrier",
        predication,
        valuation: Object.freeze({ kind: "predication.fiber.valuation", base: predication.base, fibers: Object.freeze(fibers) }),
    });
}
/** Posit a predication site into the presheaf settlement reads. */
export function posit(predication) {
    return presheaf(fiberCarrier(predication));
}
/** Fold a list of memes into a valuation over a base, combining coincident cells by knowledge join. */
export function composeFibers(memes, base) {
    const byPredicate = [];
    for (const m of memes) {
        const bucket = byPredicate.find((item) => predicateCoincides(item.predicate, m.cell.predicate));
        if (bucket) {
            const index = bucket.assignments.findIndex((a) => cellCoincides(a.cell, m.cell));
            if (index >= 0) {
                const prior = bucket.assignments[index];
                bucket.assignments[index] = meme(m.cell, joinKnowledge(prior.charge, m.charge));
            }
            else
                bucket.assignments.push(m);
        }
        else
            byPredicate.push({ predicate: m.cell.predicate, assignments: [m] });
    }
    const fibers = byPredicate.map(({ predicate, assignments }) => Object.freeze({
        kind: "predication.fiber.algebra",
        predicate,
        entities: entitySet(assignments.flatMap((m) => [m.cell.subject, m.cell.object]), termCoincides),
        assignments: Object.freeze(assignments),
    }));
    return Object.freeze({ kind: "predication.fiber.valuation", base, fibers: Object.freeze(fibers) });
}
/** The charge a valuation assigns to a cell, or bottom when none coincides. */
export function chargeAt(valuation, cell) {
    for (const fiber of valuation.fibers) {
        for (const assignment of fiber.assignments)
            if (cellCoincides(assignment.cell, cell))
                return assignment.charge;
    }
    return bottom;
}
/** Convert a predicate fiber back into a valuation over a base. */
export function valuationFromPredicateFiber(fiber, base) {
    const assignments = fiber.cells.map(([subject, object]) => meme({ subject, predicate: fiber.label, object }, fiber.chargeAt?.(subject, object) ?? charge(fiber.at(subject, object))));
    return Object.freeze({
        kind: "predication.fiber.valuation",
        base,
        fibers: Object.freeze([Object.freeze({
                kind: "predication.fiber.algebra",
                predicate: fiber.label,
                entities: fiber.entities,
                assignments: Object.freeze(assignments),
            })]),
    });
}
//# sourceMappingURL=fiber.mjs.map