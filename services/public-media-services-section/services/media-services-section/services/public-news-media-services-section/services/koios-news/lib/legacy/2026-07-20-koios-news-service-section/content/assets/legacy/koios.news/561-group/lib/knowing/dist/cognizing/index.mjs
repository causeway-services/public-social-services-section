import { cognizeAction } from "./morphisms/cognize.mjs";
import { absorbAction } from "./morphisms/absorb.mjs";
import { reflectAction } from "./morphisms/reflect.mjs";
import { ruminateAction } from "./morphisms/ruminate.mjs";
import { doubtAction } from "./morphisms/doubt.mjs";
import { forgetAction } from "./morphisms/forget.mjs";
import { assessAction } from "./assess.mjs";
import { gaugeAction } from "./gauge.mjs";
import { discernAction } from "./discern.mjs";
import { recollectAction } from "./recollect.mjs";
import { inferAction } from "./infer.mjs";
import { attendAction } from "./attend.mjs";
import { consolidateAction } from "./consolidate.mjs";
import { bindAction } from "./bind.mjs";
import { attractAction } from "./attract.mjs";
import { spectralAction, hodgeAction, contextualSpectrumAction, contextualDreamFrontierAction } from "./spectral.mjs";
import { contextualityAction } from "./contextuality.mjs";
import { samePatternAction } from "./same-pattern.mjs";
import { knowNecessarilyAction } from "./know-necessarily.mjs";
import { knowPossiblyAction } from "./know-possibly.mjs";
export { cognizeAction } from "./morphisms/cognize.mjs";
export { absorbAction } from "./morphisms/absorb.mjs";
export { reflectAction } from "./morphisms/reflect.mjs";
export { ruminateAction } from "./morphisms/ruminate.mjs";
export { doubtAction } from "./morphisms/doubt.mjs";
export { forgetAction } from "./morphisms/forget.mjs";
export { assessAction } from "./assess.mjs";
export { gaugeAction } from "./gauge.mjs";
export { discernAction } from "./discern.mjs";
export { recollectAction } from "./recollect.mjs";
export { inferAction } from "./infer.mjs";
export { attendAction } from "./attend.mjs";
export { consolidateAction } from "./consolidate.mjs";
export { bindAction } from "./bind.mjs";
export { bindingCarrier } from "./binding.mjs";
export { attractAction, attractorOf } from "./attract.mjs";
export { spectralAction, spectralBindingOf, hodgeAction, hodgeBindingOf, contextualSpectrumAction, contextualSpectrumOf, contextualDreamFrontierAction, contextualDreamFrontierOf, } from "./spectral.mjs";
export { contextualityAction, contextualityOf } from "./contextuality.mjs";
export { samePatternAction } from "./same-pattern.mjs";
export { knowNecessarilyAction } from "./know-necessarily.mjs";
export { knowPossiblyAction } from "./know-possibly.mjs";
export { cognizingTerms, cognizerCognize, cognizerDoubt, cognizerForget, cognizerReflect, cognizerRuminate, } from "./expressing.mjs";
// the C(Meme) knowledge-state grain helpers (the comonad context = a held section).
// joinK/meetK are the comonad's knowledge-order (≤_k) lattice operations; standingOf
// is the comonad counit's read-out of a meme's ≤_k standing.
export { foldSection, stateFromMemes, summarizeState, heldMemesOf, admitState, standingOf, joinK, meetK, sectionSignature } from "./section.mjs";
// knowing's own carriers — single-source TypeBox (relation-model notation, no codegen):
// the carrier VALUES are exported (not just the types) so importing this module REGISTERS
// them in relating's category kernel (the actions' `$ref`s resolve against the registry).
export { knowledgeStandingCarrier, knowledgeStateCarrier, settlingRegimeCarrier, attractorCarrier, contextualityCarrier, consolidationCarrier, derivabilityCarrier, knowledgeIdentityCarrier, modalStandingCarrier, } from "./carriers.mjs";
/** The morphisms of knowing-as-comonad on the ≤_k axis:
 *  - meme-endomorphisms: cognize (ε-unit), absorb (learn), reflect (δ converge),
 *    ruminate (δ diverge), doubt (dual descent), forget (≤_k annihilation);
 *  - readings into knowing's own carriers: assess (standing), gauge (intelligence /
 *    regime), discern (the two equalities). */
export const cognizingActions = Object.freeze([
    cognizeAction,
    absorbAction,
    reflectAction,
    ruminateAction,
    doubtAction,
    forgetAction,
    assessAction,
    gaugeAction,
    discernAction,
    // the C(Meme) knowledge-state grain: memory, inference, attention, consolidation, equivalence
    recollectAction,
    inferAction,
    attendAction,
    consolidateAction,
    // the binding problem solved by sheaf cohomology (H⁰ percepts, H¹ obstruction)
    bindAction,
    // memory recall as attractor dynamics (no-periodic-orbit ⇒ cycle-free convergence)
    attractAction,
    // spectral binding: bind's H⁰ as the Laplacian zero-eigenvalue multiplicity + Matrix-Tree robustness
    spectralAction,
    // Hodge decomposition of binding: derivable (exact) vs irreducible (harmonic/H¹) bindings
    hodgeAction,
    // bridge spectral/Hodge residue with signed global-section obstruction
    contextualSpectrumAction,
    contextualDreamFrontierAction,
    // sheaf-theoretic contextuality (signed-graph frustration = Z₂/H¹ obstruction)
    contextualityAction,
    samePatternAction,
    // modal knowing: □/◇ over a world-set (each world a held knowledge-state)
    knowNecessarilyAction,
    knowPossiblyAction,
]);
//# sourceMappingURL=index.mjs.map