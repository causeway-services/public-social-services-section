// administrating — internal offices for operating Koios.News.

import { developingOfficeReading, type DevelopingOfficeReading } from "./developing/index.mts";
import { koiosDeployDoctorReading, type DeployDoctorReading } from "./deploying/index.mts";

export type AdministratingOfficeReading = Readonly<{
  office: "administrating";
  developing: DevelopingOfficeReading;
  deploying: DeployDoctorReading;
}>;

export function administratingOfficeReading(input: Readonly<{ adSenseEnabled?: boolean }> = {}): AdministratingOfficeReading {
  return Object.freeze({
    office: "administrating",
    developing: developingOfficeReading(input),
    deploying: koiosDeployDoctorReading(),
  });
}

export { developingOfficeReading } from "./developing/index.mts";
export type { DevelopingOfficeReading } from "./developing/index.mts";
export {
  checkKoiosDeployRemote,
  koiosDeployDoctorReading,
  koiosDeployPlanReading,
  renderKoiosDeployDoctorMarkdown,
  renderKoiosDeployPlanMarkdown,
  renderKoiosDeployRemoteCheckMarkdown,
  renderKoiosDeployRehearsalMarkdown,
  renderKoiosDeployShipMarkdown,
  renderKoiosDeployStageMarkdown,
  rehearseKoiosDeployWorkspace,
  shipKoiosDeployWorkspace,
  stageKoiosDeployWorkspace,
} from "./deploying/index.mts";
export type { DeployDoctorReading, DeployPlanReading, DeployRemoteCheckReading, DeployRemoteReadiness, DeployRehearsalReading, DeployShipReading, DeployStageReading, DeployToolReading } from "./deploying/index.mts";
