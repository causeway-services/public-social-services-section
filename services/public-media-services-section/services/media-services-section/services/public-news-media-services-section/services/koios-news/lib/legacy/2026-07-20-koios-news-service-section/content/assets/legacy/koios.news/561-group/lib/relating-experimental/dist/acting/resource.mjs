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
import { mark, utterance } from "../articulating/index.mjs";
import { fact } from "./action.mjs";
/** Register a resource. Validates the uri and name. */
export function resource(spec) {
    if (!spec.uri || spec.uri.trim() === "")
        throw new TypeError("resource: uri is required");
    if (!spec.name || spec.name.trim() === "")
        throw new TypeError("resource: name is required");
    if (typeof spec.read !== "function")
        throw new TypeError("resource: read must be a function");
    return Object.freeze({
        kind: "relating.resource",
        uri: spec.uri,
        name: spec.name,
        mimeType: spec.mimeType ?? "application/json",
        ...(spec.description === undefined ? {} : { description: spec.description }),
        read: spec.read,
    });
}
/** Type guard: a value is a resource carrier. */
export function isResource(value) {
    return typeof value === "object" && value !== null && value.kind === "relating.resource";
}
/** The pure descriptor of a resource (no content). */
export function resourceDescriptor(res) {
    return Object.freeze({
        uri: res.uri,
        name: res.name,
        mimeType: res.mimeType,
        ...(res.description === undefined ? {} : { description: res.description }),
    });
}
/** The utterance facts a resource carries about itself — the leg's content. */
export function resourceUtterances(res) {
    const term = `relating.resource.${res.uri}`;
    const facts = [
        fact(term, "relating.resource.has-uri", res.uri),
        fact(term, "relating.resource.has-name", res.name),
        fact(term, "relating.resource.has-media-type", res.mimeType),
    ];
    if (res.description !== undefined)
        facts.push(fact(term, "relating.resource.description", res.description));
    return Object.freeze(facts);
}
/** A literal resource: content fixed at registration (e.g. an in-tree schema). */
export function literalResource(uri, name, text, options = {}) {
    return resource({
        uri,
        name,
        ...(options.mimeType === undefined ? {} : { mimeType: options.mimeType }),
        ...(options.description === undefined ? {} : { description: options.description }),
        read: () => text,
    });
}
// re-export the mark/utterance so a resource module can build extra facts without
// reaching past the acting boundary.
export { mark, utterance };
//# sourceMappingURL=resource.mjs.map