// administrating — internal offices for operating Koios.News.
import { developingOfficeReading } from "./developing/index.mjs";
import { koiosDeployDoctorReading } from "./deploying/index.mjs";
export function administratingOfficeReading(input = {}) {
    return Object.freeze({
        office: "administrating",
        developing: developingOfficeReading(input),
        deploying: koiosDeployDoctorReading(),
    });
}
export { developingOfficeReading } from "./developing/index.mjs";
export { checkKoiosDeployRemote, koiosDeployDoctorReading, koiosDeployPlanReading, renderKoiosDeployDoctorMarkdown, renderKoiosDeployPlanMarkdown, renderKoiosDeployRemoteCheckMarkdown, renderKoiosDeployRehearsalMarkdown, renderKoiosDeployShipMarkdown, renderKoiosDeployStageMarkdown, rehearseKoiosDeployWorkspace, shipKoiosDeployWorkspace, stageKoiosDeployWorkspace, } from "./deploying/index.mjs";
//# sourceMappingURL=index.mjs.map