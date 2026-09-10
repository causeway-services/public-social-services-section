/**
 * carriers - playing's JSON-Schema-declared carrier objects.
 *
 * Each exported carrier is one schema literal: `FromSchema` supplies the static
 * type, `carrierFrom` registers the runtime validator, and the bare `$id` remains
 * the action composition address.
 */
import { type FromSchema } from "@emsenn/relating";
export declare const ChargeValueNameSchema: {
    readonly enum: readonly ["absurd", "potential", "active", "stable"];
};
export declare const LocusSchema: {
    readonly type: "array";
    readonly items: {
        readonly type: "integer";
        readonly minimum: 0;
    };
};
export declare const DesignEntrySchema: {
    readonly type: "object";
    readonly required: readonly ["charge", "locus"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly charge: {
            readonly enum: readonly ["absurd", "potential", "active", "stable"];
        };
        readonly locus: {
            readonly type: "array";
            readonly items: {
                readonly type: "integer";
                readonly minimum: 0;
            };
        };
    };
};
export declare const DesignSchema: {
    readonly $id: "playing/design";
    readonly title: "Design";
    readonly description: "Playing's own carrier: a partial charge-valuation over a locus tree.";
    readonly type: "object";
    readonly required: readonly ["entries"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly entries: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["charge", "locus"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly charge: {
                        readonly enum: readonly ["absurd", "potential", "active", "stable"];
                    };
                    readonly locus: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "integer";
                            readonly minimum: 0;
                        };
                    };
                };
            };
        };
    };
};
export declare const designCarrier: any;
export type DesignCarrier = FromSchema<typeof DesignSchema>;
export declare const interactionCarrier: any;
export declare const orthogonalityCarrier: any;
export declare const behaviourCarrier: any;
export declare const incarnationCarrier: any;
export declare const normalizationCarrier: any;
export declare const identityCarrier: any;
export declare const statementCarrier: any;
export declare const fragmentCarrier: any;
export declare const focusingCarrier: any;
export declare const embeddingCarrier: any;
export declare const capabilityViewSchema: {
    readonly $id: "playing/capability-view";
    readonly title: "CapabilityView";
    readonly description: "The structural view of an existing object-capability: id + grants + holder (+ optional parent). Downstream OCap carriers project here without giving playing a second authority ontology.";
    readonly type: "object";
    readonly required: readonly ["id", "grants", "holder"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grants: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly holder: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly parent: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type CapabilityView = FromSchema<typeof capabilityViewSchema>;
export declare const capabilityViewCarrier: any;
export declare const macaroonCaveatSchema: {
    readonly $id: "playing/macaroons/caveat";
    readonly title: "MacaroonCaveat";
    readonly description: "A macaroon/biscuit caveat as playing attenuation: appending it narrows the carried capability grant monotonically. Third-party caveats require a delegated discharge.";
    readonly type: "object";
    readonly required: readonly ["kind", "id", "mode", "predicate", "grants"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.macaroons.caveat";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly mode: {
            readonly enum: readonly ["first-party", "third-party"];
        };
        readonly predicate: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grants: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly location: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly discharger: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type MacaroonCaveat = FromSchema<typeof macaroonCaveatSchema>;
export declare const macaroonCaveatCarrier: any;
export declare const macaroonTokenSchema: {
    readonly $id: "playing/macaroons/token";
    readonly title: "MacaroonToken";
    readonly description: "A caveat-attenuated capability token. The signature is a structural HMAC-chain model, not executable cryptography; authority is the carried CapabilityView.";
    readonly type: "object";
    readonly required: readonly ["kind", "id", "capability", "caveats", "signature"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.macaroons.token";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly capability: {
            readonly $ref: "playing/capability-view";
        };
        readonly caveats: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "playing/macaroons/caveat";
            };
        };
        readonly signature: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly parent: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type MacaroonToken = FromSchema<typeof macaroonTokenSchema> & {
    readonly capability: CapabilityView;
    readonly caveats: readonly MacaroonCaveat[];
};
export declare const macaroonTokenCarrier: any;
export declare const macaroonDischargeSchema: {
    readonly $id: "playing/macaroons/discharge";
    readonly title: "MacaroonDischarge";
    readonly description: "A third-party caveat discharge: delegated name-passing authority for the caveat's narrowed grant.";
    readonly type: "object";
    readonly required: readonly ["kind", "id", "caveat", "by", "capability", "signature"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.macaroons.discharge";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly caveat: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly by: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly capability: {
            readonly $ref: "playing/capability-view";
        };
        readonly signature: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type MacaroonDischarge = FromSchema<typeof macaroonDischargeSchema> & {
    readonly capability: CapabilityView;
};
export declare const macaroonDischargeCarrier: any;
export declare const macaroonInvocationSchema: {
    readonly $id: "playing/macaroons/invocation";
    readonly title: "MacaroonInvocation";
    readonly description: "An invocation attempt through a macaroon token, admitted only when verification and canInvoke agree.";
    readonly type: "object";
    readonly required: readonly ["kind", "token", "grants", "holder", "verified", "exercisable"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.macaroons.invocation";
        };
        readonly token: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grants: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly holder: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly verified: {
            readonly type: "boolean";
        };
        readonly exercisable: {
            readonly type: "boolean";
        };
    };
};
export type MacaroonInvocation = FromSchema<typeof macaroonInvocationSchema>;
export declare const macaroonInvocationCarrier: any;
export declare const webauthnIdentityFacetSchema: {
    readonly $id: "playing/webauthn/identity-facet";
    readonly title: "WebAuthnIdentityFacet";
    readonly description: "Playing's structural view of animating's WebAuthn/passkey identity facet. The authoritative identity carrier lives in animating/writing/identity; playing consumes this shape to run the OUT-face ceremony/assertion.";
    readonly type: "object";
    readonly required: readonly ["kind", "id", "rpId", "publicKey", "keyId"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "animating.webauthn-credential";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly rpId: {
            readonly type: "string";
        };
        readonly publicKey: {
            readonly type: "string";
        };
        readonly keyId: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type WebAuthnIdentityFacet = FromSchema<typeof webauthnIdentityFacetSchema>;
export declare const webauthnIdentityFacetCarrier: any;
export declare const webauthnRegistrationSchema: {
    readonly $id: "playing/webauthn/registration";
    readonly title: "WebAuthnRegistration";
    readonly description: "Registration as grant: an animating WebAuthn identity facet admitted as a held playing CapabilityView.";
    readonly type: "object";
    readonly required: readonly ["kind", "credential", "capability", "registered"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.webauthn.registration";
        };
        readonly credential: {
            readonly $ref: "playing/webauthn/identity-facet";
        };
        readonly capability: {
            readonly $ref: "playing/capability-view";
        };
        readonly registered: {
            readonly type: "boolean";
        };
    };
};
export type WebAuthnRegistration = FromSchema<typeof webauthnRegistrationSchema> & {
    readonly credential: WebAuthnIdentityFacet;
    readonly capability: CapabilityView;
};
export declare const webauthnRegistrationCarrier: any;
export declare const webauthnChallengeSchema: {
    readonly $id: "playing/webauthn/challenge";
    readonly title: "WebAuthnChallenge";
    readonly description: "A one-shot WebAuthn challenge naming the registered credential locus that must be held for assertion.";
    readonly type: "object";
    readonly required: readonly ["kind", "id", "rpId", "credential", "grants", "nonce"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.webauthn.challenge";
        };
        readonly id: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly rpId: {
            readonly type: "string";
        };
        readonly credential: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grants: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly nonce: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type WebAuthnChallenge = FromSchema<typeof webauthnChallengeSchema>;
export declare const webauthnChallengeCarrier: any;
export declare const webauthnAssertionSchema: {
    readonly $id: "playing/webauthn/assertion";
    readonly title: "WebAuthnAssertion";
    readonly description: "A structural WebAuthn assertion: challenge-bound proof-of-possession for a held credential locus. Signatures are modeled structurally, not executed cryptographically.";
    readonly type: "object";
    readonly required: readonly ["kind", "credential", "challenge", "grants", "holder", "clientDataHash", "authenticatorData", "signature", "verified", "exercisable"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.webauthn.assertion";
        };
        readonly credential: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly challenge: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grants: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly holder: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly clientDataHash: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly authenticatorData: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly signature: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly verified: {
            readonly type: "boolean";
        };
        readonly exercisable: {
            readonly type: "boolean";
        };
    };
};
export type WebAuthnAssertion = FromSchema<typeof webauthnAssertionSchema>;
export declare const webauthnAssertionCarrier: any;
export declare const webauthnCutSchema: {
    readonly $id: "playing/webauthn/cut";
    readonly title: "WebAuthnCut";
    readonly description: "The *-autonomous cut witness for a WebAuthn challenge-to-assertion round: convergence iff the credential authority is held and the challenge is fresh.";
    readonly type: "object";
    readonly required: readonly ["kind", "challenge", "assertion", "converged", "daimonLoci"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.webauthn.cut";
        };
        readonly challenge: {
            readonly $ref: "playing/webauthn/challenge";
        };
        readonly assertion: {
            readonly $ref: "playing/webauthn/assertion";
        };
        readonly converged: {
            readonly type: "boolean";
        };
        readonly reason: {
            readonly enum: readonly ["not-held", "replay", "mismatch", "no-daimon"];
        };
        readonly daimonLoci: {
            readonly type: "array";
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
};
export type WebAuthnCut = FromSchema<typeof webauthnCutSchema> & {
    readonly challenge: WebAuthnChallenge;
    readonly assertion: WebAuthnAssertion;
};
export declare const webauthnCutCarrier: any;
export declare const wasiRightSchema: {
    readonly type: "string";
    readonly minLength: 1;
};
export declare const wasiPreopenSchema: {
    readonly $id: "playing/wasi/preopen";
    readonly title: "WasiPreopen";
    readonly description: "A WASI preopened handle as the playing/OUT-face view of a Capability: handle + path + rights, with the capability grant as the playable locus.";
    readonly type: "object";
    readonly required: readonly ["kind", "handle", "path", "rights", "capability"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.wasi.preopen";
        };
        readonly handle: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly path: {
            readonly type: "string";
        };
        readonly rights: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
            };
        };
        readonly capability: {
            readonly $ref: "playing/capability-view";
        };
    };
};
export type WasiPreopen = FromSchema<typeof wasiPreopenSchema>;
export declare const wasiPreopenCarrier: any;
export declare const wasiInvocationSchema: {
    readonly $id: "playing/wasi/invocation";
    readonly title: "WasiInvocation";
    readonly description: "A WASI capability invocation: one operation attempted through one preopened handle. Handling the invocation is the playing cut.";
    readonly type: "object";
    readonly required: readonly ["kind", "handle", "operation", "grants", "holder"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.wasi.invocation";
        };
        readonly handle: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly operation: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly grants: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly holder: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly capability: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type WasiInvocation = FromSchema<typeof wasiInvocationSchema>;
export declare const wasiInvocationCarrier: any;
export declare const wasiCutSchema: {
    readonly $id: "playing/wasi/cut";
    readonly title: "WasiCut";
    readonly description: "The cut witness for a WASI invocation: convergence iff the capability grant is among the holder's affordances.";
    readonly type: "object";
    readonly required: readonly ["kind", "invocation", "converged", "daimonLoci"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly kind: {
            readonly const: "playing.wasi.cut";
        };
        readonly invocation: {
            readonly $ref: "playing/wasi/invocation";
        };
        readonly converged: {
            readonly type: "boolean";
        };
        readonly reason: {
            readonly enum: readonly ["no-meeting", "no-daimon"];
        };
        readonly daimonLoci: {
            readonly type: "array";
            readonly items: {
                readonly type: "array";
                readonly items: {
                    readonly type: "integer";
                    readonly minimum: 0;
                };
            };
        };
    };
};
export type WasiCut = FromSchema<typeof wasiCutSchema>;
export declare const wasiCutCarrier: any;
export declare const propositionCarrier: any;
export declare const fragmentMembershipCarrier: any;
export declare const formulaCarrier: any;
export declare const sessionCarrier: any;
export declare const sessionCompatCarrier: any;
export declare const chroniclesCarrier: any;
export declare const viewCarrier: any;
export declare const innocenceCarrier: any;
export declare const coherenceCarrier: any;
export declare const internalCompletenessCarrier: any;
export declare const locativityCarrier: any;
export declare const chronicleConvergenceCarrier: any;
export declare const designLeqCarrier: any;
export declare const compositionCarrier: any;
export declare const copycatCarrier: any;
export declare const identityLawCarrier: any;
export declare const designRef: {
    readonly $ref: "playing/design";
};
export declare const designArraySchema: {
    readonly type: "array";
    readonly items: {
        readonly $ref: "playing/design";
    };
};
export declare const jsonObjectSchema: {
    readonly type: "object";
    readonly additionalProperties: true;
};
export declare const jsonArraySchema: {
    readonly type: "array";
    readonly items: {};
};
export declare function requestSchema<const Id extends string, const Shape extends Record<string, unknown>>(id: Id, shape: Shape, required: readonly (keyof Shape & string)[], title: string): {
    readonly $id: Id;
    readonly title: string;
    readonly type: "object";
    readonly properties: Shape;
    readonly required: readonly (keyof Shape & string)[];
    readonly additionalProperties: true;
};
//# sourceMappingURL=index.d.mts.map