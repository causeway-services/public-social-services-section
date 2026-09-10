import { type FromSchema } from "@emsenn/relating";
export declare const OrganizingPerformingSessionCharacterLaneSchema: {
    readonly $id: "organizing/performing/session-character-lane";
    readonly title: "OrganizingPerformingSessionCharacterLane";
    readonly description: "The active development lane through which a session character is staged.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly properties: {
        readonly currentCwd: {
            readonly type: readonly ["string", "null"];
        };
        readonly focusPaths: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
        readonly lastTool: {
            readonly type: readonly ["string", "null"];
        };
    };
};
export type OrganizingPerformingSessionCharacterLane = FromSchema<typeof OrganizingPerformingSessionCharacterLaneSchema>;
export declare const organizingPerformingSessionCharacterLaneCarrier: import("@emsenn/relating").Carrier<{
    readonly currentCwd?: string | null;
    readonly focusPaths?: readonly string[];
    readonly lastTool?: string | null;
}>;
export declare const OrganizingPerformingSessionEventSchema: {
    readonly $id: "organizing/performing/session-event";
    readonly title: "OrganizingPerformingSessionEvent";
    readonly description: "A hook/event witness admitted to the session-character chronicle.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly properties: {
        readonly session: {
            readonly type: readonly ["string", "null"];
        };
        readonly harness: {
            readonly type: readonly ["string", "null"];
        };
        readonly source: {
            readonly type: readonly ["string", "null"];
        };
        readonly activity: {};
        readonly payload: {};
        readonly hookEventName: {};
    };
};
export type OrganizingPerformingSessionEvent = FromSchema<typeof OrganizingPerformingSessionEventSchema>;
export declare const organizingPerformingSessionEventCarrier: import("@emsenn/relating").Carrier<{
    readonly session?: string | null;
    readonly harness?: string | null;
    readonly source?: string | null;
    readonly activity?: unknown;
    readonly payload?: unknown;
    readonly hookEventName?: unknown;
}>;
export declare const OrganizingPerformingInboxEventSchema: {
    readonly $id: "organizing/performing/inbox-event";
    readonly title: "OrganizingPerformingInboxEvent";
    readonly description: "An ActivityPub inbox delivery event that may be folded into agent perception.";
    readonly type: "object";
    readonly additionalProperties: true;
    readonly properties: {
        readonly source: {
            readonly type: "string";
        };
        readonly activity: {};
        readonly inboxDelivery: {
            readonly type: "object";
            readonly additionalProperties: true;
            readonly properties: {
                readonly targetActor: {};
            };
        };
    };
};
export type OrganizingPerformingInboxEvent = FromSchema<typeof OrganizingPerformingInboxEventSchema>;
export declare const organizingPerformingInboxEventCarrier: import("@emsenn/relating").Carrier<{
    readonly source?: string;
    readonly activity?: unknown;
    readonly inboxDelivery?: {
        readonly targetActor?: unknown;
    };
}>;
declare const activitySummarySchema: {
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["id", "type", "actor", "published", "objectType", "content", "objectId", "to"];
    readonly properties: {
        readonly id: {
            readonly type: readonly ["string", "null"];
        };
        readonly type: {
            readonly type: "string";
        };
        readonly actor: {
            readonly type: "string";
        };
        readonly published: {
            readonly type: readonly ["string", "null"];
        };
        readonly objectType: {
            readonly type: readonly ["string", "null"];
        };
        readonly content: {
            readonly type: readonly ["string", "null"];
        };
        readonly objectId: {
            readonly type: readonly ["string", "null"];
        };
        readonly to: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
            };
        };
    };
};
export declare const OrganizingPerformingInboxPerceptionSignalSchema: {
    readonly $id: "organizing/performing/inbox-perception-signal";
    readonly title: "OrganizingPerformingInboxPerceptionSignal";
    readonly description: "The performing-layer perception fold of delivered ActivityPub inbox activities.";
    readonly type: "object";
    readonly additionalProperties: false;
    readonly required: readonly ["kind", "claim", "actor", "activities", "window", "recent", "agent"];
    readonly properties: {
        readonly kind: {
            readonly type: "string";
        };
        readonly claim: {
            readonly type: "string";
        };
        readonly actor: {
            readonly type: "string";
        };
        readonly activities: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly window: {
            readonly type: "integer";
            readonly minimum: 0;
        };
        readonly recent: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly required: readonly ["id", "type", "actor", "published", "objectType", "content", "objectId", "to"];
                readonly properties: {
                    readonly id: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly type: {
                        readonly type: "string";
                    };
                    readonly actor: {
                        readonly type: "string";
                    };
                    readonly published: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly objectType: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly content: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly objectId: {
                        readonly type: readonly ["string", "null"];
                    };
                    readonly to: {
                        readonly type: "array";
                        readonly items: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly agent: {};
    };
};
export type OrganizingPerformingInboxPerceptionSignal = FromSchema<typeof OrganizingPerformingInboxPerceptionSignalSchema>;
export declare const organizingPerformingInboxPerceptionSignalCarrier: import("@emsenn/relating").Carrier<{
    readonly kind: string;
    readonly claim: string;
    readonly agent: unknown;
    readonly actor: string;
    readonly activities: number;
    readonly window: number;
    readonly recent: readonly {
        readonly id: string | null;
        readonly type: string;
        readonly to: readonly string[];
        readonly content: string | null;
        readonly actor: string;
        readonly published: string | null;
        readonly objectType: string | null;
        readonly objectId: string | null;
    }[];
}>;
export type OrganizingPerformingActivitySummary = FromSchema<typeof activitySummarySchema>;
export {};
//# sourceMappingURL=carriers.d.mts.map