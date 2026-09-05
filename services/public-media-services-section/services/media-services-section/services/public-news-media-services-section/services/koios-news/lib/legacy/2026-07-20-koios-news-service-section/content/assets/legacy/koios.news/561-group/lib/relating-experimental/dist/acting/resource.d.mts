/**
 * acting/resource — the addressable-artifact class: a resource is a cocone leg.
 *
 * Where an `action` injects a *morphism* into the package's call surface, a
 * `resource` injects an *addressable artifact* — a named, typed document the
 * package already holds (a JSON Schema, the discovery carrier, an
 * `object.schema.json`). `induceBins` collects resources alongside actions into
 * the one apex; the MCP transport projects them as `resources/list` and
 * `resources/read`, the standard knowledge-vault primitive, with no second
 * ontology: a resource is just an artifact the package was already publishing.
 *
 * The descriptor (uri/name/mimeType/description) is pure carrier data and lists
 * cheaply; the content is a thunk (`read`), resolved only when read, so
 * file-backed or recomputed artifacts cost nothing until fetched.
 */
import { mark, utterance, type UtteranceCarrier } from "../articulating/index.mjs";
/** A resource: a registered addressable artifact over the package carrier. */
export interface ResourceCarrier {
    readonly kind: "relating.resource";
    /** the artifact's stable URI (the resource's name in the MCP sense). */
    readonly uri: string;
    /** a short human label. */
    readonly name: string;
    /** the artifact's media type. Default `application/json`. */
    readonly mimeType: string;
    readonly description?: string;
    /** resolve the artifact's content. Called only on `resources/read`. */
    readonly read: () => string;
}
/** The spec admitted by `resource()`. */
export interface ResourceSpec {
    readonly uri: string;
    readonly name: string;
    readonly mimeType?: string;
    readonly description?: string;
    readonly read: () => string;
}
/** The pure metadata of a resource — what `resources/list` returns. */
export interface ResourceDescriptor {
    readonly uri: string;
    readonly name: string;
    readonly mimeType: string;
    readonly description?: string;
}
/** Register a resource. Validates the uri and name. */
export declare function resource(spec: ResourceSpec): ResourceCarrier;
/** Type guard: a value is a resource carrier. */
export declare function isResource(value: unknown): value is ResourceCarrier;
/** The pure descriptor of a resource (no content). */
export declare function resourceDescriptor(res: ResourceCarrier): ResourceDescriptor;
/** The utterance facts a resource carries about itself — the leg's content. */
export declare function resourceUtterances(res: ResourceCarrier): readonly UtteranceCarrier[];
/** A literal resource: content fixed at registration (e.g. an in-tree schema). */
export declare function literalResource(uri: string, name: string, text: string, options?: {
    readonly mimeType?: string;
    readonly description?: string;
}): ResourceCarrier;
export { mark, utterance };
//# sourceMappingURL=resource.d.mts.map