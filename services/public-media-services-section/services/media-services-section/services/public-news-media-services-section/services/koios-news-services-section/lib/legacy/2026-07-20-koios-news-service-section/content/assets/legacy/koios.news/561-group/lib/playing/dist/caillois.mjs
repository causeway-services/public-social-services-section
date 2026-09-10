/**
 * caillois — classify a chronicle into Caillois' quadrant from its disposition (decision density:
 * active mastery vs passive surrender) and orientation (resolves to an outcome vs suspends the real).
 * agon = mastery×outcome, alea = surrender×outcome, mimicry = mastery×make-believe, ilinx =
 * surrender×make-believe.
 */
export function caillois(c) {
    const nonDaimon = c.actions.filter((action) => action.variety !== "daimon");
    const choices = nonDaimon.filter((action) => action.ramification.length >= 2).length;
    const decisionDensity = nonDaimon.length > 0 ? choices / nonDaimon.length : 0;
    const mastery = decisionDensity >= 0.5;
    const last = c.actions[c.actions.length - 1];
    const resolves = last !== undefined && last.variety !== "daimon";
    const dominant = mastery
        ? (resolves ? "agon" : "mimicry")
        : (resolves ? "alea" : "ilinx");
    return Object.freeze({
        kind: "playing.caillois",
        dominant,
        decisionDensity,
        disposition: mastery ? "mastery" : "surrender",
        orientation: resolves ? "outcome" : "make-believe",
    });
}
//# sourceMappingURL=caillois.mjs.map