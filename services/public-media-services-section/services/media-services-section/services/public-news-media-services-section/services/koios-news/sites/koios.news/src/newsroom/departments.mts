// newsroom/departments — the whole Koios.News production line as one reading.

import type { KoiosPost } from "../content.mts";
import type { SearchConsoleQuery } from "../demand.mts";
import { administratingOfficeReading, type AdministratingOfficeReading } from "../administrating/index.mts";
import { researchDepartmentReading, type ResearchDepartmentReading } from "../researching/index.mts";
import { writingDepartmentReading, type WritingDepartmentReading } from "../researching/writing/index.mts";
import { editingDepartmentReading, type EditingDepartmentReading } from "../researching/writing/editing/index.mts";
import { publishingDepartmentReading, type PublishingDepartmentReading } from "../researching/writing/editing/publishing/index.mts";
import { koiosItems, type KoiosItem, type KoiosMasthead } from "../surface.mts";
import { desksReading, type DesksReading } from "../researching/sourcing/desks.mts";
import type { ViewCounts } from "../views.mts";

export type KoiosNewsroomDepartments = Readonly<{
  kind: "koios.newsroom.departments";
  // The two orthogonal axes of the newsroom: desks are topical standing (what
  // we cover), departments are the production line (how a desk's stories are
  // made). Every story crosses every department and belongs to one desk.
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

export function newsroomDepartmentsReading(input: Readonly<{
  posts: readonly KoiosPost[];
  masthead: KoiosMasthead;
  views: ViewCounts;
  dataDir: string;
  adClient?: string;
  searchConsole?: readonly SearchConsoleQuery[];
}>): KoiosNewsroomDepartments {
  const items: readonly KoiosItem[] = koiosItems(input.posts, input.masthead);
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
