import type { Design } from "./structuring/concurrent-game/with-symmetry/ludicizing/design.mjs";
/** Don a persona: relocate a design's whole play under an address — the same actor as a new character.
 *  Masks compose (delocation is a monoid action), so there is no original face beneath. */
export declare function mask(actor: Design, at: readonly number[]): Design;
/** Whether `worn` is `actor` wearing the mask at `at` — i.e. `worn` is the persona of the same
 *  underlying play, relocated. (Two characters that are one actor under different masks.) */
export declare function sameActor(actor: Design, worn: Design, at: readonly number[]): boolean;
/** The performativity reading of a persona — reconstructed from its performances. */
export interface Performativity {
    readonly kind: "playing.performativity";
    /** the number of chronicles (performances) the persona is the union of. */
    readonly plays: number;
    /** the design reconstructed from the union of its chronicles' actions. */
    readonly reconstructed: Design;
    /** the reconstruction equals the persona — "a design is the union of its chronicles". */
    readonly faithful: boolean;
    /** NO ESSENCE behind the performances: the doer is exactly the deeds (Butler). Equals `faithful`. */
    readonly noEssence: boolean;
}
/**
 * performativity — demonstrate Butler's "no doer behind the deed" on the ludics: reconstruct the persona
 * from its chronicles alone (the union of the plays it performs) and find the reconstruction FAITHFUL.
 * The persona has no substantive interior prior to its performances; it IS their sedimented union.
 */
export declare function performativity(actor: Design): Performativity;
/** The Jungian split of an actor before an audience. */
export interface PersonaShadow {
    readonly kind: "playing.persona-shadow";
    /** the PERSONA — the mask shown: the incarnation/front stage the audience meets. */
    readonly persona: Design;
    /** the SHADOW — the disowned: the ballast/back stage no counter visits. */
    readonly shadow: Design;
    readonly personaLoci: number;
    readonly shadowLoci: number;
}
/** personaShadow — split an actor into persona (the mask shown to the audience) and shadow (the disowned
 *  reserve), via the incarnation stage split. Jung's persona/shadow as front/back stage. */
export declare function personaShadow(actor: Design, troupe: readonly Design[], universe: readonly Design[]): PersonaShadow;
/** The role-distance reading: how much the actor exceeds the role it shows. */
export interface RoleDistance {
    readonly kind: "playing.role-distance";
    /** the reserve held back as a fraction of the whole: shadow / (persona + shadow) ∈ [0,1]. */
    readonly distance: number;
    /** the actor equals its incarnation — no reserve (MATERIAL). */
    readonly material: boolean;
    /** the mode: `identification` (the actor IS the role — Stanislavski/Method) or `role-distance` (the
     *  actor SHOWS the role from a reserve — Brecht's gestus / Goffman's role distance). */
    readonly mode: "identification" | "role-distance";
}
/**
 * roleDistance — read the actor's relation to its role: an actor with no reserve (material — its whole
 * commitment is incarnated/shown) IS the role (identification, the Method); an actor holding back a
 * shadow shows the role at a distance (Brechtian demonstration). `distance` is the held-back fraction.
 */
export declare function roleDistance(actor: Design, troupe: readonly Design[], universe: readonly Design[]): RoleDistance;
//# sourceMappingURL=persona.d.mts.map