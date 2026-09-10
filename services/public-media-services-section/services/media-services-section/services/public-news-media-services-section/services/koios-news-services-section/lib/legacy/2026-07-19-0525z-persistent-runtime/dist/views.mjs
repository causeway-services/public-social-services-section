// views.mts - Koios' privacy-light view counter surface.
//
// The append/replay/count operator lives upstream in the content mill. Koios
// keeps the site-local clock witness and public aliases used by its newsroom.
import { ContentMillViewTrace, contentViewEvent, } from "@emsenn/organizing-a-content-mill";
export { ContentMillViewTrace as ViewTrace };
/** Judge a candidate view assertion from query material; null when malformed. */
export function viewAssertion(input) {
    return contentViewEvent(input);
}
/** Today's day stamp. Wall-clock as testimony of when a view was witnessed. */
export function dayStamp() {
    return new Date().toISOString().slice(0, 10); // law-allow: wall-clock-as-data
}
//# sourceMappingURL=views.mjs.map