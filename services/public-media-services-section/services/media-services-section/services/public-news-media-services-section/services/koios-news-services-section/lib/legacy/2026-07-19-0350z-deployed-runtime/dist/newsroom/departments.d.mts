import type { KoiosPost } from "../content.mjs";
import type { SearchConsoleQuery } from "../demand.mjs";
import { type AdministratingOfficeReading } from "../administrating/index.mjs";
import { type ResearchDepartmentReading } from "../researching/index.mjs";
import { type WritingDepartmentReading } from "../researching/writing/index.mjs";
import { type EditingDepartmentReading } from "../researching/writing/editing/index.mjs";
import { type PublishingDepartmentReading } from "../researching/writing/editing/publishing/index.mjs";
import { type KoiosMasthead } from "../surface.mjs";
import { type DesksReading } from "../researching/sourcing/desks.mjs";
import type { ViewCounts } from "../views.mjs";
export type KoiosNewsroomDepartments = Readonly<{
    kind: "koios.newsroom.departments";
    desks: DesksReading;
    administrating: AdministratingOfficeReading;
    researching: ResearchDepartmentReading & Readonly<{
        writing: WritingDepartmentReading & Readonly<{
            editing: EditingDepartmentReading & Readonly<{
                publishing: PublishingDepartmentReading;
            }>;
        }>;
    }>;
}>;
export declare function newsroomDepartmentsReading(input: Readonly<{
    posts: readonly KoiosPost[];
    masthead: KoiosMasthead;
    views: ViewCounts;
    dataDir: string;
    adClient?: string;
    searchConsole?: readonly SearchConsoleQuery[];
}>): KoiosNewsroomDepartments;
//# sourceMappingURL=departments.d.mts.map