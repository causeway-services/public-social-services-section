/**
 * articulating/utterance — the base object, base carrier, and base morphism.
 *
 * `Mark` is the opaque atom: an immutable carrier wrapping one present value.
 * Core code never inspects a Mark's payload as ordinary data — only a codec
 * boundary may. A `Token` (left hand) and a `Claim` (right hand) each carry a
 * Mark; an `Utterance = (Token, Claim)` is the base admission carrier; and
 * `articulate` opens the aperiodic articulation category at its potential cell.
 * Every public morphism of relating normalizes back through `Mark → Utterance →
 * articulate`; this module is where that base lives.
 */
/** A mark: an immutable carrier wrapping a single present value. The opaque atom. */
export declare class Mark {
    readonly kind: "utterance.mark";
    readonly value: unknown;
    constructor(value: unknown);
}
/** A token: the immutable left-hand utterance carrier holding one mark. */
export declare class Token {
    readonly kind: "utterance.token";
    readonly hand: "left";
    readonly mark: Mark;
    constructor(mark: Mark);
}
/** A claim: the immutable right-hand utterance carrier holding one mark. */
export declare class Claim {
    readonly kind: "utterance.claim";
    readonly hand: "right";
    readonly mark: Mark;
    constructor(mark: Mark);
}
/** An utterance: the base admission carrier pairing a token with a claim. */
export interface UtteranceCarrier {
    readonly kind: "utterance.carrier";
    readonly token: Token;
    readonly claim: Claim;
}
/** The token-side slot of an aperiodic articulation cell. */
export type TokenArticulationSlot = readonly [] | readonly [Token];
/** The claim-side slot of an aperiodic articulation cell. */
export type ClaimArticulationSlot = readonly [] | readonly [Claim];
/** The pairing term of an aperiodic articulation cell. */
export type AperiodicArticulationPairing = readonly [TokenArticulationSlot, ClaimArticulationSlot];
/** An aperiodic articulation cell: a carrier utterance plus its two slots. */
export type AperiodicArticulationCell = readonly [UtteranceCarrier, AperiodicArticulationPairing];
/** The potential aperiodic articulation cell: both slots empty (the initial object). */
export type PotentialAperiodicArticulationCell = readonly [UtteranceCarrier, readonly [readonly [], readonly []]];
/** The articulation cell `articulate` opens, carrying the potential aperiodic cell. */
export interface ArticulationCell {
    readonly kind: "utterance.articulation.cell";
    readonly potentialAperiodicArticulationCell: PotentialAperiodicArticulationCell;
}
/** A witness that two marks coincide. */
export interface MarkCoincidenceWitness<Carrier> {
    readonly kind: "utterance.coincidence:witness";
    readonly left: Carrier;
    readonly right: Carrier;
}
/** An obstruction to two marks coinciding. */
export interface MarkCoincidenceObstruction<Carrier> {
    readonly kind: "utterance.coincidence-obstruction";
    readonly left: Carrier;
    readonly right: Carrier;
}
/** The result of judging two token/claim carriers coincident. */
export type TokenIdentityJudgment = MarkCoincidenceWitness<Token> | MarkCoincidenceObstruction<Token>;
/** The result of judging two claim carriers coincident. */
export type ClaimIdentityJudgment = MarkCoincidenceWitness<Claim> | MarkCoincidenceObstruction<Claim>;
/** Constructs a Mark wrapping the given value. */
export declare function mark(value: unknown): Mark;
/** Constructs a Token from the given mark. */
export declare function token(markCarrier: Mark): Token;
/** Constructs a Claim from the given mark. */
export declare function claim(markCarrier: Mark): Claim;
/** Constructs an utterance carrier from two marks: left becomes a token, right a claim. */
export declare function utterance(left: Mark, right: Mark): UtteranceCarrier;
/** Whether two mark payloads coincide: identical primitives, or structurally
 *  equal plain JSON. This is the only place core code reads a Mark payload, and
 *  it reads it only to judge coincidence — never to branch on its content.
 *
 *  Structural (value) coincidence, not reference identity: this package is
 *  boundary-first, so carriers are routinely reconstructed from JSON with no
 *  shared references. Coincidence must survive a transport round-trip; reference
 *  identity would not. (This is the one deliberate divergence from the prior
 *  reference-identity carrier coincidence.) */
export declare function coincides(left: unknown, right: unknown): boolean;
/** Judges whether two tokens coincide: a witness when their marks coincide, else an obstruction. */
export declare function tokenIdentity(left: Token, right: Token): TokenIdentityJudgment;
/** Judges whether two claims coincide: a witness when their marks coincide, else an obstruction. */
export declare function claimIdentity(left: Claim, right: Claim): ClaimIdentityJudgment;
/**
 * Articulates an utterance carrier: opens the aperiodic articulation category at
 * its potential cell. The token and claim are fixed by the carrier; neither slot
 * is filled at this initial object. This is the base morphism.
 */
export declare function articulate(carrier: UtteranceCarrier): ArticulationCell;
/** Type guard: the aperiodic articulation shape with a potential cell whose slots are empty. */
export declare function isArticulationCell(value: object): value is ArticulationCell;
//# sourceMappingURL=utterance.d.mts.map