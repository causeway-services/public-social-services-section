/**
 * affect — Silvan Tomkins' affect system as a reading over a ludic CHRONICLE (frontier register,
 * Layer B / first cut: dev/docs/notes/2026-06-25-affect-and-dramaturgy-in-play.md, in @emsenn/gaming).
 *
 * Tomkins (Affect Imagery Consciousness, 1962) holds that affect is triggered not by content but by the
 * PROFILE of neural firing density — its gradient: a steep rise fires fear, a moderate rise interest, a
 * sustained high level anger or distress, a fall (relief) enjoyment, a sudden onset surprise. A
 * CHRONICLE is, in his terms, a SCENE (a lived run) and a design is a SCRIPT; the affect a play carries
 * is read off the gradient of its STIMULATION — here the `ramification` opened at each action (the
 * branching novelty introduced). This gives the felt TEXTURE of a play that the win/loss reading discards.
 *
 * A reading, honestly: it maps the chronicle's stimulation profile to seven of Tomkins' nine affects.
 * The two rejection affects (disgust, dissmell) are content-directed, not gradient-driven, and are
 * reserved — never produced by this gradient reading. Consumes only the chronicle's actions; re-derives
 * no ludics.
 */
import type { Chronicle } from "./structuring/concurrent-game/with-symmetry/ludicizing/chronicle.mjs";
/** Tomkins' nine affects. The gradient reading produces seven; `disgust`/`dissmell` are reserved for a
 *  future content-directed (not density-driven) reading. */
export type AffectName = "interest" | "enjoyment" | "surprise" | "distress" | "fear" | "anger" | "shame" | "disgust" | "dissmell";
/** The stimulation profile of a chronicle and the dominant affect read off its gradient. */
export interface PlayAffect {
    readonly kind: "playing.play-affect";
    /** the dominant Tomkins affect the play's stimulation gradient fires. */
    readonly dominant: AffectName;
    /** the affect's valence. */
    readonly valence: "positive" | "negative" | "neutral";
    /** the stimulation (branching) opened at the first action — the onset. */
    readonly onset: number;
    /** the peak stimulation across the play. */
    readonly peak: number;
    /** peak − onset: how much the stimulation rose from the start (the gradient's reach). */
    readonly buildup: number;
    /** the number of actions in the play (the scene's length). */
    readonly length: number;
    /** the play ended in a Daimon (†) — a give-up: the interruption of interest/enjoyment Tomkins reads
     *  as shame. */
    readonly surrender: boolean;
}
/**
 * playAffect — read the dominant Tomkins affect of a chronicle off its stimulation gradient (the
 * branching `ramification` opened at each action). A give-up (Daimon) fires shame; a startling onset
 * (maximal stimulation at the first move) fires surprise; a steep build fires fear, a moderate build
 * interest; sustained-high-without-relief fires anger, sustained-moderate distress; a smooth low or
 * resolved line settles to enjoyment. The empty play is bare attention (interest).
 */
export declare function playAffect(c: Chronicle): PlayAffect;
//# sourceMappingURL=affect.d.mts.map