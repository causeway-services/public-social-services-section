/**
 * acting/induce — module → carrier: the coproduct apex of a module's actions,
 * resources, and prompts.
 *
 * This is the inverse of the manifest→carrier arrow elsewhere in the workspace
 * (which reads `package.json#bin`). `induceBins` reads a module's registered
 * actions, resources, and prompts and yields the discovery carrier — the
 * coproduct apex into which each leg injects — plus a bound dispatch. CLI,
 * OpenAPI, MCP (tools + resources + prompts), and web UX are projected from this
 * one carrier as functorial images; none invents a second ontology.
 *
 * Resources and prompts are derived from what the package already declares: each
 * action's input/output JSON Schema and the discovery carrier itself project as
 * MCP resources, and each action projects as a guided MCP prompt — so the three
 * standard knowledge-vault primitives come for free, with packages free to
 * register richer resources/prompts via `resource()`/`prompt()`.
 */
import type { UtteranceCarrier } from "../articulating/index.mjs";
import type { JsonRecord } from "../codecs/json.mjs";
import { type Action } from "./action.mjs";
import { type DispatchOptions, type DispatchResult } from "./dispatch.mjs";
import { type ResourceCarrier, type ResourceDescriptor } from "./resource.mjs";
import { type PromptCarrier, type PromptDescriptor } from "./prompt.mjs";
/** One action projected as a POST endpoint over the stdio process boundary. */
export interface ActionEndpoint {
    readonly name: string;
    readonly href: string;
    readonly method: "POST";
    readonly input: string;
    readonly output: string;
    readonly summary?: string;
    readonly description?: string;
    readonly inputSchema?: JsonRecord;
    readonly outputSchema?: JsonRecord;
}
/** The discovery carrier: the coproduct apex of a package's legs. */
export interface ActionDiscovery {
    readonly kind: "relating.acting.discovery";
    readonly package: string;
    readonly protocol: "stdio";
    readonly bins: readonly ActionEndpoint[];
    readonly resources: readonly ResourceDescriptor[];
    readonly prompts: readonly PromptDescriptor[];
    readonly utterances: readonly UtteranceCarrier[];
}
/** What `induceBins` returns: the carrier, a bound dispatch, the legs. */
export interface InducedBins {
    readonly discovery: ActionDiscovery;
    readonly actions: readonly Action[];
    readonly resources: readonly ResourceCarrier[];
    readonly prompts: readonly PromptCarrier[];
    readonly dispatch: (argv: readonly string[], stdin: string, options?: DispatchOptions) => DispatchResult;
}
/** Options for inducing bins. */
export interface InduceOptions {
    readonly packageName?: string;
    readonly basePath?: string;
    /** Extra resources to publish beyond the auto-derived schema/discovery ones. */
    readonly resources?: readonly ResourceCarrier[];
    /** Extra prompts to publish beyond the auto-derived per-action ones. */
    readonly prompts?: readonly PromptCarrier[];
    /** Auto-derive one resource per action input/output JSON Schema. Default true. */
    readonly deriveSchemaResources?: boolean;
    /** Auto-derive one guided prompt per action. Default true. */
    readonly derivePrompts?: boolean;
}
/** Keep only the actions out of a module namespace (or accept a list directly). */
export declare function collectActions(source: Iterable<unknown> | Readonly<Record<string, unknown>>): readonly Action[];
/** Keep only the resources out of a module namespace (or accept a list directly). */
export declare function collectResources(source: Iterable<unknown> | Readonly<Record<string, unknown>>): readonly ResourceCarrier[];
/** Keep only the prompts out of a module namespace (or accept a list directly). */
export declare function collectPrompts(source: Iterable<unknown> | Readonly<Record<string, unknown>>): readonly PromptCarrier[];
/** Induce the bin surface for a module's legs: the discovery carrier and a bound dispatch. */
export declare function induceBins(source: Iterable<unknown> | Readonly<Record<string, unknown>>, options?: InduceOptions): InducedBins;
//# sourceMappingURL=induce.d.mts.map