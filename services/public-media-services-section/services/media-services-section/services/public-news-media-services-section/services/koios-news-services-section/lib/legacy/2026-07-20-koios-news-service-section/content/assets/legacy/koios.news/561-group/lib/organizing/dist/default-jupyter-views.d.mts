import { type EAVT, type EAVTRecord } from "@emsenn/relating/writing";
import { type RWILWitness, type WitnessStore } from "@emsenn/relating/ledger";
import { type JupyterNotebook } from "./jupyter.mjs";
import type { GradedConsensus } from "./federate-graded.mjs";
import type { AccountabilityReport, TransactionWitness } from "./writing/accountable-transaction/index.mjs";
import type { AccountableClaim } from "./cockpit-coordination.mjs";
import type { Camp } from "./writing/activitypub/index.mjs";
export interface OrganizingWitnessLedgerHandle {
    readonly store: WitnessStore;
    readonly feeds: readonly string[];
}
export interface OrganizingPackageMeshPackage {
    readonly name: string;
    readonly version?: string;
    readonly description?: string;
    readonly dependencies?: readonly string[];
    readonly deps?: readonly {
        readonly name: string;
        readonly range?: string;
        readonly kind?: string;
    }[];
    readonly exports?: readonly string[];
    readonly bins?: readonly string[];
    readonly scripts?: readonly string[];
    readonly tests?: readonly string[];
    readonly layer?: string;
    readonly lifecycle?: string;
    readonly maturity?: string;
    readonly manifest?: Readonly<{
        readonly bins?: readonly string[];
        readonly scripts?: readonly string[];
    }>;
}
export interface OrganizingPackageMesh {
    readonly workspace?: string;
    readonly packages?: readonly OrganizingPackageMeshPackage[];
    readonly nodes?: readonly OrganizingPackageMeshPackage[];
    readonly edges?: readonly {
        readonly from: string;
        readonly to: string;
        readonly kind?: string;
    }[];
}
export interface OrganizingDefaultViewSessionEvent {
    readonly id?: string | null;
    readonly session?: string | null;
    readonly harness?: string | null;
    readonly camp?: string | null;
    readonly kind?: string | null;
    readonly source?: string | null;
    readonly at?: string | null;
    readonly event?: string | null;
    readonly activity?: unknown;
}
export interface OrganizingDefaultJupyterViewsInput {
    readonly instance: string;
    readonly exportedAt?: string;
    readonly witnessRows?: readonly (EAVT | EAVTRecord | RWILWitness)[];
    readonly witnessLedger?: OrganizingWitnessLedgerHandle;
    readonly sessionEvents?: readonly OrganizingDefaultViewSessionEvent[];
    readonly camps?: readonly Camp[];
    readonly federationReports?: readonly GradedConsensus[];
    readonly accountableTransactions?: readonly TransactionWitness[];
    readonly accountabilityReports?: readonly AccountabilityReport[];
    readonly accountableClaims?: readonly AccountableClaim[];
    readonly packageMesh?: OrganizingPackageMesh;
}
export interface OrganizingDefaultJupyterViewsWriteOptions extends OrganizingDefaultJupyterViewsInput {
    readonly outDir: string;
}
export interface OrganizingDefaultNotebookDocument {
    readonly id: OrganizingDefaultNotebookId;
    readonly path: string;
    readonly title: string;
    readonly notebook: JupyterNotebook;
    readonly content: string;
}
export type OrganizingDefaultNotebookId = "witness-ledger" | "infotile-field" | "package-mesh" | "activity-timeseries" | "four-charge-bilattice" | "h1-coordination-cost";
export interface OrganizingDefaultViewArtifact {
    readonly data: readonly {
        readonly path: string;
        readonly content: string;
    }[];
    readonly notebooks: readonly OrganizingDefaultNotebookDocument[];
}
export interface OrganizingDefaultJupyterViewsWritten {
    readonly root: string;
    readonly data: readonly string[];
    readonly notebooks: readonly string[];
}
export declare function organizingDefaultJupyterViewArtifacts(input: OrganizingDefaultJupyterViewsInput): OrganizingDefaultViewArtifact;
export declare function writeOrganizingDefaultJupyterViews(options: OrganizingDefaultJupyterViewsWriteOptions): OrganizingDefaultJupyterViewsWritten;
export declare function organizingDefaultNotebookDocuments(instance: string, exportedAt?: string): readonly OrganizingDefaultNotebookDocument[];
export declare function organizingDefaultViewSessionEventsFromWitnessRows(rows: readonly (EAVT | EAVTRecord | RWILWitness)[]): readonly OrganizingDefaultViewSessionEvent[];
//# sourceMappingURL=default-jupyter-views.d.mts.map