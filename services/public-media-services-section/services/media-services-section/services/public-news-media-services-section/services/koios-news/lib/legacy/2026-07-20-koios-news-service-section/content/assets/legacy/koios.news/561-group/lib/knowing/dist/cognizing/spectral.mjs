/**
 * cognizing/spectral — [Meme] → knowing/spectral-binding: BINDING read through the substrate
 * spectral graph Laplacian.
 *
 * knowing's `bind` (bind.mts/binding.mts) already reads the held section's feature graph as Čech
 * cohomology: H⁰ = bound percepts (connected components), H¹ = binding obstruction (cycle rank),
 * computed by its own union-find. This reading GROUNDS that H⁰ in relating's combinatorial graph
 * Laplacian L = D − W (`@emsenn/relating` analysis.laplacian, exact over ℤ): the percept count is the
 * zero-eigenvalue multiplicity (`componentCount`), the spectral definition of H⁰. And it ADDS the one
 * thing union-find cannot see — the **Matrix-Tree (Kirchhoff) spanning-tree count** (`treeCount`), the
 * number of distinct spanning configurations that hold the percept together. That count is the BINDING
 * ROBUSTNESS: `0` ⟺ the section fragments into several percepts (H⁰ > 1); `1` ⟺ a unique rigid binding
 * (a spanning tree, no redundant cycles, H¹ = 0); `> 1` ⟺ a redundantly/over-determined binding (cycles
 * present, H¹ > 0 — the illusory-conjunction / superposition-catastrophe risk bind flags). The relation
 * graph reads only the cells (subject↔object), so the held memes present it directly via
 * `relationGraphOfCells`. Total over any collection of memes.
 */
import { action, analysis, bottom, claim, jsonResource, mark, predicateOfClaim, token, } from "@emsenn/relating";
import { admitMemes } from "./section.mjs";
import { contextualityOf } from "./contextuality.mjs";
import { aperiodicDream, aperiodicPraxisFrontier, aperiodicResidue, observation, task, } from "../dreaming/index.mjs";
const MEME_CARRIER_ID = "relating/articulating/predicating/positing/meme";
/** The von Neumann cardinality of a `Natural` (its member set's size IS the number). */
const natCount = (natural) => natural.members.length;
/** The empty/edgeless binding (no related cells present a relation graph). */
const emptySpectralBinding = (features) => Object.freeze({
    kind: "knowing.spectral-binding",
    features,
    percepts: features,
    bound: features === 1,
    spanningTrees: features <= 1 ? 1 : 0,
    rigid: features <= 1,
    redundant: false,
});
/** Read a held section's binding through the substrate graph Laplacian: the spectral percept count
 *  (H⁰) and the spanning-tree robustness of the binding. */
export function spectralBindingOf(memes) {
    const cells = memes.map((m) => m.cell);
    const related = cells.filter((cell) => cell.subject !== cell.object);
    if (related.length === 0) {
        // no non-reflexive relation: each distinct term is its own isolated percept.
        const terms = [];
        for (const cell of cells)
            for (const term of [cell.subject, cell.object])
                if (!terms.includes(term))
                    terms.push(term);
        return emptySpectralBinding(terms.length);
    }
    const graph = analysis.relationGraphOfCells(cells);
    const percepts = natCount(analysis.componentCount(graph));
    const spanningTrees = natCount(analysis.magnitude(analysis.treeCount(graph)));
    return Object.freeze({
        kind: "knowing.spectral-binding",
        features: graph.terms.length,
        percepts,
        bound: percepts === 1,
        spanningTrees,
        rigid: spanningTrees === 1,
        redundant: spanningTrees > 1,
    });
}
/** spectral — read a held section's binding through the spectral graph Laplacian (H⁰ percepts as
 *  zero-eigenvalue multiplicity + Matrix-Tree spanning-tree robustness). */
export const spectralAction = action({
    verb: "spectral",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Read a held section's BINDING through the substrate graph Laplacian: H⁰ percepts (zero-eigenvalue multiplicity) and the Matrix-Tree spanning-tree count as the binding's rigidity/redundancy.",
    description: `Domain: an array of meme carriers (${MEME_CARRIER_ID}) or { memes: [...] } — the held section. Codomain: knowing/spectral-binding — knowing's BIND read through relating's combinatorial graph Laplacian L = D − W (analysis.laplacian, exact over ℤ). The percept count H⁰ is the Laplacian's zero-eigenvalue multiplicity (componentCount) — the spectral definition of bind's bound-percept count. The Matrix-Tree (Kirchhoff) spanning-tree count is the binding ROBUSTNESS union-find cannot see: 0 ⟺ the section fragments (H⁰ > 1), 1 ⟺ a unique rigid binding (a spanning tree, H¹ = 0), > 1 ⟺ a redundant/over-determined binding (cycles, H¹ > 0 — illusory-conjunction risk). Grounded in relating's analysis.laplacian (relationGraphOfCells / componentCount / treeCount) and bind.mts.`,
    domainSchema: Object.freeze({ type: "array", items: Object.freeze({ $ref: MEME_CARRIER_ID }) }),
    codomainSchema: Object.freeze({
        type: "object",
        required: ["kind", "features", "percepts", "bound", "spanningTrees", "rigid", "redundant"],
        properties: Object.freeze({
            kind: Object.freeze({ const: "knowing.spectral-binding" }),
            features: Object.freeze({ type: "integer", minimum: 0 }),
            percepts: Object.freeze({ type: "integer", minimum: 0 }),
            bound: Object.freeze({ type: "boolean" }),
            spanningTrees: Object.freeze({ type: "integer", minimum: 0 }),
            rigid: Object.freeze({ type: "boolean" }),
            redundant: Object.freeze({ type: "boolean" }),
        }),
    }),
    run: (input) => jsonResource(spectralBindingOf(admitMemes(input, "spectral")), "spectral binding"),
});
/** Decompose a held section's binding through the substrate graph Hodge decomposition. */
export function hodgeBindingOf(memes) {
    const cells = memes.map((m) => m.cell);
    const related = cells.filter((cell) => cell.subject !== cell.object);
    if (related.length === 0) {
        const terms = [];
        for (const cell of cells)
            for (const term of [cell.subject, cell.object])
                if (!terms.includes(term))
                    terms.push(term);
        return Object.freeze({ kind: "knowing.hodge-binding", features: terms.length, bindings: 0, derivable: 0, irreducible: 0 });
    }
    const graph = analysis.relationGraphOfCells(cells);
    const hodge = analysis.hodgeDecomposition(graph);
    return Object.freeze({
        kind: "knowing.hodge-binding",
        features: graph.terms.length,
        bindings: natCount(hodge.edges),
        derivable: natCount(hodge.exact),
        irreducible: natCount(hodge.harmonic),
    });
}
/** hodge — decompose a held section's binding into derivable (exact) and irreducible (harmonic) parts. */
export const hodgeAction = action({
    verb: "hodge",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Hodge-decompose a held section's BINDING: derivable (exact/gradient) bindings vs irreducible (harmonic/β₁) cycles — the exact H¹ illusory-conjunction count.",
    description: `Domain: an array of meme carriers (${MEME_CARRIER_ID}) or { memes: [...] } — the held section. Codomain: knowing/hodge-binding — the discrete Hodge decomposition of the binding graph's edge-flows (analysis.laplacian.hodgeDecomposition, exact over ℤ): \`derivable\` = exact/gradient flows rank(L) = V − C (bindings inference can reconstruct from local potentials), \`irreducible\` = harmonic flows β₁ = E − V + C (the H¹ obstruction — the illusory-conjunction cycles no local amendment kills). Refines spectral-binding's \`redundant\` flag into the exact obstruction rank. Grounded in relating's analysis.laplacian and bind.mts.`,
    domainSchema: Object.freeze({ type: "array", items: Object.freeze({ $ref: MEME_CARRIER_ID }) }),
    codomainSchema: Object.freeze({
        type: "object",
        required: ["kind", "features", "bindings", "derivable", "irreducible"],
        properties: Object.freeze({
            kind: Object.freeze({ const: "knowing.hodge-binding" }),
            features: Object.freeze({ type: "integer", minimum: 0 }),
            bindings: Object.freeze({ type: "integer", minimum: 0 }),
            derivable: Object.freeze({ type: "integer", minimum: 0 }),
            irreducible: Object.freeze({ type: "integer", minimum: 0 }),
        }),
    }),
    run: (input) => jsonResource(hodgeBindingOf(admitMemes(input, "hodge")), "hodge binding"),
});
/** Bridge the spectral/Hodge reading of a held section with signed contextuality constraints. */
export function contextualSpectrumOf(input) {
    const spectral = spectralBindingOf(input.memes);
    const hodge = hodgeBindingOf(input.memes);
    const contextuality = contextualityOf(input.constraints ?? []);
    const harmonic = hodge.irreducible > 0;
    const contextual = contextuality.contextual;
    const phase = harmonic
        ? contextual ? "harmonic-contextual" : "harmonic"
        : contextual ? "contextual" : "flat";
    return Object.freeze({
        kind: "knowing.contextual-spectrum",
        spectral,
        hodge,
        contextuality,
        obstruction: Object.freeze({
            phase,
            harmonicRank: hodge.irreducible,
            frustration: contextuality.frustration,
            globalSection: contextuality.globalSection,
        }),
        praxis: praxisOf(phase),
        theory: Object.freeze({
            spectral: "hodge-harmonic-residue",
            contextual: "global-section-obstruction",
            autonomous: "self-producing-frontier",
            social: "theory-practice-loop",
        }),
    });
}
/** Promote contextual/spectral obstruction into a finite-excluded aperiodic dream frontier. */
export function contextualDreamFrontierOf(input) {
    const spectrum = contextualSpectrumOf(input);
    const observations = contextualDreamObservations(spectrum, input.memes);
    const limit = optionalNonNegativeInteger(input.limit, "contextual-dream-frontier: limit") ?? 1;
    return Object.freeze({
        kind: "knowing.contextual-dream-frontier",
        regime: "aperiodic",
        spectrum,
        observations,
        residue: aperiodicResidue(observations),
        dream: aperiodicDream({ observations, limit }),
        praxis: aperiodicPraxisFrontier({ observations, limit }),
        bridge: Object.freeze({
            from: "knowing.contextual-spectrum",
            to: "knowing.dream.aperiodic-residue",
            active: observations.length > 0,
            reason: contextualDreamReason(spectrum),
        }),
        theory: Object.freeze({
            sheaf: "global-section-obstruction",
            spectral: "hodge-harmonic-residue",
            praxis: "theory-practice-theory",
            dream: "aperiodic-non-convergence",
        }),
    });
}
function praxisOf(phase) {
    switch (phase) {
        case "harmonic-contextual":
            return Object.freeze({
                reflection: "The section has a harmonic residue and no compatible signed global section.",
                action: "Treat it as a dream frontier: do not resolve locally; surface the obstruction for a new conjecture or intervention.",
            });
        case "harmonic":
            return Object.freeze({
                reflection: "The section has irreducible cycles, but the signed constraints still admit a global section.",
                action: "Preserve the cycle as long-range structure; look for spectral invariants before forcing simplification.",
            });
        case "contextual":
            return Object.freeze({
                reflection: "The section is not harmonically redundant, but its signs are globally frustrated.",
                action: "Repair the measurement/context cover or promote the contradiction as a signed research obligation.",
            });
        case "flat":
            return Object.freeze({
                reflection: "No harmonic residue or signed contextual obstruction is visible at this grain.",
                action: "Let finite researching handle it; dreaming has no residue to feed on here.",
            });
    }
}
function contextualDreamObservations(spectrum, memes) {
    if (spectrum.obstruction.phase === "flat")
        return Object.freeze([]);
    const charge = memes[0]?.charge ?? bottom;
    const observer = token(mark(Object.freeze(["knowing", "contextual-dream", "observer"])));
    const local = observation({
        observer,
        task: task({
            subject: token(mark(Object.freeze(["contextual-dream", "local", spectrum.obstruction.phase]))),
            predicate: predicateOfClaim(claim(mark(Object.freeze(["contextual-dream", "hodge-residue"])))),
            object: token(mark(Object.freeze(["hodge", "harmonic-rank", String(spectrum.obstruction.harmonicRank)]))),
        }),
        charge,
        note: mark(Object.freeze(["contextual-dream", "local-window"])),
    });
    const global = observation({
        observer,
        task: task({
            subject: token(mark(Object.freeze(["contextual-dream", "global", spectrum.obstruction.phase]))),
            predicate: predicateOfClaim(claim(mark(Object.freeze(["contextual-dream", "global-section-obstruction"])))),
            object: token(mark(Object.freeze(["contextuality", "frustration", String(spectrum.obstruction.frustration)]))),
        }),
        charge,
        note: mark(Object.freeze(["contextual-dream", "signed-cover"])),
    });
    return Object.freeze([local, global]);
}
function contextualDreamReason(spectrum) {
    if (spectrum.obstruction.phase === "flat")
        return "The spectrum is flat: no harmonic residue or contextual obstruction needs the aperiodic dream loop.";
    if (spectrum.obstruction.phase === "harmonic-contextual")
        return "A harmonic residue coincides with signed global-section obstruction, so local repair cannot settle the frontier.";
    if (spectrum.obstruction.phase === "harmonic")
        return "A harmonic residue persists as long-range structure even though the signed cover still admits a global section.";
    return "The signed cover has no global section, so the contradiction must be promoted as a research obligation.";
}
function admitContextualSpectrumInput(input) {
    const value = jsonResource(input, "contextual-spectrum input");
    const record = value !== null && typeof value === "object" && !Array.isArray(value)
        ? value
        : { memes: value };
    const memes = admitMemes(record["memes"] ?? value, "contextual-spectrum");
    const rawConstraints = record["constraints"];
    const constraints = rawConstraints === undefined
        ? []
        : Array.isArray(rawConstraints)
            ? rawConstraints.map((constraint) => String(constraint))
            : (() => { throw new TypeError("contextual-spectrum: constraints must be an array"); })();
    return Object.freeze({ memes, constraints: Object.freeze(constraints) });
}
function admitContextualDreamFrontierInput(input) {
    const value = jsonResource(input, "contextual-dream-frontier input");
    const record = value !== null && typeof value === "object" && !Array.isArray(value)
        ? value
        : { memes: value };
    const admitted = admitContextualSpectrumInput(record);
    const limit = optionalNonNegativeInteger(record["limit"], "contextual-dream-frontier: limit");
    return Object.freeze({
        memes: admitted.memes,
        constraints: admitted.constraints,
        ...(limit === undefined ? {} : { limit }),
    });
}
function optionalNonNegativeInteger(value, context) {
    if (value === undefined)
        return undefined;
    if (typeof value !== "number" || !Number.isInteger(value) || value < 0)
        throw new TypeError(`${context} must be a non-negative integer`);
    return value;
}
/** contextual-spectrum — bridge spectral/Hodge residue with signed global-section obstruction. */
export const contextualSpectrumAction = action({
    verb: "contextual-spectrum",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Bridge spectral/Hodge binding residue with signed contextuality: flat, harmonic, contextual, or harmonic-contextual.",
    description: `Domain: { memes, constraints? } where memes are ${MEME_CARRIER_ID} carriers and constraints are a=b / a!=b signed cover edges. Codomain: knowing/contextual-spectrum. This composes the spectral sheaf reading (Hodge harmonic residue) with Abramsky-Brandenburger-style global-section obstruction. The praxis field names the theory-practice move: finite research when flat, dream-frontier intervention when harmonic and contextual.`,
    domainSchema: Object.freeze({
        type: "object",
        required: ["memes"],
        properties: Object.freeze({
            memes: Object.freeze({ type: "array", items: Object.freeze({ $ref: MEME_CARRIER_ID }) }),
            constraints: Object.freeze({ type: "array", items: Object.freeze({ type: "string" }) }),
        }),
        additionalProperties: true,
    }),
    codomainSchema: Object.freeze({
        $id: "knowing/contextual-spectrum",
        type: "object",
        required: ["kind", "spectral", "hodge", "contextuality", "obstruction", "praxis", "theory"],
        properties: Object.freeze({
            kind: Object.freeze({ const: "knowing.contextual-spectrum" }),
            spectral: Object.freeze({ type: "object" }),
            hodge: Object.freeze({ type: "object" }),
            contextuality: Object.freeze({ type: "object" }),
            obstruction: Object.freeze({ type: "object" }),
            praxis: Object.freeze({ type: "object" }),
            theory: Object.freeze({ type: "object" }),
        }),
    }),
    run: (input) => {
        const admitted = admitContextualSpectrumInput(input);
        return jsonResource(contextualSpectrumOf(admitted), "contextual spectrum");
    },
});
export const contextualDreamFrontierAction = action({
    verb: "contextual-dream-frontier",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Promote spectral/contextual obstruction into finite-excluded aperiodic dream residue and praxis.",
    description: `Domain: { memes, constraints?, limit? } where memes are ${MEME_CARRIER_ID} carriers and constraints are signed cover edges. Codomain: knowing/contextual-dream-frontier. A non-flat contextual spectrum becomes two obstruction observations whose pair is unreachable by strict-finite, Scott-continuous, or transfinite dreaming, then flows into aperiodic conjectures and praxis obligations.`,
    domainSchema: Object.freeze({
        type: "object",
        required: ["memes"],
        properties: Object.freeze({
            memes: Object.freeze({ type: "array", items: Object.freeze({ $ref: MEME_CARRIER_ID }) }),
            constraints: Object.freeze({ type: "array", items: Object.freeze({ type: "string" }) }),
            limit: Object.freeze({ type: "integer", minimum: 0 }),
        }),
        additionalProperties: true,
    }),
    codomainSchema: Object.freeze({
        $id: "knowing/contextual-dream-frontier",
        type: "object",
        required: Object.freeze(["kind", "regime", "spectrum", "observations", "residue", "dream", "praxis", "bridge", "theory"]),
        properties: Object.freeze({
            kind: Object.freeze({ const: "knowing.contextual-dream-frontier" }),
            regime: Object.freeze({ const: "aperiodic" }),
            spectrum: Object.freeze({ type: "object" }),
            observations: Object.freeze({ type: "array" }),
            residue: Object.freeze({ type: "object" }),
            dream: Object.freeze({ type: "object" }),
            praxis: Object.freeze({ type: "object" }),
            bridge: Object.freeze({ type: "object" }),
            theory: Object.freeze({ type: "object" }),
        }),
    }),
    run: (input) => {
        const admitted = admitContextualDreamFrontierInput(input);
        return jsonResource(contextualDreamFrontierOf(admitted), "contextual dream frontier");
    },
});
//# sourceMappingURL=spectral.mjs.map