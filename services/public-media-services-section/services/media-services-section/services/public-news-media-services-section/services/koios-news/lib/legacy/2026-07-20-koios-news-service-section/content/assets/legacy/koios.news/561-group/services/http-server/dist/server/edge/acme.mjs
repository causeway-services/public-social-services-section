// edge/acme.ts — ACME (Let's Encrypt) TLS certificate provisioning and renewal.
//
// Certificate state is tracked as Memes: subject → "cert" → "valid"|"expired"|"renewing".
// Expiry policy decides whether the current cert needs renewal.
// HTTP-01 challenge responses are served via an injected middleware.
//
// This module provides the plumbing; actual ACME protocol requires an external library
// (e.g. acme-client). Integrate by supplying an `order` callback.
import { witness, UtteranceLog } from "../internal/witness.mjs";
export function acme(opts) {
    const renewDays = opts.renewDaysBeforeExpiry ?? 30;
    const checkInterval = opts.checkIntervalMs ?? 86_400_000;
    const store = new UtteranceLog();
    const challenges = new Map(); // token → keyAuth
    let certState = null;
    let timer = null;
    function storeCertMeme(state) {
        witness(store, { subject: opts.domains[0] ?? "acme", predicate: "cert", object: state }, state === "valid" ? [true, false] : [false, true]);
    }
    const challengeRespond = (token, keyAuth) => {
        challenges.set(token, keyAuth);
    };
    async function doRenew() {
        storeCertMeme("renewing");
        try {
            const { cert, key } = await opts.order(opts.domains, opts.email, challengeRespond);
            // Parse expiry from cert (PEM → simple regex for "Not After" field)
            // Real parsing would use a crypto library; we approximate 90 days from now
            const expiresAt = Date.now() + 90 * 24 * 3600 * 1000; // law-allow: wall-clock-as-data — certificate expiry bookkeeping (ACME renewal protocol)
            certState = { cert, key, expiresAt };
            storeCertMeme("valid");
            opts.onRenew?.(opts.domains);
        }
        catch (err) {
            storeCertMeme("expired");
            opts.onError?.(err);
        }
        finally {
            challenges.clear();
        }
    }
    function shouldRenew() {
        if (!certState)
            return true;
        const renewThreshold = renewDays * 24 * 3600 * 1000;
        return certState.expiresAt - Date.now() <= renewThreshold; // law-allow: wall-clock-as-data — certificate expiry bookkeeping (ACME renewal protocol)
    }
    // Background check
    timer = setInterval(async () => {
        if (shouldRenew())
            await doRenew();
    }, checkInterval);
    if (timer.unref)
        timer.unref();
    // Initial provision (fire-and-forget — callers await manager.renew() explicitly if needed)
    const challengeMiddleware = (ctx) => {
        const { req, res } = ctx;
        if (!req.url?.startsWith("/.well-known/acme-challenge/"))
            return Promise.resolve(undefined);
        const token = req.url.split("/").pop() ?? "";
        const keyAuth = challenges.get(token);
        if (!keyAuth) {
            res.writeHead(404).end();
            return Promise.resolve(true);
        }
        res.setHeader("Content-Type", "text/plain");
        res.writeHead(200).end(keyAuth);
        return Promise.resolve(true);
    };
    return {
        challengeMiddleware,
        credentials() {
            return certState ? { cert: certState.cert, key: certState.key } : null;
        },
        async renew() { await doRenew(); },
        stop() { if (timer) {
            clearInterval(timer);
            timer = null;
        } },
    };
}
/** Build a TLS-enabled App from an AcmeManager. Refreshes tls on each renewal. */
export function withAcme(app, manager) {
    const base = {
        ...app,
        middlewares: [manager.challengeMiddleware, ...(app.middlewares ?? [])],
    };
    Object.defineProperty(base, "tls", {
        get() {
            const creds = manager.credentials();
            return creds ? { cert: creds.cert, key: creds.key } : app.tls;
        },
        enumerable: true,
        configurable: true,
    });
    return base;
}
//# sourceMappingURL=acme.mjs.map