/**
 * Action projections for the researching spine.
 *
 * The executable morphisms live in the nested researching modules. These actions
 * only admit a memory carrier at the wire and project the real codomain carriers
 * to bounded JSON-safe forms.
 */
import { action, jsonResource } from "@emsenn/relating";
import { projectCurriculum, projectLearning, projectResearch } from "../projecting/index.mjs";
import { introducing, studying, learning, teaching } from "./introducing/index.mjs";
import { certified, research } from "./researching.mjs";
const memoryDomainSchema = Object.freeze({
    type: "object",
    required: ["kind", "root", "documents"],
    properties: {
        kind: { const: "knowing.memory" },
        root: { type: "string" },
        documents: { type: "array" },
        utterances: { type: "array" },
    },
    additionalProperties: true,
});
function admitMemory(input, verb) {
    const value = jsonResource(input, `${verb} memory`);
    if (value === null || typeof value !== "object" || Array.isArray(value)) {
        throw new TypeError(`${verb}: expected a knowing.memory carrier`);
    }
    const record = value;
    if (record["kind"] !== "knowing.memory")
        throw new TypeError(`${verb}: expected kind "knowing.memory"`);
    if (typeof record["root"] !== "string")
        throw new TypeError(`${verb}: memory.root must be a string`);
    if (!Array.isArray(record["documents"]))
        throw new TypeError(`${verb}: memory.documents must be an array`);
    return record;
}
function settledResearch(input, verb) {
    const settled = research(admitMemory(input, verb));
    if (settled === null)
        throw new TypeError(`${verb}: no memory documents to research`);
    return settled;
}
export const researchAction = action({
    verb: "research",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Research memory into its settled topology and certification judgment.",
    description: "Domain: knowing.memory. Codomain: the projected SettledResearch carrier: closure regime, on-shell judgment, certification, and stage count.",
    domainSchema: memoryDomainSchema,
    codomainSchema: Object.freeze({ $ref: "knowing/researching/research" }),
    run: (input) => {
        const settled = settledResearch(input, "research");
        return jsonResource(projectResearch(settled, certified(settled)), "research projection");
    },
});
export const learningAction = action({
    verb: "learning",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Research memory and project the learning lessons its trace yields.",
    description: "Domain: knowing.memory. Codomain: the projected learning carrier induced by research -> introducing -> studying -> learning.",
    domainSchema: memoryDomainSchema,
    codomainSchema: Object.freeze({ $ref: "knowing/researching/learning" }),
    run: (input) => {
        const settled = settledResearch(input, "learning");
        return jsonResource(projectLearning(learning(studying(introducing(settled)))), "learning projection");
    },
});
export const curriculumAction = action({
    verb: "curriculum",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Research memory and project its curriculum.",
    description: "Domain: knowing.memory. Codomain: the projected curriculum carrier induced by research -> introducing -> studying -> learning -> teaching.",
    domainSchema: memoryDomainSchema,
    codomainSchema: Object.freeze({ $ref: "knowing/researching/curriculum" }),
    run: (input) => {
        const settled = settledResearch(input, "curriculum");
        return jsonResource(projectCurriculum(teaching(learning(studying(introducing(settled))))), "curriculum projection");
    },
});
export const researchActions = Object.freeze([
    researchAction,
    learningAction,
    curriculumAction,
]);
//# sourceMappingURL=actions.mjs.map