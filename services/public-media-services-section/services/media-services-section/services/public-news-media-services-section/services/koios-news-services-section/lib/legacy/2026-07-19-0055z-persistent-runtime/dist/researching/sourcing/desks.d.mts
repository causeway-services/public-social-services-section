import { type ContentDesk, type ContentDesksReading } from "@emsenn/organizing-a-content-farm";
export type DeskReading = ContentDesk;
export type DesksReading = ContentDesksReading;
export type DesksOptions = Readonly<{
    configPath?: string;
    now?: () => string;
    /** Published article facts, for per-desk article counts. Each entry is a
     * public item's section label and date; omit to report zero counts. */
    articles?: readonly Readonly<{
        section?: string | undefined;
        published?: string | undefined;
        isPublic?: boolean | undefined;
    }>[];
}>;
/** Project every configured wire into a desk reading. */
export declare function desksReading(options?: DesksOptions): DesksReading;
//# sourceMappingURL=desks.d.mts.map