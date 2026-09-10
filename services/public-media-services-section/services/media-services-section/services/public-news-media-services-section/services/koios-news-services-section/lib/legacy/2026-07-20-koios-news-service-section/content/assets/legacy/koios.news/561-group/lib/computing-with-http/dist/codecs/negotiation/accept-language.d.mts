export type AcceptLanguageEntry = {
    range: string;
    q: number;
    specificity: number;
    order: number;
};
export declare function parseAcceptLanguage(header: string): AcceptLanguageEntry[];
/** Negotiate a language tag using RFC 4647-style basic filtering.
 *  Returns the original offered tag, or null if every matching range has q=0. */
export declare function negotiateLanguage(acceptLanguageHeader: string | undefined, offered: readonly string[]): string | null;
//# sourceMappingURL=accept-language.d.mts.map