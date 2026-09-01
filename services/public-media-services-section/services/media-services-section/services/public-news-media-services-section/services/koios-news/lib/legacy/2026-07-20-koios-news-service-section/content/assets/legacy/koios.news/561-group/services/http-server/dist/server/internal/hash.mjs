// internal/hash.ts — SHA-1 and SHA-256 helpers for ETags and content addressing.
import { createHash } from "node:crypto";
export function sha256(data) {
    return createHash("sha256").update(data).digest();
}
export function sha256hex(data) {
    return createHash("sha256").update(data).digest("hex");
}
export function sha1(data) {
    return createHash("sha1").update(data).digest();
}
export function sha1hex(data) {
    return createHash("sha1").update(data).digest("hex");
}
/** Strong ETag: quoted SHA-1 hex of body content. */
export function strongEtag(data) {
    return `"${sha1hex(data)}"`;
}
/** Generate a random UUID v4. */
export function uuid() {
    return crypto.randomUUID();
}
//# sourceMappingURL=hash.mjs.map