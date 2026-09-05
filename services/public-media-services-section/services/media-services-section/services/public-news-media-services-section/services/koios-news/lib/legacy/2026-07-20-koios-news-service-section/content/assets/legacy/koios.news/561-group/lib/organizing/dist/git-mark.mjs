/**
 * git-mark - organizing reflection over git federation covers.
 *
 * Computing owns git event carriers. Organizing owns the cover reading: a
 * submodule pin is an external worktree member whose path/url/commit must cohere
 * with the repository cover.
 */
import { coverCarrier } from "./host-neutral-carriers.mjs";
export function parseGitmodules(text) {
    const entries = [];
    let current;
    const flush = () => {
        if (current?.path !== undefined && current.url !== undefined) {
            entries.push(Object.freeze({
                name: current.name,
                path: current.path,
                url: current.url,
                ...(current.branch === undefined ? {} : { branch: current.branch }),
            }));
        }
    };
    for (const raw of text.split(/\r?\n/u)) {
        const section = /^\s*\[submodule\s+"(.+)"\]\s*$/u.exec(raw);
        if (section?.[1] !== undefined) {
            flush();
            current = { name: section[1] };
            continue;
        }
        const field = /^\s*([A-Za-z0-9_.-]+)\s*=\s*(.*?)\s*$/u.exec(raw);
        if (current === undefined || field?.[1] === undefined || field[2] === undefined)
            continue;
        if (field[1] === "path")
            current.path = normalizePath(field[2]);
        else if (field[1] === "url")
            current.url = field[2];
        else if (field[1] === "branch")
            current.branch = field[2];
    }
    flush();
    return Object.freeze(entries.sort((left, right) => left.path.localeCompare(right.path)));
}
export function encodeGitmodules(entries) {
    return entries
        .slice()
        .sort((left, right) => left.path.localeCompare(right.path))
        .map((entry) => [
        `[submodule "${entry.name}"]`,
        `\tpath = ${entry.path}`,
        `\turl = ${entry.url}`,
        ...(entry.branch === undefined ? [] : [`\tbranch = ${entry.branch}`]),
    ].join("\n"))
        .join("\n") + (entries.length === 0 ? "" : "\n");
}
export function parseGitSubmoduleStatus(text) {
    return Object.freeze(text.split(/\r?\n/u).flatMap((line) => {
        if (line.trim().length === 0)
            return [];
        const marker = line[0] ?? " ";
        const parts = line.slice(1).trim().split(/\s+/u);
        const commit = parts[0] ?? "";
        const path = parts[1] ?? "";
        if (commit === "" || path === "")
            return [];
        return [Object.freeze({
                path: normalizePath(path),
                commit,
                status: marker === "-" ? "uninitialized" : marker === "+" ? "modified" : marker === "U" ? "merged" : "pinned",
                raw: line,
            })];
    }).sort((left, right) => left.path.localeCompare(right.path)));
}
export function parseGitlinks(text) {
    return Object.freeze(text.split(/\r?\n/u).flatMap((line) => {
        const match = /^160000\s+([A-Fa-f0-9]{40,64})\s+\d+\s+(.+)$/u.exec(line.trim());
        if (match?.[1] === undefined || match[2] === undefined)
            return [];
        return [Object.freeze({
                path: normalizePath(match[2]),
                commit: match[1],
                status: "pinned",
                raw: line,
            })];
    }).sort((left, right) => left.path.localeCompare(right.path)));
}
export function gitSubmoduleCover(modules, statusEntries = []) {
    const statusByPath = new Map(statusEntries.map((entry) => [entry.path, entry]));
    const universe = new Set();
    const opens = modules.map((entry) => {
        const status = statusByPath.get(entry.path);
        const members = [entry.path, entry.url, ...(status === undefined ? [] : [status.commit])];
        for (const member of members)
            universe.add(member);
        return Object.freeze({
            id: entry.path,
            members: Object.freeze(members),
            source: entry.url,
        });
    });
    const nerveEdges = [];
    for (let leftIndex = 0; leftIndex < opens.length; leftIndex += 1) {
        for (let rightIndex = leftIndex + 1; rightIndex < opens.length; rightIndex += 1) {
            const left = opens[leftIndex];
            const right = opens[rightIndex];
            const rightMembers = new Set(right.members);
            const intersection = left.members.filter((member) => rightMembers.has(member));
            if (intersection.length > 0)
                nerveEdges.push(Object.freeze({
                    left: left.id,
                    right: right.id,
                    intersection: Object.freeze(intersection),
                }));
        }
    }
    const missingPins = modules.filter((entry) => statusByPath.get(entry.path)?.status !== "pinned").length;
    const h1 = missingPins + Math.max(0, nerveEdges.length - opens.length + connectedComponents(opens.map((entry) => entry.id), nerveEdges));
    return coverCarrier.assert(Object.freeze({
        kind: "organizing.cover",
        universe: Object.freeze([...universe].sort((left, right) => left.localeCompare(right))),
        opens: Object.freeze(opens),
        nerveEdges: Object.freeze(nerveEdges),
        h1,
        coordinationFree: h1 === 0,
    }), "git submodule cover");
}
function normalizePath(value) {
    return value.replace(/\\/gu, "/").replace(/^\.\//u, "");
}
function connectedComponents(nodes, edges) {
    if (nodes.length === 0)
        return 0;
    const parent = new Map(nodes.map((node) => [node, node]));
    const find = (value) => {
        const current = parent.get(value) ?? value;
        if (current === value)
            return current;
        const root = find(current);
        parent.set(value, root);
        return root;
    };
    const union = (left, right) => {
        const l = find(left);
        const r = find(right);
        if (l !== r)
            parent.set(l, r);
    };
    for (const edge of edges)
        union(edge.left, edge.right);
    return new Set(nodes.map(find)).size;
}
//# sourceMappingURL=git-mark.mjs.map