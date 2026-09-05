/**
 * codecs/markdown — Markdown flatfiles with optional frontmatter, projected into
 * EAVT-shaped assertions.
 *
 * Filesystem reads/writes are outside this codec; callers provide the markdown
 * text and witness. Frontmatter unfolds into the same object-spelled EAVT rows
 * the schema codec uses, so a document is a settled fold of its own assertions
 * and its conformance is a four-valued charge, not a boolean lint.
 */
import { extname } from "node:path";
import { restrict } from "../holography/index.mjs";
import { canonical, parse as parseJson, requireJsonValue } from "./json.mjs";
import { unfoldSchema } from "./schema.mjs";
import { stringProjector } from "./text.mjs";
export const DOC_TYPE_STAMP = "tx-document-types";
export const markdownProjector = restrict(stringProjector, {
    type: "markdown",
    recognize: (resource) => [".md", ".markdown"].includes(extname(resource.path).toLowerCase()),
});
export const markdownDocumentSchemaFragment = Object.freeze({
    type: "object",
    additionalProperties: true,
    required: Object.freeze(["name", "description"]),
    properties: Object.freeze({
        name: Object.freeze({ type: "string", minLength: 1 }),
        description: Object.freeze({ type: "string", minLength: 1, maxLength: 300 }),
    }),
});
export const documentTypeDefinitions = Object.freeze([
    Object.freeze({
        slug: "readme",
        title: "README",
        description: "A human-facing markdown-document named exactly README.md at a directory root.",
        filename: "^README\\.md$",
        placement: "{thing}/",
        bodySkeleton: "# {name}\n",
    }),
    Object.freeze({
        slug: "agents-guide",
        title: "Agents Guide",
        description: "An agent-facing markdown-document named exactly AGENTS.md at a directory root.",
        filename: "^AGENTS\\.md$",
        placement: "{thing}/",
        bodySkeleton: "# AGENTS.md\n",
    }),
    Object.freeze({
        slug: "claude-memory",
        title: "Claude Memory",
        description: "A markdown-document at a CLAUDE.md or CLAUDE.local.md location for project instruction memory.",
        filename: "^CLAUDE(\\.local)?\\.md$",
        placement: "{thing}/",
        bodySkeleton: "# CLAUDE.md\n",
    }),
    Object.freeze({
        slug: "heartbeat",
        title: "Heartbeat",
        description: "A markdown-document named exactly HEARTBEAT.md at a repository or package root.",
        filename: "^HEARTBEAT\\.md$",
        placement: "{thing}/",
        bodySkeleton: "# HEARTBEAT.md\n",
    }),
    Object.freeze({
        slug: "specification",
        title: "Specification",
        description: "A markdown-document named specification.md at {thing}/docs/dev/ for normative development specification.",
        filename: "^specification\\.md$",
        placement: "{thing}/docs/dev/",
        bodySkeleton: "# {name}\n",
    }),
    Object.freeze({
        slug: "development-journal-entry",
        title: "Development Journal Entry",
        description: "A date-stamped markdown-document at {thing}/docs/dev/journal/<YYYY-MM-DD>[-slug].md carrying historical narrative about the parent thing on the named date.",
        filename: "^\\d{4}-\\d{2}-\\d{2}(-[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)?\\.md$",
        placement: "{thing}/docs/dev/journal/",
        bodySkeleton: "# {title}\n",
        schemaFragment: Object.freeze({
            properties: Object.freeze({
                "entry-date": Object.freeze({ type: "string", format: "date" }),
                "session-of": Object.freeze({ type: "string" }),
                "superseded-by": Object.freeze({ type: "string" }),
            }),
        }),
    }),
    Object.freeze({
        slug: "development-document",
        title: "Development Document",
        description: "A markdown-document at {thing}/docs/dev/{slug}.md carrying development-stage prose.",
        filename: "^(?!specification\\.md$)[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\\.md$",
        placement: "{thing}/docs/dev/",
        bodySkeleton: "# {name}\n\n## Key Terms\n",
    }),
]);
export function parseMarkdown(text) {
    const yamlMatch = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (yamlMatch) {
        return Object.freeze({
            frontmatter: Object.freeze(parseYamlFrontmatter(yamlMatch[1] ?? "")),
            format: "yaml",
            body: text.slice(yamlMatch[0].length),
        });
    }
    const tomlMatch = text.match(/^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+\r?\n?/);
    if (tomlMatch) {
        return Object.freeze({ frontmatter: Object.freeze({}), format: "toml", body: text.slice(tomlMatch[0].length) });
    }
    return Object.freeze({ frontmatter: null, format: null, body: text });
}
export function frontmatterConformance(text, opts = {}) {
    const witness = opts.witness ?? "frontmatter";
    const yaml = /^---\r?\n[\s\S]*?\r?\n---\r?\n?/.test(text);
    const toml = /^\+\+\+\r?\n[\s\S]*?\r?\n\+\+\+\r?\n?/.test(text);
    const present = yaml || toml;
    const charge = (predicate, modality, depth, value) => Object.freeze({
        predicate,
        modality,
        depth,
        value,
        evidence: value === "potential"
            ? Object.freeze([Object.freeze([witness]), Object.freeze([])])
            : value === "active"
                ? Object.freeze([Object.freeze([]), Object.freeze([witness])])
                : Object.freeze([Object.freeze([]), Object.freeze([])]),
    });
    const charges = Object.freeze([
        charge("has-frontmatter", "MUST", 0, present ? "potential" : "active"),
        charge("yaml-frontmatter", "SHOULD", 1, yaml ? "potential" : present ? "active" : "absurd"),
        charge("toml-frontmatter", "MAY", 2, toml ? "potential" : "absurd"),
    ]);
    const notes = charges
        .filter((entry) => entry.modality === "SHOULD" && entry.value === "active")
        .map((entry) => `SHOULD ${entry.predicate} (depth ${entry.depth})`);
    return Object.freeze({
        settled: true,
        conformant: charges.filter((entry) => entry.modality === "MUST").every((entry) => entry.value !== "active"),
        format: yaml ? "yaml" : toml ? "toml" : null,
        charges,
        notes: Object.freeze(notes),
    });
}
export function markdownDataform(text, opts) {
    const parsed = parseMarkdown(text);
    const verdict = frontmatterConformance(text, { witness: opts.witness });
    const frontmatter = parsed.frontmatter ?? {};
    const subject = opts.subject ?? (typeof frontmatter["slug"] === "string" && frontmatter["slug"] ? frontmatter["slug"] : opts.witness);
    const assertions = [];
    const push = (a, v) => {
        assertions.push(Object.freeze({ e: subject, a, v, t: opts.witness }));
    };
    for (const [key, value] of Object.entries(frontmatter)) {
        if (Array.isArray(value))
            for (const item of value)
                push(key, frontmatterRowValue(item));
        else
            push(key, frontmatterRowValue(value));
    }
    push("body", parsed.body);
    const cells = assertions.map((assertion) => Object.freeze({
        cell: Object.freeze({ subject: assertion.e, predicate: assertion.a, object: assertion.v }),
        charge: Object.freeze({ value: Object.freeze([true, false]), evidence: Object.freeze([Object.freeze([opts.witness]), Object.freeze([])]) }),
    }));
    return Object.freeze({
        subject,
        format: parsed.format,
        conformant: verdict.conformant,
        verdict,
        frontmatter: Object.freeze(frontmatter),
        body: parsed.body,
        assertions: Object.freeze(assertions),
        cells: Object.freeze(cells),
    });
}
export function documentTypeFragment(definition) {
    return Object.freeze({
        title: definition.title,
        description: definition.description,
        "x-trc-type": definition.slug,
        "x-trc-filename": definition.filename,
        "x-trc-placement": definition.placement,
        "x-trc-body-skeleton": definition.bodySkeleton,
        ...(definition.schemaFragment ?? {}),
    });
}
export function documentTypeAssertions(definition, opts = {}) {
    const options = { ...(opts.base === undefined ? {} : { base: opts.base }), t: opts.t ?? DOC_TYPE_STAMP };
    return [
        ...unfoldSchema(markdownDocumentSchemaFragment, options),
        ...unfoldSchema(documentTypeFragment(definition), options),
    ];
}
export function allDocumentTypeAssertions(opts = {}) {
    return Object.freeze(documentTypeDefinitions.flatMap((definition) => documentTypeAssertions(definition, opts)));
}
function frontmatterRowValue(value) {
    if (value !== null && typeof value === "object")
        return canonical(value);
    return value;
}
function parseYamlFrontmatter(src) {
    const lines = src.split(/\r?\n/);
    const out = {};
    for (let index = 0; index < lines.length;) {
        const line = lines[index];
        if (line.trim() === "") {
            index++;
            continue;
        }
        const match = line.match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
        if (!match)
            throw new TypeError(`frontmatter: expected key at line ${index + 1}`);
        const key = match[1];
        const rest = match[2] ?? "";
        if (rest.trim() !== "") {
            out[key] = parseScalar(rest);
            index++;
            continue;
        }
        const block = collectIndented(lines, index + 1);
        out[key] = parseYamlBlock(block.lines);
        index = block.next;
    }
    return requireJsonValue(out, "frontmatter");
}
function collectIndented(lines, start) {
    const block = [];
    let index = start;
    while (index < lines.length) {
        const line = lines[index];
        if (line.trim() === "") {
            block.push(line);
            index++;
            continue;
        }
        if (!line.startsWith("  "))
            break;
        block.push(line);
        index++;
    }
    return { lines: block, next: index };
}
function parseYamlBlock(lines) {
    const meaningful = lines.filter((line) => line.trim() !== "");
    if (meaningful.length === 0)
        return {};
    return parseYamlNode(meaningful, lineIndent(meaningful[0]));
}
function parseYamlNode(lines, indent) {
    const meaningful = lines.filter((line) => line.trim() !== "");
    if (meaningful.length === 0)
        return {};
    return meaningful[0].slice(indent).startsWith("- ")
        ? parseYamlArray(meaningful, indent)
        : parseYamlMapping(meaningful, indent);
}
function parseYamlArray(lines, indent) {
    const items = [];
    for (let index = 0; index < lines.length;) {
        const line = lines[index];
        if (lineIndent(line) !== indent || !line.slice(indent).startsWith("- ")) {
            throw new TypeError("frontmatter: expected array item");
        }
        const rest = line.slice(indent + 2);
        const itemLines = [];
        index++;
        while (index < lines.length && !(lineIndent(lines[index]) === indent && lines[index].slice(indent).startsWith("- "))) {
            itemLines.push(lines[index]);
            index++;
        }
        if (rest.trim() === "") {
            items.push(parseYamlNode(itemLines, indent + 2));
            continue;
        }
        if (/^[A-Za-z0-9_-]+:\s*/.test(rest)) {
            items.push(parseYamlNode([`${" ".repeat(indent + 2)}${rest}`, ...itemLines], indent + 2));
            continue;
        }
        if (itemLines.length > 0)
            throw new TypeError("frontmatter: scalar array item cannot have nested fields");
        items.push(parseScalar(rest));
    }
    return requireJsonValue(items, "frontmatter array");
}
function parseYamlMapping(lines, indent) {
    const record = {};
    for (let index = 0; index < lines.length;) {
        const line = lines[index];
        const prefix = " ".repeat(indent);
        if (!line.startsWith(prefix) || lineIndent(line) !== indent)
            throw new TypeError("frontmatter: expected nested mapping field");
        const match = line.slice(indent).match(/^([A-Za-z0-9_-]+):(?:\s*(.*))?$/);
        if (!match)
            throw new TypeError("frontmatter: expected nested mapping field");
        const key = match[1];
        const rest = match[2] ?? "";
        index++;
        if (rest.trim() !== "") {
            record[key] = parseScalar(rest);
            continue;
        }
        const child = [];
        while (index < lines.length && lineIndent(lines[index]) > indent) {
            child.push(lines[index]);
            index++;
        }
        record[key] = parseYamlNode(child, indent + 2);
    }
    return requireJsonValue(record, "frontmatter nested mapping");
}
function lineIndent(line) {
    return line.match(/^ */)?.[0].length ?? 0;
}
function parseScalar(raw) {
    const trimmed = raw.trim();
    if (trimmed === "")
        return "";
    try {
        return requireJsonValue(parseJson(trimmed), "frontmatter scalar");
    }
    catch {
        if (trimmed === "true")
            return true;
        if (trimmed === "false")
            return false;
        if (/^-?\d+(\.\d+)?$/.test(trimmed))
            return Number(trimmed);
        return trimmed.replace(/^["']|["']$/g, "");
    }
}
//# sourceMappingURL=markdown.mjs.map