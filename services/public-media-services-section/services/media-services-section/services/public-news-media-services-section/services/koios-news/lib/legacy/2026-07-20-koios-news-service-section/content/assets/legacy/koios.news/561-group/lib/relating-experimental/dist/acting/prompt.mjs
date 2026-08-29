import { fact } from "./action.mjs";
/** Register a prompt. Validates the name and compose function. */
export function prompt(spec) {
    if (!spec.name || spec.name.trim() === "")
        throw new TypeError("prompt: name is required");
    if (typeof spec.compose !== "function")
        throw new TypeError("prompt: compose must be a function");
    return Object.freeze({
        kind: "relating.prompt",
        name: spec.name,
        ...(spec.description === undefined ? {} : { description: spec.description }),
        arguments: Object.freeze([...(spec.arguments ?? [])]),
        compose: spec.compose,
    });
}
/** Type guard: a value is a prompt carrier. */
export function isPrompt(value) {
    return typeof value === "object" && value !== null && value.kind === "relating.prompt";
}
/** A convenience user-text message. */
export function userMessage(text) {
    return Object.freeze({ role: "user", content: Object.freeze({ type: "text", text }) });
}
/** The pure descriptor of a prompt (no compose). */
export function promptDescriptor(pr) {
    return Object.freeze({
        name: pr.name,
        ...(pr.description === undefined ? {} : { description: pr.description }),
        arguments: pr.arguments,
    });
}
/**
 * Derive a prompt from an action: a guided template that asks the agent to
 * produce the action's input carrier and run the verb. Composed entirely from
 * the action's own declared metadata — no second description.
 */
export function actionPrompt(act) {
    const summary = act.summary ?? `the ${act.verb} morphism`;
    return prompt({
        name: act.verb,
        description: act.summary ?? act.description ?? `Invoke the ${act.verb} operation.`,
        arguments: [
            Object.freeze({ name: "input", description: `The ${act.in} input carrier for ${act.verb}.`, required: true }),
        ],
        compose: (args) => {
            const lines = [
                `Operation: ${act.verb} — ${summary}.`,
                ...(act.description === undefined ? [] : [act.description]),
                `Input wire: ${act.in}. Output wire: ${act.out}.`,
                "",
                `Produce a well-formed ${act.in} input carrier, then call ${act.verb} with it.`,
                ...(args["input"] === undefined || args["input"] === "" ? [] : ["", "Given input:", args["input"]]),
            ];
            return [userMessage(lines.join("\n"))];
        },
    });
}
/** The utterance facts a prompt carries about itself — the leg's content. */
export function promptUtterances(pr) {
    const term = `relating.prompt.${pr.name}`;
    const facts = [fact(term, "relating.prompt.has-name", pr.name)];
    if (pr.description !== undefined)
        facts.push(fact(term, "relating.prompt.description", pr.description));
    for (const arg of pr.arguments)
        facts.push(fact(term, "relating.prompt.has-argument", arg.name));
    return Object.freeze(facts);
}
//# sourceMappingURL=prompt.mjs.map