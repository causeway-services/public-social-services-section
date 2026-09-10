/**
 * consensus — bilattice network-sheaf consensus over a fleet of observer charges.
 *
 * socializing's own collective-decision read (multi-observer settlement): many
 * agents observe the same subject and each contributes a charge; consensus is read
 * off the network sheaf on the observer graph. The obstruction to agreement is
 * exactly the H¹ of the opposition subgraph — disagreement is a topological
 * obstruction, not a mere mismatch. Theory:
 * `work/archive/quorum-as-colimit-of-voter-fibers.md`, `consensus-closure.md`, and
 * the bilattice-network-sheaf-consensus theorem.
 *
 * Per component (a connected group of observers):
 *   pooled = ⋀_k over the component  (knowledge-join — everything anyone knows)
 *   common = ⋁_k over the component  (knowledge-meet — what all agree on)
 * Two observers are *opposed* on an edge when one settled positive-only
 * (`potential`) and the other negative-only (`active`): a direct contradiction in
 * truth direction. The obstruction is the first Betti number of the opposition
 * subgraph (edges − touched-vertices + components); zero means coordination-free,
 * and the fleet is *confident* only when coordination-free and every component
 * pooled to a definite (non-⊥, non-⊤) charge.
 *
 * This is socializing's home for the consensus read — the off-diagonal observer
 * category O settling its plurality into one decision. (Relocated from animating;
 * a fleet's collective settlement is a social, not an interior-agent, concern.)
 */
import { analysis, cell, claim, cohomologyOfCells, cohomologyTerms, evaluateRunTerm, joinKnowledge, mark, meetKnowledge, predicateOfClaim, token, valueOf, } from "@emsenn/relating";
/** The complete graph on `size` observers — every observer compared with every other. */
export function completeGraph(size) {
    const edges = [];
    for (let left = 0; left < size; left++) {
        for (let right = left + 1; right < size; right++)
            edges.push([left, right]);
    }
    return edges;
}
/** The [positive, negative] truth/falsity presence of a charge.
 *  ⊥ absurd = [f,f], t potential = [t,f], f active = [f,t], ⊤ stable = [t,t]. */
function present(charge) {
    switch (valueOf(charge).name) {
        case "potential": return [true, false];
        case "active": return [false, true];
        case "stable": return [true, true];
        default: return [false, false]; // absurd
    }
}
/** A charge with a definite truth direction (potential or active, not ⊥/⊤). */
export function definite(charge) {
    const [positive, negative] = present(charge);
    return positive !== negative;
}
/** Two charges in directly opposed truth directions: one positive-only, the
 *  other negative-only. ⊥ and ⊤ are never opposed (no definite direction). */
export function opposed(left, right) {
    const [leftPositive, leftNegative] = present(left);
    const [rightPositive, rightNegative] = present(right);
    return (leftPositive && !leftNegative && rightNegative && !rightPositive) ||
        (rightPositive && !rightNegative && leftNegative && !leftPositive);
}
/** Network-sheaf consensus over the observer charges and the comparison graph
 *  (default: complete graph — every pair compared). */
export function sheafCharges(charges, edges = completeGraph(charges.length)) {
    validateEdges(charges.length, edges);
    const components = connectedComponents(charges.length, edges);
    const componentConsensus = components.map((members) => {
        const first = charges[members[0]];
        if (!first)
            throw new TypeError("sheafCharges: component without a charge");
        const rest = members.slice(1).map((index) => charges[index]);
        return {
            members,
            pooled: rest.reduce((left, right) => joinKnowledge(left, right), first),
            common: rest.reduce((left, right) => meetKnowledge(left, right), first),
        };
    });
    const opposedEdges = [];
    edges.forEach(([left, right], index) => {
        if (opposed(charges[left], charges[right]))
            opposedEdges.push(index);
    });
    const opposedPairs = opposedEdges.map((index) => edges[index]);
    const cohomology = oppositionCohomology(opposedPairs);
    const obstruction = cohomology.h1;
    const coordinationFree = obstruction === 0;
    const confidentByComponent = componentConsensus.map(({ pooled }) => coordinationFree && definite(pooled));
    return {
        componentConsensus,
        opposedEdges,
        cohomology: cohomology.receipt,
        obstruction,
        coordinationFree,
        confidentByComponent,
        confident: coordinationFree && confidentByComponent.every(Boolean),
    };
}
function oppositionCohomology(opposedPairs) {
    const opposes = predicateOfClaim(claim(mark("opposes")));
    const cells = opposedPairs.map(([left, right]) => cell(token(mark(`observer:${left}`)), opposes, token(mark(`observer:${right}`))));
    const cohomology = cohomologyOfCells(cells);
    const normalized = evaluateRunTerm(cohomologyTerms.carrier, cohomology);
    const receipt = Object.freeze({
        kind: "socializing.consensus.cohomology",
        cells: opposedPairs.length,
        h0: natCount(cohomology.zeroCohomology.rank),
        h1: natCount(cohomology.firstCohomology.rank),
        vanishing: evaluateRunTerm(cohomologyTerms.rankVanishing, cohomology.firstCohomology.vanishing),
        carrier: normalized,
    });
    return { h1: receipt.h1, receipt };
}
/** Consensus over any observations that carry a `charge`. */
export function sheafObservations(observations, edges = completeGraph(observations.length)) {
    return sheafCharges(observations.map((observation) => observation.charge), edges);
}
/** The von Neumann cardinality of a `Natural` (its member set's size IS the number). */
const natCount = (natural) => natural.members.length;
/** An observer's TRUTH-LEAN as an exact integer: +1 leaning FOR (potential), −1 leaning AGAINST
 *  (active), 0 for no definite direction (⊥ absurd / ⊤ stable). The observable whose harmonicity on
 *  the comparison graph IS consensus equilibrium. */
const leanInteger = (charge) => {
    const [positive, negative] = present(charge);
    if (positive && !negative)
        return analysis.intOne;
    if (negative && !positive)
        return analysis.intNegate(analysis.intOne);
    return analysis.intZero;
};
/** Read a fleet's consensus through the substrate graph Laplacian: the agreement graph's component
 *  count (H⁰) and spanning-tree robustness. */
export function spectralConsensus(charges, edges = completeGraph(charges.length)) {
    validateEdges(charges.length, edges);
    const agreement = edges.filter(([left, right]) => !opposed(charges[left], charges[right]));
    const spectrum = analysis.graphSpectrum(charges.length, agreement.map(([left, right]) => [left, right]));
    const clusters = natCount(spectrum.components);
    const agreementTrees = natCount(analysis.magnitude(spectrum.spanningTrees));
    const comparisonWeights = analysis.weightsOfEdges(charges.length, edges.map(([left, right]) => [left, right]));
    const atEquilibrium = analysis.isHarmonicOfWeights(comparisonWeights, charges.map(leanInteger));
    const hodge = analysis.hodgeDecompositionOfWeights(analysis.weightsOfEdges(charges.length, agreement.map(([left, right]) => [left, right])));
    return Object.freeze({
        kind: "socializing.spectral-consensus",
        observers: charges.length,
        clusters,
        unified: clusters === 1,
        agreementTrees,
        robust: agreementTrees > 1,
        fragile: agreementTrees === 1,
        atEquilibrium,
        derivable: natCount(hodge.exact),
        irreducible: natCount(hodge.harmonic),
    });
}
/**
 * diffusedField — diffuse the fleet's charges to consensus. Each observer relaxes to the net
 * truth-DIRECTION of its agreement-community (`sign` of the harmonic projection `lim_{t→∞} e^{−tL}`
 * onto `ker L` — the per-community mean lean), read through the substrate `diffusionDirections`. Where
 * `spectralConsensus.atEquilibrium` asks WHETHER the leans are already harmonic, this reads what the
 * fleet settles TO: how many observers land for / against / balanced once consensus diffuses.
 */
export function diffusedField(charges, edges = completeGraph(charges.length)) {
    validateEdges(charges.length, edges);
    const agreement = edges.filter(([left, right]) => !opposed(charges[left], charges[right]));
    const weights = analysis.weightsOfEdges(charges.length, agreement.map(([left, right]) => [left, right]));
    const directions = analysis.diffusionDirections(weights, charges.map(leanInteger));
    let leansFor = 0;
    let leansAgainst = 0;
    let balanced = 0;
    for (const direction of directions) {
        if (analysis.intIsZero(direction))
            balanced += 1;
        else if (analysis.isNegative(direction))
            leansAgainst += 1;
        else
            leansFor += 1;
    }
    return Object.freeze({ kind: "socializing.diffused-field", observers: charges.length, leansFor, leansAgainst, balanced });
}
function validateEdges(size, edges) {
    for (const [left, right] of edges) {
        if (left < 0 || right < 0 || left >= size || right >= size || left === right) {
            throw new RangeError(`sheafCharges: edge [${left},${right}] out of range or self-loop`);
        }
    }
}
function connectedComponents(size, edges) {
    const parent = Array.from({ length: size }, (_, index) => index);
    const find = (value) => parent[value] === value ? value : (parent[value] = find(parent[value]));
    for (const [left, right] of edges)
        parent[find(left)] = find(right);
    const groups = new Map();
    for (let index = 0; index < size; index++) {
        const root = find(index);
        const group = groups.get(root) ?? [];
        group.push(index);
        groups.set(root, group);
    }
    return [...groups.values()];
}
//# sourceMappingURL=consensus.mjs.map