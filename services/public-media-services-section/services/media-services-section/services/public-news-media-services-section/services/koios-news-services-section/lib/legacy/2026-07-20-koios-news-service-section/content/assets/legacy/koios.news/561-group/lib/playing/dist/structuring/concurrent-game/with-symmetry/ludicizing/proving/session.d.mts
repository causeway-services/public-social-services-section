/**
 * Session types as propositions — the Caires-Pfenning correspondence.
 *
 * Corpus (concurrent-game-system journal, ~line 256; Caires-Pfenning 2010,
 * "Session Types as Intuitionistic Linear Propositions"; Wadler 2012,
 * "Propositions as Sessions"): a session type $S$ on a channel corresponds to a
 * CLL formula, a session-typed process $P \vdash x : S$ to a CLL proof, and
 * channel communication to cut-elimination. This package's `Proposition` carrier
 * is CLASSICAL (par + involutive `dualProp`), so we read the correspondence in
 * Wadler's classical convention: receive is $A^\perp \parr B$ (the intuitionistic
 * $A \multimap B$ of the corpus snippet, displayed there as $\multimap$).
 *
 * The map (a pure function `propositionOfSession`):
 *   - `send` (output $A$, continue $B$)       ↦ $A \otimes B$   (corpus: $A \otimes B$)
 *   - `recv` (input $A$, continue $B$)        ↦ $A^\perp \parr B$ (corpus: $A \multimap B$)
 *   - `select` (internal choice of branches)  ↦ $\bigoplus$       (Opponent's choice $\oplus$)
 *   - `offer`  (external choice of branches)  ↦ $\binampersand$   (Player's choice $\&$)
 *   - `end`   (close)                         ↦ $1$
 *   - `wait`  (wait for close)                ↦ $\bot$
 *   - `server` (replicated provider)          ↦ $!A$
 *   - `client` (replicated requester)         ↦ $?A$
 *
 * The correspondence is full and faithful (corpus sub-theorem): we realize only
 * the type-level half — the structural map of session vocabulary to connectives.
 * Endpoint duality is the CLL linear negation: send/receive, select/offer,
 * server/client, and close/wait are dual pairs.
 */
import { type Proposition } from "./proposition.mjs";
/**
 * A session type — the vocabulary of session-typed concurrency. `send`/`recv`
 * carry a payload and a continuation; `select`/`offer` carry labelled branches;
 * `end` is the terminated session; `server`/`client` are the replicated
 * exponentials.
 */
export type SessionType = {
    readonly kind: "game.logic.session.end";
} | {
    readonly kind: "game.logic.session.wait";
} | {
    readonly kind: "game.logic.session.send";
    readonly payload: SessionType;
    readonly continuation: SessionType;
} | {
    readonly kind: "game.logic.session.recv";
    readonly payload: SessionType;
    readonly continuation: SessionType;
} | {
    readonly kind: "game.logic.session.select";
    readonly branches: readonly SessionType[];
} | {
    readonly kind: "game.logic.session.offer";
    readonly branches: readonly SessionType[];
} | {
    readonly kind: "game.logic.session.server";
    readonly body: SessionType;
} | {
    readonly kind: "game.logic.session.client";
    readonly body: SessionType;
};
export declare const sessionEnd: () => SessionType;
export declare const sessionWait: () => SessionType;
export declare const sessionSend: (payload: SessionType, continuation: SessionType) => SessionType;
export declare const sessionRecv: (payload: SessionType, continuation: SessionType) => SessionType;
export declare const sessionSelect: (branches: readonly SessionType[]) => SessionType;
export declare const sessionOffer: (branches: readonly SessionType[]) => SessionType;
export declare const sessionServer: (body: SessionType) => SessionType;
export declare const sessionClient: (body: SessionType) => SessionType;
/**
 * The Caires-Pfenning map from a session type to its CLL proposition. Pure and
 * total. `select`/`offer` over branches fold with $\oplus$/$\&$; an empty
 * `select` is $0$ (unit of $\oplus$) and an empty `offer` is $\top$ (unit of
 * $\&$) by the standard nullary-choice convention.
 */
export declare function propositionOfSession(session: SessionType): Proposition;
/**
 * Endpoint duality for session protocols. The payload type is the message type
 * and is not dualized when send/receive swap; the continuation is the peer
 * endpoint and is dualized.
 */
export declare function dualSession(session: SessionType): SessionType;
/** Structural equality of session types. */
export declare function sameSessionTypes(left: SessionType, right: SessionType): boolean;
export interface SessionDualityWitness {
    readonly kind: "game.logic.sessionDuality:witness";
    readonly session: SessionType;
    readonly dual: SessionType;
    readonly proposition: Proposition;
    readonly dualProposition: Proposition;
}
export interface SessionDualityObstruction {
    readonly kind: "game.logic.sessionDuality-obstruction";
    readonly session: SessionType;
    readonly dual: SessionType;
    readonly proposition: Proposition;
    readonly dualProposition: Proposition;
    readonly reason: string;
}
export type SessionDualityJudgment = SessionDualityWitness | SessionDualityObstruction;
/** Witness that `dualSession` maps to CLL linear negation under `propositionOfSession`. */
export declare function sessionDualityJudgment(session: SessionType): SessionDualityJudgment;
export interface SessionCompatibilityWitness {
    readonly kind: "game.logic.sessionCompatibility:witness";
    readonly left: SessionType;
    readonly right: SessionType;
    readonly cut: Proposition;
}
export interface SessionCompatibilityObstruction {
    readonly kind: "game.logic.sessionCompatibility-obstruction";
    readonly left: SessionType;
    readonly right: SessionType;
    readonly expectedRight: SessionType;
    readonly reason: string;
}
export type SessionCompatibilityJudgment = SessionCompatibilityWitness | SessionCompatibilityObstruction;
/**
 * Channel compatibility: two endpoints can communicate exactly when one is the
 * dual of the other. The `cut` proposition records the CLL cut boundary
 * `A ⊗ A^⊥`, the proof-theoretic side of channel composition.
 */
export declare function sessionCompatibilityJudgment(left: SessionType, right: SessionType): SessionCompatibilityJudgment;
export interface SessionCorrespondenceWitness {
    readonly kind: "game.logic.sessionCorrespondence:witness";
    readonly session: SessionType;
    readonly proposition: Proposition;
}
/**
 * Witness the Caires-Pfenning correspondence for a given session type: the
 * session and its CLL proposition image, paired. Always a witness (the map is
 * total); the carrier records the realized correspondence.
 */
export declare function sessionCorrespondence(session: SessionType): SessionCorrespondenceWitness;
export declare function isSessionType(value: unknown): value is SessionType;
//# sourceMappingURL=session.d.mts.map