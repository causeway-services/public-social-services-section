#!/usr/bin/env node
// draft-repair — contract one bounded prose repair after an Editor judgment.
// The provider writes prose. Koios resolves source custody and serializes the act.
import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { decodeFrontMatterDocument, encodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";
import { makeAsk } from "@emsenn/producing-content";
import { DEFAULT_CONTENT_PRODUCTION_CONFIG } from "./config.mjs";
import { loadPosts } from "./content.mjs";
import { koiosFarmProperty } from "./demand.mjs";
import { appendDatedRecord, appendKoiosAct, ledgerRootPath, recordDigest } from "./management/ledger.mjs";
import { readAssignment } from "./researching/writing/assignments.mjs";
import { researchPacket } from "./researching/sourcing/research-packets.mjs";
import { reviewManuscriptStandards } from "./researching/writing/editing/standards.mjs";
import { procureLissProse } from "./researching/writing/editing/liss-editorial.mjs";
import { canonicalizeSourceUrls, descriptionFromProse, proseContributionBody, summaryFromProse } from "./researching/writing/prose-contribution.mjs";
const SITE_ROOT = dirname(DEFAULT_CONTENT_PRODUCTION_CONFIG);
function digest(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function isRecord(value) {
    return !!value && typeof value === "object" && !Array.isArray(value);
}
function jsonlFiles(root) {
    try {
        return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory()
            ? jsonlFiles(join(root, entry.name))
            : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []);
    }
    catch {
        return [];
    }
}
function latestEditorialReport(dataDir, slug, manuscriptDigest) {
    const records = [...jsonlFiles(ledgerRootPath(dataDir, "editorial-judgments"))].sort().flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }).filter((record) => record["slug"] === slug
        && record["manuscriptDigest"] === manuscriptDigest
        && (record["disposition"] === "revise" || record["disposition"] === "refuse"));
    const record = records.at(-1);
    if (record === undefined)
        throw new Error(`no current revise/refuse judgment for ${slug} at ${manuscriptDigest}`);
    const report = String(record["report"] ?? record["summary"] ?? "");
    return Object.freeze({ report, digest: recordDigest(record) });
}
function manuscriptAssignmentId(frontMatter) {
    const koios = isRecord(frontMatter["koios"]) ? frontMatter["koios"] : {};
    const assignmentId = koios["assignment_id"];
    if (typeof assignmentId !== "string" || assignmentId.trim() === "") {
        throw new Error("bounded repair requires a manuscript linked to a durable assignment");
    }
    return assignmentId;
}
export async function repairDraft(input) {
    const property = koiosFarmProperty();
    const dataDir = resolve(property.dataDir);
    const contentDir = resolve(property.contentDir);
    const path = resolve(contentDir, `${input.slug}.md`);
    const before = readFileSync(path, "utf8");
    const beforeDigest = recordDigest(before);
    const document = decodeFrontMatterDocument(before);
    const assignmentId = manuscriptAssignmentId(document.frontMatter);
    const assignment = readAssignment(dataDir, assignmentId, loadPosts(contentDir));
    const references = Array.isArray(document.frontMatter["references"]) ? document.frontMatter["references"] : [];
    const citedUrls = references.flatMap((reference) => isRecord(reference) && typeof reference["URL"] === "string" ? [reference["URL"]] : []);
    const sourceUrls = citedUrls.length > 0 ? citedUrls : assignment.sourceUrls;
    const packet = researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: Math.max(4, sourceUrls.length) });
    if (packet.selectedCount === 0)
        throw new Error(`assignment ${assignmentId} has no admitted source evidence for repair`);
    const editor = latestEditorialReport(dataDir, input.slug, beforeDigest);
    const provider = input.provider ?? "property";
    const usage = { calls: 0, tokens: 0 };
    const prompt = [
        "You hold Koios.News's Draft Revision duty. Rewrite the complete article body so it clears every material defect in the independent Editor report.",
        "Return prose, not a serialized newsroom record: only the complete revised Markdown body, with no title, frontmatter, labels, patch language, code fence, or commentary.",
        "The latest independent Editor report is authoritative. A later independent pass will judge the exact revised manuscript.",
        "Do not invent connective tissue, causal claims, quotations, identities, numbers, temporal order, policy contents, or geography. If the packet cannot support a requested expansion, narrow or remove the claim.",
        "Every factual paragraph must carry a normal reader-facing source link or an immediately continuing attribution. Never reproduce internal claim IDs or claim tokens.",
        `INDEPENDENT EDITOR REPORT:\n${editor.report}`,
        `WITNESSED RESEARCH PACKET:\n${JSON.stringify(packet)}`,
        `CURRENT BODY:\n${document.body}`,
    ].join("\n\n");
    let providerResult;
    const completion = provider === "liss"
        ? (() => {
            const result = procureLissProse({
                purpose: `Repair Koios manuscript ${input.slug} under assignment ${assignmentId}.`,
                prompt,
                model: "claude-sonnet-4-6",
                requiredText: [sourceUrls[0]],
            });
            usage.calls = 1;
            providerResult = result.providerResult;
            return result.text;
        })()
        : await makeAsk({
            provider: property.provider ?? "nim",
            ...(property.model === undefined ? {} : { model: property.model }),
            temperature: 0.2,
            maxTokens: 3000,
            onUsage: (entry) => { usage.calls += 1; usage.tokens += entry.totalTokens ?? 0; },
        })(prompt);
    let body = "";
    let contributionProblem;
    try {
        body = canonicalizeSourceUrls(proseContributionBody(completion), packet.sourceUrls);
    }
    catch (error) {
        contributionProblem = error instanceof Error ? error.message : String(error);
    }
    const bodyWords = body.split(/\s+/gu).filter(Boolean).length;
    const problems = Object.freeze([
        ...(contributionProblem === undefined ? [] : [contributionProblem]),
        ...(packet.sourceUrls.some((url) => body.includes(url)) ? [] : ["draft repair omitted every witnessed source citation"]),
        ...(bodyWords >= 600 ? [] : [`draft repair returned ${bodyWords} words; the deterministic completeness floor is 600`]),
        ...(bodyWords <= 1_100 ? [] : [`draft repair returned ${bodyWords} words; the licensed evidence budget allows at most 1100`]),
        ...(body.includes("[claim:") ? ["draft repair leaked internal claim tokens into reader prose"] : []),
    ]);
    const at = input.now ?? new Date().toISOString();
    if (problems.length > 0) {
        const obstruction = Object.freeze({
            kind: "koios.draft-repair-obstruction", at, slug: input.slug, assignmentId, problems,
            before: Object.freeze({ path, digest: beforeDigest }), editorJudgmentDigest: editor.digest,
            inference: Object.freeze({ provider: provider === "liss" ? "logical-inference-service-section" : property.provider ?? "nim", model: provider === "liss" ? "claude-sonnet-4-6" : property.model ?? "provider-default", usage }),
            composition: Object.freeze({ promptDigest: digest(prompt), promptCharacters: prompt.length }),
            completion: Object.freeze({ digest: digest(completion), characters: completion.length }),
            ...(providerResult === undefined ? {} : { providerResultDigest: recordDigest(providerResult) }),
        });
        appendDatedRecord({ dataRoot: dataDir, ledger: "contract-events", instant: at, record: obstruction });
        throw new Error(problems.join("; "));
    }
    const priorKoios = isRecord(document.frontMatter["koios"]) ? document.frontMatter["koios"] : {};
    const next = Object.freeze({
        ...document,
        frontMatter: Object.freeze({
            ...document.frontMatter,
            draft: true,
            description: descriptionFromProse(body),
            summary: summaryFromProse(body),
            koios: Object.freeze({ ...priorKoios, gates_clear: false }),
        }),
        body: `${body}\n`,
    });
    writeFileSync(path, encodeFrontMatterDocument(next), "utf8");
    const after = readFileSync(path, "utf8");
    const standards = reviewManuscriptStandards(contentDir, input.slug);
    const inference = Object.freeze({
        provider: provider === "liss" ? "logical-inference-service-section" : property.provider ?? "nim",
        model: provider === "liss" ? "claude-sonnet-4-6" : property.model ?? "provider-default",
        usage,
        ...(providerResult === undefined ? {} : { providerResultDigest: recordDigest(providerResult) }),
    });
    const record = Object.freeze({
        kind: "koios.draft-repair", at, slug: input.slug, assignmentId,
        editorJudgmentDigest: editor.digest,
        before: Object.freeze({ path, digest: beforeDigest }),
        after: Object.freeze({ path, digest: recordDigest(after), standards }),
        replacement: Object.freeze({
            beforeBodyDigest: digest(document.body),
            afterBodyDigest: digest(body),
            beforeCharacters: document.body.length,
            afterCharacters: body.length,
        }),
        inference,
        composition: Object.freeze({ promptDigest: digest(prompt), promptCharacters: prompt.length }),
    });
    appendDatedRecord({ dataRoot: dataDir, ledger: "contract-events", instant: at, record: record });
    if (provider === "property") {
        appendKoiosAct({ dataRoot: dataDir, ledger: "provider-usage", instant: at, act: "inference.consumed", subject: `draft-repair:${input.slug}:${digest(prompt)}`, data: { purpose: "bounded-draft-repair", assignmentId, provider: inference["provider"], model: inference["model"], usage } });
    }
    return record;
}
function isMain() {
    return process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href;
}
if (isMain()) {
    const slug = process.argv[2];
    if (slug === undefined || slug === "")
        throw new TypeError("usage: draft-repair <slug> [--liss]");
    const record = await repairDraft({ slug, provider: process.argv.includes("--liss") ? "liss" : "property" });
    process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
}
//# sourceMappingURL=draft-repair.mjs.map