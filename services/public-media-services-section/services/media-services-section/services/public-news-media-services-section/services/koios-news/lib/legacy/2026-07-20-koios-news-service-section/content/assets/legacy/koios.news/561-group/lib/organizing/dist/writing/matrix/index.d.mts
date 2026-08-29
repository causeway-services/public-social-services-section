/**
 * writing/matrix — organizing's ACROSS-face standards codec: the Matrix protocol's
 * state-resolution over a DAG of signed events. The scale-2 / real-time half of the
 * across face: a federated ROOM whose shared state is settled by reading a directed
 * acyclic graph of events.
 *
 * The thesis (protocols-as-faculty-projections.md): Matrix's deep mechanism —
 * state-resolution over a DAG of signed events — IS the witness ledger (the event
 * DAG) + consensus/Mayer–Vietoris (the resolution) + camps (rooms), nearly
 * one-to-one. So this is not designed onto socializing; it is discovered to be the
 * wire-projection of organizing's federation math for real-time.
 *
 * No second ontology (the gate): a Matrix EVENT is an animating `Activity` — one
 * charged membrane meme — with the DAG envelope (`eventId`, `prevEvents`) added
 * around it. The Activity is reused verbatim; the codec adds only the graph spine.
 * A ROOM is a set of those events over a `Camp`. STATE RESOLUTION is a fold over the
 * DAG that REUSES organizing's proven `converge` (socializing's `consensusClose`
 * ∧_t / `majorityClose`) and `federate` (the cross-arena Mayer–Vietoris): branches
 * that AGREE settle coordination-free; a CONFLICT is settled by the consensus
 * reading (contested → ⊤ tolerated), never silently last-writer-wins.
 *
 * Layering: organizing → animating → relating. Single-source carriers via relating's
 * `carrier()` (bare descent-path $id); imports only the stable public faces
 * (@emsenn/relating, @emsenn/animating, ./organizing, ./writing/activitypub).
 * See dev/docs/notes/2026-06-25-matrix-as-socializing.md.
 */
import { type ChargeValueName, type FromSchema } from "@emsenn/relating";
import { type Activity } from "@emsenn/animating";
import type { Camp } from "../activitypub/index.mjs";
import type { Federation } from "../../organizing.mjs";
/** A Matrix EVENT as a DAG node: one charged membrane meme (an animating Activity)
 *  carried inside the event-graph envelope. `eventId` names the node; `prevEvents`
 *  are the parent node ids (the DAG edges this event extends); `stateKey`, when
 *  present, marks the event as a STATE event keyed by `(type, stateKey)` — the cell
 *  of room state it writes (a non-state event is a timeline/message event). The
 *  carried activity-shape is reused verbatim: `type`, `sender` (the AS2 `actor`),
 *  `object`. No second ontology — an event IS a charged meme with a graph spine. */
/** A Matrix event — one signed DAG node carrying a charged meme. Single-source
 *  carrier (the schema is the type, the `$id`, and the validator); bare descent-path
 *  `$id`. The event's claim is read through the SAME bridge as an Activity. */
export declare const eventSchema: {
    readonly $id: "organizing/writing/matrix/event";
    readonly title: "MatrixEvent";
    readonly description: "A Matrix event as a DAG node: one charged membrane meme (an animating Activity) inside the event-graph envelope (eventId, prevEvents). A state event (stateKey present) writes the room-state cell (type, stateKey); resolution of conflicting state events is by organizing's consensus reading, not last-writer. $id is the bare package-rooted path.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["eventId", "prevEvents", "type", "sender", "object"];
    readonly properties: {
        readonly eventId: {
            readonly type: "string";
        };
        readonly prevEvents: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly type: {
            readonly type: "string";
        };
        readonly sender: {
            readonly type: "string";
        };
        readonly object: {
            readonly anyOf: readonly [{
                readonly type: "string";
                readonly description: "a bare IRI or text the event is about";
            }, {
                readonly type: "object";
                readonly additionalProperties: true;
                readonly description: "an AS2 object node (content carries the claim)";
                readonly properties: {
                    readonly type: {
                        readonly type: "string";
                    };
                    readonly content: {
                        readonly type: "string";
                    };
                    readonly id: {
                        readonly type: "string";
                    };
                };
            }];
        };
        readonly stateKey: {
            readonly type: "string";
        };
        readonly originServerTs: {
            readonly type: "integer";
        };
    };
};
export type MatrixEvent = FromSchema<typeof eventSchema>;
export declare const eventCarrier: import("@emsenn/relating").Carrier<{
    readonly object: string | {
        readonly type?: string;
        readonly content?: string;
        readonly id?: string;
    };
    readonly type: string;
    readonly eventId: string;
    readonly prevEvents: readonly string[];
    readonly sender: string;
    readonly stateKey?: string;
    readonly originServerTs?: number;
}>;
/** A ROOM: a set of events (the event DAG) over a constituent `Camp`. The camp is the
 *  polity whose members exchange the events; the DAG is the witness ledger of what
 *  they have said. No second model — the room is `{ camp, events }`. */
export interface Room {
    readonly camp: Camp;
    readonly events: readonly MatrixEvent[];
}
/** Whether an event is a STATE event (writes a room-state cell) vs a timeline event. */
export declare function isStateEvent(event: MatrixEvent): boolean;
/**
 * asActivity — view a Matrix event AS the animating `Activity` it carries (drop the
 * DAG envelope). This is the no-second-ontology bridge: an event's body is exactly a
 * charged meme, so it flows straight into animating/communicating's across-face
 * reading and into organizing's `converge`/`federate`. The graph spine (eventId,
 * prevEvents) is metadata ABOUT the meme, not part of it.
 */
export declare function asActivity(event: MatrixEvent): Activity;
/** One branch of the event DAG: the events reachable from a given head (its causal
 *  past, head last), in topological order. A FORK is two heads with disjoint recent
 *  pasts; they are RECONCILED by state resolution, not by picking one. */
export declare function ancestryOf(room: Room, headId: string): readonly MatrixEvent[];
/** The resolved value of one state cell after settling its conflicting writers. */
export interface ResolvedCell {
    /** the state cell key `(type, stateKey)`. */
    readonly type: string;
    readonly stateKey: string;
    /** the claim that settled into the cell (the value of the room-state field). */
    readonly claim: string;
    /** the consensus value of the cell: `potential` = the writers agree (coordination-
     *  free); lowered to `stable` (⊤) when writers CONFLICT — the conflict is HELD,
     *  not dropped (paraconsistent); `active`/`absurd` when challenged/silent. */
    readonly value: ChargeValueName;
    /** whether the cell was written by more than one event (a fork was reconciled). */
    readonly forked: boolean;
    /** the conflicting candidate claims, in DAG order (kept when forked, so no writer
     *  is silently lost — the ⊤ witnesses). */
    readonly candidates: readonly string[];
}
/**
 * resolveState — Matrix state resolution as a fold over the event DAG. NOT
 * last-writer-wins: for each state cell `(type, stateKey)`, the events that write it
 * are read through organizing's `converge` (socializing's `consensusClose` ∧_t /
 * `majorityClose`) over the cell's candidate claims. When every writer agrees the
 * cell settles `potential` coordination-free; when writers CONFLICT the cell is
 * settled `stable` (⊤) — the conflict is HELD with all candidate witnesses kept,
 * never silently resolved away. This REUSES the proven consensus reading; it does not
 * author a second resolution algorithm.
 *
 * Concretely: each writer of a cell becomes a one-event "camp", and `converge`
 * settles the camps' stances on that cell's claim. Agreement ⇒ one claim, all camps
 * `potential` ⇒ `potential`. Disagreement ⇒ distinct claims; the dominant claim's
 * consensus is read, and a residual disagreement is surfaced as ⊤ (`stable`).
 */
export declare function resolveState(room: Room): readonly ResolvedCell[];
/** Whether two branches' resolved state AGREE on every shared cell (coordination-free
 *  reconciliation) — true ⟺ no cell forked into a held ⊤ conflict. */
export declare function isCoordinationFree(cells: readonly ResolvedCell[]): boolean;
/**
 * federateRoom — read the federation cohomology of a room split into branches: each
 * branch's events (as Activities) become a camp, and organizing's `federateActivities`
 * (the cross-arena Mayer–Vietoris `federate`) classifies the union — `shared` lifts
 * coordination-free, `contested` is tolerated as ⊤, `federationOnly` is the genuine
 * room-level obligation; `glued` says whether the branches cohere without consensus
 * apparatus. This is the SAME federation reading WMAP's S2S uses, applied to the
 * DAG's branches — Matrix's "state-res is our H¹" made literal.
 */
export declare function federateRoom(branches: readonly (readonly MatrixEvent[])[]): Federation;
//# sourceMappingURL=index.d.mts.map