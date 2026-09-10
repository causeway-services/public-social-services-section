import type { JsonValue } from "../codecs/json.mjs";
import { type Action } from "./action.mjs";
/** Options governing one dispatch. */
export interface DispatchOptions {
    /** When set, witness each play under this data root. Omit to disable witnessing. */
    readonly dataRoot?: string;
    /** The invocation-log namespace (the package term). Default "relating". */
    readonly namespace?: string;
    /** The caller descriptor recorded as E. Default `{ transport: "cli" }`. */
    readonly caller?: JsonValue;
    /** The program name prefixed onto dispatch error messages. Default "relate". */
    readonly program?: string;
    /** The boundary clock stamping T. Default `new Date().toISOString()`. */
    readonly now?: () => string;
}
/** The outcome of one dispatch. */
export interface DispatchResult {
    readonly code: number;
    readonly stdout: string;
    readonly stderr: string;
}
/** Index a catalog of actions by verb. */
export declare function actionsByVerb(actions: readonly Action[]): ReadonlyMap<string, Action>;
/** Run one dispatch: argv + stdin → stdout, witnessing the play when configured. */
export declare function dispatch(actions: readonly Action[], argv: readonly string[], stdin: string, options?: DispatchOptions): DispatchResult;
//# sourceMappingURL=dispatch.d.mts.map