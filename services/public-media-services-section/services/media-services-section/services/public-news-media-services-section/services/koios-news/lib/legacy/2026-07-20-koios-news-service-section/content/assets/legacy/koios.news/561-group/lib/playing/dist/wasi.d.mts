/**
 * wasi — WebAssembly System Interface as playing's OUT-face sandbox.
 *
 * This module models WASI's capability security, not a WebAssembly runtime. A
 * preopened handle is the WASI view of an existing object-capability: its grant is
 * the playable locus, an invocation is the cut against the holder's affordances,
 * and attenuation narrows authority monotonically while preserving provenance.
 */
import { type CapabilityView, type WasiCut as WasiCutCarrierShape, type WasiInvocation as WasiInvocationCarrierShape, type WasiPreopen as WasiPreopenCarrierShape } from "./carriers/index.mjs";
export declare const WASI_RIGHTS: readonly ["fd-read", "fd-write", "path-open", "path-create-directory", "path-filestat-get", "path-filestat-set-times", "path-remove-directory", "path-unlink-file", "clock-time-get", "random-get"];
export type WasiRight = typeof WASI_RIGHTS[number] | (string & {});
export type WasiRights = readonly WasiRight[];
export type WasiInvocation = WasiInvocationCarrierShape;
export type WasiHandle = Omit<WasiPreopenCarrierShape, "capability" | "rights"> & {
    readonly capability: CapabilityView;
    readonly rights: readonly WasiRight[];
};
export type WasiPreopen = WasiHandle;
export type WasiInteraction = Omit<WasiCutCarrierShape, "invocation"> & {
    readonly invocation: WasiInvocation;
};
export type WasiCut = WasiInteraction;
export { wasiPreopenSchema as wasiHandleSchema, wasiPreopenCarrier as wasiHandleCarrier } from "./carriers/index.mjs";
export interface GrantOptions {
    readonly id?: string;
    readonly parent?: string;
}
export interface PreopenOptions {
    readonly handle?: number;
    readonly path?: string;
    readonly rights?: WasiRights;
}
export interface AttenuateOptions extends GrantOptions {
    readonly rights?: WasiRights;
    readonly path?: string;
}
declare function sameOrNarrowerGrant(parent: string, child: string): boolean;
export declare const scopeNarrows: typeof sameOrNarrowerGrant;
export declare function wasiLocus(target: CapabilityView | WasiPreopen): string;
/**
 * grant — issue a capability-like root authority. This is intentionally the same
 * structural authority shape as WMAP/OCap: `grants` is the move/locus, not an ACL.
 */
export declare function grant(holder: string, grants: string, options?: GrantOptions): CapabilityView;
/** preopen — project a capability into a WASI preopened handle. */
export declare function preopen(capability: CapabilityView, options?: PreopenOptions): WasiPreopen;
/**
 * attenuate — derive a narrower capability with provenance. It refuses widening:
 * the child grant must sit inside the parent grant and child rights must be a
 * subset of the parent rights.
 */
export declare function attenuate(parent: WasiPreopen, grants: string, options?: AttenuateOptions): WasiPreopen;
/** canInvoke — soundness gate: exercisable iff the granted move is held. */
export declare function canInvoke(affordances: readonly string[], target: CapabilityView | WasiPreopen): boolean;
/** invoke — form the WASI invocation carrier for one operation on one handle. */
export declare function invoke(target: CapabilityView | WasiPreopen, operation?: string): WasiInvocation;
/**
 * cut — run the invocation as playing's interaction: convergence is exactly
 * `canInvoke`, witnessed by cutting a proponent invocation design against the
 * holder's opponent affordance design.
 */
export declare function cut(affordances: readonly string[], target: CapabilityView | WasiPreopen, operation?: string): WasiCut;
export declare const interact: typeof cut;
/** Whether `child` is a monotone attenuation of `parent`, including provenance. */
export declare function isAttenuation(parent: WasiPreopen, child: WasiPreopen): boolean;
//# sourceMappingURL=wasi.d.mts.map