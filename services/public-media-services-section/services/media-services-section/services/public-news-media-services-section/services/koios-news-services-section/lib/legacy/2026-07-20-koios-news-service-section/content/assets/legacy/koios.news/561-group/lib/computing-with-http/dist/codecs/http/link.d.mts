export type LinkValue = Readonly<{
    href: string;
    params: Readonly<Record<string, string>>;
}>;
export declare function linkHeader(links: Array<{
    href: string;
    rel: string;
    [k: string]: string;
}>): string;
export declare function parseLinkHeader(value: string | null | undefined): readonly LinkValue[];
//# sourceMappingURL=link.d.mts.map