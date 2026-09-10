/** Koios-owned editorial judgment, executed under contract by LISS. */
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeFrontMatterDocument } from "@emsenn/organizing-a-content-farm";
import { reviewManuscriptStandards } from "./standards.mjs";
import { appendDatedRecord, appendProviderUsage, ledgerRootPath } from "../../../management/ledger.mjs";
import { loadPosts } from "../../../content.mjs";
import { readAssignment } from "../assignments.mjs";
import { researchPacket } from "../../sourcing/research-packets.mjs";
import { EDITORIAL_ASSESSMENT_CONTRACT, procureEditorialAssessment } from "./editorial-assessment-contract.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const KOIOS_ACTOR = "urn:ame:koios-news";
const LISS_ACTOR = "urn:ame:logical-inference-service-section";
const CONTRACT = "liss-inference-service";
const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..");
const DEFAULT_LISS_ROOT = resolve(SITE_ROOT, "../../../../../red-cup-engineering/services/logical-inference-service-section");
export class InferenceRouteRefusal extends Error {
    failedTiers;
    refusalDigest;
    constructor(message, failedTiers, refusalDigest) {
        super(message);
        this.name = "InferenceRouteRefusal";
        this.failedTiers = Object.freeze([...failedTiers]);
        this.refusalDigest = refusalDigest;
    }
}
function canonical(value) {
    if (Array.isArray(value))
        return `[${value.map(canonical).join(",")}]`;
    if (value !== null && typeof value === "object")
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
}
function digest(value) { return `sha256:${createHash("sha256").update(canonical(value)).digest("hex")}`; }
function isRecord(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function jsonObjectEnvelope(text) {
    const trimmed = text.trim();
    const fenced = /^```json\s*\n([\s\S]*?)\n```$/i.exec(trimmed);
    return fenced === null ? trimmed : fenced[1].trim();
}
function labeledField(text, label) {
    const prose = new RegExp(`^${label}:\\s*(.+)$`, "im").exec(text)?.[1]?.trim();
    if (prose !== undefined && prose !== "")
        return prose;
    return new RegExp(`"${label.replaceAll("_", "(?:_|\\s)")}"\\s*:\\s*"([^"\\n]*)"`, "i").exec(text)?.[1]?.trim();
}
function labeledSection(text, label, next) {
    return new RegExp(`^${label}:\\s*\\n([\\s\\S]*?)(?=^${next}:|\\s*$)`, "im").exec(text)?.[1]?.trim() ?? "";
}
function bullets(text) {
    return Object.freeze(text.split("\n").map((line) => line.replace(/^\\s*(?:[-*]|\\d+[.)])\\s*/, "").trim()).filter(Boolean));
}
function parseEditorialReport(text) {
    const envelope = jsonObjectEnvelope(text);
    try {
        const raw = JSON.parse(envelope);
        const disposition = raw["disposition"];
        if (!(disposition === "accept" || disposition === "revise" || disposition === "refuse"))
            throw new Error("invalid disposition");
        return Object.freeze({
            disposition,
            publishable: raw["publishable"] === true,
            summary: String(raw["summary"] ?? ""),
            findings: Object.freeze(Array.isArray(raw["findings"]) ? raw["findings"] : []),
            claimAudit: Object.freeze(Array.isArray(raw["claimAudit"]) ? raw["claimAudit"] : []),
            requiredRepairs: Object.freeze(Array.isArray(raw["requiredRepairs"]) ? raw["requiredRepairs"].map(String) : []),
            pipelineDiagnosis: Object.freeze(isRecord(raw["pipelineDiagnosis"]) ? {
                failureLayer: String(raw["pipelineDiagnosis"]["failureLayer"] ?? "none"),
                evidence: String(raw["pipelineDiagnosis"]["evidence"] ?? ""),
                improvement: String(raw["pipelineDiagnosis"]["improvement"] ?? ""),
                replayFrom: String(raw["pipelineDiagnosis"]["replayFrom"] ?? ""),
            } : { failureLayer: "none", evidence: "", improvement: "", replayFrom: "" }),
        });
    }
    catch {
        const dispositionText = labeledField(text, "DISPOSITION") ?? labeledField(text, "disposition") ?? "";
        const disposition = dispositionText.toLowerCase().match(/accept|revise|refuse/)?.[0];
        if (!(disposition === "accept" || disposition === "revise" || disposition === "refuse"))
            throw new Error("editorial report has no recognizable disposition");
        const publishableText = labeledField(text, "PUBLISHABLE") ?? labeledField(text, "publishable") ?? "no";
        const failureLayer = (labeledField(text, "FAILURE_LAYER") ?? labeledField(text, "failureLayer") ?? "none").toLowerCase();
        return Object.freeze({
            disposition,
            publishable: /^(?:yes|true)\b/i.test(publishableText),
            summary: labeledSection(text, "SUMMARY", "FINDINGS") || labeledField(text, "summary") || "See the preserved editorial report.",
            findings: Object.freeze([]),
            claimAudit: Object.freeze([]),
            requiredRepairs: bullets(labeledSection(text, "REQUIRED REPAIRS", "PIPELINE IMPROVEMENT")),
            pipelineDiagnosis: Object.freeze({
                failureLayer,
                evidence: labeledSection(text, "PIPELINE EVIDENCE", "REPLAY_FROM") || labeledField(text, "evidence") || "See the preserved editorial report.",
                improvement: labeledSection(text, "PIPELINE IMPROVEMENT", "END REPORT") || labeledField(text, "improvement") || "See the preserved editorial report.",
                replayFrom: labeledField(text, "REPLAY_FROM") ?? labeledField(text, "replayFrom") ?? "",
            }),
        });
    }
}
function contentId(value) { return `urn:${digest(value)}`; }
function activity(type, target, object) {
    const body = { type, actor: KOIOS_ACTOR, target, object };
    return { "@context": CONTEXT, id: contentId(body), ...body };
}
function endpoint(root, name) {
    const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    const bins = pkg["bin"];
    const path = bins?.[name];
    if (typeof path !== "string")
        throw new Error(`LISS does not advertise ${name}`);
    return resolve(root, path);
}
function invokeLiss(root, operation, input, now, timeout, resourceEnv = {}) {
    const temp = mkdtempSync(join(tmpdir(), "koios-liss-invocation-"));
    const inputPath = join(temp, "request.json");
    const outputPath = join(temp, "response.json");
    try {
        writeFileSync(inputPath, `${JSON.stringify(input)}\n`, "utf8");
        const result = spawnSync(process.execPath, [endpoint(root, operation), "--operation", operation, "--now", now, "--input-file", inputPath, "--output-file", outputPath], {
            cwd: root, encoding: "utf8", timeout, env: { ...process.env, ...resourceEnv },
        });
        let output;
        try {
            output = JSON.parse(readFileSync(outputPath, "utf8"));
        }
        catch {
            throw new Error(result.error?.message || result.stderr || result.stdout || `LISS ${operation} exited ${result.status}`);
        }
        if (output === null || typeof output !== "object" || Array.isArray(output))
            throw new Error(`LISS ${operation} returned no activity`);
        return output;
    }
    finally {
        rmSync(temp, { recursive: true, force: true });
    }
}
function providerRefusal(value, service) {
    const object = isRecord(value["object"]) ? value["object"] : {};
    const attempts = Array.isArray(object["attempts"]) ? object["attempts"] : [];
    const route = attempts.flatMap((attempt) => isRecord(attempt)
        ? [`${String(attempt["tier"] ?? "unknown-tier")}:${String(attempt["provider"] ?? "unknown-provider")}:${String(attempt["disposition"] ?? "refused")}`]
        : []);
    const failedTiers = attempts.flatMap((attempt) => isRecord(attempt) && typeof attempt["tier"] === "string" ? [attempt["tier"]] : []);
    const reason = String(object["reason"] ?? "provider refused the contracted service").replace(/\s+/gu, " ").slice(0, 600);
    const refusalDigest = digest(value);
    return new InferenceRouteRefusal(`${service} refused: ${reason}; route=${route.join(",") || "unreported"}; refusalDigest=${refusalDigest}`, failedTiers, refusalDigest);
}
function acceptedContract(source, offer) {
    const offerObject = offer["object"];
    const effects = Array.isArray(offerObject["effects"]) ? offerObject["effects"] : [];
    const allowedActions = ["invoke-service", ...effects];
    const capability = {
        id: contentId({ source: source["id"], offer: offer["id"], allowedActions }), type: "Capability",
        issuer: KOIOS_ACTOR, holder: LISS_ACTOR, invocationTarget: LISS_ACTOR, parentOffer: offer["id"], allowedActions,
        attenuation: { sourceActivity: source["id"], requestDigest: offerObject["requestDigest"], effects, providerScope: offerObject["scope"] ?? {}, customerTerritoryMutation: false },
        capTP: { target: LISS_ACTOR, method: "invoke-service" }, grantSource: source["id"],
    };
    const object = { type: "ServiceContract", contract: CONTRACT, demand: contentId({ source: source["id"], service: "editorial-judgment" }), offer, capability };
    return { ...activity("Accept", LISS_ACTOR, object), inReplyTo: offer["id"] };
}
export function procureLissProse(input) {
    const now = input.now ?? new Date().toISOString();
    const model = input.model ?? "claude-sonnet-4-6";
    const tiers = input.tiers ?? ["leader-claude"];
    const tierEffects = {
        "free-groq": ["external-network", "groq-inference-account"],
        "free-nim": ["external-network", "nvidia-inference-account"],
        "leader-claude": ["external-network", "leader-inference-account"],
    };
    const effects = [...new Set(tiers.flatMap((tier) => tierEffects[tier]))];
    const models = { ...(input.models ?? {}), ...(tiers.includes("leader-claude") ? { "leader-claude": input.models?.["leader-claude"] ?? model } : {}) };
    const request = {
        type: "RoutedInferenceRequest", executionMode: "live",
        messages: [{ role: "user", content: input.prompt }],
        admissibleTiers: [...tiers], models,
        sufficiency: (input.requiredText ?? []).map((value) => ({ type: "contains", value })),
        maxTokens: input.maxTokens ?? 6000,
    };
    const source = activity("Create", KOIOS_ACTOR, { type: "Note", content: input.purpose, attachment: [request, { type: "ResourceGrant", effects, maxRuntimeMs: 1_200_000 }] });
    const solicitation = activity("Offer", LISS_ACTOR, { type: "ServiceSolicitation", demand: contentId({ purpose: input.purpose, prompt: digest(input.prompt) }), sourceActivity: source, requestedEvidence: ["provider-authored-contract", "provider-owned-result"] });
    const root = resolve(input.lissRoot ?? process.env.KOIOS_LISS_ROOT ?? DEFAULT_LISS_ROOT);
    const groqCredential = process.env["GROQ_API_KEY"] ?? process.env["API_KEY_GROQ_GROQCLOUD"] ?? process.env["API_KEY_GROQ"];
    const nvidiaCredential = process.env["NVIDIA_API_KEY"] ?? process.env["NVIDIA_NIM_API_KEY"] ?? process.env["API_KEY_NVIDIA_NIM"] ?? process.env["API_KEY_INFERENCE_NVIDIA"];
    const resourceEnv = Object.freeze({
        ...(tiers.includes("free-groq") && groqCredential !== undefined ? { GROQ_API_KEY: groqCredential } : {}),
        ...(tiers.includes("free-nim") && nvidiaCredential !== undefined ? { NVIDIA_API_KEY: nvidiaCredential } : {}),
    });
    const offer = invokeLiss(root, "solicit-service", solicitation, now, 30_000);
    if (offer["type"] !== "Offer")
        throw new Error(`LISS did not offer prose inference: ${JSON.stringify(offer)}`);
    const providerResult = invokeLiss(root, "invoke-service", acceptedContract(source, offer), now, 1_200_000, resourceEnv);
    if (providerResult["type"] !== "Accept")
        throw providerRefusal(providerResult, "LISS prose inference");
    appendProviderUsage({ dataRoot: join(SITE_ROOT, "data"), instant: now, providerResult, purpose: input.purpose });
    const routed = providerResult["object"];
    const selectedTier = String(routed["selectedTier"] ?? tiers.at(-1) ?? "leader-claude");
    return Object.freeze({ text: String(routed["text"] ?? ""), providerResult, model: models[selectedTier] ?? model, recordedAt: now, selectedTier, selectedProvider: String(routed["selectedProvider"] ?? "logical-inference-service-section") });
}
function markdownFiles(root) {
    return readdirSync(root, { withFileTypes: true }).filter((entry) => entry.isFile() && entry.name.endsWith(".md")).map((entry) => join(root, entry.name));
}
function jsonFiles(root) {
    const walk = (path) => readdirSync(path, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? walk(join(path, entry.name)) : entry.name.endsWith(".json") ? [join(path, entry.name)] : []);
    return walk(root);
}
function latestRun(dataDir, slug) {
    const path = join(dataDir, "journals", "logs", "mill-runs.jsonl");
    try {
        return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line)).filter((row) => row["slug"] === slug).at(-1);
    }
    catch {
        return undefined;
    }
}
function latestCircuitDraft(dataDir, slug) {
    return [...jsonlFiles(ledgerRootPath(dataDir, "contract-events"))].sort().flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }).filter((row) => row["kind"] === "koios.ledger-act" && row["act"] === "newsroom.circuit.drafted" && isRecord(row["data"]) && row["data"]["slug"] === slug).at(-1);
}
function jsonlFiles(root) {
    try {
        return readdirSync(root, { withFileTypes: true }).flatMap((entry) => entry.isDirectory() ? jsonlFiles(join(root, entry.name)) : entry.name.endsWith(".jsonl") ? [join(root, entry.name)] : []);
    }
    catch {
        return [];
    }
}
function latestWriterReplay(dataDir, slug) {
    return jsonlFiles(join(dataDir, "records", "writer-replays")).flatMap((path) => {
        try {
            return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    }).filter((row) => isRecord(row["result"]) && row["result"]["slug"] === slug).at(-1);
}
function evidenceFromRun(storeDir, run) {
    const gates = Array.isArray(run?.["gates"]) ? run["gates"] : [];
    const sourceUrls = Array.isArray(run?.["sources"])
        ? run["sources"].flatMap((source) => isRecord(source) && typeof source["url"] === "string" ? [source["url"]] : [])
        : [];
    const urls = [...new Set([...sourceUrls, ...gates.flatMap((gate) => String(gate["evidence"] ?? "").match(/https?:\/\/[^\s,;)]+/g) ?? []).map((url) => url.replace(/[.]+$/, ""))])];
    return jsonFiles(storeDir).flatMap((path) => {
        try {
            const value = JSON.parse(readFileSync(path, "utf8"));
            const claims = Array.isArray(value["claims"]) ? value["claims"] : [];
            const cited = claims.some((claim) => urls.includes(String(claim["provenance"]?.["citation"] ?? "")));
            return cited ? [{ path: path.slice(storeDir.length + 1), value }] : [];
        }
        catch {
            return [];
        }
    });
}
function evidenceFromAssignment(contentDir, dataDir, manuscript) {
    const document = decodeFrontMatterDocument(manuscript);
    const koios = isRecord(document.frontMatter["koios"]) ? document.frontMatter["koios"] : {};
    const assignmentId = koios["assignment_id"];
    if (typeof assignmentId !== "string" || assignmentId === "")
        return [];
    try {
        const assignment = readAssignment(dataDir, assignmentId, loadPosts(contentDir));
        const references = Array.isArray(document.frontMatter["references"]) ? document.frontMatter["references"] : [];
        const citedUrls = references.flatMap((reference) => isRecord(reference) && typeof reference["URL"] === "string" ? [reference["URL"]] : []);
        const sourceUrls = citedUrls.length > 0 ? citedUrls : assignment.sourceUrls;
        const packet = researchPacket({ term: assignment.term, beat: assignment.beat, sourceUrls, limit: Math.max(4, sourceUrls.length) });
        const priorContext = [...jsonlFiles(ledgerRootPath(dataDir, "source-claims"))].sort().flatMap((path) => {
            try {
                return readFileSync(path, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
            }
            catch {
                return [];
            }
        }).filter((row) => row["kind"] === "koios.prior-research-context-admission" && row["assignmentId"] === assignmentId).at(-1);
        return Object.freeze([
            { kind: "koios.assignment-research-packet", assignmentId, warrant: "current-event factual evidence", value: packet },
            ...(priorContext === undefined ? [] : [{ kind: "koios.prior-research-context", assignmentId, warrant: "internal conceptual memory only; not current-event factual evidence", value: priorContext }]),
        ]);
    }
    catch {
        return [];
    }
}
function pipelineArtifacts() {
    const producingRoot = resolve(SITE_ROOT, "../../../../../red-cup-engineering/src/content/assets/legacy/2026-07-03-producing-content");
    const paths = [
        join(SITE_ROOT, "producing-content.config.json"),
        join(SITE_ROOT, "lib/law/reported-analysis-genre-contract.json"),
        join(SITE_ROOT, "data/records/research/2026/07/17/2026-07-17-koios-news-research.jsonl"),
        resolve(SITE_ROOT, "../../dev/content/notes/2026/06/01/agentic-newsroom.md"),
        resolve(SITE_ROOT, "../../dev/content/notes/2026/06/01/news-topology.md"),
        resolve(SITE_ROOT, "../../dev/content/notes/2026/06/01/claims-to-prose.md"),
        resolve(SITE_ROOT, "../../dev/content/notes/2026/06/01/accountable-attention.md"),
        join(SITE_ROOT, "working/researching/SKILL.md"),
        join(SITE_ROOT, "working/researching/scripts/new-brief.mjs"),
        join(SITE_ROOT, "working/writing/SKILL.md"),
        join(SITE_ROOT, "working/writing/scripts/new-post.mjs"),
        join(SITE_ROOT, "working/editing/SKILL.md"),
        join(SITE_ROOT, "working/editing/scripts/lint-post.mjs"),
        join(SITE_ROOT, "src/researching/sourcing/source-cycle.mts"),
        join(SITE_ROOT, "src/writer-replay.mts"),
        join(SITE_ROOT, "src/newsroom/departments.mts"),
        join(producingRoot, "src/content-farm/cultivate.mts"),
        join(producingRoot, "src/content-farm/newsroom.mts"),
        join(producingRoot, "src/topology/article.mts"),
        join(producingRoot, "src/computer/ask.mts"),
    ];
    return Object.freeze(paths.flatMap((path) => {
        try {
            const content = readFileSync(path, "utf8");
            return [{ path, digest: digest(content), content }];
        }
        catch {
            return [];
        }
    }));
}
function editorialMaterials(input) {
    const contentDir = resolve(SITE_ROOT, input.contentDir ?? "content/posts");
    const path = markdownFiles(contentDir).find((candidate) => candidate.endsWith(`/${input.slug}.md`));
    if (path === undefined)
        throw new Error(`no manuscript for ${input.slug}`);
    const manuscript = readFileSync(path, "utf8");
    const standards = reviewManuscriptStandards(contentDir, input.slug);
    const dataDir = resolve(SITE_ROOT, input.dataDir ?? "data");
    const run = latestCircuitDraft(dataDir, input.slug) ?? latestRun(dataDir, input.slug) ?? latestWriterReplay(dataDir, input.slug);
    const assignmentEvidence = evidenceFromAssignment(contentDir, dataDir, manuscript);
    const evidence = assignmentEvidence.length > 0
        ? assignmentEvidence
        : evidenceFromRun(resolve(SITE_ROOT, input.storeDir ?? "store"), run);
    const pipeline = standards.publishable ? [] : pipelineArtifacts();
    return Object.freeze({ contentDir, dataDir, path, manuscript, standards, run, evidence, pipeline, contextDigest: digest({ standards, run: run ?? null, evidence, pipeline }) });
}
export function editorialContextDigestForManuscript(input) {
    return editorialMaterials(input).contextDigest;
}
export function judgeManuscriptUnderContract(input) {
    const materials = editorialMaterials(input);
    const { manuscript, standards, dataDir, run, evidence, pipeline } = materials;
    const now = input.now ?? new Date().toISOString();
    const model = input.model ?? "claude-sonnet-4-6";
    const assessment = procureEditorialAssessment({
        slug: input.slug,
        manuscript,
        manuscriptDigest: digest(manuscript),
        standards: standards,
        ...(run === undefined ? {} : { run }),
        evidence,
        pipeline,
        editorialContextDigest: materials.contextDigest,
        now,
        dataDir,
        model,
        ...(input.lissRoot === undefined ? {} : { lissRoot: input.lissRoot }),
    });
    const chosen = assessment.selection;
    const disposition = chosen.tool === "submit_editorial_acceptance" ? "accept" : chosen.tool === "submit_revision_request" ? "revise" : "refuse";
    if (disposition === "accept" && standards.publishable !== true)
        throw new Error("independent editor selected acceptance while deterministic standards remain unclear");
    const judgment = Object.freeze({
        kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest: digest(manuscript), editorialContextDigest: materials.contextDigest, disposition,
        publishable: disposition === "accept", summary: chosen.summary,
        findings: Object.freeze([]), claimAudit: Object.freeze([]), requiredRepairs: chosen.requiredRepairs,
        pipelineDiagnosis: Object.freeze({ failureLayer: chosen.failureLayer, evidence: chosen.summary, improvement: chosen.requiredRepairs.join("\n"), replayFrom: chosen.replayFrom }),
        provider: "independent-editorial-assessment/logical-inference-service-section/claude-code-inference-team", model, contract: EDITORIAL_ASSESSMENT_CONTRACT,
        serviceAccepted: true, report: chosen.report, providerResult: assessment.providerResult,
        selectedTool: chosen.tool, toolSelectionValidated: true, toolSelectionDigest: assessment.selectionDigest, recordedAt: now,
    });
    appendDatedRecord({ dataRoot: dataDir, ledger: "editorial-judgments", instant: now, record: judgment });
    return judgment;
}
export function recoverEditorialDiagnostic(input) {
    const contentDir = resolve(SITE_ROOT, input.contentDir ?? "content/posts");
    const path = markdownFiles(contentDir).find((candidate) => candidate.endsWith(`/${input.slug}.md`));
    if (path === undefined)
        throw new Error(`no manuscript for ${input.slug}`);
    const manuscript = readFileSync(path, "utf8");
    const exchange = JSON.parse(readFileSync(resolve(input.exchangePath), "utf8"));
    const completion = isRecord(exchange["completion"]) ? exchange["completion"] : {};
    const report = String(completion["text"] ?? "");
    const raw = parseEditorialReport(report);
    const now = input.now ?? new Date().toISOString();
    const judgment = Object.freeze({
        kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest: digest(manuscript), editorialContextDigest: digest({ exchangePath: resolve(input.exchangePath), report }), disposition: raw.disposition,
        // A refused carrier can guide repair but can never authorize publication.
        publishable: false, summary: raw.summary, findings: raw.findings, claimAudit: raw.claimAudit,
        requiredRepairs: raw.requiredRepairs, pipelineDiagnosis: raw.pipelineDiagnosis,
        provider: "logical-inference-service-section/claude-code-inference-team", model: input.model ?? String(completion["model"] ?? "claude-sonnet-4-6"),
        contract: CONTRACT, serviceAccepted: false, report,
        providerResult: Object.freeze({ type: "RefusedServiceDiagnostic", exchangePath: resolve(input.exchangePath), reason: "model prose was useful but the declared JSON envelope predicate was not satisfied" }),
        recordedAt: now,
    });
    appendDatedRecord({ dataRoot: join(SITE_ROOT, "data"), ledger: "editorial-judgments", instant: now, record: judgment });
    return judgment;
}
export function reprojectLatestEditorialJudgment(input) {
    const contentDir = resolve(SITE_ROOT, input.contentDir ?? "content/posts");
    const path = markdownFiles(contentDir).find((candidate) => candidate.endsWith(`/${input.slug}.md`));
    if (path === undefined)
        throw new Error(`no manuscript for ${input.slug}`);
    const manuscript = readFileSync(path, "utf8");
    const manuscriptDigest = digest(manuscript);
    const records = [...jsonlFiles(ledgerRootPath(join(SITE_ROOT, "data"), "editorial-judgments"))].sort().flatMap((recordPath) => {
        try {
            return readFileSync(recordPath, "utf8").split("\n").filter(Boolean).map((line) => JSON.parse(line));
        }
        catch {
            return [];
        }
    });
    const prior = records.filter((record) => record["slug"] === input.slug
        && record["manuscriptDigest"] === manuscriptDigest
        && record["serviceAccepted"] === true
        && typeof record["report"] === "string").at(-1);
    if (prior === undefined)
        throw new Error(`no accepted provider result to reproject for ${input.slug} at ${manuscriptDigest}`);
    const raw = parseEditorialReport(String(prior["report"]));
    const now = input.now ?? new Date().toISOString();
    const judgment = Object.freeze({
        kind: "koios.editorial-judgment", slug: input.slug, manuscriptDigest,
        editorialContextDigest: typeof prior["editorialContextDigest"] === "string" ? prior["editorialContextDigest"] : digest({ prior: prior["recordedAt"], report: prior["report"] }),
        disposition: raw.disposition, publishable: false,
        summary: raw.summary, findings: raw.findings, claimAudit: raw.claimAudit,
        requiredRepairs: raw.requiredRepairs, pipelineDiagnosis: raw.pipelineDiagnosis,
        provider: String(prior["provider"] ?? "logical-inference-service-section/claude-code-inference-team"),
        model: String(prior["model"] ?? "claude-sonnet-4-6"), contract: String(prior["contract"] ?? CONTRACT),
        // Legacy prose may guide a replay, but parsing it again can no longer
        // manufacture publication authority after the tool-selection transition.
        serviceAccepted: false, report: String(prior["report"]), providerResult: prior["providerResult"], recordedAt: now,
    });
    appendDatedRecord({ dataRoot: join(SITE_ROOT, "data"), ledger: "editorial-judgments", instant: now, record: judgment });
    return judgment;
}
//# sourceMappingURL=liss-editorial.mjs.map