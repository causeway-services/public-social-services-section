import { readFileSync } from "node:fs";
import { join, resolve } from "node:path";
function feedItems(value) {
    return Array.isArray(value.items) ? value.items.filter((item) => item !== null && typeof item === "object" && !Array.isArray(item)) : [];
}
function articlePath(value, origin) {
    if (typeof value !== "string")
        return undefined;
    try {
        const url = new URL(value, origin);
        return url.pathname.startsWith("/posts/") ? url.pathname : undefined;
    }
    catch {
        return undefined;
    }
}
export async function compareStaticShadowToLive(input) {
    const outputDir = resolve(input.outputDir);
    const liveOrigin = input.liveOrigin ?? "https://koios.news";
    const manifest = JSON.parse(readFileSync(join(outputDir, "manifest.json"), "utf8"));
    const localFeed = JSON.parse(readFileSync(join(outputDir, "feed.json"), "utf8"));
    const provenance = JSON.parse(readFileSync(join(outputDir, "publication-provenance.json"), "utf8"));
    const response = await fetch(`${liveOrigin}/feed.json`, { headers: { accept: "application/feed+json, application/json" } });
    if (!response.ok)
        throw new Error(`live feed comparison returned ${response.status}`);
    const liveFeed = await response.json();
    const liveItems = feedItems(liveFeed);
    const shadowItems = feedItems(localFeed);
    const liveArticles = new Set(liveItems.flatMap((item) => articlePath(item.url, liveOrigin) ?? []));
    const shadowArticles = new Set(shadowItems.flatMap((item) => articlePath(item.url, manifest.canonicalOrigin) ?? []));
    const shared = [...shadowArticles].filter((path) => liveArticles.has(path));
    const liveOnlyArticles = [...liveArticles].filter((path) => !shadowArticles.has(path)).sort();
    const shadowOnlyArticles = [...shadowArticles].filter((path) => !liveArticles.has(path)).sort();
    const witnessMatchesCurrentLive = input.livePublicationWitness.articleRoutes.length === liveArticles.size
        && input.livePublicationWitness.articleRoutes.every((path) => liveArticles.has(path));
    const provenanceArticles = Array.isArray(provenance.articles)
        ? provenance.articles.filter((item) => item !== null && typeof item === "object" && !Array.isArray(item))
        : [];
    const exactAcceptedPaths = new Set(provenanceArticles.flatMap((article) => typeof article.path === "string" && article.authority === "exact-editorial-acceptance" ? [article.path] : []));
    const liveRoutesPreserved = liveOnlyArticles.length === 0;
    const shadowOnlyRoutesAccepted = shadowOnlyArticles.every((path) => exactAcceptedPaths.has(path));
    const migrationPolicyAccepted = manifest.policy.publicationAdmission === "public-record-carry-forward/v1"
        && provenance.policy === "public-record-carry-forward/v1"
        && manifest.livePublicationWitnessDigest === input.livePublicationWitness.witnessDigest;
    const manifestArtifacts = new Map(manifest.artifacts.map((artifact) => [artifact.route, artifact]));
    const sitemapRoutesPreserved = input.livePublicationWitness.sitemapRoutes.every((route) => manifestArtifacts.has(route));
    const surfaceComparisons = input.livePublicationWitness.surfaces.map((surface) => {
        const artifact = manifestArtifacts.get(surface.route);
        if (surface.status === 404 && artifact === undefined)
            return Object.freeze({ route: surface.route, liveStatus: surface.status, liveMediaType: surface.mediaType, shadowPresent: false, disposition: "intentional-shadow-absence" });
        if (artifact === undefined)
            return Object.freeze({ route: surface.route, liveStatus: surface.status, liveMediaType: surface.mediaType, shadowPresent: false, disposition: "missing" });
        const shadowMediaType = artifact.mediaType.split(";", 1)[0].trim().toLowerCase();
        return Object.freeze({
            route: surface.route,
            liveStatus: surface.status,
            liveMediaType: surface.mediaType,
            shadowPresent: true,
            shadowMediaType,
            disposition: surface.status === 200 && shadowMediaType === surface.mediaType ? "preserved" : "media-type-mismatch",
        });
    });
    const liveSurfaceShapePreserved = surfaceComparisons.every((surface) => ["preserved", "intentional-shadow-absence"].includes(surface.disposition));
    const latest = liveItems[0];
    const latestPath = articlePath(latest?.url, liveOrigin);
    const contentParity = liveOnlyArticles.length === 0 && shadowOnlyArticles.length === 0;
    const authorityEvidence = Object.freeze({
        providerResourceGrantAccepted: input.authorityEvidence?.providerResourceGrantAccepted === true,
        previewDeliverySettled: input.authorityEvidence?.previewDeliverySettled === true,
        previewParitySettled: input.authorityEvidence?.previewParitySettled === true,
        remoteRollbackRehearsed: input.authorityEvidence?.remoteRollbackRehearsed === true,
        mutableRoutesDisposed: input.authorityEvidence?.mutableRoutesDisposed === true,
        cutoverAuthorized: input.authorityEvidence?.cutoverAuthorized === true,
    });
    const cutoverEligible = liveRoutesPreserved && shadowOnlyRoutesAccepted && migrationPolicyAccepted
        && witnessMatchesCurrentLive && sitemapRoutesPreserved && liveSurfaceShapePreserved
        && input.staticProfileParitySettled === true
        && input.liveSemanticParitySettled === true
        && input.providerPackagingDryRunSettled === true && input.retainedOriginRollbackRehearsed === true
        && authorityEvidence.providerResourceGrantAccepted && authorityEvidence.previewDeliverySettled
        && authorityEvidence.previewParitySettled && authorityEvidence.remoteRollbackRehearsed
        && authorityEvidence.mutableRoutesDisposed;
    const cutoverReady = cutoverEligible && authorityEvidence.cutoverAuthorized;
    const obstructions = Object.freeze([
        ...(liveRoutesPreserved ? [] : [`live-route-loss:${liveOnlyArticles.length}`]),
        ...(shadowOnlyRoutesAccepted ? [] : [`unaccepted-shadow-only-routes:${shadowOnlyArticles.filter((path) => !exactAcceptedPaths.has(path)).length}`]),
        ...(migrationPolicyAccepted ? [] : ["public-record-carry-forward-policy-not-accepted"]),
        ...(witnessMatchesCurrentLive ? [] : ["frozen-live-witness-no-longer-matches-current-live-feed"]),
        ...(sitemapRoutesPreserved ? [] : ["live-sitemap-route-loss"]),
        ...(liveSurfaceShapePreserved ? [] : ["live-surface-status-or-media-type-divergence"]),
        ...(input.staticProfileParitySettled === true ? [] : ["shadow-to-cutover-candidate-profile-parity-not-settled"]),
        ...(input.liveSemanticParitySettled === true ? [] : ["vps-to-cutover-candidate-semantic-parity-not-proved"]),
        ...(input.providerPackagingDryRunSettled === true ? [] : ["cloudflare-provider-packaging-not-rehearsed"]),
        ...(input.retainedOriginRollbackRehearsed === true ? [] : ["retained-vps-origin-rollback-not-rehearsed-for-current-live-witness"]),
        ...(authorityEvidence.providerResourceGrantAccepted ? [] : ["missing-cloudflare-provider-resource-grant"]),
        ...(authorityEvidence.previewDeliverySettled ? [] : ["cloudflare-preview-not-delivered"]),
        ...(authorityEvidence.previewParitySettled ? [] : ["local-artifact-to-preview-byte-parity-not-proved"]),
        ...(authorityEvidence.remoteRollbackRehearsed ? [] : ["rollback-not-remotely-rehearsed"]),
        ...(authorityEvidence.mutableRoutesDisposed ? [] : ["mutable-route-disposition-not-executed"]),
        ...(cutoverEligible && !authorityEvidence.cutoverAuthorized ? ["explicit-cutover-act-absent"] : []),
    ]);
    return Object.freeze({
        kind: "koios.shadow-live-parity",
        liveOrigin,
        shadowAuthority: "non-authoritative-shadow",
        liveArticleCount: liveArticles.size,
        shadowArticleCount: shadowArticles.size,
        sharedArticleCount: shared.length,
        liveOnlyArticles: Object.freeze(liveOnlyArticles),
        shadowOnlyArticles: Object.freeze(shadowOnlyArticles),
        liveRoutesPreserved,
        shadowOnlyRoutesAccepted,
        migrationPolicyAccepted,
        witnessDigest: input.livePublicationWitness.witnessDigest,
        witnessMatchesCurrentLive,
        sitemapRoutesPreserved,
        liveSurfaceShapePreserved,
        liveSemanticParitySettled: input.liveSemanticParitySettled === true,
        surfaceComparisons: Object.freeze(surfaceComparisons),
        staticProfileParitySettled: input.staticProfileParitySettled === true,
        providerPackagingDryRunSettled: input.providerPackagingDryRunSettled === true,
        retainedOriginRollbackRehearsed: input.retainedOriginRollbackRehearsed === true,
        authorityEvidence,
        ...(latest !== undefined && latestPath !== undefined ? { liveLatest: Object.freeze({ title: String(latest.title ?? ""), published: String(latest.date_published ?? ""), path: latestPath }) } : {}),
        contentParity,
        cutoverEligible,
        cutoverReady,
        decision: cutoverReady ? "cutover-authorized" : cutoverEligible ? "eligible-for-explicit-cutover" : "retain-vps-authority",
        obstructions,
    });
}
//# sourceMappingURL=shadow-parity.mjs.map