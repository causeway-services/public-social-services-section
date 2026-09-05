export type AcceptEntry = {
    type: string;
    subtype: string;
    q: number;
    specificity: number;
    order: number;
};
export declare function parseAccept(header: string): AcceptEntry[];
/** Negotiate content type. Returns the best matching offered type, or null if none is acceptable. */
export declare function negotiateType(acceptHeader: string | undefined, offered: readonly string[]): string | null;
//# sourceMappingURL=accept.d.mts.map