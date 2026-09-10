/**
 * webauthn — passkeys/FIDO2 as playing's OUT-face proof-of-possession ceremony.
 *
 * This models the WebAuthn ceremony structurally. It does not call a browser,
 * platform authenticator, CTAP device, or cryptographic verifier. animating owns
 * the identity facet (`animating.webauthn-credential`); playing consumes that
 * facet as a credential locus, registers it as a held CapabilityView, and cuts a
 * fresh challenge against the holder's affordances.
 */
import { type WebAuthnAssertion, type WebAuthnChallenge, type WebAuthnCut, type WebAuthnIdentityFacet, type WebAuthnRegistration } from "./carriers/index.mjs";
export interface RegisterOptions {
    readonly id?: string;
    readonly holder?: string;
}
export interface ChallengeOptions {
    readonly id?: string;
    readonly nonce?: string;
}
export interface AssertionContext {
    readonly affordances: readonly string[];
    readonly usedChallenges?: readonly string[];
}
export interface AssertionVerdict {
    readonly held: boolean;
    readonly fresh: boolean;
    readonly matched: boolean;
    readonly verified: boolean;
    readonly reason?: WebAuthnCut["reason"];
}
export declare function webauthnGrant(credential: WebAuthnIdentityFacet): string;
/**
 * register — WebAuthn registration as `grant`. The identity facet is already
 * owned by animating; this function only turns it into the held OUT-face locus
 * that the assertion ceremony may exercise.
 */
export declare function register(credentialView: WebAuthnIdentityFacet, options?: RegisterOptions): WebAuthnRegistration;
/**
 * challenge — issue a one-shot challenge naming the exact registered credential
 * locus. Freshness is checked by the caller's used-challenge ledger.
 */
export declare function challenge(registration: WebAuthnRegistration, options?: ChallengeOptions): WebAuthnChallenge;
export declare function verify(registration: WebAuthnRegistration, issued: WebAuthnChallenge, context: AssertionContext): AssertionVerdict;
/** canAssert — soundness gate: assertable iff the credential locus is held. */
export declare function canAssert(registration: WebAuthnRegistration, context: Pick<AssertionContext, "affordances">): boolean;
/**
 * assertCredential — produce the structural WebAuthn assertion. This is the
 * proof-of-possession move: one fresh challenge, one held credential locus, one
 * invocation. The signature string is a ceremony witness, not real crypto.
 */
export declare function assertCredential(registration: WebAuthnRegistration, issued: WebAuthnChallenge, context: AssertionContext): WebAuthnAssertion;
/**
 * cut — the challenge-to-assertion round as playing's *-autonomous interaction:
 * convergence iff the challenge is fresh, names the registration, and `canInvoke`
 * says the credential authority is held.
 */
export declare function cut(registration: WebAuthnRegistration, issued: WebAuthnChallenge, context: AssertionContext): WebAuthnCut;
export declare const invoke: typeof assertCredential;
export declare const canInvoke: typeof canAssert;
export declare const ceremony: typeof cut;
//# sourceMappingURL=webauthn.d.mts.map