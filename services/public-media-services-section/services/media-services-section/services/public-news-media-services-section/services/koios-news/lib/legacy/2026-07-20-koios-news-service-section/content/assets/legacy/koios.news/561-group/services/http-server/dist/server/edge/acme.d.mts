import type { App, Middleware } from "../types.mjs";
export type AcmeOptions = {
    domains: string[];
    email: string;
    /** Called to perform ACME order and obtain {cert, key} PEM strings. */
    order: (domains: string[], email: string, challengeRespond: ChallengeRespond) => Promise<{
        cert: string;
        key: string;
    }>;
    renewDaysBeforeExpiry?: number;
    checkIntervalMs?: number;
    onRenew?: (domains: string[]) => void;
    onError?: (err: unknown) => void;
};
export type ChallengeRespond = (token: string, keyAuth: string) => void;
export type AcmeManager = {
    /** Middleware that serves ACME HTTP-01 challenge responses. */
    challengeMiddleware: Middleware;
    /** Current TLS credentials, or null if not yet provisioned. */
    credentials(): {
        cert: string;
        key: string;
    } | null;
    /** Force an immediate renewal attempt. */
    renew(): Promise<void>;
    /** Stop the background renewal timer. */
    stop(): void;
};
export declare function acme(opts: AcmeOptions): AcmeManager;
/** Build a TLS-enabled App from an AcmeManager. Refreshes tls on each renewal. */
export declare function withAcme(app: App, manager: AcmeManager): App;
//# sourceMappingURL=acme.d.mts.map