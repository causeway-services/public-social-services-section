import { createHash, randomUUID } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { a2aResultParts, sendRmnTask } from "@red-cup-engineering/a2a-rmn-task-client-service";
import { agentCardSignatureEvidence } from "@red-cup-engineering/a2a-agent-card-discovery-service";
import { extractRmnPart, userRmnMessage } from "@red-cup-engineering/a2a-rmn-part-service";
import { encodeJsonByteCarrier } from "@red-cup-engineering/json-byte-carrier-service";
import { admitJsonSemanticContent, EMPTY_WITNESS_ROOT, identifyJsonSemanticContent } from "@red-cup-engineering/semantic-content-identify-service";
const A2A_CARRIER_KIND = "rsc-quiescent.a2a-json";
const semanticBytes = (value) => identifyJsonSemanticContent({ objectKind: A2A_CARRIER_KIND, value, witnessRoot: EMPTY_WITNESS_ROOT }).bytes;
const decodeSemantic = (bytes) => admitJsonSemanticContent({ bytes, objectKind: A2A_CARRIER_KIND }).value;
import { ACTOR, NOTEBOOK, contentId } from "./channel.mjs";
const semanticId = (objectKind, value) => identifyJsonSemanticContent({ objectKind, value, witnessRoot: EMPTY_WITNESS_ROOT }).token;

const NI = /^ni:\/\/\/sha-256;[A-Za-z0-9_-]{43}$/u;
function digest(bytes) { return `sha256:${createHash("sha256").update(bytes).digest("hex")}`; }
function providerContentId(value) { return semanticId("emsweb.persistent-notebook.record", value); }
function exact(value) { if (!value || typeof value !== "object") return false; const { id, ...body } = value; return id === providerContentId(body); }

export function lessonSourceProjection(lesson) {
  if (lesson?.type !== "MathematicsLessonBriefAdmission" || typeof lesson.title !== "string" || typeof lesson.notebookPrompt !== "string" || !Array.isArray(lesson.learningObjectives) || !Array.isArray(lesson.definitions)) throw new TypeError("lesson source projection requires an admitted mathematics lesson");
  const lines = [
    `# ${lesson.title}`,
    "",
    lesson.promise,
    "",
    "## Learning objectives",
    ...lesson.learningObjectives.map((value) => `- ${value}`),
    "",
    "## Definitions",
    ...lesson.definitions.map((value) => `- ${value}`),
    "",
    "## Instructional frame",
    lesson.humanFrame,
    "",
    "## Assessment",
    lesson.assessment,
    "",
    `Research source packet: ${lesson.sourcePacket}`,
    `Research corpus digest: ${lesson.sourceCorpusDigest}`,
    "",
  ];
  return Buffer.from(lines.join("\n"), "utf8");
}

export function formPersistentNotebookCinematicOrder(lesson, { sourceBytes = lessonSourceProjection(lesson), sourceTitle = `${lesson.title} — Mathematics in Relation lesson brief`, binding = loadPersistentNotebookBinding() } = {}) {
  const bytes = Buffer.from(sourceBytes);
  if (bytes.length < 1 || bytes.length > 10 * 1024 * 1024 || typeof sourceTitle !== "string" || sourceTitle.trim() === "") throw new TypeError("persistent-notebook order requires one bounded named lesson carrier");
  const body = { type: "PersistentNotebookChannelVideoOrder", customer: ACTOR, provider: NOTEBOOK, notebook: binding.notebook, sourceLifecyclePolicy: "curated-cumulative-corpus", source: { carrier: encodeJsonByteCarrier(bytes, { mediaType: "text/markdown" }), digest: digest(bytes), title: sourceTitle, byteLength: bytes.length }, prompt: lesson.notebookPrompt, format: "cinematic", style: null, language: "en" };
  return { id: providerContentId(body), ...body };
}

export function createPersistentNotebookCinematicClient({ agentUrl, expectedAgentCardIdentity, dataRoot, send = sendRmnTask, fetch: fetchArtifact = globalThis.fetch, cardEvidence = agentCardSignatureEvidence, timeoutMs = 3_630_000, maxAttempts = 240, wait = (milliseconds) => new Promise((accept) => setTimeout(accept, milliseconds)) } = {}) {
  if (typeof agentUrl !== "string" || !agentUrl.endsWith("/.well-known/agent-card.json") || !NI.test(expectedAgentCardIdentity ?? "")) throw new TypeError("mathematics notebook client requires a pinned signed Agent Card");
  if (typeof dataRoot !== "string") throw new TypeError("mathematics notebook client requires its local data root");
  const root = resolve(dataRoot), authenticated = new WeakMap();
  return {
    async requestCinematic(order) {
      const deadline = Date.now() + timeoutMs;
      for (let attempt = 0; attempt < maxAttempts && Date.now() < deadline; attempt += 1) {
        const message = userRmnMessage(semanticBytes(["persistent-notebook-channel-video-order", order]), "persistent-notebook-channel-video-order.rmn.cbor", randomUUID());
        const exchange = await send({ agentUrl, message, requireSignature: true, signal: AbortSignal.timeout(Math.max(1, deadline - Date.now())) });
        const identity = cardEvidence(exchange.agentCard).card;
        if (identity !== expectedAgentCardIdentity) throw new TypeError("persistent-notebook Agent Card identity does not match the mathematics contract");
        const part = extractRmnPart(a2aResultParts(exchange.result)), decoded = decodeSemantic(part.bytes);
        if (!semanticBytes(decoded).equals(part.bytes) || decoded?.[0] !== "persistent-notebook-channel-video-result" || decoded.length !== 2) throw new TypeError("persistent-notebook returned a foreign channel-video result");
        const result = decoded[1];
        if (result?.order !== order.id) throw new TypeError("persistent-notebook result does not bind the mathematics order");
        if (result.disposition === "in-progress") { await wait(Math.min(Number(result.retryAfterSeconds ?? 5) * 1000, Math.max(0, deadline - Date.now()))); continue; }
        if (result.disposition === "refused") throw Object.assign(new Error(`persistent-notebook refused: ${result.code ?? "unspecified"}`), { code: result.code, retryable: result.retryable === true, result });
        const delivery = result.delivery;
        if (result.disposition !== "artifact" || !exact(delivery) || delivery.type !== "PersistentNotebookChannelVideoDelivery" || delivery.provider !== NOTEBOOK || delivery.customer !== ACTOR || delivery.order !== order.id || delivery.format !== "cinematic") throw new TypeError("persistent-notebook result lacks the exact mathematics cinematic delivery");
        if (!exact(delivery.demand) || !exact(delivery.videoAdmission) || !exact(delivery.cinematicCapacityReceipt) || delivery.videoAdmission.demand !== delivery.demand.id || delivery.videoAdmission.cinematicCapacityReceipt !== delivery.cinematicCapacityReceipt.id || delivery.videoAdmission.sha256 !== delivery.artifact?.sha256) throw new TypeError("cinematic delivery lacks its exact demand, artifact, and premium-capacity chain");
        authenticated.set(delivery, { order: order.id, identity, inputNi: exchange.inputNi, outputNi: exchange.outputNi });
        return delivery;
      }
      throw new Error("mathematics cinematic did not settle within the bounded retry window");
    },
    async materializeArtifact(delivery) {
      if (!authenticated.has(delivery)) throw new TypeError("only an authenticated cinematic delivery may be materialized");
      const artifact = delivery.artifact; let url;
      try { url = new URL(artifact?.url); } catch { throw new TypeError("cinematic delivery artifact requires an absolute URL"); }
      if (!(["https:"].includes(url.protocol) || (url.protocol === "http:" && ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname))) || url.username || url.password || artifact.authorization?.scheme !== "Bearer" || typeof artifact.authorization.token !== "string" || artifact.authorization.token.length < 32) throw new TypeError("cinematic artifact capability is not a secure attenuated HTTP delivery");
      const response = await fetchArtifact(url, { headers: { accept: "video/mp4", authorization: `Bearer ${artifact.authorization.token}` }, redirect: "error", signal: AbortSignal.timeout(timeoutMs) });
      if (!response.ok) throw new Error(`persistent-notebook artifact fetch returned HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length < 12 || bytes.subarray(4, 8).toString("ascii") !== "ftyp" || artifact.mediaType !== "video/mp4" || bytes.length !== artifact.byteLength || digest(bytes) !== artifact.sha256) throw new TypeError("cinematic artifact bytes differ from signed delivery terms");
      const artifactRoot = join(root, "artifacts"); mkdirSync(artifactRoot, { recursive: true }); const path = join(artifactRoot, `${artifact.sha256.slice(7)}.mp4`);
      if (existsSync(path)) { if (digest(readFileSync(path)) !== artifact.sha256) throw new TypeError("local cinematic artifact conflicts with its digest"); }
      else writeFileSync(path, bytes, { flag: "wx", mode: 0o600 });
      return { path, bytes, sha256: artifact.sha256, byteLength: bytes.length, mediaType: artifact.mediaType };
    },
    cinematicActivity(delivery) {
      const evidence = authenticated.get(delivery);
      if (!evidence) throw new TypeError("cinematic activity requires an authenticated delivery");
      const object = { type: "PersistentNotebookCinematicDelivery", demand: delivery.demand, videoAdmission: delivery.videoAdmission, capacityReceipt: delivery.cinematicCapacityReceipt };
      const body = { type: "Accept", actor: NOTEBOOK, object }; const activity = { id: contentId(body), ...body };
      authenticated.set(activity, evidence); return activity;
    },
    async verifyActivity(activity, order) { const evidence = authenticated.get(activity); return evidence?.identity === expectedAgentCardIdentity && evidence.order === order?.id; },
  };
}

export function loadPersistentNotebookBinding(path = new URL("../content/config/persistent-notebook-provider.json", import.meta.url)) {
  const binding = JSON.parse(readFileSync(path, "utf8"));
  if (binding?.type !== "PersistentNotebookChannelVideoProviderBinding" || binding.status !== "active" || binding.customer !== ACTOR || binding.provider !== NOTEBOOK || binding.format !== "cinematic" || !NI.test(binding.agentCardIdentity ?? "")) throw new TypeError("mathematics persistent-notebook binding is not active and exact");
  return binding;
}

export function persistentNotebookClient(dataRoot) { const binding = loadPersistentNotebookBinding(); return createPersistentNotebookCinematicClient({ agentUrl: binding.agentUrl, expectedAgentCardIdentity: binding.agentCardIdentity, dataRoot }); }
