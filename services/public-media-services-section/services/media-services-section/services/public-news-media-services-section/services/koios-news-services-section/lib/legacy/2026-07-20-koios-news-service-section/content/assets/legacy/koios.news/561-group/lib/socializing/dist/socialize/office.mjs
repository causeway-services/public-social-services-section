import { correlate, } from "./govern.mjs";
/** The work-carrier spine — the levels a jural relation's scope-action (a WORK-ITEM) sits at.
 *  endeavor generates campaign generates project generates plan generates task generates the
 *  work-item leaf (the managing-operations work-vocabulary order; here it types the SCOPE of a
 *  duty/assignment, so an agent's obligation is addressed at the right altitude of the work). */
export const WORK_LEVELS = Object.freeze([
    "endeavor",
    "campaign",
    "project",
    "plan",
    "task",
    "work-item",
]);
/** The scope-action string a jural relation carries for a work-item: `level:id` (parent dropped —
 *  the enclosing carrier is the work hierarchy's concern, not the binding's). */
export function workScope(item) {
    return `${item.level}:${item.id}`;
}
/**
 * Constitute an office from its name and deontic profile. Each profile entry becomes a jural
 * relation with the office as the active holder, asserted (potential) — the office's structural,
 * persistent normative content.
 */
export function office(name, profile) {
    const relations = profile.map((entry) => Object.freeze({
        kind: entry.kind,
        active: name,
        passive: entry.party ?? `${name}:body-politic`,
        scope: workScope(entry.over),
        standing: "potential",
    }));
    return Object.freeze({
        kind: "socializing.office",
        name,
        profile: Object.freeze(relations),
    });
}
/** The incumbency state from the two FOUR-valued required predicates (office-as-double-settlement.md):
 *  recognition (honor) × induction (munus). A ⊤ on either is a repair condition; an explicit f
 *  on either fails the settlement; (t,t) is full dignitas. */
export function incumbencyState(recognition, induction) {
    if (recognition === "stable" || induction === "stable")
        return "repair";
    if (recognition === "active" || induction === "active")
        return "failed";
    const recognized = recognition === "potential";
    const inducted = induction === "potential";
    if (recognized && inducted)
        return "dignitas";
    if (inducted)
        return "munus";
    if (recognized)
        return "recognition";
    return "vacant";
}
/**
 * invest — settle a candidate's incumbency of an office by the double settlement, devolving the
 * office's deontic profile onto the incumbent at dignitas (powers transfer; dignitas non moritur
 * leaves the office's own profile untouched). The two required predicates are passed as their
 * settled FOUR values (recognition = honor, induction = munus).
 */
export function invest(office, incumbent, recognition, induction) {
    const state = incumbencyState(recognition, induction);
    const devolved = state === "dignitas"
        ? office.profile.map((relation) => Object.freeze({ ...relation, active: incumbent }))
        : [];
    return Object.freeze({
        office: office.name,
        incumbent,
        state,
        devolved: Object.freeze(devolved),
    });
}
/** relieve — dissolve an incumbent's hold on an office (the inverse of investiture): the
 *  incumbency returns to vacant and nothing is devolved. The office itself persists. */
export function relieve(office, incumbent) {
    return Object.freeze({
        office: office.name,
        incumbent,
        state: "vacant",
        devolved: Object.freeze([]),
    });
}
/**
 * assign — bind a work-item to an agent as a DUTY (the agent now OWES it: the "owned-by"
 * relation). The correlative is the office's/assigner's CLAIM that the work be done. This is
 * the operational position that turns a work-item into agentic labor an agent is answerable for.
 */
export function assign(to, item, by = "assigner") {
    return Object.freeze({
        kind: "duty",
        active: to,
        passive: by,
        scope: workScope(item),
        standing: "potential",
    });
}
/** grant — bind a POWER over a work-item to an agent (the capacity to alter positions regarding
 *  it); the correlative is the governed party's liability. */
export function grant(to, item, over = "body-politic") {
    return Object.freeze({
        kind: "power",
        active: to,
        passive: over,
        scope: workScope(item),
        standing: "potential",
    });
}
/** immunize — bind an IMMUNITY to an agent regarding a work-item (a position another agent
 *  CANNOT alter on it); the correlative is the other party's disability. */
export function immunize(holder, item, against = "body-politic") {
    return Object.freeze({
        kind: "immunity",
        active: holder,
        passive: against,
        scope: workScope(item),
        standing: "potential",
    });
}
/** The correlative (passive-side) view of a borne relation — the party the relation binds and
 *  how (a duty's claim-holder, a power's liable party, an immunity's disabled party). */
export function borneBy(relation) {
    return correlate(relation);
}
/** waive — the holder VOLUNTARILY relinquishes a position: its standing moves to `active` (denied,
 *  f). A waiver is by the position's own holder. */
export function waive(relation) {
    return Object.freeze({ ...relation, standing: "active" });
}
/** revoke — a granted authority is UNILATERALLY retracted by the grantor: the standing moves to
 *  `active` (denied, f). Distinct from waiver in provenance (grantor, not holder); same standing move. */
export function revoke(relation) {
    return Object.freeze({ ...relation, standing: "active" });
}
/** ratify — retroactively VALIDATE a position that was unauthorized (⊥) or contested (⊤): its
 *  standing moves to `potential` (asserted, t). The retroactive-validation operational position. */
export function ratify(relation) {
    return Object.freeze({ ...relation, standing: "potential" });
}
/** rotate — advance a rotation to the NEXT eligible incumbent (the Markov discipline: next in the
 *  roster, cycling). The current incumbent is relieved and the next installed in one step; NO agent
 *  accumulates the office's authority across periods — authority-experience distributes across the
 *  roster. Returns the advanced rotation and the relieved/installed incumbents. */
export function rotate(rotation) {
    const size = rotation.roster.length;
    if (size === 0)
        throw new RangeError("rotate: empty roster");
    const next = (rotation.current + 1) % size;
    return Object.freeze({
        rotation: Object.freeze({ ...rotation, current: next }),
        relieved: rotation.roster[((rotation.current % size) + size) % size],
        installed: rotation.roster[next],
    });
}
/** Constitute the accountability of a bearer over a scope (a work-item or a bare scope string). */
export function accountability(bearer, scope) {
    return Object.freeze({
        kind: "socializing.accountability",
        bearer,
        scope: typeof scope === "string" ? scope : workScope(scope),
    });
}
/** answerableParty — the party accountable for any outcome in scope: ALWAYS the bearer (totality),
 *  NEVER a delegate (non-transferability by delegation). Invariant under `delegate`. */
export function answerableParty(account) {
    return account.bearer;
}
/** delegate — distribute AUTHORITY (a power) to a sub-agent: a new power relation with active = the
 *  delegate. Delegation distributes authority; it does NOT move accountability — an `Accountability`
 *  is unchanged by this op (the U.S. Navy Regs 0802 invariant: delegation never relieves the bearer). */
export function delegate(power, to) {
    return Object.freeze({ ...power, active: to });
}
// ── Reciprocity (ayni) + restoration (Ubuntu) ──
/** reciprocate — ayni reciprocal exchange: labor PROVIDED creates a correlative reciprocal-DEBT — the
 *  receiver now owes reciprocal labor to the provider. A duty relation active = receiver (the debtor),
 *  passive = provider (the creditor). Accumulates as the populace's reciprocal-debt graph. */
export function reciprocate(provider, receiver, labor) {
    return Object.freeze({
        kind: "duty",
        active: receiver,
        passive: provider,
        scope: typeof labor === "string" ? labor : workScope(labor),
        standing: "potential",
    });
}
/** restore — the restorative-accountability response: a reparation duty (offender owes the harmed
 *  party) aimed at reintegration, not a punitive position. */
export function restore(offender, harmed, harm) {
    return Object.freeze({
        kind: "socializing.restoration",
        reparation: Object.freeze({
            kind: "duty",
            active: offender,
            passive: harmed,
            scope: `repair:${typeof harm === "string" ? harm : workScope(harm)}`,
            standing: "potential",
        }),
        reintegrative: true,
    });
}
/** separationOfDuty — static separation of duty (RBAC): certain role pairs MUST NOT be co-assigned to
 *  one agent (conflict of interest). Returns the violating (agent, forbidden-pair) conflicts — empty
 *  iff the assignment respects every constraint. The forbidden combinations are a structural axiom on
 *  the role-assignment relation. */
export function separationOfDuty(assignments, forbidden) {
    const byAgent = new Map();
    for (const { agent, role } of assignments) {
        const roles = byAgent.get(agent) ?? new Set();
        roles.add(role);
        byAgent.set(agent, roles);
    }
    const conflicts = [];
    for (const [agent, roles] of byAgent) {
        for (const [a, b] of forbidden) {
            if (roles.has(a) && roles.has(b))
                conflicts.push(Object.freeze({ agent, roles: Object.freeze([a, b]) }));
        }
    }
    return Object.freeze(conflicts);
}
/** declare — perform a status-function declaration. With standing it CONSTITUTES the institutional
 *  fact (the target holds, as a privilege in the context, the status `counts-as:<Y>`); without
 *  standing it misfires (constituted = null). */
export function declare(target, status, context, by, hasStanding) {
    return Object.freeze({
        kind: "socializing.declaration",
        target,
        status,
        context,
        by,
        felicitous: hasStanding,
        constituted: hasStanding
            ? Object.freeze({
                kind: "privilege",
                active: target,
                passive: context,
                scope: `counts-as:${status}`,
                standing: "potential",
            })
            : null,
    });
}
/** refuse — the Black-radical REFUSAL / abolition capability: a community blocks an inherited
 *  declaration from BINDING its members — a structural claim of NON-APPLICABILITY ("this institution's
 *  rules do not fire on our cells"). The refused status's standing is denied (active, f) for the
 *  refuser: the declaration does not bind them. Not a negation of governance — an alternative one. */
export function refuse(declaration, by) {
    return Object.freeze({
        kind: "privilege",
        active: by,
        passive: declaration.context,
        scope: `refuses:${declaration.status}`,
        standing: "active",
    });
}
//# sourceMappingURL=office.mjs.map