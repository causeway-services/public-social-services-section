import { actionUtterances, fact, isAction } from "./action.mjs";
import { wireCodec } from "./codecs.mjs";
import { dispatch } from "./dispatch.mjs";
import { isResource, resource, resourceDescriptor, resourceUtterances, } from "./resource.mjs";
import { actionPrompt, isPrompt, promptDescriptor, promptUtterances, } from "./prompt.mjs";
function joinPath(basePath, leaf) {
    const base = basePath.replace(/\/+$/, "");
    return `${base}/${encodeURIComponent(leaf)}`;
}
/** Keep only the actions out of a module namespace (or accept a list directly). */
export function collectActions(source) {
    return Object.freeze(collectValues(source).filter(isAction));
}
/** Keep only the resources out of a module namespace (or accept a list directly). */
export function collectResources(source) {
    return Object.freeze(collectValues(source).filter(isResource));
}
/** Keep only the prompts out of a module namespace (or accept a list directly). */
export function collectPrompts(source) {
    return Object.freeze(collectValues(source).filter(isPrompt));
}
function collectValues(source) {
    return Symbol.iterator in Object(source)
        ? [...source]
        : Object.values(source);
}
/** Project an action into its endpoint. */
function endpointOf(act, basePath) {
    return Object.freeze({
        name: act.verb,
        href: joinPath(basePath, act.verb),
        method: "POST",
        input: wireCodec(act.in).mediaType,
        output: wireCodec(act.out).mediaType,
        ...(act.summary === undefined ? {} : { summary: act.summary }),
        ...(act.description === undefined ? {} : { description: act.description }),
        ...(act.inputSchema === undefined ? {} : { inputSchema: act.inputSchema }),
        ...(act.outputSchema === undefined ? {} : { outputSchema: act.outputSchema }),
    });
}
/** The URI of an action's input/output schema resource. */
function schemaUri(packageName, verb, side) {
    return `relating://${encodeURIComponent(packageName)}/schema/${encodeURIComponent(verb)}/${side}`;
}
/** Auto-derive the schema resources a package already carries on its actions. */
function schemaResourcesOf(actions, packageName) {
    const resources = [];
    for (const act of actions) {
        if (act.inputSchema !== undefined) {
            const schema = act.inputSchema;
            resources.push(resource({
                uri: schemaUri(packageName, act.verb, "input"),
                name: `${act.verb} input schema`,
                description: `JSON Schema of the ${act.in} input carrier for ${act.verb}.`,
                read: () => `${JSON.stringify(schema, null, 2)}\n`,
            }));
        }
        if (act.outputSchema !== undefined) {
            const schema = act.outputSchema;
            resources.push(resource({
                uri: schemaUri(packageName, act.verb, "output"),
                name: `${act.verb} output schema`,
                description: `JSON Schema of the ${act.out} output carrier for ${act.verb}.`,
                read: () => `${JSON.stringify(schema, null, 2)}\n`,
            }));
        }
    }
    return Object.freeze(resources);
}
/** De-duplicate resources by URI, keeping the first occurrence. */
function dedupeResources(resources) {
    const seen = new Set();
    const kept = [];
    for (const res of resources) {
        if (seen.has(res.uri))
            continue;
        seen.add(res.uri);
        kept.push(res);
    }
    return Object.freeze(kept);
}
/** De-duplicate prompts by name, keeping the first occurrence. */
function dedupePrompts(prompts) {
    const seen = new Set();
    const kept = [];
    for (const pr of prompts) {
        if (seen.has(pr.name))
            continue;
        seen.add(pr.name);
        kept.push(pr);
    }
    return Object.freeze(kept);
}
/** Induce the bin surface for a module's legs: the discovery carrier and a bound dispatch. */
export function induceBins(source, options = {}) {
    const actions = collectActions(source);
    const packageName = options.packageName ?? "@emsenn/relating-experimental";
    const basePath = options.basePath ?? "";
    const term = `relating.package.${packageName}`;
    const bins = actions.map((act) => endpointOf(act, basePath));
    // Registered prompts come first so they win de-duplication over derived ones.
    const registeredPrompts = [...collectPrompts(source), ...(options.prompts ?? [])];
    const derivedPrompts = options.derivePrompts === false ? [] : actions.map(actionPrompt);
    const prompts = dedupePrompts([...registeredPrompts, ...derivedPrompts]);
    // Registered resources come first; auto-derived schema + discovery resources follow.
    const registeredResources = [...collectResources(source), ...(options.resources ?? [])];
    const schemaResources = options.deriveSchemaResources === false ? [] : schemaResourcesOf(actions, packageName);
    const utterances = [
        fact(term, "relating.package.has-name", packageName),
        fact(term, "relating.package.speaks-protocol", "stdio"),
    ];
    for (const act of actions) {
        utterances.push(fact(term, "relating.package.has-action", act.verb));
        for (const u of actionUtterances(act))
            utterances.push(u);
    }
    // The discovery carrier is itself a resource; its read thunk closes over the
    // assembled descriptors so the artifact is always the live apex.
    let discoveryRef;
    const discoveryResource = resource({
        uri: `relating://${encodeURIComponent(packageName)}/discovery`,
        name: `${packageName} discovery`,
        description: "The package's coproduct apex: its actions, resources, and prompts.",
        read: () => `${JSON.stringify(discoveryRef, null, 2)}\n`,
    });
    const resources = dedupeResources([...registeredResources, ...schemaResources, discoveryResource]);
    for (const res of resources) {
        utterances.push(fact(term, "relating.package.has-resource", res.uri));
        for (const u of resourceUtterances(res))
            utterances.push(u);
    }
    for (const pr of prompts) {
        utterances.push(fact(term, "relating.package.has-prompt", pr.name));
        for (const u of promptUtterances(pr))
            utterances.push(u);
    }
    discoveryRef = Object.freeze({
        kind: "relating.acting.discovery",
        package: packageName,
        protocol: "stdio",
        bins: Object.freeze(bins),
        resources: Object.freeze(resources.map(resourceDescriptor)),
        prompts: Object.freeze(prompts.map(promptDescriptor)),
        utterances: Object.freeze(utterances),
    });
    return Object.freeze({
        discovery: discoveryRef,
        actions,
        resources,
        prompts,
        dispatch: (argv, stdin, dispatchOptions = {}) => dispatch(actions, argv, stdin, { namespace: packageName, ...dispatchOptions }),
    });
}
//# sourceMappingURL=induce.mjs.map