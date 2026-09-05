/**
 * acting/dispatch — the one dispatcher behind the single `relate` binary.
 *
 * `node:util.parseArgs` reads argv: the first positional is the verb, `--in`/
 * `--out` select wire codecs (overriding the action's defaults), and any other
 * flags are the action's arguments. The dispatcher reads stdin once, decodes by
 * the selected input codec, runs the pure morphism, encodes by the output codec,
 * and — when a data root is given — witnesses the play as EAVT (E=caller,
 * A=verb+args, V=return, T=now). Witnessing happens HERE, at the scripted
 * boundary; a direct in-process `action.run(...)` is never witnessed.
 *
 * This replaces every per-script `readStdin`/`jsonResource`/`import.meta.url`
 * tail with one place.
 */
import { parseArgs } from "node:util";
import {} from "./action.mjs";
import { wireCodec } from "./codecs.mjs";
import { witnessInvocation } from "./invocation.mjs";
/** Index a catalog of actions by verb. */
export function actionsByVerb(actions) {
    return new Map(actions.map((act) => [act.verb, act]));
}
function nowIso() {
    return new Date().toISOString(); // law-allow: wall-clock-as-data — T is the play's stamped input, not an ordering
}
/** Collect non-codec flags as the action's argument record. */
function argRecord(values) {
    const args = {};
    for (const [key, value] of Object.entries(values)) {
        if (key === "in" || key === "out" || value === undefined)
            continue;
        if (typeof value === "string" || typeof value === "boolean")
            args[key] = value;
        else if (Array.isArray(value))
            args[key] = value.filter((item) => typeof item === "string");
    }
    return Object.freeze(args);
}
/** Run one dispatch: argv + stdin → stdout, witnessing the play when configured. */
export function dispatch(actions, argv, stdin, options = {}) {
    const catalog = actionsByVerb(actions);
    const verbs = [...catalog.keys()].sort().join(", ");
    const program = options.program ?? "relate";
    // First pass: discover the verb from the positionals (permissive).
    let verb;
    try {
        verb = parseArgs({ args: [...argv], allowPositionals: true, strict: false }).positionals[0];
    }
    catch (error) {
        return { code: 2, stdout: "", stderr: `${program}: ${error instanceof Error ? error.message : String(error)}\n` };
    }
    if (verb === undefined)
        return { code: 2, stdout: "", stderr: `${program}: a verb is required; known: ${verbs}\n` };
    const act = catalog.get(verb);
    if (act === undefined)
        return { code: 2, stdout: "", stderr: `${program}: unknown verb ${JSON.stringify(verb)}; known: ${verbs}\n` };
    // Second pass: configure the codec flags and the action's declared valued options.
    const optionsConfig = { in: { type: "string" }, out: { type: "string" } };
    for (const name of act.options)
        optionsConfig[name] = { type: "string" };
    let values;
    try {
        values = parseArgs({ args: [...argv], options: optionsConfig, allowPositionals: true, strict: false }).values;
    }
    catch (error) {
        return { code: 2, stdout: "", stderr: `${program} ${verb}: ${error instanceof Error ? error.message : String(error)}\n` };
    }
    const inName = typeof values["in"] === "string" ? values["in"] : act.in;
    const outName = typeof values["out"] === "string" ? values["out"] : act.out;
    const args = argRecord(values);
    let stdout;
    let value;
    try {
        const input = wireCodec(inName).decode(stdin);
        value = act.run(input, args);
        stdout = wireCodec(outName).encode(value);
    }
    catch (error) {
        return { code: 1, stdout: "", stderr: `relate ${verb}: ${error instanceof Error ? error.message : String(error)}\n` };
    }
    if (options.dataRoot !== undefined) {
        const at = (options.now ?? nowIso)();
        witnessInvocation(options.dataRoot, options.namespace ?? "relating", {
            caller: options.caller ?? { transport: "cli" },
            verb,
            args,
            value,
            at,
        });
    }
    return { code: 0, stdout, stderr: "" };
}
//# sourceMappingURL=dispatch.mjs.map