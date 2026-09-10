/**
 * Polarity — Player/Opponent duality, the $(-)^\perp$ of concurrent game systems,
 * realized as a Belnap class of the meme-algebra bilattice charge.
 *
 * The theory-of-computing claim (CGS is the theory of computing) makes
 * Player/Opponent duality the dualizing operation $(-)^\perp$ of the
 * $*$-autonomous category $\mathbf{CGS}$.  The ludics journal pins the
 * correspondence to the charge exactly:
 *
 *   - positive polarity (Proponent / Player commits "told true")  ↔ $t = (1,0)$ ↔ charge `potential`
 *   - negative polarity (Opponent     commits "told false")       ↔ $f = (0,1)$ ↔ charge `active`
 *
 * So a polarity IS a charge value, and the dual $(-)^\perp$ that swaps Player
 * and Opponent IS the meme-algebra gauge `negate`: it swaps the truth/falsity
 * coordinates, carrying `potential` to `active` and back.  We do not reinvent
 * duality; we borrow the apex's negation.
 */
import { type ChargeValue } from "@emsenn/relating";
export type PolarityName = "positive" | "negative";
export interface Polarity {
    readonly kind: "game.polarity";
    readonly name: PolarityName;
}
export declare const polarityNames: () => readonly PolarityName[];
export declare function polarity(name: PolarityName): Polarity;
export declare const positive: () => Polarity;
export declare const negative: () => Polarity;
export declare const polarityName: (p: Polarity) => PolarityName;
/** Player/Opponent duality $(-)^\perp$: swaps Proponent and Opponent. */
export declare function dual(p: Polarity): Polarity;
export declare const samePolarity: (left: Polarity, right: Polarity) => boolean;
/**
 * The Belnap charge of a polarity — the meme-apex shadow of the game object.
 * positive ↦ potential = (told-true), negative ↦ active = (told-false).
 */
export declare function polarityCharge(p: Polarity): ChargeValue;
/**
 * Recover the polarity committed by a charge value, where one is committed.
 * `potential` (t) is positive, `active` (f) is negative; the give-up value
 * `stable` ($\top$) and the no-action value `absurd` ($\bot$) commit no polarity.
 */
export declare function chargePolarity(value: ChargeValue): Polarity | null;
export declare function isPolarityName(value: unknown): value is PolarityName;
export declare function isPolarity(value: unknown): value is Polarity;
export declare function asPolarity(value: unknown): Polarity;
/**
 * Witness that $(-)^\perp$ on polarity coincides with `negate` on the charge:
 * `polarityCharge(dual(p))` equals `negateValue(polarityCharge(p))` for every p.
 * The dualizing operation of the game is the gauge negation of the apex.
 */
export interface DualityIsNegationWitness {
    readonly kind: "game.polarity.dualityIsNegation:witness";
    readonly polarity: Polarity;
    readonly dualCharge: ChargeValue;
    readonly negatedCharge: ChargeValue;
}
export interface DualityIsNegationObstruction {
    readonly kind: "game.polarity.dualityIsNegation-obstruction";
    readonly polarity: Polarity;
    readonly dualCharge: ChargeValue;
    readonly negatedCharge: ChargeValue;
}
export type DualityIsNegationJudgment = DualityIsNegationWitness | DualityIsNegationObstruction;
export declare function dualityIsNegation(p: Polarity): DualityIsNegationJudgment;
//# sourceMappingURL=polarity.d.mts.map