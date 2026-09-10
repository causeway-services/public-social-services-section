/**
 * cognizing — knowing's core morphisms, which accumulate knowledge over the meme carrier.
 *
 * knowing WORKS OVER memes — meme in, meme out — accumulating along the meme's KNOWLEDGE order
 * ≤_k (where communicating's semiotic morphisms work the truth/meaning axis). The ≤_k accumulation
 * has a comonad structure (cognize = ε-extract, reflect = δ); that structure is a useful
 * DESCRIPTION of what these morphisms do, not a definition of what knowing IS — the "comonad on
 * Meme" gloss does not gate the surface (the cognizing READINGS below — assess/gauge/bind/attract/
 * … — are first-class faculty operations that are NOT meme→meme, and that is fine). The core
 * meme-transforming morphisms carry
 * `domainSchema === codomainSchema === { $ref: "relating/articulating/predicating/positing/meme" }`,
 * co-mounting on the meme node with communicating (disambiguated by verb), and realize the memory
 * settling-coalgebra structure read as cognition.
 * (dev/docs/notes/2026-06-21-knowing-as-comonad-on-meme.md.)
 *
 * The generating set:
 *   cognize  — the comonad unit / ε-extract: the ≤_k-idempotent "extract the known".
 *   absorb   — learning: one ≤_k increment (a firing of the settlement filtration).
 *   reflect  — the comonad δ, CONVERGENT: knowing-that-you-know, charge preserved (settles).
 *   ruminate — the δ orbit that NEVER settles: the named non-converging pathology
 *              (kept visible as reflect's shadow, never hidden).
 *
 * These are added alongside (not in place of) the coKleisli reading verbs
 * (research/know/study/…); the meme carrier is reused wholesale from
 * @emsenn/relating and no rival carrier is invented here.
 */
import type { Action } from "@emsenn/relating";
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
export { bindingCarrier, type Binding } from "./binding.mjs";
export { attractAction, attractorOf } from "./attract.mjs";
export { spectralAction, spectralBindingOf, type SpectralBinding, hodgeAction, hodgeBindingOf, type HodgeBinding, contextualSpectrumAction, contextualSpectrumOf, type ContextualSpectrum, type ContextualSpectrumPhase, contextualDreamFrontierAction, contextualDreamFrontierOf, type ContextualDreamFrontier, } from "./spectral.mjs";
export { contextualityAction, contextualityOf } from "./contextuality.mjs";
export { samePatternAction } from "./same-pattern.mjs";
export { knowNecessarilyAction } from "./know-necessarily.mjs";
export { knowPossiblyAction } from "./know-possibly.mjs";
export { cognizingTerms, cognizerCognize, cognizerDoubt, cognizerForget, cognizerReflect, cognizerRuminate, } from "./expressing.mjs";
export { foldSection, stateFromMemes, summarizeState, heldMemesOf, admitState, standingOf, joinK, meetK, sectionSignature } from "./section.mjs";
export { knowledgeStandingCarrier, knowledgeStateCarrier, settlingRegimeCarrier, attractorCarrier, contextualityCarrier, consolidationCarrier, derivabilityCarrier, knowledgeIdentityCarrier, modalStandingCarrier, type KnowledgeStanding, type SettlingRegime, type Attractor, type Contextuality, type KnowledgeIdentity, type KnowledgeState, type HeldMeme, type Consolidation, type Derivability, type ModalStanding, } from "./carriers.mjs";
/** The morphisms of knowing-as-comonad on the ≤_k axis:
 *  - meme-endomorphisms: cognize (ε-unit), absorb (learn), reflect (δ converge),
 *    ruminate (δ diverge), doubt (dual descent), forget (≤_k annihilation);
 *  - readings into knowing's own carriers: assess (standing), gauge (intelligence /
 *    regime), discern (the two equalities). */
export declare const cognizingActions: readonly Action[];
//# sourceMappingURL=index.d.mts.map