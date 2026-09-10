/**
 * acting/prompt — the composed-message class: a prompt is a cocone leg.
 *
 * A `prompt` injects a *composed message template* into the package's call
 * surface: a named, argument-taking recipe that renders MCP prompt messages. It
 * is the third standard MCP knowledge-vault primitive (alongside tools and
 * resources). `induceBins` collects prompts into the one apex; the MCP transport
 * projects them as `prompts/list` and `prompts/get`.
 *
 * Prompts compose from what the package already declares. `actionPrompt` derives
 * one prompt from an action's own summary/description/codec metadata — so every
 * registered morphism is, for free, a guided prompt an agent can fill in and run.
 * A package may also register richer composed flows (e.g. a research flow that
 * chains several actions) by calling `prompt()` directly.
 */
import type { UtteranceCarrier } from "../articulating/index.mjs";
import { type Action } from "./action.mjs";
/** One rendered prompt message. */
export interface PromptMessage {
    readonly role: "user" | "assistant";
    readonly content: Readonly<{
        type: "text";
        text: string;
    }>;
}
/** A declared prompt argument. */
export interface PromptArgument {
    readonly name: string;
    readonly description?: string;
    readonly required?: boolean;
}
/** A prompt: a registered composed-message template over the package carrier. */
export interface PromptCarrier {
    readonly kind: "relating.prompt";
    readonly name: string;
    readonly description?: string;
    readonly arguments: readonly PromptArgument[];
    /** render the prompt's messages from the supplied arguments. */
    readonly compose: (args: Readonly<Record<string, string>>) => readonly PromptMessage[];
}
/** The spec admitted by `prompt()`. */
export interface PromptSpec {
    readonly name: string;
    readonly description?: string;
    readonly arguments?: readonly PromptArgument[];
    readonly compose: (args: Readonly<Record<string, string>>) => readonly PromptMessage[];
}
/** The pure descriptor of a prompt — what `prompts/list` returns. */
export interface PromptDescriptor {
    readonly name: string;
    readonly description?: string;
    readonly arguments: readonly PromptArgument[];
}
/** Register a prompt. Validates the name and compose function. */
export declare function prompt(spec: PromptSpec): PromptCarrier;
/** Type guard: a value is a prompt carrier. */
export declare function isPrompt(value: unknown): value is PromptCarrier;
/** A convenience user-text message. */
export declare function userMessage(text: string): PromptMessage;
/** The pure descriptor of a prompt (no compose). */
export declare function promptDescriptor(pr: PromptCarrier): PromptDescriptor;
/**
 * Derive a prompt from an action: a guided template that asks the agent to
 * produce the action's input carrier and run the verb. Composed entirely from
 * the action's own declared metadata — no second description.
 */
export declare function actionPrompt(act: Action): PromptCarrier;
/** The utterance facts a prompt carries about itself — the leg's content. */
export declare function promptUtterances(pr: PromptCarrier): readonly UtteranceCarrier[];
//# sourceMappingURL=prompt.d.mts.map