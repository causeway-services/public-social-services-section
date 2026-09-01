/**
 * macaroons — caveat-attenuated capability tokens on playing's OUT face.
 *
 * This models macaroon/biscuit law, not production cryptography. The HMAC
 * signature chain is represented structurally so the carrier records how each
 * caveat is bound to the previous token; no hashing or crypto dependency is
 * introduced here. Real signing belongs at a wire package boundary.
 */
import { type CapabilityView, type MacaroonCaveat, type MacaroonDischarge, type MacaroonInvocation, type MacaroonToken } from "./carriers/index.mjs";
export interface MacaroonOptions {
    readonly id?: string;
    readonly signature?: string;
}
export interface CaveatOptions {
    readonly id?: string;
    readonly mode?: MacaroonCaveat["mode"];
    readonly location?: string;
    readonly discharger?: string;
}
export interface DischargeOptions {
    readonly id?: string;
    readonly signature?: string;
}
export interface MacaroonVerificationContext {
    readonly affordances: readonly string[];
    readonly predicates?: readonly string[];
    readonly discharges?: readonly MacaroonDischarge[];
}
export interface MacaroonVerification {
    readonly valid: boolean;
    readonly token: MacaroonToken;
    readonly failures: readonly string[];
    readonly checked: readonly MacaroonCaveat[];
}
export declare function macaroonGrantNarrows(parent: string, child: string): boolean;
export interface MacaroonAttenuationMonotoneWitness {
    readonly kind: "playing.macaroons.attenuation-monotone:witness";
    readonly parentGrant: string;
    readonly childGrant: string;
    readonly checked: readonly MacaroonCaveat[];
}
export interface MacaroonAttenuationMonotoneObstruction {
    readonly kind: "playing.macaroons.attenuation-monotone:obstruction";
    readonly parentGrant: string;
    readonly childGrant: string;
    readonly reason: string;
    readonly caveat?: MacaroonCaveat;
}
export type MacaroonAttenuationMonotoneJudgment = MacaroonAttenuationMonotoneWitness | MacaroonAttenuationMonotoneObstruction;
/**
 * attenuationMonotone — executable law witness for the macaroon/biscuit rule:
 * every appended caveat must move down the authority preorder, and the carried
 * capability must equal the final caveat grant. This is a value-level proof, not
 * a cryptographic verification step.
 */
export declare function attenuationMonotone(parent: MacaroonToken, child: MacaroonToken): MacaroonAttenuationMonotoneJudgment;
/** macaroonFromCapability — view an existing CapabilityView as a portable token. */
export declare function macaroonFromCapability(capability: CapabilityView, options?: MacaroonOptions): MacaroonToken;
/** caveat — declare one first- or third-party authority-narrowing predicate. */
export declare function caveat(predicate: string, grants: string, options?: CaveatOptions): MacaroonCaveat;
export declare function thirdPartyCaveat(predicate: string, grants: string, discharger: string, location: string, options?: Omit<CaveatOptions, "mode" | "location" | "discharger">): MacaroonCaveat;
/**
 * attenuate — append one caveat. This is the macaroon restriction step: the
 * caveat grant must be <= the current grant, and the resulting token carries
 * the caveat-narrowed CapabilityView with parent provenance.
 */
export declare function attenuate(token: MacaroonToken, next: MacaroonCaveat, options?: MacaroonOptions): MacaroonToken;
/**
 * discharge — satisfy a third-party caveat by name-passing a delegated
 * capability view from the caveat's discharger. It must name the caveat's
 * narrowed grant and holder.
 */
export declare function discharge(caveatToDischarge: MacaroonCaveat, capability: CapabilityView, options?: DischargeOptions): MacaroonDischarge;
/** verifyMacaroon — walk the caveat chain and the final canInvoke gate. */
export declare function verifyMacaroon(token: MacaroonToken, context: MacaroonVerificationContext): MacaroonVerification;
export declare function canInvokeMacaroon(token: MacaroonToken, context: MacaroonVerificationContext): boolean;
export declare function invoke(token: MacaroonToken, context: MacaroonVerificationContext): MacaroonInvocation;
export declare const canInvoke: typeof canInvokeMacaroon;
//# sourceMappingURL=macaroons.d.mts.map