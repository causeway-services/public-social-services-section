import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { STATIC_PUBLICATION_EXCLUSIONS } from "./static-shadow.mjs";
const PUBLIC_MUTABLE_ROUTES = Object.freeze(["/healthz", "/hit", "/views.json"]);
const PRIVATE_BOUNDARIES = Object.freeze(["/newsroom", "/cable", "/mcp", "/operators"]);
function sha256(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function canonical(value) {
    if (Array.isArray(value))
        return `[${value.map(canonical).join(",")}]`;
    if (value !== null && typeof value === "object")
        return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(",")}}`;
    return JSON.stringify(value);
}
function disposition(route) {
    if (route === "/hit" || route === "/views.json")
        return Object.freeze({
            sourceClass: "public-mutable-route",
            disposition: "suspend-accountable-attention",
            futureAdmission: "Only a separately contracted accountable-attention service may restore both collection and its public aggregate; privacy must change in the same accepted act.",
        });
    if (route === "/healthz")
        return Object.freeze({
            sourceClass: "public-mutable-route",
            disposition: "retire-public-health-route",
            futureAdmission: "Only a bounded provider health operation or separately granted Worker may restore a primary-host health route.",
        });
    return Object.freeze({
        sourceClass: "separate-private-boundary",
        disposition: "retain-outside-publication-boundary",
        futureAdmission: "This authority remains outside the public static publication and requires its own authenticated service and hostname grant.",
    });
}
export async function settleMutableRouteDispositions(input) {
    const candidateOutputDir = resolve(input.candidateOutputDir);
    const liveOrigin = new URL(input.liveOrigin ?? input.livePublicationWitness.origin).origin;
    if (liveOrigin !== input.livePublicationWitness.origin)
        throw new Error("mutable-route settlement origin differs from the frozen live-publication witness");
    const manifestBytes = readFileSync(join(candidateOutputDir, "manifest.json"));
    const manifest = JSON.parse(manifestBytes.toString("utf8"));
    if (manifest.profile !== "cutover-candidate" || manifest.authority !== "non-authoritative-cutover-candidate")
        throw new Error("mutable-route settlement requires a cutover-candidate artifact");
    if (manifest.livePublicationWitnessDigest !== input.livePublicationWitness.witnessDigest)
        throw new Error("candidate is not bound to the current frozen live-publication witness");
    if (canonical([...manifest.exclusions].sort()) !== canonical([...STATIC_PUBLICATION_EXCLUSIONS].sort()))
        throw new Error("candidate exclusion inventory differs from Koios publication law");
    const candidateRoutes = new Set(manifest.artifacts.map((artifact) => artifact.route));
    for (const route of STATIC_PUBLICATION_EXCLUSIONS)
        if (candidateRoutes.has(route))
            throw new Error(`excluded route entered candidate: ${route}`);
    const privacyArtifact = manifest.artifacts.find((artifact) => artifact.route === "/privacy");
    if (privacyArtifact === undefined)
        throw new Error("candidate has no privacy artifact");
    const privacyBytes = readFileSync(join(candidateOutputDir, privacyArtifact.file));
    if (sha256(privacyBytes) !== privacyArtifact.digest)
        throw new Error("candidate privacy artifact differs from its manifest");
    const privacy = privacyBytes.toString("utf8");
    for (const statement of ["does not send a first-party view beacon", "does not expose an aggregate attention route", "Accountable attention remains suspended"]) {
        if (!privacy.includes(statement))
            throw new Error(`candidate privacy surface omits required disposition: ${statement}`);
    }
    const fetcher = input.fetcher ?? fetch;
    const readings = [];
    for (const route of STATIC_PUBLICATION_EXCLUSIONS) {
        const response = await fetcher(`${liveOrigin}${route}`, { method: "GET", redirect: "manual", headers: { accept: "*/*" } });
        const policy = disposition(route);
        readings.push(Object.freeze({
            route,
            ...policy,
            liveProbeMethod: "GET",
            liveStatus: response.status,
            liveMediaType: (response.headers.get("content-type") ?? "application/octet-stream").split(";", 1)[0].trim().toLowerCase(),
            candidatePresent: false,
            effectiveUnder: "exact-candidate-cutover-only",
        }));
    }
    if (readings.filter((reading) => reading.sourceClass === "public-mutable-route").map((reading) => reading.route).sort().join("\n") !== [...PUBLIC_MUTABLE_ROUTES].sort().join("\n"))
        throw new Error("public mutable-route classification does not close");
    if (readings.filter((reading) => reading.sourceClass === "separate-private-boundary").map((reading) => reading.route).sort().join("\n") !== [...PRIVATE_BOUNDARIES].sort().join("\n"))
        throw new Error("private-boundary classification does not close");
    const body = Object.freeze({
        kind: "koios.mutable-route-disposition-settlement/v1",
        node: "koios-news",
        currentAuthority: "vps",
        candidateAuthority: "non-authoritative-cutover-candidate",
        observedAt: input.observedAt,
        liveOrigin,
        artifactManifestDigest: sha256(manifestBytes),
        livePublicationWitnessDigest: input.livePublicationWitness.witnessDigest,
        deliveryPolicyDigest: sha256(readFileSync(join(candidateOutputDir, "_headers"))),
        candidatePrivacyDigest: privacyArtifact.digest,
        dispositions: Object.freeze(readings),
        candidateOnly: true,
        currentVpsMutated: false,
        credentialsUsed: false,
        settled: true,
    });
    return Object.freeze({ ...body, dispositionDigest: sha256(canonical(body)) });
}
//# sourceMappingURL=mutable-route-dispositions.mjs.map