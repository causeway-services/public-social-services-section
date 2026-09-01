/**
 * @emsenn/playing — the *-autonomous interaction faculty (single-agent ludics).
 *
 * playing is the OUTSIDE boundary sibling of communicating (the meme monoid) and
 * knowing (the meme comonad): the meme's *-AUTONOMOUS duality and the CUT. Its own
 * carrier is the `Design` (a strategy = a partial charge-valuation over a locus tree
 * of memes); its characteristic morphism is the binary `interact` (the cut:
 * `Design ⊗ Design^⊥ → Interaction`). On top of the cut it carries the full
 * *-autonomous category of behaviours (the MALL connectives, the exponentials,
 * incarnation, cut-elimination, Fax), the logic layer (CLL propositions, the
 * fragment lattice, focusing with shifts, sessions, the embeddings), and the
 * topology roundout (chronicles, internal completeness, locativity, the locative
 * primitives). See dev/docs/notes/2026-06-21-playing-as-star-autonomous-interaction.md.
 *
 * The single-agent ludics core is also exposed as the subpath `@emsenn/playing/ludics`
 * (see `ludics.mts`); `@emsenn/gaming-experimental` — the scale-2 lift of playing
 * along the agent-sheaf — owns the multi-agent CGS layer (arenas-with-symmetry,
 * concurrent strategies, the nominal/FSym symmetry, the social play readings, the
 * running multiplayer game) and reuses this ludics core rather than duplicating it.
 * See dev/docs/notes/2026-06-21-gaming-as-multi-agent-playing.md.
 *
 * The package root is the action surface: `actions` is the cocone `induceBins` reads
 * to project every transport (CLI/MCP/OpenAPI/web), and one `dispatch` witnesses
 * every play as EAVT in playing's own ledger.
 */
export * from "./structuring/index.mjs";
export * from "./encoding/index.mjs";
export * from "./carriers/index.mjs";
export * from "./expressing.mjs";
export { starAutonomousActions } from "./star-autonomous.mjs";
export { proofActions } from "./proof.mjs";
export { topologyExtraActions } from "./topology-extra.mjs";
export * as wasi from "./wasi.mjs";
export * as macaroons from "./macaroons.mjs";
export * as webauthn from "./webauthn.mjs";
export { grant as grantWasiCapability, preopen as preopenWasiCapability, attenuate as attenuateWasiCapability, invoke as invokeWasiCapability, canInvoke as canInvokeWasiCapability, cut as cutWasiInvocation, isAttenuation as isWasiAttenuation, type WasiRights, type GrantOptions as WasiGrantOptions, type PreopenOptions as WasiPreopenOptions, type AttenuateOptions as WasiAttenuateOptions, } from "./wasi.mjs";
export { macaroonFromCapability, caveat as macaroonCaveat, thirdPartyCaveat as macaroonThirdPartyCaveat, attenuate as attenuateMacaroonCapability, discharge as dischargeMacaroonCaveat, verifyMacaroon, canInvokeMacaroon, invoke as invokeMacaroonCapability, macaroonGrantNarrows, attenuationMonotone as macaroonAttenuationMonotone, type MacaroonVerificationContext, type MacaroonVerification, type MacaroonAttenuationMonotoneJudgment, } from "./macaroons.mjs";
export { webauthnGrant, register as registerWebAuthnCredential, challenge as challengeWebAuthnCredential, verify as verifyWebAuthnAssertion, canAssert as canAssertWebAuthnCredential, assertCredential as assertWebAuthnCredential, invoke as invokeWebAuthnCredential, cut as cutWebAuthnCeremony, ceremony as webAuthnCeremony, type RegisterOptions as WebAuthnRegisterOptions, type ChallengeOptions as WebAuthnChallengeOptions, type AssertionContext as WebAuthnAssertionContext, type AssertionVerdict as WebAuthnAssertionVerdict, } from "./webauthn.mjs";
export { compositionActions, composeAction, copycatAction, identityLawAction, } from "./composition-actions.mjs";
export { actions, designAction, dualizeAction, interactAction, } from "./actions.mjs";
export { playingFace, type PlayingFace, type EvidenceAxis, type EvidenceBelnap, } from "./face.mjs";
export { playAffect, type PlayAffect, type AffectName } from "./affect.mjs";
export { genre, type Genre, type AffectArc } from "./genre.mjs";
export { caillois, type Caillois, type CailloisCategory } from "./caillois.mjs";
export { stage, paradoxOfTheActor, spectator, dissensus, type Stage, type ParadoxOfTheActor, type Spectator, type Dissensus, } from "./dramaturgy.mjs";
export { mask, sameActor, performativity, personaShadow, roleDistance, type Performativity, type PersonaShadow, type RoleDistance, } from "./persona.mjs";
export { discipline, admits, designKey, type Discipline } from "./discipline.mjs";
export { skill, mastery, composes, nucleus, phase, SKILLFUL_WORK, type Skill, type ClosurePosition, type Mastery, } from "./skill.mjs";
export { characterAgent, practiced, repertoire, performedSelf, identity, type CharacterAgent, type CharacterParts, type Repertoire, type PerformedSelf, type Identity, } from "./character-agent.mjs";
export { sessionEventWitnessSchema, sessionEventWitnessCarrier, sessionMaskSchema, sessionMaskCarrier, sessionSituationSchema, sessionSituationCarrier, sessionCharacterReadingSchema, sessionCharacterReadingCarrier, sessionMasks, foldSessionInterior, sessionCharacterReading, type SessionEventWitness, type SessionEventWitnessCarrier, type SessionMask, type SessionMaskCarrier, type SessionSituationReading, type SessionSituationCarrier, type SessionPerceive, type PerceiveFoldOptions, type SessionCharacterOptions, type SessionCharacterReading, type SessionCharacterReadingCarrier, } from "./session-character.mjs";
export { macaroonFromCapability as macaroon, caveat, thirdPartyCaveat, attenuate as attenuateMacaroon, discharge as dischargeMacaroon, invoke as invokeMacaroon, canInvoke as canInvokeMacaroonToken, } from "./macaroons.mjs";
export { webauthnGrant as passkeyLocus, register as registerPasskey, challenge as challengePasskey, assertCredential as assertPasskey, canAssert as canAssertPasskey, cut as cutPasskeyCeremony, } from "./webauthn.mjs";
export { WASI_RIGHTS, wasiLocus, wasiHandleSchema, wasiHandleCarrier, preopen, grant as grantWasi, scopeNarrows, attenuate as attenuateWasi, invoke as invokeWasi, canInvoke as canInvokeWasi, interact as interactWasi, type WasiRight, type WasiHandle, type WasiInvocation, type WasiInteraction, } from "./wasi.mjs";
//# sourceMappingURL=index.d.mts.map