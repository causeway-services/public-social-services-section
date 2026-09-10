// views.mts - Koios' privacy-light view counter surface.
//
// The append/replay/count operator lives upstream in the content mill. Koios
// keeps the site-local clock witness and public aliases used by its newsroom.

import {
  ContentMillViewTrace,
  contentViewEvent,
  type ContentViewCounts,
  type ContentViewEvent,
} from "@emsenn/organizing-a-content-mill";

export type ViewAssertion = ContentViewEvent;
export type ViewCounts = ContentViewCounts;
export { ContentMillViewTrace as ViewTrace };

/** Judge a candidate view assertion from query material; null when malformed. */
export function viewAssertion(input: { p?: string | null; r?: string | null; day: string }): ViewAssertion | null {
  return contentViewEvent(input);
}

/** Today's day stamp. Wall-clock as testimony of when a view was witnessed. */
export function dayStamp(): string {
  return new Date().toISOString().slice(0, 10); // law-allow: wall-clock-as-data
}
