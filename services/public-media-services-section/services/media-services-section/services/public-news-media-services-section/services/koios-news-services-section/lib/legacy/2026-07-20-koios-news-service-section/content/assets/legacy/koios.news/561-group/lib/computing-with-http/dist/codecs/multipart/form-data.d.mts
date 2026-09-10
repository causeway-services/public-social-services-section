export type MultipartPart = Readonly<{
    name: string;
    filename?: string;
    contentType?: string;
    headers: Readonly<Record<string, string>>;
    data: Buffer;
    text(encoding?: BufferEncoding): string;
}>;
export type MultipartForm = Readonly<{
    fields: URLSearchParams;
    files: readonly MultipartPart[];
    parts: readonly MultipartPart[];
    get(name: string): string | null;
    getAll(name: string): string[];
    file(name: string): MultipartPart | undefined;
    filesFor(name: string): readonly MultipartPart[];
}>;
export declare function parseMultipartForm(body: Buffer | string, boundary: string): MultipartForm;
export type MultipartPartInit = Readonly<{
    name: string;
    data: Buffer | string;
    filename?: string;
    contentType?: string;
}>;
/** Encode form parts as a multipart/form-data body under the given boundary. */
export declare function serializeMultipartForm(parts: readonly MultipartPartInit[], boundary: string): Buffer;
//# sourceMappingURL=form-data.d.mts.map