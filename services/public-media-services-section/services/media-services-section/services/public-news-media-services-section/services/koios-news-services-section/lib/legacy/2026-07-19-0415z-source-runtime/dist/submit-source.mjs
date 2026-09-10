#!/usr/bin/env node
// submit-source.mts — hand the newsroom ONE specific source and let the
// submission desk appraise it and, if it belongs in a Koios beat, work it into
// a draft candidate.
//
// Submission shape: a JSON object on stdin, or --key=value flags. Keys:
//   url (required), title (required), summary, text, authors (comma-sep),
//   published, beat, term, at, dryRun.
//
//   echo '{"url":"...","title":"...","summary":"..."}' | node dist/submit-source.mjs
//   node dist/submit-source.mjs --url=... --title=... --beat=war
import process from "node:process";
import { isOutOfFrame, submitSource } from "./researching/sourcing/index.mjs";
function readStdin() {
    return new Promise((resolve, reject) => {
        if (process.stdin.isTTY) {
            resolve("");
            return;
        }
        let data = "";
        process.stdin.setEncoding("utf8");
        process.stdin.on("data", (chunk) => { data += chunk; });
        process.stdin.on("end", () => resolve(data));
        process.stdin.on("error", reject);
    });
}
function parseFlags(argv) {
    const flags = {};
    for (const arg of argv) {
        const match = arg.match(/^--([^=]+)=(.*)$/s);
        if (match?.[1] !== undefined && match[2] !== undefined)
            flags[match[1]] = match[2];
    }
    return flags;
}
function asString(value) {
    return typeof value === "string" && value.trim() !== "" ? value.trim() : undefined;
}
function asAuthors(value) {
    if (Array.isArray(value))
        return value.map(String).map((author) => author.trim()).filter(Boolean);
    const text = asString(value);
    if (text === undefined)
        return undefined;
    return text.split(",").map((author) => author.trim()).filter(Boolean);
}
const stdin = (await readStdin()).trim();
const flags = parseFlags(process.argv.slice(2));
const fromStdin = stdin === "" ? {} : JSON.parse(stdin);
const input = { ...fromStdin, ...flags };
const url = asString(input["url"]);
const title = asString(input["title"]);
if (url === undefined || title === undefined) {
    process.stderr.write('submit-source: a submission needs at least "url" and "title".\n');
    process.exit(1);
}
const submitted = Object.freeze({
    url,
    title,
    ...(asString(input["summary"]) === undefined ? {} : { summary: asString(input["summary"]) }),
    ...(asString(input["text"]) === undefined ? {} : { text: asString(input["text"]) }),
    ...(asAuthors(input["authors"]) === undefined ? {} : { authors: asAuthors(input["authors"]) }),
    ...(asString(input["published"]) === undefined ? {} : { published: asString(input["published"]) }),
    ...(asString(input["beat"]) === undefined ? {} : { beat: asString(input["beat"]) }),
    ...(asString(input["term"]) === undefined ? {} : { term: asString(input["term"]) }),
});
const judgment = await submitSource(submitted, {
    env: process.env,
    ...(asString(input["at"]) === undefined ? {} : { at: asString(input["at"]) }),
    ...(input["dryRun"] === true || input["dryRun"] === "true" ? { dryRun: true } : {}),
});
process.stdout.write(`${JSON.stringify(judgment, null, 2)}\n`);
process.exitCode = isOutOfFrame(judgment) ? 2 : 0;
//# sourceMappingURL=submit-source.mjs.map