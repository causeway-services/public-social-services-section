/**
 * settling/closure — the ordinal tower and the bounded closure engine.
 *
 * Ordinals are built as zero / successor / labelled limit with a fundamental
 * sequence; a `Lattice<T>` carries bottom, leq, join, eq, and a stabilizing sup;
 * a `ClosureProcess` is a monotone endomorphism over a lattice with a search
 * horizon. `closeOrdinalProcess` iterates from bottom, recording the orbit, and
 * searches finite then limit blocks for the stabilization stage, classifying the
 * regime (finite / Scott / transfinite) or returning an obstruction. Built over
 * the exact-arithmetic Natural carrier and the opaque Mark for limit labels.
 */
import { natIsZero, natZero, predecessor, successor } from "./analysis/exact-number.mjs";
import { mark } from "../../../utterance.mjs";
const naturalFromInternalBound = (bound) => {
    let value = natZero;
    for (let index = 0; index < bound; index += 1)
        value = successor(value);
    return value;
};
const two = naturalFromInternalBound(2);
const defaultFiniteStages = naturalFromInternalBound(64);
const defaultLimitBlocks = naturalFromInternalBound(4);
const omegaMultipleOrdinalLabel = (multiplier) => Object.freeze({ kind: "ordinal.closure.omegaMultipleLabel", multiplier });
const omegaSquaredOrdinalLabel = () => Object.freeze({ kind: "ordinal.closure.omegaSquaredLabel" });
/** The zero ordinal. */
export const zeroOrdinal = Object.freeze({ kind: "ordinal.closure.ordinal.zero" });
/** The successor of an ordinal. */
export const successorOrdinal = (predecessorOrdinal) => Object.freeze({ kind: "ordinal.closure.ordinal.successor", predecessor: predecessorOrdinal });
/** An ordinal label wrapping a mark. */
export const ordinalLabel = (label) => Object.freeze({ kind: "ordinal.closure.ordinalLabel", mark: label });
/** A limit ordinal from a label and a fundamental sequence. */
export const limitOrdinal = (label, fundamentalSequence) => Object.freeze({ kind: "ordinal.closure.ordinal.limit", label, fundamentalSequence });
/** The finite ordinal of value n. */
export const finiteOrdinal = (n) => {
    let ordinal = zeroOrdinal;
    for (const _member of n.members)
        ordinal = successorOrdinal(ordinal);
    return ordinal;
};
/** The ordinal obtained by applying successor n times. */
export const ordinalPlusFinite = (ordinal, n) => {
    let out = ordinal;
    for (const _member of n.members)
        out = successorOrdinal(out);
    return out;
};
/** Omega: the limit whose fundamental sequence enumerates the finite ordinals. */
export const omegaOrdinal = () => limitOrdinal(ordinalLabel(mark(omegaMultipleOrdinalLabel(successor(natZero)))), (n) => finiteOrdinal(n));
/** Omega times k. */
export const omegaMultipleOrdinal = (k) => natIsZero(k)
    ? zeroOrdinal
    : limitOrdinal(ordinalLabel(mark(omegaMultipleOrdinalLabel(k))), (n) => ordinalPlusFinite(omegaMultipleOrdinal(predecessor(k)), n));
/** Omega squared. */
export const omegaSquaredOrdinal = () => limitOrdinal(ordinalLabel(mark(omegaSquaredOrdinalLabel())), (n) => omegaMultipleOrdinal(n));
/** Whether an ordinal is zero. */
export const isZeroOrdinal = (ordinal) => ordinal.kind === "ordinal.closure.ordinal.zero";
/** Whether an ordinal is a successor. */
export const isSuccessorOrdinal = (ordinal) => ordinal.kind === "ordinal.closure.ordinal.successor";
/** Whether an ordinal is a limit. */
export const isLimitOrdinal = (ordinal) => ordinal.kind === "ordinal.closure.ordinal.limit";
/** The finite closure regime value. */
export const finiteClosureRegime = Object.freeze({ kind: "ordinal.closure.regime.finite" });
/** The Scott closure regime value. */
export const scottClosureRegime = Object.freeze({ kind: "ordinal.closure.regime.scott" });
/** The transfinite closure regime value. */
export const transfiniteClosureRegime = Object.freeze({ kind: "ordinal.closure.regime.transfinite" });
/** The aperiodic closure regime value. */
export const aperiodicClosureRegime = Object.freeze({ kind: "ordinal.closure.regime.aperiodic" });
/** Construct a stabilization search horizon. */
export const closureStabilizationSearchHorizon = (finiteStages, limitBlocks) => Object.freeze({ kind: "ordinal.closure.stabilizationSearchHorizon", finiteStages, limitBlocks });
/** Construct a closure process (default horizon: 64 finite stages over 4 limit blocks). */
export const closureProcess = (lattice, endomorphism, horizon = closureStabilizationSearchHorizon(defaultFiniteStages, defaultLimitBlocks)) => Object.freeze({ kind: "ordinal.closure.process", lattice, endomorphism, horizon });
/** Construct a search block. */
export const closureSearchBlock = (base, finiteStages) => Object.freeze({ kind: "ordinal.closure.searchBlock", base, finiteStages });
/** The ordered search blocks for a horizon. */
export function closureSearchBlocks(horizon) {
    return Object.freeze([
        closureSearchBlock(zeroOrdinal, horizon.finiteStages),
        ...horizon.limitBlocks.members.map((member) => closureSearchBlock(omegaMultipleOrdinal(successor(member)), horizon.finiteStages)),
    ]);
}
/** Whether an ordinal is finite, by stripping its successor chain. */
export function finiteOrdinalJudgment(ordinal) {
    let current = ordinal;
    let value = natZero;
    while (current.kind === "ordinal.closure.ordinal.successor") {
        value = successor(value);
        current = current.predecessor;
    }
    return current.kind === "ordinal.closure.ordinal.zero"
        ? Object.freeze({ kind: "ordinal.closure.finiteOrdinal:witness", ordinal, value })
        : Object.freeze({ kind: "ordinal.closure.finiteOrdinal-obstruction", ordinal, residue: current });
}
function approx(lattice, phi, ordinal) {
    switch (ordinal.kind) {
        case "ordinal.closure.ordinal.zero":
            return lattice.bottom;
        case "ordinal.closure.ordinal.successor":
            return phi(approx(lattice, phi, ordinal.predecessor));
        case "ordinal.closure.ordinal.limit":
            return lattice.sup((n) => approx(lattice, phi, ordinal.fundamentalSequence(n)));
    }
}
/** The closure approximant of a process at an ordinal stage. */
export const closureApproximant = (process, ordinal) => approx(process.lattice, process.endomorphism, ordinal);
const closureOrbitPoint = (stage, value) => Object.freeze({ kind: "ordinal.closure.orbitPoint", stage, value });
function* closureOrbit(lattice, phi) {
    let value = lattice.bottom;
    let stage = zeroOrdinal;
    yield closureOrbitPoint(stage, value);
    for (;;) {
        value = phi(value);
        stage = successorOrdinal(stage);
        yield closureOrbitPoint(stage, value);
    }
}
/** The closure orbit of a process: orbit points iterating the endomorphism from bottom. */
export function* closureOrbitOfProcess(process) {
    yield* closureOrbit(process.lattice, process.endomorphism);
}
/** A sup operator from a lattice equality: the first sequence value equal to its predecessor. */
export const stabilizingSup = (lattice) => (sequence) => {
    let previous = sequence(natZero);
    for (let index = successor(natZero);; index = successor(index)) {
        const current = sequence(index);
        if (lattice.eq(current, previous))
            return current;
        previous = current;
    }
};
/** Classify the stabilizing regime of an ordinal. */
export function closureRegimeOfOrdinal(ordinal) {
    const finite = finiteOrdinalJudgment(ordinal);
    if (finite.kind === "ordinal.closure.finiteOrdinal:witness")
        return finiteClosureRegime;
    if (ordinal.kind === "ordinal.closure.ordinal.limit"
        && finiteOrdinalJudgment(ordinal.fundamentalSequence(two)).kind === "ordinal.closure.finiteOrdinal:witness")
        return scottClosureRegime;
    return transfiniteClosureRegime;
}
/** Whether a process stabilizes at an ordinal (approximant equals its successor). */
export function closureStabilizationAt(process, ordinal) {
    const value = closureApproximant(process, ordinal);
    const successorValue = closureApproximant(process, successorOrdinal(ordinal));
    return process.lattice.eq(successorValue, value)
        ? Object.freeze({ kind: "ordinal.closure.stabilization:witness", ordinal, value, successor: successorValue })
        : Object.freeze({ kind: "ordinal.closure.stabilization-obstruction", searchedThrough: ordinal, value, successor: successorValue });
}
/** Run the bounded stabilization search over a process. */
export function closeOrdinalProcess(process) {
    const at = (ordinal) => closureApproximant(process, ordinal);
    const orbit = [];
    const closeAt = (stabilization) => {
        const regime = closureRegimeOfOrdinal(stabilization.ordinal);
        const search = Object.freeze({
            kind: "ordinal.closure.stabilizationSearch:witness",
            ordinal: stabilization.ordinal,
            regime,
            stabilization,
        });
        return Object.freeze({ kind: "ordinal.closure.carrier", process, value: stabilization.value, orbit: Object.freeze(orbit), search, stabilization });
    };
    const closeWitness = (stabilization) => {
        switch (stabilization.kind) {
            case "ordinal.closure.stabilization:witness":
                return closeAt(stabilization);
        }
    };
    {
        let value = process.lattice.bottom;
        let ordinal = zeroOrdinal;
        orbit.push(closureOrbitPoint(ordinal, value));
        for (const _stage of process.horizon.finiteStages.members) {
            const successorValue = process.endomorphism(value);
            if (process.lattice.eq(successorValue, value)) {
                return closeAt(Object.freeze({ kind: "ordinal.closure.stabilization:witness", ordinal, value, successor: successorValue }));
            }
            ordinal = successorOrdinal(ordinal);
            value = successorValue;
            orbit.push(closureOrbitPoint(ordinal, value));
        }
    }
    for (const block of closureSearchBlocks(process.horizon)) {
        const base = block.base;
        switch (base.kind) {
            case "ordinal.closure.ordinal.zero":
                continue;
            case "ordinal.closure.ordinal.limit": {
                const closed = closeWitness(closureStabilizationAt(process, base));
                if (closed)
                    return closed;
                break;
            }
        }
        for (const member of block.finiteStages.members) {
            const closed = closeWitness(closureStabilizationAt(process, ordinalPlusFinite(base, member)));
            if (closed)
                return closed;
        }
    }
    const omegaSquare = omegaSquaredOrdinal();
    const omegaSquareClosure = closeWitness(closureStabilizationAt(process, omegaSquare));
    if (omegaSquareClosure)
        return omegaSquareClosure;
    const searchedThrough = omegaMultipleOrdinal(successor(process.horizon.limitBlocks));
    const value = at(searchedThrough);
    const stabilization = Object.freeze({
        kind: "ordinal.closure.stabilization-obstruction",
        searchedThrough,
        value,
        successor: at(successorOrdinal(searchedThrough)),
    });
    const search = Object.freeze({
        kind: "ordinal.closure.stabilizationSearch-obstruction",
        searchedThrough,
        stabilization,
    });
    return Object.freeze({ kind: "ordinal.closure.carrier", process, value, orbit: Object.freeze(orbit), search, stabilization });
}
//# sourceMappingURL=closure.mjs.map