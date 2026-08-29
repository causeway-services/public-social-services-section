/**
 * cognizing/gauge — Meme → knowing/settling-regime: INTELLIGENCE as the closure regime.
 *
 * knowing is the comonad on Meme working the knowledge order ≤_k
 * (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md). `gauge` reads the
 * INTELLIGENCE faculty: the closure regime of the meme's settling orbit — how far up
 * the ordinal the ≤_k-monotone orbit must climb to reach (or fail to reach) its
 * fixpoint. This is the GENERAL faculty of which reflect/ruminate are two values:
 * a settled (or trivially absurd) meme is strict-finite; a one-sided meme settles at
 * ω (scott-continuous); a REFLEXIVE meme still unsettled is the APERIODIC regime
 * (κ≥ω₁) — the never-settling rumination orbit, "strictly knowledge-ascending and
 * coherent rather than stabilizing" (aperiodic-settling). The orbit is always
 * knowledge-monotone (settling-monotonicity). Total over any meme.
 */
import { action, jsonResource, isMeme, } from "@emsenn/relating";
const MEME_CARRIER_ID = "relating/articulating/predicating/positing/meme";
const REGIME_CARRIER_ID = "knowing/settling-regime";
function admitMeme(input, verb) {
    if (typeof input === "object" && input !== null && isMeme(input))
        return input;
    throw new TypeError(`${verb}: expected a meme carrier (predication.fiber.meme)`);
}
const nestsMeme = (value) => typeof value === "object" && value !== null && isMeme(value);
/** The FOUR knowledge-order standing named by a charge's two sides. */
function standingOf(meme) {
    const truth = meme.charge.value[0].name === "present";
    const falsity = meme.charge.value[1].name === "present";
    if (truth && falsity)
        return "stable";
    if (truth)
        return "potential";
    if (falsity)
        return "active";
    return "absurd";
}
/** The closure regime implied by a meme's standing and reflexivity. */
function regimeOf(meme) {
    const standing = standingOf(meme);
    const reflexive = nestsMeme(meme.cell.subject.mark.value) || nestsMeme(meme.cell.object.mark.value);
    if (standing === "stable") {
        return { kind: "knowing.settling-regime", regime: "strict-finite", converges: true, monotone: true, closureOrdinal: "finite", settled: true };
    }
    if (standing === "absurd") {
        return { kind: "knowing.settling-regime", regime: "strict-finite", converges: true, monotone: true, closureOrdinal: "zero", settled: true };
    }
    // one-sided (potential or active): not yet at the ≤_k top.
    if (reflexive) {
        // a meme-about-a-meme that has NOT settled: the aperiodic, never-converging orbit (rumination).
        return { kind: "knowing.settling-regime", regime: "aperiodic", converges: false, monotone: true, closureOrdinal: "omega-1-or-above", settled: false };
    }
    // more evidence settles it at ω: the scott-continuous regime.
    return { kind: "knowing.settling-regime", regime: "scott-continuous", converges: true, monotone: true, closureOrdinal: "omega", settled: false };
}
/** gauge — read a meme's intelligence: the closure regime of its settling orbit. */
export const gaugeAction = action({
    verb: "gauge",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Gauge a meme's intelligence: the closure regime of its settling orbit (strict-finite … aperiodic).",
    description: `Domain: a meme carrier (${MEME_CARRIER_ID}). Codomain: ${REGIME_CARRIER_ID} — the closure-orbit class of the meme's ≤_k settling. The general faculty of which reflect/ruminate are two values: a reflexive unsettled meme is the aperiodic (κ≥ω₁) never-settling regime (rumination); a settled meme is strict-finite. Grounded in settling-continuity, settling-monotonicity, and aperiodic-settling.`,
    domainSchema: Object.freeze({ $ref: MEME_CARRIER_ID }),
    codomainSchema: Object.freeze({ $ref: REGIME_CARRIER_ID }),
    run: (input) => jsonResource(regimeOf(admitMeme(input, "gauge")), "settling regime"),
});
//# sourceMappingURL=gauge.mjs.map