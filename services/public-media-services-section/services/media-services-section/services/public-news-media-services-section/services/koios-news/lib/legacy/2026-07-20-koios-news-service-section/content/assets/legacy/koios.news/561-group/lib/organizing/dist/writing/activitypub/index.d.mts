/**
 * writing/activitypub — organizing's ACROSS-face standards codec: ActivityPub
 * Server-to-Server (federation). The scale-2 half: moving data between agent-CAMPS.
 *
 * animating owns scale-1: the single agent as an Actor, its Activity↔membrane
 * bridge, its inbox/outbox (Client-to-Server). organizing owns scale-2: delivering
 * those SAME Activities between many Actors across constituent camps — S2S. This is
 * exactly the C2S/S2S split of ActivityPub landing on our scale-1/scale-2 seam.
 *
 * No second ontology: this consumes animating's `Activity` and `Actor` verbatim and
 * adds only DELIVERY — it never redefines the Activity. A camp is a constituent
 * society of Actors (a polity); a federation is the parallel composition `‖` of
 * camps (organizing/federation.schema). Delivering an Activity across the federation
 * is the cross-arena fan-out: route one Actor's outbound Activity to the inboxes of
 * member Actors across camps, preferring a camp's shared inbox when present.
 *
 * Layering: organizing → animating → relating. This is downstream of animating's
 * across face; it imports the scale-1 vocabulary and adds the inter-camp transport.
 * The federation-cohomology reading of WHAT propagates (shared lifts coordination-
 * free / contested tolerated as ⊤ / federationOnly) is organizing's federation math;
 * this brick is the delivery primitive it rides on.
 * See dev/docs/notes/2026-06-25-codecs-on-faces-activitypub-across-scales.md.
 */
import type { ChargeValueName } from "@emsenn/relating";
import { ACTIVITY_JSON, type Activity, type Actor, type OrderedCollection, type Capability } from "@emsenn/animating";
import { type Federation } from "../../organizing.mjs";
import { type OfficeEligibilityRequest, type EligibilityGap } from "../../authority.mjs";
/** The ActivityStreams 2.0 JSON-LD context (re-stated so this codec needs no JSON-LD
 *  processor — the federation surface emits only the AS2 vocabulary it uses). */
export declare const ACTIVITYSTREAMS_CONTEXT: "https://www.w3.org/ns/activitystreams";
/** A camp: a constituent society of member Actors — one polity in the federation.
 *  `sharedInbox`, when present, is the camp's batch delivery endpoint (S2S optimization). */
export interface Camp {
    readonly id: string;
    readonly members: readonly Actor[];
    readonly sharedInbox?: string;
}
/** A Delivery: one Activity routed to a deduplicated set of target inbox IRIs — the
 *  S2S delivery envelope. A plain typed envelope over the carried `Activity` (it nests
 *  an already-carried value, so it is not a re-registered carrier). */
export interface Delivery {
    readonly "@context": typeof ACTIVITYSTREAMS_CONTEXT;
    readonly activity: Activity;
    /** the resolved target inbox IRIs the activity is delivered to (deduplicated). */
    readonly targets: readonly string[];
}
/**
 * deliver — the S2S delivery to a flat set of recipient Actors: route one Activity to
 * each recipient's inbox. The atomic inter-Actor transport.
 */
export declare function deliver(activity: Activity, recipients: readonly Actor[]): Delivery;
/**
 * deliverToCamps — the federation fan-out: route one Activity to member Actors across
 * many camps (the parallel composition `‖` of constituent inboxes). When a camp has a
 * `sharedInbox`, that single endpoint stands in for its members (the S2S shared-inbox
 * optimization); otherwise each member's inbox is targeted. Cross-camp duplicate
 * inboxes (a member belonging to two camps — name-passing) are delivered once.
 */
export declare function deliverToCamps(activity: Activity, camps: readonly Camp[]): Delivery;
/** The count of distinct camps an Activity reaches — its federation spread. */
export declare function reach(delivery: Delivery): number;
/** One S2S HTTP request: POST the activity to a remote inbox. */
export interface DeliveryRequest {
    readonly method: "POST";
    readonly url: string;
    readonly contentType: typeof ACTIVITY_JSON;
    readonly body: string;
}
/**
 * deliveryRequests — the LIVE S2S transport (in lib, not a site): project a `Delivery`
 * into the HTTP POST requests that carry the Activity to each target inbox. Pure — like
 * relating's `routeRequest`, it produces the requests; an effectful client (or a site
 * binding) sends them. This is how data actually moves between agent-camps over HTTP.
 */
export declare function deliveryRequests(delivery: Delivery): readonly DeliveryRequest[];
/**
 * federateActivities — read WHAT propagates when camps exchange Activities, via
 * organizing's PROVEN federation math (`federate`, the cross-arena Mayer–Vietoris
 * parallel composition). Each camp's delivered Activities become its across membrane;
 * the existing `federate` then classifies the union: `shared` concerns lift
 * coordination-free, `contested` overlap-disagreement is tolerated as ⊤, and
 * `federationOnly` is the genuine federation-level obligation.
 * `glued`/`coordination` say whether the camps cohere without consensus apparatus.
 *
 * No second ontology: this REUSES `federate` over the Activities-as-membrane — it does
 * not re-author the federation cohomology. It is the bridge that makes S2S delivery
 * federation-AWARE rather than blind fan-out.
 */
export declare function federateActivities(campActivities: readonly (readonly Activity[])[]): Federation;
/**
 * follow — an agent requests to join a camp: a `Follow` Activity addressed to the
 * camp. The actor is the agent's IRI, the object is the camp's id. The agent sends
 * this to the camp's (shared) inbox.
 */
export declare function follow(actor: Actor, camp: Camp): Activity;
/**
 * accept — the camp admits a follower: an `Accept` Activity wrapping the `Follow`.
 * The actor is the camp; the object references the Follow (its follower carried in
 * `content`). Sent back to the follower's inbox completes the handshake.
 */
export declare function accept(followActivity: Activity, camp: Camp): Activity;
/**
 * admit — realize the membership the Accept grants: the camp with the follower added
 * as a member (idempotent, deduplicated by Actor id). This is "joining a camp" as
 * state — after this, `deliverToCamps` fans Activities to the new member, and the
 * member's concerns participate in `federateActivities`.
 */
export declare function admit(camp: Camp, member: Actor): Camp;
/** Whether an Actor is already a member of a camp. */
export declare function isMember(camp: Camp, actorId: string): boolean;
/**
 * announce — broadcast (socializing's `broadcast`): an Actor re-publishes an existing
 * Activity to an audience — the AS2 `Announce` (boost). The object references the
 * announced Activity; `to` is the audience the broadcast reaches.
 */
export declare function announce(activity: Activity, by: Actor, audience: readonly string[]): Activity;
/**
 * mergeActivities — the CRDT merge (socializing's `merge` = the ≤_k join ∨_k): combine
 * several camps' Activity collections into one, conflict-free. It is a grow-only-set
 * join — idempotent, commutative, associative — keyed so that an assertion and its
 * `Undo` are BOTH retained (paraconsistent: no witness is dropped). The conflict is
 * not resolved here; it surfaces as ⊤ when the merged collection is read by the across
 * face (`federateActivities`/`communicatingFace`). Returns an AS2 OrderedCollection
 * (reusing animating's builder — no second ontology).
 */
export declare function mergeActivities(...collections: readonly (readonly Activity[])[]): OrderedCollection;
/** The outcome of an office-bound grant: either the issued capability, or the
 *  eligibility gap that denied it. */
export type GrantOutcome = {
    readonly granted: Capability;
} | {
    readonly denied: EligibilityGap;
};
/**
 * grantByOffice — issue a capability ONLY if the issuer is eligible for the office that
 * authorizes it (organizing's `officeEligibility`). This binds OCap issuance to the
 * authority math: holding the office's required capabilities/authorities is the
 * precondition for minting a new capability. An ineligible issuer is denied with the
 * eligibility `gap` — authority is earned, not asserted.
 */
export declare function grantByOffice(request: OfficeEligibilityRequest, holder: string, grants: string, id?: string): GrantOutcome;
/** One capability transfer: a held capability passed to a recipient. */
export interface CapabilityTransfer {
    readonly capability: Capability;
    readonly to: string;
}
/**
 * exchange — concurrent capability exchange across agents (gaming's FSym(𝔸) symmetry):
 * apply many capability delegations SIMULTANEOUSLY — each is name-passing, and because
 * the actions commute under the symmetry the batch is order-independent. Returns each
 * re-held capability and the `Offer` Activity conveying it, ready for `deliver`. The
 * concurrent (not sequential) realization of `delegate`.
 */
export declare function exchange(transfers: readonly CapabilityTransfer[]): readonly {
    readonly capability: Capability;
    readonly activity: Activity;
}[];
/** investiture — install an incumbent in an office (socializing's `invest`): an AS2
 *  `Add` of the incumbent to the office collection. The office's authority is what
 *  `grantByOffice` later checks — this is how an Actor comes to hold issuing power. */
export declare function investiture(office: string, incumbent: string, by: string): Activity;
/** vacate — relieve an incumbent of an office (socializing's `relieve`): an AS2 `Remove`. */
export declare function vacate(office: string, incumbent: string, by: string): Activity;
/**
 * rotateOffice — rotational authority (socializing's `rotate`, the Andean ayllu): the
 * office passes round-robin to the next member of the roster. Returns the next index,
 * who is installed/relieved, and the AS2 `Remove`+`Add` activities that transfer it —
 * authority that circulates rather than concentrates.
 */
export declare function rotateOffice(office: string, roster: readonly string[], current: number, by: string): {
    readonly next: number;
    readonly installed: string;
    readonly relieved: string;
    readonly activities: readonly Activity[];
};
/** A claim's converged decision across the camps that spoke to it. */
export interface ClaimConsensus {
    readonly claim: string;
    /** the consensus value: `potential` = the camps converge to accept; lowered by any dissent. */
    readonly value: ChargeValueName;
    /** whether a simple majority of speaking camps assert the claim. */
    readonly majority: boolean;
}
/**
 * converge — settle a plurality of camps toward consensus on each claim (socializing's
 * `consensusClose` = the truth-MEET ∧_t, strict: any dissent lowers it; and
 * `majorityClose` = simple majority). For each claim, the camps that SPOKE contribute
 * an alignment (`potential` if the camp asserts it, `active` if it challenges/denies);
 * silent camps abstain. The strict consensus and the majority reading are both
 * reported — the H¹/coordination cost is whether they agree. Reuses socializing's
 * proven deciding functions; no second consensus ontology.
 */
export declare function converge(campActivities: readonly (readonly Activity[])[]): readonly ClaimConsensus[];
/**
 * commonGround — the conversational common ground of a thread (communicating's
 * grounding: `assertIntoCommonGround`/`challengeCommonGround`): the claims that were
 * asserted and NOT challenged — the propositions the participants mutually accept as
 * the shared context. A challenged claim (an `Undo`/`Delete`/`Reject`, or a denial)
 * drops out: acceptance is defeasible. This is the accumulating shared ground of an
 * AS2 conversation, not a per-actor reading.
 */
export declare function commonGround(activities: readonly Activity[]): readonly string[];
/** A name translation between observer frames — V(α) in the discrete (stalkwise) case:
 *  a map from one camp's IRIs/handles to another's. */
export type NameTranslation = Readonly<Record<string, string>>;
/**
 * translate — re-frame an Activity from one camp's namespace into another's
 * (socializing's `translate` = the inter-observer functor V(α), discrete case): apply
 * the name translation to the actor and the audience (`to`/`cc`). This is how an
 * Activity authored in one observer frame is carried into another across the
 * federation — name-passing under translation, not a re-authoring of the content.
 */
export declare function translate(activity: Activity, translation: NameTranslation): Activity;
//# sourceMappingURL=index.d.mts.map