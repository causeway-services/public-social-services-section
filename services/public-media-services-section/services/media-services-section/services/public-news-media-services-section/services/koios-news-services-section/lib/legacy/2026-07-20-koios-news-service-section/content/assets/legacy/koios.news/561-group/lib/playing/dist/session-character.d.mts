/**
 * session-character - read one agent-session as a performed character.
 *
 * A session self is not stored in an actor record. It is reconstructed from the
 * chronicle of what the session did: the plays yield the actor, the actor wears
 * masks at situation addresses, and role-distance/persona-shadow are read only
 * relative to a supplied troupe and universe.
 *
 * `playing` intentionally does not import `animating`: the dependency graph runs
 * the other way. Callers inject the animating interior, or inject the `perceive`
 * leg so this module can fold events append-only with prior events as memory.
 */
import { type FromSchema } from "@emsenn/relating";
import { identity, performedSelf, type CharacterAgent } from "./character-agent.mjs";
import { type Performativity, type PersonaShadow, type RoleDistance } from "./persona.mjs";
import { type Chronicle } from "./structuring/concurrent-game/with-symmetry/ludicizing/chronicle.mjs";
import type { Design } from "./structuring/concurrent-game/with-symmetry/ludicizing/design.mjs";
import type { Discipline } from "./discipline.mjs";
import type { Skill } from "./skill.mjs";
export declare const sessionEventWitnessSchema: {
    readonly $id: "playing/session-character/event-witness";
    readonly title: "SessionEventWitness";
    readonly description: "One witnessed event in a session chronicle. The chronicle is the play carried by the event; harness/lane/office provide mask labels.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly required: readonly ["kind", "session", "chronicle"];
    readonly properties: {
        readonly kind: {
            readonly const: "playing.session-character.event:witness";
        };
        readonly session: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly chronicle: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly harness: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly via: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly lane: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly office: {
            readonly type: "string";
            readonly minLength: 1;
        };
    };
};
export type SessionEventWitnessCarrier = FromSchema<typeof sessionEventWitnessSchema>;
export type SessionEventWitness = SessionEventWitnessCarrier & {
    readonly chronicle: Chronicle;
};
export declare const sessionEventWitnessCarrier: any;
export declare const sessionMaskSchema: {
    readonly $id: "playing/session-character/mask";
    readonly title: "SessionMask";
    readonly description: "A session mask: the reconstructed actor delocated at a harness, lane, or office address.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "axis", "label", "at", "persona"];
    readonly properties: {
        readonly kind: {
            readonly const: "playing.session-character.mask";
        };
        readonly axis: {
            readonly enum: readonly ["harness", "lane", "office"];
        };
        readonly label: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly at: {
            readonly type: "array";
            readonly items: {
                readonly type: "integer";
                readonly minimum: 0;
            };
        };
        readonly persona: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
export type SessionMaskCarrier = FromSchema<typeof sessionMaskSchema>;
export type SessionMask = Omit<SessionMaskCarrier, "persona"> & {
    readonly persona: Design;
};
export declare const sessionMaskCarrier: any;
export declare const sessionSituationSchema: {
    readonly $id: "playing/session-character/situation";
    readonly title: "SessionSituationReading";
    readonly description: "A parameterized reading of one reconstructed actor before a troupe and universe.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "name", "personaShadow", "roleDistance"];
    readonly properties: {
        readonly kind: {
            readonly const: "playing.session-character.situation";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly personaShadow: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly roleDistance: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
};
export type SessionSituationCarrier = FromSchema<typeof sessionSituationSchema>;
export type SessionSituationReading = Omit<SessionSituationCarrier, "personaShadow" | "roleDistance"> & {
    readonly personaShadow: PersonaShadow;
    readonly roleDistance: RoleDistance;
};
export declare const sessionSituationCarrier: any;
export declare const sessionCharacterReadingSchema: {
    readonly $id: "playing/session-character/reading";
    readonly title: "SessionCharacterReading";
    readonly description: "The performed character reading of one session: animating interior, masks, character-agent bundle, and situation-sensitive moat readings.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "name", "events", "folds", "actor", "interior", "masks", "character", "performativity", "performedSelf", "identity", "baseline", "situation"];
    readonly properties: {
        readonly kind: {
            readonly const: "playing.session-character.reading";
        };
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
        };
        readonly events: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly folds: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly actor: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly interior: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly masks: {
            readonly type: "array";
            readonly items: {
                readonly $ref: "playing/session-character/mask";
            };
        };
        readonly character: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly performativity: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly performedSelf: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly identity: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
        readonly baseline: {
            readonly $ref: "playing/session-character/situation";
        };
        readonly situation: {
            readonly $ref: "playing/session-character/situation";
        };
    };
};
export type SessionCharacterReadingCarrier = FromSchema<typeof sessionCharacterReadingSchema>;
export type SessionCharacterReading<Interior extends object = object> = Omit<SessionCharacterReadingCarrier, "actor" | "interior" | "masks" | "character" | "performativity" | "performedSelf" | "identity" | "baseline" | "situation"> & {
    readonly actor: Design;
    readonly interior: Interior;
    readonly masks: readonly SessionMask[];
    readonly character: CharacterAgent;
    readonly performativity: Performativity;
    readonly performedSelf: ReturnType<typeof performedSelf>;
    readonly identity: ReturnType<typeof identity>;
    readonly baseline: SessionSituationReading;
    readonly situation: SessionSituationReading;
};
export declare const sessionCharacterReadingCarrier: any;
export interface PerceiveFoldOptions {
    readonly identity: string;
}
export type SessionPerceive<Interior extends object> = (input: readonly SessionEventWitness[], memory: readonly SessionEventWitness[] | undefined, options: PerceiveFoldOptions) => Interior;
export interface SessionCharacterOptions<Interior extends object> {
    readonly name?: string;
    readonly interior?: Interior;
    readonly perceive?: SessionPerceive<Interior>;
    readonly disciplines?: readonly Discipline[];
    readonly skills?: readonly Skill[];
    readonly baselineUniverse?: readonly Design[];
}
export declare function sessionMasks(actor: Design, events: readonly SessionEventWitness[]): readonly SessionMask[];
export declare function foldSessionInterior<Interior extends object>(events: readonly SessionEventWitness[], perceive: SessionPerceive<Interior>, options: PerceiveFoldOptions): {
    readonly interior: Interior;
    readonly folds: number;
};
export declare function sessionCharacterReading<Interior extends object>(events: readonly SessionEventWitness[], troupe: readonly Design[], universe: readonly Design[], options: SessionCharacterOptions<Interior>): SessionCharacterReading<Interior>;
//# sourceMappingURL=session-character.d.mts.map