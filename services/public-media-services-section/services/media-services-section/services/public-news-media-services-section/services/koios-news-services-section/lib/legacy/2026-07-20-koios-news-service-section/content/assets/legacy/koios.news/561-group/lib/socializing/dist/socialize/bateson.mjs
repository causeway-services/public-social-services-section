/**
 * doubleBind — detect a Batesonian double bind on an agent over a scope: a cross-level contradiction
 * (required at one Hart/Ostrom level, forbidden at another) that the agent cannot escape (`escapable`
 * false — no admissible refusal/exit/metacommunication). A same-level contradiction is not a bind; it is
 * an honest ⊤ the collective may hold open. The bind is exactly cross-level ⊤ ∧ ¬escapable.
 */
export function doubleBind(injunctions, agent, scope, escapable) {
    const relevant = injunctions.filter((injunction) => injunction.agent === agent && injunction.scope === scope);
    const requiredAt = new Set(relevant.filter((i) => i.polarity === "require").map((i) => i.level));
    const forbiddenAt = new Set(relevant.filter((i) => i.polarity === "forbid").map((i) => i.level));
    let crossLevel = false;
    for (const r of requiredAt)
        for (const f of forbiddenAt)
            if (r !== f)
                crossLevel = true;
    return Object.freeze({
        kind: "socializing.double-bind",
        agent,
        scope,
        levels: Object.freeze([...new Set(relevant.map((i) => i.level))]),
        crossLevel,
        escapable,
        bound: crossLevel && !escapable,
    });
}
function monotoneNondecreasing(series) {
    for (let i = 1; i < series.length; i += 1)
        if (series[i] < series[i - 1] - 1e-12)
            return false;
    return true;
}
/**
 * schismogenesis — classify a differentiation trajectory as symmetrical (mutual escalation → growing
 * spread / polarization) or complementary (dominance/submission → growing concentration / coagulation),
 * and flag it RUNAWAY when the escalating axis rose monotonically with no regulating check — the
 * unchecked path to schism.
 */
export function schismogenesis(trajectory) {
    if (trajectory.length < 2) {
        return Object.freeze({ kind: "socializing.schismogenesis", pattern: "none", spreadRise: 0, concentrationRise: 0, runaway: false });
    }
    const first = trajectory[0];
    const last = trajectory[trajectory.length - 1];
    const spreadRise = last.spread - first.spread;
    const concentrationRise = last.concentration - first.concentration;
    const pattern = spreadRise <= 0 && concentrationRise <= 0
        ? "none"
        : spreadRise >= concentrationRise ? "symmetrical" : "complementary";
    const axis = pattern === "symmetrical" ? trajectory.map((s) => s.spread) : trajectory.map((s) => s.concentration);
    const rise = pattern === "symmetrical" ? spreadRise : concentrationRise;
    return Object.freeze({
        kind: "socializing.schismogenesis",
        pattern,
        spreadRise,
        concentrationRise,
        runaway: pattern !== "none" && rise > 0 && monotoneNondecreasing(axis),
    });
}
//# sourceMappingURL=bateson.mjs.map