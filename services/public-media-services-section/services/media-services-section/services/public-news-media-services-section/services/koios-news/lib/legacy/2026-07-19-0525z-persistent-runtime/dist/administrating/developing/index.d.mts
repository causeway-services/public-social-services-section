export type TopicFocusReading = Readonly<{
    topic: "climate" | "technology" | "politics" | "economy" | "ai" | "crypto";
    seedCount: number;
    highPriorityCount: number;
    terms: readonly string[];
}>;
export type DevelopingCapability = Readonly<{
    id: string;
    area: "topics" | "analytics" | "advertising" | "administration" | "upstream";
    status: "active" | "planned";
    intention: string;
    constraint: string;
}>;
export type EditorialMetricTask = Readonly<{
    id: string;
    status: "planned" | "active";
    metric: string;
    evidence: readonly string[];
    nextSurface: string;
    constraint: string;
}>;
export type TopologyConstructionPattern = Readonly<{
    id: string;
    status: "planned" | "active";
    upstream: readonly string[];
    construction: string;
    koiosUse: string;
    nextSurface: string;
    constraint: string;
}>;
export type DevelopingOfficeReading = Readonly<{
    office: "administrating.developing";
    principles: readonly string[];
    topicFocus: readonly TopicFocusReading[];
    analytics: Readonly<{
        stance: "first-party-aggregate";
        collected: readonly string[];
        excluded: readonly string[];
        plannedAdminSurfaces: readonly string[];
    }>;
    editorialMetricTasks: readonly EditorialMetricTask[];
    topologyConstruction: Readonly<{
        stance: "nested-derived-components";
        reviewed: readonly string[];
        patterns: readonly TopologyConstructionPattern[];
    }>;
    advertising: Readonly<{
        adsenseReady: boolean;
        providers: readonly Readonly<{
            id: "adsense" | "a-ads";
            status: "configured" | "planned";
            unitId?: string;
            unitIds?: readonly string[];
            intendedUse: string;
        }>[];
        plannedRouting: string;
        roiInputs: readonly string[];
    }>;
    capabilities: readonly DevelopingCapability[];
}>;
export declare function developingOfficeReading(input?: Readonly<{
    adSenseEnabled?: boolean;
}>): DevelopingOfficeReading;
//# sourceMappingURL=index.d.mts.map