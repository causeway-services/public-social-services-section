import { type HeaderValue } from "./header-value.mjs";
export type ContentType = Readonly<{
    type: string;
    params: Readonly<Record<string, string>>;
}>;
export declare function parseContentType(value: HeaderValue): ContentType | null;
export declare function serializeContentType(contentType: ContentType): string;
//# sourceMappingURL=content-type.d.mts.map