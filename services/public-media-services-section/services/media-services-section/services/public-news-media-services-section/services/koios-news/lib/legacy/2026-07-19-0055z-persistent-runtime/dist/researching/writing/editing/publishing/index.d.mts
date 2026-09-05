import type { KoiosPost } from "../../../../content.mjs";
import { type KoiosItem, type KoiosMasthead } from "../../../../surface.mjs";
import type { ViewCounts } from "../../../../views.mjs";
import { type PublishingManagementReading } from "./managing/index.mjs";
export type PublishingDepartmentReading = Readonly<{
    department: "publishing";
    publicCount: number;
    withheldCount: number;
    routes: readonly string[];
    management: PublishingManagementReading;
}>;
export declare function publishingDepartmentReading(input: Readonly<{
    masthead: KoiosMasthead;
    items: readonly KoiosItem[];
    posts: readonly KoiosPost[];
    views?: ViewCounts;
    dataDir?: string;
    adClient?: string;
}>): PublishingDepartmentReading;
export { publishingManagementReading } from "./managing/index.mjs";
export type { PublishingManagementReading } from "./managing/index.mjs";
//# sourceMappingURL=index.d.mts.map