/**
 * Prime event structures — the objects of $\mathbf{CGS}$ before symmetry.
 *
 * Castellan-Clairambault-Winskel take the objects of the concurrent-games
 * category to be prime event structures $(E, \leq, \#)$: a set of events with a
 * causal partial order $\leq$ (an event may not occur until its causes have)
 * and an irreflexive symmetric conflict relation $\#$ (two events in conflict
 * never both occur), with conflict inherited upward along causality.  A
 * *configuration* is a finite, down-closed, conflict-free set of events — a
 * reachable position of the running game.
 *
 * Each event carries a polarity, making the structure a *polarized* prime event
 * structure — the raw board on which Player and Opponent move.
 */
import { type Polarity } from "../polarity.mjs";
export interface Event {
    readonly kind: "game.event";
    readonly id: string;
    readonly polarity: Polarity;
}
/** An edge of a binary relation over event ids, stored as an ordered pair. */
export type EventPair = readonly [from: string, to: string];
export interface PrimeEventStructure {
    readonly kind: "game.eventStructure";
    readonly events: readonly Event[];
    /** Causality edges `[a, b]` read as $a \leq b$ ($a$ causally precedes $b$). */
    readonly causality: readonly EventPair[];
    /** Conflict edges `[a, b]` read as $a \mathbin{\#} b$ (symmetric; stored once). */
    readonly conflict: readonly EventPair[];
}
export declare function event(id: string, polarity: Polarity): Event;
export declare function eventStructure(events: readonly Event[], causality?: readonly EventPair[], conflict?: readonly EventPair[]): PrimeEventStructure;
export declare const eventIds: (structure: PrimeEventStructure) => readonly string[];
export declare const eventById: (structure: PrimeEventStructure, id: string) => Event | null;
/** $a \leq b$ in the reflexive-transitive closure of the causality edges. */
export declare function causes(structure: PrimeEventStructure, a: string, b: string): boolean;
/** $a \mathbin{\#} b$ — conflict is symmetric, so test both stored orientations. */
export declare function conflicts(structure: PrimeEventStructure, a: string, b: string): boolean;
/** The causes of `id`: every event $c$ with $c \leq id$ (including `id`). */
export declare function downSet(structure: PrimeEventStructure, id: string): readonly string[];
export interface ConfigurationWitness {
    readonly kind: "game.configuration:witness";
    readonly events: readonly string[];
}
export interface ConfigurationObstruction {
    readonly kind: "game.configuration-obstruction";
    readonly events: readonly string[];
    readonly reason: "unknown-event" | "not-down-closed" | "conflict";
    readonly offending: EventPair;
}
export type ConfigurationJudgment = ConfigurationWitness | ConfigurationObstruction;
/**
 * Judge whether a set of event ids is a configuration: every id is known, the
 * set is down-closed under causality, and it is conflict-free.
 */
export declare function configurationJudgment(structure: PrimeEventStructure, events: readonly string[]): ConfigurationJudgment;
export declare function isConfiguration(structure: PrimeEventStructure, events: readonly string[]): boolean;
export declare function isEvent(value: unknown): value is Event;
export declare function isPrimeEventStructure(value: unknown): value is PrimeEventStructure;
//# sourceMappingURL=structure.d.mts.map