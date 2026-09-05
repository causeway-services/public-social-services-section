import { type DemandEntry, type SearchConsoleQuery } from "../demand.mjs";
import type { KoiosPost } from "../content.mjs";
import type { ViewCounts } from "../views.mjs";
import { type SourcingDepartmentReading } from "./sourcing/index.mjs";
export type ResearchDepartmentReading = Readonly<{
    department: "researching";
    sourcing: SourcingDepartmentReading;
    demand: Readonly<{
        next: DemandEntry | null;
        count: number;
        entries: readonly DemandEntry[];
        searchConsoleQueries: number;
    }>;
}>;
export declare function researchDepartmentReading(input: Readonly<{
    posts: readonly KoiosPost[];
    views: ViewCounts;
    dataDir: string;
    searchConsole?: readonly SearchConsoleQuery[];
}>): ResearchDepartmentReading;
export { sourcingDepartmentReading } from "./sourcing/index.mjs";
export type { SourcingDepartmentReading } from "./sourcing/index.mjs";
//# sourceMappingURL=index.d.mts.map