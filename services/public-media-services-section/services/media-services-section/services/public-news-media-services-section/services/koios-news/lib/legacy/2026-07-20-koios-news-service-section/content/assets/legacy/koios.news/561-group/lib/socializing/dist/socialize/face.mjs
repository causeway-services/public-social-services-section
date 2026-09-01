/**
 * socialize/face — socializing's ACROSS / TRUTH local section over an inter-agent
 * membrane, the boundary face organizing (the bulk) reads instead of faking the across
 * face with a generic relating `descend`.
 *
 * organizing is a holographic BULK over three boundary FACES (socializing = across,
 * computing = inside, gaming = outside; dev/docs/notes/2026-06-21-bulk-over-faces-
 * local-section-threading.md). Each face is a LOCAL SECTION over that faculty's
 * inter-agent membrane, read on one of the three transverse agentive-triad bilattice
 * axes. socializing supplies the ACROSS face on the TRUTH axis (`≤_t` — which way the
 * collective leans; negation antitone): the across reading is the collective's settled
 * DIRECTION over the observer cover.
 *
 * Crucially this is socializing's OWN multi-observer reading, NOT a copy of organizing's
 * generic descend-then-section. The membrane is settled into socializing's Social Field
 * `V : O → Settlings_B` (the multi-observer system — `field.mts`), then its OWN
 * network-sheaf consensus is read off the converged `FieldSection` (`converge.mts` →
 * `consensus.mjs`'s `sheafCharges`, the bilattice-network-sheaf-consensus). The face's
 * thin cover/held/contested are projected off that field section's consensus
 * components and their opposition-H¹, not off a bare descent state:
 *
 *   cover     = the consensus components of the field section over the observer cover
 *               (each a glued common-ground cell of the collective)
 *   held      = the components whose pooled charge is a HELD truth direction
 *               (definite potential/active, or a stable held-contradiction that still
 *               glued) — the cells the collective settles
 *   contested = the components that pooled to `stable` — held truth contradictions
 *               (both witnesses, paraconsistent) — the across-face's contested cells
 *
 * The truth axis enters in how a claim becomes a charge: a denial/negation claim leans
 * `active` (negative, `≤_t`-down), an assertion leans `potential` (positive, `≤_t`-up),
 * so two observers asserting and denying the SAME subject become `opposed` on the truth
 * axis (negation antitone) — exactly the across-face direction reading. This is grounded
 * in the agentive-triad's truth axis (content/_archive predication-categories truth.md;
 * Avron twist-product) and socializing's own consensus module.
 *
 * Dependency: this is a LEAF over relating + the package's own modules. It does NOT
 * import @emsenn/organizing (the bulk). organizing imports THIS.
 */
import { charge, chargeValue, fourCensus, truthAggregateOfCensus, valueOf, } from "@emsenn/relating";
import { bigradedCohomology } from "@emsenn/relating/settling";
import { completeTranslations, ungroundedSection, } from "./field.mjs";
import { convergeAction } from "./converge.mjs";
/** The axis this face reads — the agentive-triad TRUTH axis (`≤_t`, negation antitone). */
export const SOCIALIZING_FACE_AXIS = "truth";
/** The stigmergic coordination reading: socializing coordinates through its Social Field (the
 *  shared trace field), so the per-step cost is the linear O(N + |L|) = observers + cover, and
 *  the O(N²) pairwise (orchestrated) cost is AVOIDED. Grounded in stigmergy-decouples-
 *  coordination-cost.md. */
function coordinationOf(observers, cover) {
    return Object.freeze({
        stigmergic: true, // socializing's consensus is read off the converged field section, not observer pairs
        cost: observers + cover, // O(N + |L|): the linear stigmergic per-step cost
        orchestratedCost: (observers * (observers - 1)) / 2, // O(N²): the pairwise cost it avoids
    });
}
/** Read the bigraded common-knowledge the collective achieves off its truth-axis census,
 *  PARAMETERIZED from relating's `bigradedCohomology`: C^t and C^k coincide (the bigrading
 *  collapses) iff there is no paraconsistent ⊤ component; the ⊤ components are where the two
 *  axes diverge (the split-brain / learner-lag substrate surface). */
function commonKnowledgeOf(belnap) {
    const decomposition = bigradedCohomology(belnap);
    return Object.freeze({
        agree: decomposition.collapse.kind === "predication.bigradedCohomology.collapse:witness",
        value: decomposition.truth,
        divergence: decomposition.contradiction,
    });
}
/** The truth direction a membrane claim leans: a denial leans `active` (negative,
 *  `≤_t`-down); an assertion leans `potential` (positive, `≤_t`-up). Negation antitone:
 *  the same subject asserted vs denied becomes opposed on the truth axis. The denial is
 *  detected at the claim boundary (leading negation marker or a `false`/`no` payload). */
function truthCharge(claimValue) {
    const text = typeof claimValue === "string" ? claimValue.trim() : String(claimValue);
    const denied = claimValue === false
        || /^(not|no|never|¬|!|-)\b/i.test(text)
        || /^¬|^!/.test(text);
    return charge(chargeValue(denied ? "active" : "potential"));
}
/** The bare subject a claim is about, with any leading negation marker stripped — so an
 *  assertion and its denial land on the SAME cell (and are read as opposed there). */
function claimSubject(claimValue) {
    const text = typeof claimValue === "string" ? claimValue.trim() : String(claimValue);
    return text.replace(/^(not|no|never)\b\s*/i, "").replace(/^[¬!\-]\s*/, "").trim() || text;
}
/**
 * Settle a membrane (`readonly UtteranceCarrier[]`) into socializing's Social Field:
 * each distinct observer (an utterance's `token`) becomes an observer `o ∈ O` carrying,
 * as its local memes, the truth-charges of the claims it uttered (cell = the claim's
 * bare subject). The observer category `O` is taken maximally connected (every observer
 * compared with every other) so the across reading is the WHOLE collective's direction.
 */
export function membraneField(membrane) {
    const byObserver = new Map();
    const order = [];
    for (const carrier of membrane) {
        const observer = String(carrier.token.mark.value);
        const subject = claimSubject(carrier.claim.mark.value);
        let memes = byObserver.get(observer);
        if (memes === undefined) {
            memes = [];
            byObserver.set(observer, memes);
            order.push(observer);
        }
        memes.push(Object.freeze({
            kind: "communicating.meme",
            cell: subject,
            charge: truthCharge(carrier.claim.mark.value),
        }));
    }
    const members = order.map((observer) => Object.freeze({
        kind: "socializing.member",
        agent: Object.freeze({ kind: "animating.agent", name: observer }),
        memes: Object.freeze(byObserver.get(observer)),
    }));
    return Object.freeze({
        kind: "socializing.social-field",
        members: Object.freeze(members),
        base: Object.freeze({
            kind: "socializing.social-base",
            translations: completeTranslations(members.length),
        }),
        section: ungroundedSection(),
    });
}
/** A component pooled to `stable` (`⊤`) — a HELD truth contradiction (both witnesses,
 *  paraconsistent). The across-face's contested cell. */
function isStable(pooled) {
    const c = pooled;
    return valueOf(c).name === "stable";
}
/** A component the collective HOLDS: its pooled charge carries a settled truth direction
 *  — a definite potential/active lean, or a stable held-contradiction that still glued.
 *  An `absurd` (⊥, no observer contributed) component is not held. */
function isHeld(pooled) {
    const c = pooled;
    return valueOf(c).name !== "absurd";
}
/**
 * socializingFace — socializing's ACROSS / TRUTH local section over an inter-agent
 * membrane, for the organizing bulk to glue. Settles the membrane into socializing's
 * Social Field and reads the across direction off its OWN converged consensus section
 * (network-sheaf consensus over the observer cover), NOT a generic descend.
 *
 * The thin { cover, held, contested } the bulk requires is projected off the field
 * section's consensus components: cover = the components (cells of the local section),
 * held = the components holding a truth direction, contested = the components pooled to
 * `stable` (held contradictions). Total over membranes; the empty membrane is the empty
 * across face (all zero, ungrounded section).
 */
export function socializingFace(membrane) {
    const field = membraneField(membrane);
    if (field.members.length === 0) {
        return Object.freeze({
            kind: "socializing.face",
            faculty: "socializing",
            direction: "across",
            axis: SOCIALIZING_FACE_AXIS,
            cover: 0,
            held: 0,
            contested: 0,
            observers: 0,
            obstruction: 0,
            leans: true,
            lean: "absurd",
            belnap: Object.freeze({ absurd: 0, potential: 0, active: 0, stable: 0 }),
            commonKnowledge: Object.freeze({ agree: true, value: 0, divergence: 0 }),
            coordination: Object.freeze({ stigmergic: true, cost: 0, orchestratedCost: 0 }),
            section: ungroundedSection(),
        });
    }
    // convergeAction returns the converged social-field carrier directly (jsonResource is
    // the round-tripped value, not a { resource } envelope).
    const converged = convergeAction.run(field, {});
    const section = converged.section;
    const components = section.components;
    // The truth-axis FOUR census is PARAMETERIZED from relating's proof-tree `fourCensus` over
    // the consensus components' pooled charges. `held` = the settled truth directions (non-absurd);
    // `contested` = the stable held-contradictions (⊤).
    const belnap = fourCensus(components.map((component) => valueOf(component.pooled)));
    const held = belnap.potential + belnap.active + belnap.stable;
    const contested = belnap.stable;
    return Object.freeze({
        kind: "socializing.face",
        faculty: "socializing",
        direction: "across",
        axis: SOCIALIZING_FACE_AXIS,
        cover: components.length,
        held,
        contested,
        observers: field.members.length,
        obstruction: section.obstruction,
        leans: section.coordinationFree,
        lean: truthAggregateOfCensus(belnap),
        belnap,
        commonKnowledge: commonKnowledgeOf(belnap),
        coordination: coordinationOf(field.members.length, components.length),
        section,
    });
}
//# sourceMappingURL=face.mjs.map