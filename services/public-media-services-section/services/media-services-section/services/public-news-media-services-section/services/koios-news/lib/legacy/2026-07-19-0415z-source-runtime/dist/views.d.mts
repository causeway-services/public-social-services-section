import { ContentMillViewTrace, type ContentViewCounts, type ContentViewEvent } from "@emsenn/organizing-a-content-mill";
export type ViewAssertion = ContentViewEvent;
export type ViewCounts = ContentViewCounts;
export { ContentMillViewTrace as ViewTrace };
/** Judge a candidate view assertion from query material; null when malformed. */
export declare function viewAssertion(input: {
    p?: string | null;
    r?: string | null;
    day: string;
}): ViewAssertion | null;
/** Today's day stamp. Wall-clock as testimony of when a view was witnessed. */
export declare function dayStamp(): string;
//# sourceMappingURL=views.d.mts.map