// Compare the two non-authoritative projections made by the one Koios app.
// This proves that the production-shaped candidate differs from the private
// shadow only where the publication profile deliberately requires a delta.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
function manifestAt(outputDir) {
    return JSON.parse(readFileSync(join(outputDir, "manifest.json"), "utf8"));
}
function digest(value) {
    return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}
function artifacts(manifest) {
    return new Map(manifest.artifacts.map((artifact) => [artifact.route, artifact]));
}
function bytes(outputDir, artifact) {
    return readFileSync(join(outputDir, artifact.file));
}
function withoutAAds(html) {
    return html
        .replace(/<div class="ad-slot ad-slot--a-ads"[^>]*><iframe[^>]*><\/iframe><\/div>/gu, "")
        .replace(/>\n{2,}</gu, ">\n<");
}
function normalizedHeaders(value) {
    return value
        .replace(/^  X-Robots-Tag: noindex, nofollow, noarchive\n/mu, "")
        .replace("frame-src https://acceptable.a-ads.com; ", "");
}
export function compareStaticPublicationProfiles(input) {
    const shadowOutputDir = resolve(input.shadowOutputDir);
    const candidateOutputDir = resolve(input.candidateOutputDir);
    if (digest(readFileSync(join(shadowOutputDir, "manifest.json"))) !== input.shadowManifestDigest)
        throw new Error("shadow manifest digest does not witness the compared bytes");
    if (digest(readFileSync(join(candidateOutputDir, "manifest.json"))) !== input.candidateManifestDigest)
        throw new Error("candidate manifest digest does not witness the compared bytes");
    const shadow = manifestAt(shadowOutputDir);
    const candidate = manifestAt(candidateOutputDir);
    if (shadow.profile !== "shadow")
        throw new Error("profile comparison shadow input is not a shadow artifact");
    if (candidate.profile !== "cutover-candidate")
        throw new Error("profile comparison candidate input is not a cutover candidate");
    if (shadow.livePublicationWitnessDigest !== candidate.livePublicationWitnessDigest)
        throw new Error("publication profiles do not share one frozen public-record witness");
    const shadowArtifacts = artifacts(shadow);
    const candidateArtifacts = artifacts(candidate);
    const shadowRoutes = [...shadowArtifacts.keys()].sort();
    const candidateRoutes = [...candidateArtifacts.keys()].sort();
    const routeSetsEqual = JSON.stringify(shadowRoutes) === JSON.stringify(candidateRoutes);
    const routes = [...new Set([...shadowRoutes, ...candidateRoutes])].sort();
    const deltas = [];
    for (const route of routes) {
        const left = shadowArtifacts.get(route);
        const right = candidateArtifacts.get(route);
        if (left === undefined || right === undefined || left.mediaType !== right.mediaType || left.file !== right.file) {
            deltas.push(Object.freeze({ route, disposition: "unexpected" }));
            continue;
        }
        const leftBytes = bytes(shadowOutputDir, left);
        const rightBytes = bytes(candidateOutputDir, right);
        if (leftBytes.equals(rightBytes)) {
            deltas.push(Object.freeze({ route, disposition: "identical" }));
            continue;
        }
        if (route === "/robots.txt") {
            deltas.push(Object.freeze({ route, disposition: "indexing-policy" }));
            continue;
        }
        if (route === "urn:cloudflare-pages:_headers") {
            const intentional = normalizedHeaders(leftBytes.toString("utf8")) === normalizedHeaders(rightBytes.toString("utf8"));
            deltas.push(Object.freeze({ route, disposition: intentional ? "indexing-policy" : "unexpected" }));
            continue;
        }
        if (left.mediaType.startsWith("text/html")) {
            if (route === "/privacy") {
                deltas.push(Object.freeze({ route, disposition: "privacy-disclosure" }));
                continue;
            }
            const intentional = withoutAAds(leftBytes.toString("utf8")) === withoutAAds(rightBytes.toString("utf8"));
            deltas.push(Object.freeze({ route, disposition: intentional ? "advertising-carrier-only" : "unexpected" }));
            continue;
        }
        deltas.push(Object.freeze({ route, disposition: "unexpected" }));
    }
    const unexpectedRoutes = Object.freeze(deltas.filter((delta) => delta.disposition === "unexpected").map((delta) => delta.route));
    return Object.freeze({
        kind: "koios.static-profile-parity",
        shadowManifestDigest: input.shadowManifestDigest,
        candidateManifestDigest: input.candidateManifestDigest,
        routeSetsEqual,
        exactArtifactCount: deltas.filter((delta) => delta.disposition === "identical").length,
        intentionalDeltaCount: deltas.filter((delta) => delta.disposition !== "identical" && delta.disposition !== "unexpected").length,
        unexpectedRoutes,
        deltas: Object.freeze(deltas),
        candidateReadyForCutoverEvaluation: routeSetsEqual && unexpectedRoutes.length === 0,
        authorityConferred: false,
    });
}
//# sourceMappingURL=static-profile-parity.mjs.map