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
import { type Cell, type EntitySet, type PredicationPredicate, type PredicationSite, type PredicationTerm } from "../predication.mjs";
import { type ChargeCarrier, type ChargeValue } from "./bilattice-charge.mjs";
import { type PositPresheaf } from "./settling/sheaf.mjs";
/** A charged assignment within a fiber: one cell bound to a charge. */
export interface Meme {
    readonly kind: "predication.fiber.meme";
    readonly cell: Cell;
    readonly charge: ChargeCarrier;
}
/** The fiber over one predicate: its label, entity set, and charged assignments. */
export interface FiberAlgebra {
    readonly kind: "predication.fiber.algebra";
    readonly predicate: PredicationPredicate;
    readonly entities: EntitySet<PredicationTerm>;
    readonly assignments: readonly Meme[];
}
/** A valuation: the base plus one fiber algebra per predicate. */
export interface Valuation {
    readonly kind: "predication.fiber.valuation";
    readonly base: PredicationSite["base"];
    readonly fibers: readonly FiberAlgebra[];
}
/** A predication site paired with its fibered valuation. */
export interface FiberCarrier {
    readonly kind: "predication.fiber.carrier";
    readonly predication: PredicationSite;
    readonly valuation: Valuation;
}
/** The name of one of the two lattice orders on charge values. */
export type OrderName = "knowledge" | "truth";
/** A bounded lattice order on charge values. */
export interface Order {
    readonly kind: "predication.fiber.order";
    readonly name: OrderName;
    readonly join: (left: ChargeValue, right: ChargeValue) => ChargeValue;
    readonly meet: (left: ChargeValue, right: ChargeValue) => ChargeValue;
    readonly bottom: ChargeValue;
    readonly top: ChargeValue;
}
/** The knowledge order: absurd bottom, stable top. */
export declare function knowledgeOrder(): Order;
/** The truth order: active bottom, potential top. */
export declare function truthOrder(): Order;
/** A cell within a predicate fiber: an ordered subject/object pair. */
export type PredicateFiberCell = readonly [subject: PredicationTerm, object: PredicationTerm];
/** Evidence that two predicate fiber cells coincide. */
export interface PredicateFiberCellIdentityWitness {
    readonly kind: "predication.fiber.cellIdentity:witness";
    readonly left: PredicateFiberCell;
    readonly right: PredicateFiberCell;
}
/** Evidence that two predicate fiber cells fail to coincide. */
export interface PredicateFiberCellIdentityObstruction {
    readonly kind: "predication.fiber.cellIdentity-obstruction";
    readonly left: PredicateFiberCell;
    readonly right: PredicateFiberCell;
}
/** The result of comparing two predicate fiber cells. */
export type PredicateFiberCellIdentityJudgment = PredicateFiberCellIdentityWitness | PredicateFiberCellIdentityObstruction;
/** Compare two predicate fiber cells by term coincidence. */
export declare function predicateFiberCellIdentity(left: PredicateFiberCell, right: PredicateFiberCell): PredicateFiberCellIdentityJudgment;
/** A predicate fiber: a labelled predicate over entities, with a charge-value reader. */
export interface PredicateFiber {
    readonly kind: "predication.fiber.predicate";
    readonly label: PredicationPredicate;
    readonly entities: EntitySet<PredicationTerm>;
    readonly cells: readonly PredicateFiberCell[];
    readonly at: (subject: PredicationTerm, object: PredicationTerm) => ChargeValue;
    readonly chargeAt?: (subject: PredicationTerm, object: PredicationTerm) => ChargeCarrier;
}
/** The kind of fiber generator. */
export type GeneratorKind = "specialization" | "converse" | "subject-projection" | "object-projection";
/** A morphism between predicate fibers: pullback, ∃, ∀ along a generator. */
export interface FiberGenerator {
    readonly kind: "predication.fiber.generator";
    readonly generator: GeneratorKind;
    readonly domain: readonly PredicateFiberCell[];
    readonly codomain: readonly PredicateFiberCell[];
    readonly pullback: (fiber: PredicateFiber) => PredicateFiber;
    readonly exists: (order: Order, fiber: PredicateFiber) => PredicateFiber;
    readonly forall: (order: Order, fiber: PredicateFiber) => PredicateFiber;
}
/** Construct a meme binding a cell to a charge. */
export declare function meme(cell: Cell, charge: ChargeCarrier): Meme;
/** Type guard for a meme. */
export declare function isMeme(value: object): value is Meme;
/** Every ordered subject/object pair over an entity set. */
export declare function allCells(entities: EntitySet<PredicationTerm>): readonly PredicateFiberCell[];
/** Build a predicate fiber from a label, entities, and a charge-value reader. */
export declare function predicateFiber(label: PredicationPredicate, entities: EntitySet<PredicationTerm>, read: (subject: PredicationTerm, object: PredicationTerm) => ChargeValue, cells?: readonly PredicateFiberCell[], readCharge?: (subject: PredicationTerm, object: PredicationTerm) => ChargeCarrier): PredicateFiber;
/** Project a fiber algebra into a predicate fiber. */
export declare function fiberFromAlgebra(algebra: FiberAlgebra): PredicateFiber;
/** The cellwise linear fusion of two predicate fibers. */
export declare function predicationFiberLinearFusion(left: PredicateFiber, right: PredicateFiber, cells?: readonly PredicateFiberCell[]): PredicateFiber;
/** The cellwise linear residuum of two predicate fibers. */
export declare function predicationFiberLinearResiduum(left: PredicateFiber, right: PredicateFiber, cells?: readonly PredicateFiberCell[]): PredicateFiber;
/** Whether the left fiber is below the right under the truth order. */
export declare function leqTruthPredicateFiber(left: PredicateFiber, right: PredicateFiber, cells?: readonly PredicateFiberCell[]): boolean;
/** Whether a generator's pullback commutes with linear fusion. */
export declare function generatorPreservesLinearFusion(generator: FiberGenerator, left: PredicateFiber, right: PredicateFiber): boolean;
/** Whether a generator's pullback commutes with linear residuum. */
export declare function generatorPreservesLinearResiduum(generator: FiberGenerator, left: PredicateFiber, right: PredicateFiber): boolean;
/** The Frobenius reciprocity law for a generator over an order. */
export declare function generatorSatisfiesLinearFusionFrobenius(generator: FiberGenerator, order: Order, alpha: PredicateFiber, phi: PredicateFiber): boolean;
/** The converse generator: swaps subject and object. */
export declare function converse(entities: EntitySet): FiberGenerator;
/** The subject-projection generator. */
export declare function subjectProjection(entities: EntitySet): FiberGenerator;
/** The object-projection generator. */
export declare function objectProjection(entities: EntitySet): FiberGenerator;
/** The specialization generator restricting an ambient cell set to a support subset. */
export declare function specialization(entities: EntitySet, support: readonly PredicateFiberCell[], ambient?: readonly PredicateFiberCell[]): FiberGenerator;
/** Build the fibered valuation carrier from a site: each cell witnessed-potential by its subject. */
export declare function fiberCarrier(predication: PredicationSite): FiberCarrier;
/** Posit a predication site into the presheaf settlement reads. */
export declare function posit(predication: PredicationSite): PositPresheaf;
/** Fold a list of memes into a valuation over a base, combining coincident cells by knowledge join. */
export declare function composeFibers(memes: readonly Meme[], base: PredicationSite["base"]): Valuation;
/** The charge a valuation assigns to a cell, or bottom when none coincides. */
export declare function chargeAt(valuation: Valuation, cell: Cell): ChargeCarrier;
/** Convert a predicate fiber back into a valuation over a base. */
export declare function valuationFromPredicateFiber(fiber: PredicateFiber, base: PredicationSite["base"]): Valuation;
//# sourceMappingURL=fiber.d.mts.map