import { dutyPowerValence } from "./clastre.mjs";
/**
 * symbolicViolence — detect Bourdieusian symbolic violence: an agent dominated over a scope (savior–slave
 * by `dutyPowerValence`) who authors no contesting stance over it (no relation of theirs holds an `active`
 * denial or a `stable` ⊤ on the scope). Domination plus the dominated's own endorsement is misrecognition
 * — the sociological core of californication's affective foreclosure.
 */
export function symbolicViolence(relations, agent, scope) {
    const dominated = dutyPowerValence(relations, agent, scope).valence === "savior-slave";
    const contests = relations.some((relation) => relation.active === agent
        && relation.scope === scope
        && (relation.standing === "active" || relation.standing === "stable"));
    const endorsed = !contests;
    return Object.freeze({
        kind: "socializing.symbolic-violence",
        agent,
        scope,
        dominated,
        endorsed,
        symbolicViolence: dominated && endorsed,
    });
}
/**
 * capitalConcentration — the share of one form of capital held by its largest holder, the structuring
 * inequality of the field on that axis. Symbolic capital concentrated is how misrecognition (symbolic
 * violence) converts into durable position.
 */
export function capitalConcentration(holders, dimension) {
    let total = 0;
    let topHolder = "";
    let topValue = 0;
    for (const holder of holders) {
        const value = Math.max(0, holder.capital[dimension]);
        total += value;
        if (value > topValue) {
            topValue = value;
            topHolder = holder.agent;
        }
    }
    return Object.freeze({
        kind: "socializing.capital-concentration",
        dimension,
        total,
        topHolder,
        topShare: total > 0 ? topValue / total : 0,
    });
}
//# sourceMappingURL=bourdieu.mjs.map