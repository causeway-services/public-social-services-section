/**
 * Keep Koios's public identity canonical while allowing one immutable HTML
 * artifact to operate under any admitted delivery origin.
 *
 * Canonical metadata and structured data remain absolute. Browser-facing
 * internal navigation and resource attributes become root-relative, so a
 * reader on a shadow, candidate, or successor origin stays on that carrier.
 */
export type OriginPortabilityDefect = Readonly<{
    tag: string;
    attribute: string;
    value: string;
}>;
export type NavigationInspection = Readonly<{
    internalTargets: readonly string[];
    canonicalEscapes: readonly string[];
}>;
/** Rewrite only browser delivery attributes, never metadata or script bodies. */
export declare function makeHtmlOriginPortable(html: string, canonicalOriginValue: string): string;
/** Find canonical-origin URLs that would make a portable carrier call home. */
export declare function originPortabilityDefects(html: string, canonicalOriginValue: string): readonly OriginPortabilityDefect[];
/** Resolve clickable links exactly as a browser on the supplied document URL. */
export declare function inspectNavigation(html: string, documentUrlValue: string, canonicalOriginValue: string): NavigationInspection;
//# sourceMappingURL=origin-portability.d.mts.map