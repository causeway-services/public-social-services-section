// HTTP content-coding computation: zstd (Node >=22.15), br, gzip, deflate.
import { PassThrough } from "node:stream";
import * as zlib from "node:zlib";
const zstd = zlib;
const BASE_CODINGS = ["br", "gzip", "deflate"];
export function zstdSupported() {
    return typeof zstd.createZstdCompress === "function" && typeof zstd.createZstdDecompress === "function";
}
export function supportedCompressionCodings() {
    return zstdSupported() ? ["zstd", ...BASE_CODINGS] : BASE_CODINGS;
}
export async function compress(body, coding) {
    if (coding === "identity")
        return body;
    return new Promise((resolve, reject) => {
        const stream = compressStream(coding);
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
        stream.end(body);
    });
}
export async function decompress(body, coding) {
    if (coding === "identity")
        return body;
    return new Promise((resolve, reject) => {
        const stream = decompressStream(coding);
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("end", () => resolve(Buffer.concat(chunks)));
        stream.on("error", reject);
        stream.end(body);
    });
}
export function compressStream(coding) {
    if (coding === "br")
        return zlib.createBrotliCompress({ params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 } });
    if (coding === "gzip")
        return zlib.createGzip({ level: 6 });
    if (coding === "deflate")
        return zlib.createDeflate({ level: 6 });
    if (coding === "zstd" && zstd.createZstdCompress)
        return zstd.createZstdCompress();
    return new PassThrough();
}
export function decompressStream(coding) {
    if (coding === "br")
        return zlib.createBrotliDecompress();
    if (coding === "gzip")
        return zlib.createGunzip();
    if (coding === "deflate")
        return zlib.createInflate();
    if (coding === "zstd" && zstd.createZstdDecompress)
        return zstd.createZstdDecompress();
    return new PassThrough();
}
export const CODINGS = supportedCompressionCodings();
//# sourceMappingURL=index.mjs.map