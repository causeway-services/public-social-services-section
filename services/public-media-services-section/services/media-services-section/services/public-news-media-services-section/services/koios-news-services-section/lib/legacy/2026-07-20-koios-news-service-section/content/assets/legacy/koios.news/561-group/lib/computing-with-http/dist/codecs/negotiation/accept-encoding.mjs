// accept-encoding.mts — the Accept-Encoding representation and the
// content-coding choice.
//
// The offered list is the caller's authority: this codec knows the
// representation, not the platform. Whoever negotiates supplies the
// codings they can actually produce (or already have, for precompressed
// variants) — which is why `offered` is required here, where the old
// web-server-internal version defaulted to a zlib capability probe.
export function parseAcceptEncoding(header) {
    const map = new Map();
    for (const part of header.split(",").map((s) => s.trim()).filter(Boolean)) {
        const [coding, ...params] = part.split(";").map((s) => s.trim());
        const qParam = params.find((param) => param.startsWith("q="));
        const q = qParam ? parseFloat(qParam.slice(2)) : 1;
        map.set((coding ?? "identity").toLowerCase(), isNaN(q) ? 1 : q);
    }
    return map;
}
function identityQ(prefs) {
    const explicit = prefs.get("identity");
    if (explicit !== undefined)
        return explicit;
    return prefs.get("*") ?? Number.EPSILON;
}
/** Negotiate content-coding among the offered codings: the best one, or null if none is acceptable. */
export function negotiateEncoding(acceptEncodingHeader, offered) {
    if (!acceptEncodingHeader)
        return offered.includes("identity") ? "identity" : (offered[0] ?? null);
    const prefs = parseAcceptEncoding(acceptEncodingHeader);
    const star = prefs.get("*");
    const candidates = [];
    for (const [order, coding] of offered.entries()) {
        if (coding === "identity")
            continue;
        const q = prefs.get(coding) ?? star ?? 0;
        if (q > 0)
            candidates.push({ coding, q, order });
    }
    const identity = identityQ(prefs);
    if (offered.includes("identity") && identity > 0) {
        candidates.push({ coding: "identity", q: identity, order: offered.indexOf("identity") });
    }
    candidates.sort((left, right) => right.q - left.q || left.order - right.order);
    return candidates[0]?.coding ?? null;
}
//# sourceMappingURL=accept-encoding.mjs.map