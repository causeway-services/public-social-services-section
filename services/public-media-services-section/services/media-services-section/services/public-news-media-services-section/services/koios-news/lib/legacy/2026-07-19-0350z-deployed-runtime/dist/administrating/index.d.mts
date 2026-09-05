import { type DevelopingOfficeReading } from "./developing/index.mjs";
import { type DeployDoctorReading } from "./deploying/index.mjs";
export type AdministratingOfficeReading = Readonly<{
    office: "administrating";
    developing: DevelopingOfficeReading;
    deploying: DeployDoctorReading;
}>;
export declare function administratingOfficeReading(input?: Readonly<{
    adSenseEnabled?: boolean;
}>): AdministratingOfficeReading;
export { developingOfficeReading } from "./developing/index.mjs";
export type { DevelopingOfficeReading } from "./developing/index.mjs";
export { checkKoiosDeployRemote, koiosDeployDoctorReading, koiosDeployPlanReading, renderKoiosDeployDoctorMarkdown, renderKoiosDeployPlanMarkdown, renderKoiosDeployRemoteCheckMarkdown, renderKoiosDeployRehearsalMarkdown, renderKoiosDeployShipMarkdown, renderKoiosDeployStageMarkdown, rehearseKoiosDeployWorkspace, shipKoiosDeployWorkspace, stageKoiosDeployWorkspace, } from "./deploying/index.mjs";
export type { DeployDoctorReading, DeployPlanReading, DeployRemoteCheckReading, DeployRemoteReadiness, DeployRehearsalReading, DeployShipReading, DeployStageReading, DeployToolReading } from "./deploying/index.mjs";
//# sourceMappingURL=index.d.mts.map