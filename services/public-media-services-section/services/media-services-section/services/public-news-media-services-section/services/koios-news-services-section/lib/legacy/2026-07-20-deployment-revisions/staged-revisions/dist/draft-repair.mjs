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
import { appendDatedRecord, appendKoiosAct, ledgerRootPath, readKoiosLedger, recordDigest } from "./management/ledger.mjs";
import { readAssignment } from "./researching/writing/assignments.mjs";
import { researchPacket } from "./researching/sourcing/research-packets.mjs";
import { repairManuscriptEditorialSurfaces, reviewManuscriptStandards } from "./researching/writing/editing/standards.mjs";
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
export function latestEditorialReport(dataDir, slug, manuscriptDigest) {
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
    const repairTools = Array.isArray(record["repairTools"])
        ? record["repairTools"].flatMap((value) => isRecord(value)
            && value["tool"] === "replace_exact_body_text"
            && typeof value["before"] === "string"
            && value["before"].length > 0
            && typeof value["after"] === "string"
            ? [Object.freeze({ tool: "replace_exact_body_text", before: value["before"], after: value["after"] })]
            : isRecord(value) && value["tool"] === "repair_editorial_surfaces" && Object.keys(value).every((key) => key === "tool")
                ? [Object.freeze({ tool: "repair_editorial_surfaces" })]
                : [])
        : [];
    return Object.freeze({ report, digest: recordDigest(record), repairTools: Object.freeze(repairTools) });
}
/** Return the closest byte-bound authority that can license a manuscript
 * repair. Most repairs follow an independent Editor judgment. A source-
 * originality refusal happens earlier, so its deterministic gate witness is
 * the repair authority and must not be mistaken for a source-custody defect. */
export function latestManuscriptRepairDirective(input) {
    const manuscriptDigest = recordDigest(input.manuscript);
    try {
        const editor = latestEditorialReport(input.dataDir, input.slug, manuscriptDigest);
        return Object.freeze({ ...editor, authority: "independent-editor" });
    }
    catch {
        // Continue to the earlier deterministic warranty gate.
    }
    const gate = readKoiosLedger(input.dataDir, "contract-events")
        .filter((record) => record["act"] === "newsroom.circuit.source-originality-refused"
        && record["subject"] === input.assignmentId
        && isRecord(record["data"])
        && record["data"]["slug"] === input.slug)
        .sort((left, right) => String(left["recordedAt"] ?? "").localeCompare(String(right["recordedAt"] ?? "")))
        .at(-1);
    const data = gate !== undefined && isRecord(gate["data"]) ? gate["data"] : undefined;
    const findings = Array.isArray(data?.["findings"])
        ? data.findings.filter((finding) => isRecord(finding)
            && typeof finding["draftSentence"] === "string"
            && typeof finding["sourceSentence"] === "string"
            && typeof finding["sourceUrl"] === "string")
        : [];
    const recordedManuscriptDigest = typeof data?.["manuscriptDigest"] === "string" ? data.manuscriptDigest : undefined;
    const bytesAreCurrent = recordedManuscriptDigest === manuscriptDigest
        || (findings.length > 0
            && findings.every((finding) => input.manuscript.includes(String(finding["draftSentence"]))));
    if (gate === undefined || data === undefined || findings.length === 0 || !bytesAreCurrent) {
        throw new Error(`no current repair directive for ${input.slug} at ${manuscriptDigest}`);
    }
    const examples = findings.map((finding, index) => [
        `${index + 1}. Do not reuse this draft sentence: ${String(finding["draftSentence"])}`,
        `   Reconstruct its supported facts independently from ${String(finding["sourceUrl"])} or use a short explicit quotation.`,
    ].join("\n"));
    return Object.freeze({
        report: [
            `The deterministic source-originality gate found ${findings.length} source-shaped sentence(s).`,
            "Replay the writer against the same witnessed source packet. Use materially independent prose or an explicit, properly attributed quotation. Preserve all other warranted claims and citations, and do not refresh or replace the sources.",
            ...examples,
        ].join("\n"),
        digest: recordDigest(gate),
        repairTools: Object.freeze([]),
        authority: "deterministic-source-originality-gate",
    });
}
/** Apply only exact, unique body-span repairs selected by the independent
 * editor. The selection contributes bounded choices; code owns the mutation. */
export function applyExactBodyRepairTools(body, repairTools) {
    let next = body;
    for (const repair of repairTools) {
        if (repair.tool !== "replace_exact_body_text")
            continue;
        const first = next.indexOf(repair.before);
        if (first < 0 || next.indexOf(repair.before, first + repair.before.length) >= 0)
            throw new Error("editorial repair tool requires one exact unique body span");
        next = `${next.slice(0, first)}${repair.after}${next.slice(first + repair.before.length)}`;
    }
    return next;
}
export function applyBoundedEditorialRepairTools(contentDir, slug, repairTools) {
    if (repairTools.length === 0)
        throw new Error("bounded editorial repair requires at least one admitted tool act");
    const path = resolve(contentDir, `${slug}.md`);
    const encoded = readFileSync(path, "utf8");
    const document = decodeFrontMatterDocument(encoded);
    const body = applyExactBodyRepairTools(document.body, repairTools);
    if (body !== document.body)
        writeFileSync(path, encodeFrontMatterDocument(Object.freeze({ ...document, body })), "utf8");
    const surfacesRequested = repairTools.some((repair) => repair.tool === "repair_editorial_surfaces");
    const repaired = repairManuscriptEditorialSurfaces(contentDir, slug);
    if (body === document.body && !surfacesRequested)
        throw new Error("bounded editorial repair changed no manuscript body bytes");
    if (body === document.body && repaired.changed.length === 0)
        throw new Error("bounded editorial surface repair changed no manuscript bytes");
    return repaired;
}
export function editorRequestsCarrierRepair(report) {
    return /(?:frontmatter|metadata fields?|artifact (?:preamble|sentences?)|process narration|editorial commentary|description and summary|body is returned byte-for-byte)/iu.test(report);
}
export function renderedDraftRevisionInstructions(authority = "independent-editor") {
    const operatingMaterial = [
        "lib/management/offices/reporter.json",
        "lib/management/offices/editor-in-chief.json",
        "lib/management/duties/forming-a-reported-manuscript.json",
        "lib/management/duties/judging-accountable-publication.json",
        "lib/management/contracts/liss-routed-writer-inference.json",
        "lib/law/accountable-attention-and-publication.json",
        "lib/law/reported-analysis-genre-contract.json",
    ].map((relativePath) => Object.freeze({
        relativePath,
        value: JSON.parse(readFileSync(join(SITE_ROOT, relativePath), "utf8")),
    }));
    const authorityLabel = authority === "independent-editor"
        ? "the independent Editor report"
        : "the deterministic source-originality gate report";
    return [
        `You hold Koios.News's Draft Revision duty. Rewrite the complete article body so it clears every material defect in ${authorityLabel}.`,
        "Return prose, not a serialized newsroom record: only the complete revised Markdown body, with no title, frontmatter, labels, patch language, code fence, or commentary.",
        `For this repair, ${authorityLabel} is authoritative. A later independent editorial pass will judge the exact revised manuscript.`,
        ...(authority === "independent-editor"
            ? ["When the Editor identifies bounded defects, preserve every other compliant sentence, heading, quotation, and citation byte-for-byte. Change only the named defects; do not opportunistically restyle or recompose the article."]
            : [
                "This is a full writer replay, not a local patch. Reconstruct the whole manuscript in materially independent language while preserving the licensed facts, uncertainty, attribution, and reader-facing citations.",
                "Do not preserve sentences from the failed draft byte-for-byte. Do not copy a sentence from the research packet merely because it is licensed as a claim. Use a short, explicit, attributed quotation only when the exact language itself matters.",
            ]),
        "Do not invent connective tissue, causal claims, quotations, identities, numbers, temporal order, policy contents, or geography. If the packet cannot support a requested expansion, narrow or remove the claim.",
        "Every factual paragraph must carry a normal reader-facing source link or an immediately continuing attribution. Never reproduce internal claim IDs or claim tokens.",
        ...operatingMaterial.map(({ relativePath, value }) => `${relativePath}:\n${JSON.stringify(value)}`),
    ].join("\n\n");
}
export function composeDraftRevisionPrompt(input) {
    const cleanRoomReplay = input.repairAuthority === "deterministic-source-originality-gate";
    const reportLabel = cleanRoomReplay
        ? "DETERMINISTIC SOURCE-ORIGINALITY GATE REPORT"
        : "INDEPENDENT EDITOR REPORT";
    return [
        input.renderedInstructions ?? renderedDraftRevisionInstructions(input.repairAuthority),
        ...(cleanRoomReplay
            ? ["CLEAN-ROOM REPLAY BOUNDARY:\nDevelop an independent explanatory structure from the assignment and witnessed evidence; do not traverse the packet sentence-by-sentence. The failed manuscript remains digest-bound customer evidence but is intentionally withheld from this writer invocation so its wording cannot anchor the rewrite."]
            : []),
        `${reportLabel}:\n${input.editorReport}`,
        `WITNESSED RESEARCH PACKET:\n${JSON.stringify(input.researchPacket)}`,
        ...(cleanRoomReplay ? [] : [`CURRENT BODY:\n${input.currentBody}`]),
    ].join("\n\n");
}
export function composeCompletenessRepairPrompt(input) {
    return [
        "You hold Koios.News's bounded Draft Completion duty.",
        `The prior revision is ${input.candidateWords} words, below the deterministic 600-word publication floor. Return a complete revised Markdown article body of 650 to 1,000 words.`,
        "Return prose only: no title, frontmatter, labels, patch language, code fence, or commentary.",
        "Preserve the prior revision's supported thesis and reader-facing source links. Expand only with facts licensed by the witnessed research packet. Do not add invented connective claims, quotations, identities, numbers, chronology, policy contents, or geography.",
        "Satisfy the independent Editor's material repairs. If evidence is too thin for a requested expansion, narrow the claim and deepen explanation of supported relationships instead of inventing facts.",
        `INDEPENDENT EDITOR REPORT:\n${input.editorReport}`,
        `WITNESSED RESEARCH PACKET:\n${JSON.stringify(input.researchPacket)}`,
        `SHORT CANDIDATE BODY:\n${input.candidateBody}`,
    ].join("\n\n");
}
function draftProblems(input) {
    const bodyWords = input.body.split(/\s+/gu).filter(Boolean).length;
    return Object.freeze([
        ...(input.contributionProblem === undefined ? [] : [input.contributionProblem]),
        ...(input.sourceUrls.some((url) => input.body.includes(url)) ? [] : ["draft repair omitted every witnessed source citation"]),
        ...(bodyWords >= 600 ? [] : [`draft repair returned ${bodyWords} words; the deterministic completeness floor is 600`]),
        ...(bodyWords <= 1_100 ? [] : [`draft repair returned ${bodyWords} words; the licensed evidence budget allows at most 1100`]),
        ...(input.body.includes("[claim:") ? ["draft repair leaked internal claim tokens into reader prose"] : []),
    ]);
}
export function shouldRetryIncompleteDraft(input) {
    return input.provider === "liss"
        && input.words < 600
        && input.problems.length === 1
        && input.problems[0].includes("deterministic completeness floor");
}
export function draftRepairInferenceRoute(quality = "cheapest-sufficient") {
    return Object.freeze({
        tiers: Object.freeze(quality === "leader"
            ? ["leader-claude"]
            : ["free-gemini", "free-nim", "leader-claude"]),
        models: Object.freeze({
            "free-gemini": "gemini-3.1-flash-lite",
            "free-nim": "meta/llama-3.1-8b-instruct",
            "leader-claude": "claude-sonnet-4-6",
        }),
    });
}
function manuscriptAssignmentId(frontMatter) {
    const koios = isRecord(frontMatter["koios"]) ? frontMatter["koios"] : {};
    const assignmentId = koios["assignment_id"];
    if (typeof assignmentId !== "string" || assignmentId.trim() === "") {
        throw new Error("bounded repair requires a manuscript linked to a durable assignment");
    }
    return assignmentId;
}
export function requireManuscriptMutation(before, after) {
    if (after === before)
        throw new Error("bounded editorial repair changed no manuscript bytes");
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
    if (editor.repairTools.length > 0) {
        const surfaceRepair = applyBoundedEditorialRepairTools(contentDir, input.slug, editor.repairTools);
        const after = readFileSync(path, "utf8");
        requireManuscriptMutation(before, after);
        const repairedDocument = decodeFrontMatterDocument(after);
        const at = input.now ?? new Date().toISOString();
        const record = Object.freeze({
            kind: "koios.draft-repair", at, slug: input.slug, assignmentId, editorJudgmentDigest: editor.digest,
            before: Object.freeze({ path, digest: beforeDigest }),
            after: Object.freeze({ path, digest: recordDigest(after), standards: surfaceRepair.review }),
            replacement: Object.freeze({ beforeBodyDigest: digest(document.body), afterBodyDigest: digest(repairedDocument.body), beforeCharacters: document.body.length, afterCharacters: repairedDocument.body.length }),
            inference: Object.freeze({ provider: "koios-bounded-editorial-repair-tools", model: "none", usage: Object.freeze({ calls: 0, tokens: 0 }), toolCount: editor.repairTools.length }),
            composition: Object.freeze({ promptDigest: editor.digest, promptCharacters: 0 }),
        });
        appendDatedRecord({ dataRoot: dataDir, ledger: "contract-events", instant: at, record: record });
        return record;
    }
    if (editorRequestsCarrierRepair(editor.report)) {
        const surfaceRepair = repairManuscriptEditorialSurfaces(contentDir, input.slug);
        const after = readFileSync(path, "utf8");
        if (after === before) {
            throw new Error("editor requested a carrier-only repair but the deterministic carrier projection was already stable; whole-manuscript inference is forbidden and the projection service requires repair");
        }
        const repairedDocument = decodeFrontMatterDocument(after);
        const at = input.now ?? new Date().toISOString();
        const record = Object.freeze({
            kind: "koios.draft-repair",
            at,
            slug: input.slug,
            assignmentId,
            editorJudgmentDigest: editor.digest,
            before: Object.freeze({ path, digest: beforeDigest }),
            after: Object.freeze({ path, digest: recordDigest(after), standards: surfaceRepair.review }),
            replacement: Object.freeze({
                beforeBodyDigest: digest(document.body),
                afterBodyDigest: digest(repairedDocument.body),
                beforeCharacters: document.body.length,
                afterCharacters: repairedDocument.body.length,
            }),
            inference: Object.freeze({ provider: "koios-deterministic-editorial-surfaces", model: "none", usage: Object.freeze({ calls: 0, tokens: 0 }) }),
            composition: Object.freeze({ promptDigest: editor.digest, promptCharacters: 0 }),
        });
        appendDatedRecord({ dataRoot: dataDir, ledger: "contract-events", instant: at, record: record });
        return record;
    }
    const provider = input.provider ?? "property";
    const usage = { calls: 0, tokens: 0 };
    const prompt = composeDraftRevisionPrompt({
        editorReport: editor.report,
        researchPacket: packet,
        currentBody: document.body,
    });
    const providerResults = [];
    const selectedRoutes = [];
    const repairRoute = draftRepairInferenceRoute(input.inferenceQuality);
    let completion = provider === "liss"
        ? (() => {
            const result = procureLissProse({
                purpose: `Repair Koios manuscript ${input.slug} under assignment ${assignmentId}.`,
                prompt,
                tiers: repairRoute.tiers,
                models: repairRoute.models,
                requiredText: [sourceUrls[0]],
                maxTokens: 3_000,
            });
            usage.calls = 1;
            providerResults.push(result.providerResult);
            selectedRoutes.push(result);
            return result.text;
        })()
        : await makeAsk({
            provider: property.provider ?? "nim",
            ...(property.model === undefined ? {} : { model: property.model }),
            temperature: 0.2,
            maxTokens: 3000,
            onUsage: (entry) => { usage.calls += 1; usage.tokens += entry.totalTokens ?? 0; },
        })(prompt);
    const promptDigests = [digest(prompt)];
    let body = "";
    let contributionProblem;
    const normalize = () => {
        body = "";
        contributionProblem = undefined;
        try {
            body = canonicalizeSourceUrls(proseContributionBody(completion), packet.sourceUrls);
        }
        catch (error) {
            contributionProblem = error instanceof Error ? error.message : String(error);
        }
    };
    normalize();
    let problems = draftProblems({ body, contributionProblem, sourceUrls: packet.sourceUrls });
    const bodyWords = () => body.split(/\s+/gu).filter(Boolean).length;
    if (shouldRetryIncompleteDraft({ provider, problems, words: bodyWords() })) {
        const completionPrompt = composeCompletenessRepairPrompt({
            editorReport: editor.report,
            researchPacket: packet,
            candidateBody: body,
            candidateWords: bodyWords(),
        });
        const result = procureLissProse({
            purpose: `Complete short Koios draft repair ${input.slug} under assignment ${assignmentId}.`,
            prompt: completionPrompt,
            tiers: repairRoute.tiers,
            models: repairRoute.models,
            requiredText: [sourceUrls[0]],
            maxTokens: 3_000,
        });
        usage.calls += 1;
        providerResults.push(result.providerResult);
        selectedRoutes.push(result);
        promptDigests.push(digest(completionPrompt));
        completion = result.text;
        normalize();
        problems = draftProblems({ body, contributionProblem, sourceUrls: packet.sourceUrls });
    }
    const at = input.now ?? new Date().toISOString();
    if (problems.length > 0) {
        const obstruction = Object.freeze({
            kind: "koios.draft-repair-obstruction", at, slug: input.slug, assignmentId, problems,
            before: Object.freeze({ path, digest: beforeDigest }), editorJudgmentDigest: editor.digest,
            inference: Object.freeze({ provider: provider === "liss" ? selectedRoutes.at(-1)?.selectedProvider ?? "logical-inference-service-section" : property.provider ?? "nim", model: provider === "liss" ? selectedRoutes.at(-1)?.model ?? "cheapest-sufficient-repair-route" : property.model ?? "provider-default", ...(provider === "liss" ? { tier: selectedRoutes.at(-1)?.selectedTier ?? "unsettled" } : {}), usage }),
            composition: Object.freeze({ promptDigest: digest(prompt), promptDigests: Object.freeze(promptDigests), promptCharacters: prompt.length, attempts: promptDigests.length }),
            completion: Object.freeze({ digest: digest(completion), characters: completion.length, words: bodyWords() }),
            ...(providerResults.length === 0 ? {} : { providerResultDigests: Object.freeze(providerResults.map(recordDigest)) }),
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
        provider: provider === "liss" ? selectedRoutes.at(-1)?.selectedProvider ?? "logical-inference-service-section" : property.provider ?? "nim",
        model: provider === "liss" ? selectedRoutes.at(-1)?.model ?? "cheapest-sufficient-repair-route" : property.model ?? "provider-default",
        ...(provider === "liss" ? { tier: selectedRoutes.at(-1)?.selectedTier ?? "unsettled" } : {}),
        usage,
        ...(providerResults.length === 0 ? {} : { providerResultDigest: recordDigest(providerResults.at(-1)), providerResultDigests: Object.freeze(providerResults.map(recordDigest)) }),
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
        composition: Object.freeze({ promptDigest: digest(prompt), promptDigests: Object.freeze(promptDigests), promptCharacters: prompt.length, attempts: promptDigests.length }),
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
    const record = await repairDraft({
        slug,
        provider: process.argv.includes("--liss") ? "liss" : "property",
        ...(process.argv.includes("--leader") ? { inferenceQuality: "leader" } : {}),
    });
    process.stdout.write(`${JSON.stringify(record, null, 2)}\n`);
}
//# sourceMappingURL=draft-repair.mjs.map