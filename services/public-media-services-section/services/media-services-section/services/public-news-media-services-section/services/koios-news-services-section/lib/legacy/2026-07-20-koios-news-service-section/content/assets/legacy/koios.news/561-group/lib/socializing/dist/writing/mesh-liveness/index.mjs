/**
 * writing/mesh-liveness — SWIM + HyParView/Plumtree as socializing's mesh-liveness
 * layer beneath federation.
 *
 * This is a protocol model, not a network stack: no sockets, timers, encryption, or
 * process membership daemon are implemented here. The module admits protocol observations
 * as relating carriers, joins membership views through the existing socializing CRDT
 * surface, and projects epidemic dissemination through socializing.broadcast.
 */
import { canonical, carrierFrom, charge, chargeValue, mark, meme, cell, claim, predicateOfClaim, token, valueOf, } from "@emsenn/relating";
import { broadcastAction } from "../../socialize/broadcast.mjs";
import { crdtState, mergeCrdtStates, } from "../crdt/index.mjs";
export const MESH_LIVENESS_PROTOCOLS = Object.freeze(["swim", "hyparview", "plumtree"]);
export const LIVENESS_STATES = Object.freeze(["alive", "suspect", "dead"]);
const observationValueSchema = {
    type: "object",
    required: ["member", "status", "protocol", "observer", "round", "incarnation"],
    properties: {
        member: { type: "string", minLength: 1 },
        status: { enum: LIVENESS_STATES },
        protocol: { enum: MESH_LIVENESS_PROTOCOLS },
        observer: { type: "string", minLength: 1 },
        round: { type: "integer", minimum: 0 },
        incarnation: { type: "integer", minimum: 0 },
    },
    additionalProperties: false,
};
export const MeshLivenessObservationSchema = {
    $id: "socializing/writing/mesh-liveness/observation",
    title: "MeshLivenessObservation",
    description: "One SWIM-family membership observation: alive/suspect/dead as a charged witness over a member at a round and incarnation.",
    type: "object",
    required: ["kind", "member", "status", "protocol", "observer", "round", "incarnation", "charge", "witness"],
    properties: {
        kind: { const: "socializing.mesh-liveness.observation" },
        ...observationValueSchema.properties,
        charge: { description: "a relating ChargeCarrier; the <=_k liveness witness" },
        witness: { type: "string", minLength: 1 },
    },
    additionalProperties: false,
};
export const meshLivenessObservationCarrier = carrierFrom(MeshLivenessObservationSchema);
export const MembershipViewSchema = {
    $id: "socializing/writing/mesh-liveness/membership-view",
    title: "MembershipView",
    description: "A peer's membership view as a state-CRDT: each member key accumulates SWIM observations by socializing.merge's <=_k join.",
    type: "object",
    required: ["kind", "observer", "round", "state"],
    properties: {
        kind: { const: "socializing.mesh-liveness.membership-view" },
        observer: { type: "string", minLength: 1 },
        round: { type: "integer", minimum: 0 },
        state: { description: "a socializing StateCrdt carrier; membership cells are joined with mergeCrdtStates" },
    },
    additionalProperties: false,
};
export const membershipViewCarrier = carrierFrom(MembershipViewSchema);
export const HyParViewOverlaySchema = {
    $id: "socializing/writing/mesh-liveness/hyparview-overlay",
    title: "HyParViewOverlay",
    description: "A deterministic HyParView reading: active peers form eager gossip links; passive peers are lazy repair candidates.",
    type: "object",
    required: ["kind", "self", "active", "passive"],
    properties: {
        kind: { const: "socializing.mesh-liveness.hyparview-overlay" },
        self: { type: "string", minLength: 1 },
        active: { type: "array", items: { type: "string", minLength: 1 } },
        passive: { type: "array", items: { type: "string", minLength: 1 } },
    },
    additionalProperties: false,
};
export const hyParViewOverlayCarrier = carrierFrom(HyParViewOverlaySchema);
export const PlumtreeGossipPlanSchema = {
    $id: "socializing/writing/mesh-liveness/plumtree-plan",
    title: "PlumtreeGossipPlan",
    description: "A Plumtree reading over a HyParView overlay: eager push on active links, lazy repair adverts on passive links.",
    type: "object",
    required: ["kind", "messageId", "root", "eager", "lazy"],
    properties: {
        kind: { const: "socializing.mesh-liveness.plumtree-plan" },
        messageId: { type: "string", minLength: 1 },
        root: { type: "string", minLength: 1 },
        eager: { type: "array", items: { type: "string", minLength: 1 } },
        lazy: { type: "array", items: { type: "string", minLength: 1 } },
    },
    additionalProperties: false,
};
export const plumtreeGossipPlanCarrier = carrierFrom(PlumtreeGossipPlanSchema);
export function livenessCharge(status, witness) {
    const w = mark(witness);
    switch (status) {
        case "alive":
            return charge(chargeValue("potential"), [[w], []]);
        case "suspect":
            return charge(chargeValue("active"), [[], [w]]);
        case "dead":
            return charge(chargeValue("stable"), [[w], [w]]);
    }
}
function statusStanding(status) {
    if (status === "alive")
        return "potential";
    if (status === "dead")
        return "stable";
    return "active";
}
function memberKey(member) {
    return `mesh/member/${member}`;
}
function observationDot(observation) {
    return [
        observation.observer,
        observation.member,
        observation.incarnation,
        observation.round,
        observation.status,
        observation.witness,
    ].join(":");
}
function observationWrite(observation) {
    const value = Object.freeze({
        member: observation.member,
        status: observation.status,
        protocol: observation.protocol,
        observer: observation.observer,
        round: observation.round,
        incarnation: observation.incarnation,
    });
    return Object.freeze({
        dot: observationDot(observation),
        replica: observation.observer,
        value,
        standing: statusStanding(observation.status),
        witness: observation.witness,
    });
}
function cellForObservation(observation) {
    return Object.freeze({
        key: memberKey(observation.member),
        charge: observation.charge,
        writes: Object.freeze([observationWrite(observation)]),
    });
}
export function meshLivenessObservation(input) {
    const incarnation = input.incarnation ?? 0;
    const protocol = input.protocol ?? "swim";
    const witness = input.witness ?? `${protocol}:${input.observer}:${input.member}:${input.round}:${input.status}:${incarnation}`;
    return meshLivenessObservationCarrier.assert(Object.freeze({
        kind: "socializing.mesh-liveness.observation",
        member: input.member,
        status: input.status,
        protocol,
        observer: input.observer,
        round: input.round,
        incarnation,
        charge: livenessCharge(input.status, witness),
        witness,
    }));
}
export function membershipView(observer, observations = [], round = 0) {
    const cells = observations.map(cellForObservation);
    return membershipViewCarrier.assert(Object.freeze({
        kind: "socializing.mesh-liveness.membership-view",
        observer,
        round,
        state: crdtState(cells),
    }));
}
export function mergeMembershipViews(left, right) {
    const observer = left.observer === right.observer ? left.observer : `${left.observer}|${right.observer}`;
    return membershipViewCarrier.assert(Object.freeze({
        kind: "socializing.mesh-liveness.membership-view",
        observer,
        round: Math.max(left.round, right.round),
        state: mergeCrdtStates(left.state, right.state),
    }));
}
function valueOfWrite(write) {
    const value = write.value;
    if (value === null || typeof value !== "object" || Array.isArray(value))
        return null;
    const record = value;
    const status = record["status"];
    const protocol = record["protocol"];
    if (status !== "alive" && status !== "suspect" && status !== "dead")
        return null;
    if (protocol !== "swim" && protocol !== "hyparview" && protocol !== "plumtree")
        return null;
    if (typeof record["member"] !== "string" || typeof record["observer"] !== "string")
        return null;
    if (typeof record["round"] !== "number" || typeof record["incarnation"] !== "number")
        return null;
    return record;
}
function statusRank(status) {
    if (status === "alive")
        return 3;
    if (status === "dead")
        return 2;
    return 1;
}
function writesForMember(view, member) {
    const found = view.state.cells.find((candidate) => candidate.key === memberKey(member));
    if (found === undefined)
        return null;
    return { cell: found, writes: found.writes ?? Object.freeze([]) };
}
function membersOf(view) {
    const members = new Set();
    for (const stateCell of view.state.cells) {
        if (stateCell.key.startsWith("mesh/member/"))
            members.add(stateCell.key.slice("mesh/member/".length));
        for (const write of stateCell.writes ?? []) {
            const value = valueOfWrite(write);
            if (value)
                members.add(value.member);
        }
    }
    return Object.freeze([...members].sort());
}
export function livenessOf(view, member) {
    const found = writesForMember(view, member);
    if (found === null)
        return null;
    const candidates = found.writes
        .map((write) => ({ write, value: valueOfWrite(write) }))
        .filter((entry) => entry.value !== null)
        .sort((left, right) => right.value.incarnation - left.value.incarnation ||
        right.value.round - left.value.round ||
        statusRank(right.value.status) - statusRank(left.value.status) ||
        left.write.witness.localeCompare(right.write.witness));
    const chosen = candidates[0];
    if (chosen === undefined)
        return null;
    return Object.freeze({
        member,
        status: chosen.value.status,
        incarnation: chosen.value.incarnation,
        round: chosen.value.round,
        charge: livenessCharge(chosen.value.status, chosen.write.witness),
        accumulatedCharge: found.cell.charge,
        witnesses: Object.freeze(candidates.map((entry) => entry.write.witness).sort()),
    });
}
export function membershipTable(view) {
    return Object.freeze(membersOf(view).map((member) => livenessOf(view, member)).filter((reading) => reading !== null));
}
export function swimRound(view, options) {
    const expected = options.members ?? membersOf(view);
    const responsive = new Set(options.responsive ?? []);
    const suspicionRounds = options.suspicionRounds ?? 2;
    const observations = [];
    for (const member of expected) {
        if (member === options.observer)
            continue;
        const current = livenessOf(view, member);
        if (responsive.has(member)) {
            const incarnation = (current?.incarnation ?? 0) + (current?.status === "suspect" || current?.status === "dead" ? 1 : 0);
            observations.push(meshLivenessObservation({
                member,
                status: "alive",
                observer: options.observer,
                round: options.round,
                incarnation,
                witness: `swim:${options.observer}:${member}:${options.round}:ack:${incarnation}`,
            }));
            continue;
        }
        if (current?.status === "dead")
            continue;
        const timedOut = current?.status === "suspect" && options.round - current.round >= suspicionRounds;
        const status = timedOut ? "dead" : "suspect";
        const incarnation = (current?.incarnation ?? 0) + (timedOut ? 1 : 0);
        observations.push(meshLivenessObservation({
            member,
            status,
            observer: options.observer,
            round: options.round,
            incarnation,
            witness: `swim:${options.observer}:${member}:${options.round}:${status}:${incarnation}`,
        }));
    }
    return mergeMembershipViews(view, membershipView(options.observer, observations, options.round));
}
export function failureComplete(view, member) {
    const reading = livenessOf(view, member);
    return reading?.status === "dead";
}
export function hyParViewOverlay(self, members, options = {}) {
    const peers = [...new Set(members.filter((member) => member !== self))].sort();
    const activeFanout = options.activeFanout ?? Math.min(4, peers.length);
    const passiveFanout = options.passiveFanout ?? peers.length;
    return hyParViewOverlayCarrier.assert(Object.freeze({
        kind: "socializing.mesh-liveness.hyparview-overlay",
        self,
        active: Object.freeze(peers.slice(0, activeFanout)),
        passive: Object.freeze(peers.slice(activeFanout, activeFanout + passiveFanout)),
    }));
}
export function plumtreeGossipPlan(overlay, messageId) {
    return plumtreeGossipPlanCarrier.assert(Object.freeze({
        kind: "socializing.mesh-liveness.plumtree-plan",
        messageId,
        root: overlay.self,
        eager: Object.freeze([...overlay.active]),
        lazy: Object.freeze([...overlay.passive]),
    }));
}
export function membershipViewMeme(view, witness = `mesh-liveness:${view.observer}:${view.round}`) {
    const payloadCell = cell(token(mark("socializing.mesh-liveness")), predicateOfClaim(claim(mark("membership-view"))), token(mark(view)));
    return meme(payloadCell, charge(chargeValue("potential"), [[mark(witness)], []]));
}
export function broadcastMembershipView(field, options) {
    return broadcastAction.run(field, {
        from: options.from,
        ...(options.to === undefined ? {} : { to: options.to }),
        meme: membershipViewMeme(options.view, options.witness),
    });
}
export function sameMembershipView(left, right) {
    return canonical(left.state) === canonical(right.state);
}
export function livenessStatusName(reading) {
    return `${reading.status}:${valueOf(reading.accumulatedCharge).name}`;
}
//# sourceMappingURL=index.mjs.map