/**
 * acting — the boundary: actions (cocone legs), the dispatcher, induceBins, and
 * invocation witnessing.
 *
 * Register each operation once as an `action`; `induceBins` assembles the
 * coproduct apex (the discovery carrier) from which CLI/OpenAPI/MCP/web are
 * projected; one `dispatch` (node:util.parseArgs) runs any verb and witnesses the
 * play as EAVT in the package's own ledger.
 */
export { action, isAction, fact, actionUtterances, } from "./action.mjs";
export { stringCodec, jsonCodec, eavtCodec, formCodec, wireCodec, WIRE_CODEC_NAMES, } from "./codecs.mjs";
export { dispatch, actionsByVerb, } from "./dispatch.mjs";
export { resource, isResource, resourceDescriptor, resourceUtterances, literalResource, } from "./resource.mjs";
export { prompt, isPrompt, promptDescriptor, promptUtterances, actionPrompt, userMessage, } from "./prompt.mjs";
export { induceBins, collectActions, collectResources, collectPrompts, } from "./induce.mjs";
export { witnessInvocation, invocationStore, invocationFeed, projectInvocations, } from "./invocation.mjs";
export { serve, routeRequest, actionOpenApi, actionMcpTools, actionMcpResources, actionMcpPrompts, actionMcpHandle, actionFormHtml, actionIndexHtml, } from "./serving.mjs";
//# sourceMappingURL=index.mjs.map