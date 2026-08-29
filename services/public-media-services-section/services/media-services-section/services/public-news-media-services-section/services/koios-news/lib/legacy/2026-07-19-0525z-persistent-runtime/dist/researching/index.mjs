// researching — demand and source attention for Koios.News.
//
// The research department does not write. It produces assignments: terms,
// beats, source coverage, and demand evidence that the writing desk can take up.
import { demandTable, readSearchConsole, SEED_KEYWORDS } from "../demand.mjs";
import { sourcingDepartmentReading } from "./sourcing/index.mjs";
export function researchDepartmentReading(input) {
    const searchConsole = input.searchConsole ?? readSearchConsole(input.dataDir);
    const demand = demandTable({
        posts: input.posts,
        views: input.views,
        searchConsole,
        seeds: SEED_KEYWORDS,
    });
    return Object.freeze({
        department: "researching",
        sourcing: sourcingDepartmentReading(),
        demand: Object.freeze({
            next: demand[0] ?? null,
            count: demand.length,
            entries: Object.freeze(demand),
            searchConsoleQueries: searchConsole.length,
        }),
    });
}
export { sourcingDepartmentReading } from "./sourcing/index.mjs";
//# sourceMappingURL=index.mjs.map