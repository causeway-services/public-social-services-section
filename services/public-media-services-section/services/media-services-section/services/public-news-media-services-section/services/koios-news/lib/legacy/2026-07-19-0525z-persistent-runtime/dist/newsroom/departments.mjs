// newsroom/departments — the whole Koios.News production line as one reading.
import { administratingOfficeReading } from "../administrating/index.mjs";
import { researchDepartmentReading } from "../researching/index.mjs";
import { writingDepartmentReading } from "../researching/writing/index.mjs";
import { editingDepartmentReading } from "../researching/writing/editing/index.mjs";
import { publishingDepartmentReading } from "../researching/writing/editing/publishing/index.mjs";
import { koiosItems } from "../surface.mjs";
import { desksReading } from "../researching/sourcing/desks.mjs";
export function newsroomDepartmentsReading(input) {
    const items = koiosItems(input.posts, input.masthead);
    const researching = researchDepartmentReading({
        posts: input.posts,
        views: input.views,
        dataDir: input.dataDir,
        ...(input.searchConsole === undefined ? {} : { searchConsole: input.searchConsole }),
    });
    const writing = writingDepartmentReading(input.posts);
    const editing = editingDepartmentReading(input.posts);
    const publishing = publishingDepartmentReading({
        masthead: input.masthead,
        items,
        posts: input.posts,
        views: input.views,
        dataDir: input.dataDir,
        ...(input.adClient === undefined ? {} : { adClient: input.adClient }),
    });
    return Object.freeze({
        kind: "koios.newsroom.departments",
        desks: desksReading({ articles: items.map((item) => ({ section: item.section, published: item.published, isPublic: item.isPublic })) }),
        administrating: administratingOfficeReading({ adSenseEnabled: input.adClient !== undefined }),
        researching: Object.freeze({
            ...researching,
            writing: Object.freeze({
                ...writing,
                editing: Object.freeze({
                    ...editing,
                    publishing,
                }),
            }),
        }),
    });
}
//# sourceMappingURL=departments.mjs.map