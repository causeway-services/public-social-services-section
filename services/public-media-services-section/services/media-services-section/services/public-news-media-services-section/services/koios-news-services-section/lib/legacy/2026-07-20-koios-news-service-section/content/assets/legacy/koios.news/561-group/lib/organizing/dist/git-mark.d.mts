/**
 * git-mark - organizing reflection over git federation covers.
 *
 * Computing owns git event carriers. Organizing owns the cover reading: a
 * submodule pin is an external worktree member whose path/url/commit must cohere
 * with the repository cover.
 */
import { type Cover } from "./host-neutral-carriers.mjs";
export type GitmoduleEntry = Readonly<{
    name: string;
    path: string;
    url: string;
    branch?: string;
}>;
export type GitSubmoduleStatusEntry = Readonly<{
    path: string;
    commit: string;
    status: "pinned" | "uninitialized" | "modified" | "merged";
    raw: string;
}>;
export declare function parseGitmodules(text: string): readonly GitmoduleEntry[];
export declare function encodeGitmodules(entries: readonly GitmoduleEntry[]): string;
export declare function parseGitSubmoduleStatus(text: string): readonly GitSubmoduleStatusEntry[];
export declare function parseGitlinks(text: string): readonly GitSubmoduleStatusEntry[];
export declare function gitSubmoduleCover(modules: readonly GitmoduleEntry[], statusEntries?: readonly GitSubmoduleStatusEntry[]): Cover;
//# sourceMappingURL=git-mark.d.mts.map