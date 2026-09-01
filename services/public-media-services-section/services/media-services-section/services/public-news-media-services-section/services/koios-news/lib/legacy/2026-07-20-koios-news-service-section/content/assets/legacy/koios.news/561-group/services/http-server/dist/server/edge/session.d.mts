import type { CookieOptions } from "@emsenn/computing-with-http/codecs/cookie";
import type { Middleware } from "../types.mjs";
export type SessionData = Record<string, unknown>;
export type SessionRecord<T extends SessionData = SessionData> = Readonly<{
    id: string;
    data: T;
    createdAt: number;
    updatedAt: number;
    expiresAt: number | null;
}>;
export type SessionStore<T extends SessionData = SessionData> = Readonly<{
    get(id: string): SessionRecord<T> | undefined;
    set(record: SessionRecord<T>): void;
    delete(id: string): boolean;
}>;
export type MemorySessionStore<T extends SessionData = SessionData> = SessionStore<T> & Readonly<{
    size(): number;
    sweep(now?: number): number;
    entries(): SessionRecord<T>[];
}>;
export type SessionHandle<T extends SessionData = SessionData> = {
    id: string;
    data: T;
    isNew: boolean;
    destroyed: boolean;
    commit(): void;
    destroy(): void;
    regenerate(data?: T): void;
};
export type FlashBag = Readonly<Record<string, readonly unknown[]>>;
export type FlashHandle = {
    peek(type?: string): readonly unknown[] | FlashBag;
    consume(type?: string): readonly unknown[] | FlashBag;
    push(type: string, message: unknown): void;
    clear(type?: string): void;
};
export type SessionOptions<T extends SessionData = SessionData> = Readonly<{
    secret: string;
    cookieName?: string;
    cookie?: CookieOptions;
    ttlMs?: number;
    rolling?: boolean;
    store?: SessionStore<T>;
    localsKey?: string;
    dataLocalsKey?: string;
    idLocalsKey?: string;
    generateId?: () => string;
    now?: () => number;
}>;
export type FlashOptions = Readonly<{
    sessionLocalsKey?: string;
    localsKey?: string;
    sessionKey?: string;
}>;
export declare function memorySessionStore<T extends SessionData = SessionData>(): MemorySessionStore<T>;
export declare function session<T extends SessionData = SessionData>(options: SessionOptions<T>): Middleware;
export { session as sessionMiddleware };
export declare function flash(options?: FlashOptions): Middleware;
export { flash as flashMessages };
//# sourceMappingURL=session.d.mts.map