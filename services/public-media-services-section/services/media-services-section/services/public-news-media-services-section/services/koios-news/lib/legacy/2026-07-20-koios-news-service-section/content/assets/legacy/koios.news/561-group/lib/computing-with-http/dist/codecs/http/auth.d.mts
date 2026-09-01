export type BearerChallengeOptions = Readonly<{
    realm?: string;
    error?: string;
    errorDescription?: string;
    errorUri?: string;
    resourceMetadata?: string;
}>;
export declare function bearerToken(authorization: string | readonly string[] | undefined): string | undefined;
export declare function bearerChallenge(options?: BearerChallengeOptions): string;
//# sourceMappingURL=auth.d.mts.map