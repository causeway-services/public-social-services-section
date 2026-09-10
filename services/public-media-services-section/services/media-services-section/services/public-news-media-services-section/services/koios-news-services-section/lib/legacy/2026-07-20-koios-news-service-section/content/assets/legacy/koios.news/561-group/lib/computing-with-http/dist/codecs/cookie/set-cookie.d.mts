export type SameSite = "Strict" | "Lax" | "None" | "strict" | "lax" | "none";
export type CookiePriority = "Low" | "Medium" | "High" | "low" | "medium" | "high";
export type CookieOptions = Readonly<{
    domain?: string;
    path?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: SameSite | boolean;
    priority?: CookiePriority;
    partitioned?: boolean;
    encode?: (value: string) => string;
}>;
/** A decoded Set-Cookie field: the cookie and the attributes the grammar admitted. */
export type SetCookie = Readonly<{
    name: string;
    value: string;
    domain?: string;
    path?: string;
    expires?: Date;
    maxAge?: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite?: "Strict" | "Lax" | "None";
    priority?: "Low" | "Medium" | "High";
    partitioned: boolean;
}>;
export declare function serializeSetCookie(name: string, value: string, options?: CookieOptions): string;
export declare function parseSetCookie(text: string): SetCookie | null;
//# sourceMappingURL=set-cookie.d.mts.map