#!/usr/bin/env node
import { readActivityStreamsObjectFromStdin } from "./management/activity-ingress.mjs";
import { settleIssuePulse } from "./management/issue-controller.mjs";
import { appendKoiosAct, recordDigest } from "./management/ledger.mjs";
import { runNewsroomCircuit } from "./management/newsroom-circuit.mjs";
const CONTEXT = "https://www.w3.org/ns/activitystreams";
const ACTOR = "https://koios.news/activitypub/actor";
const CONTRACT = "koios.news/publication-cycle/v1";
function argument(name) {
    const index = process.argv.indexOf(name);
    return index === -1 ? undefined : process.argv[index + 1];
}
const now = argument("--now") ?? new Date().toISOString();
const pulse = readActivityStreamsObjectFromStdin();
const dataDir = argument("--data-dir");
const settlement = await settleIssuePulse(pulse, {
    now,
    ...(dataDir === undefined ? {} : { dataDir }),
    ...(argument("--content-dir") === undefined ? {} : { contentDir: argument("--content-dir") }),
    ...(argument("--config") === undefined ? {} : { configPath: argument("--config") }),
});
if (settlement["type"] !== "Accept") {
    // Preserve the controller's exact typed refusal. Clockkeeper can therefore
    // distinguish "no issue was admitted" from a later newsroom obstruction.
    process.stdout.write(`${JSON.stringify(settlement, null, 2)}\n`);
}
else {
    const object = settlement["object"];
    const assignmentId = String(object["assignmentId"] ?? "");
    const maxRepairs = Number(argument("--max-repairs") ?? 3);
    const result = await runNewsroomCircuit({
        assignmentId,
        now,
        maxRepairs,
        outputDir: argument("--out") ?? ".static/koios.news-candidate",
    });
    const type = result.disposition === "refused" ? "Reject" : "Question";
    const code = result.disposition === "published"
        ? "cloudflare-release-required"
        : result.disposition === "refused"
            ? "newsroom-refused"
            : "newsroom-obstructed";
    const cycleObject = Object.freeze({
        type: "PublicationCycleSettlement",
        contract: CONTRACT,
        code,
        assignmentId,
        controllerSettlementDigest: recordDigest(settlement),
        newsroom: result,
        next: result.disposition === "published"
            ? Object.freeze({ type: "StaticPublicationDeliveryDemand", requiredContract: "cloudflare-static-delivery", candidate: result.candidate })
            : Object.freeze({ type: "NewsroomRepairDemand", failure: result.reason ?? result.disposition }),
    });
    const terminal = Object.freeze({
        "@context": CONTEXT,
        type,
        actor: ACTOR,
        target: pulse["actor"],
        published: new Date().toISOString(),
        object: cycleObject,
    });
    appendKoiosAct({
        dataRoot: dataDir ?? "data",
        ledger: "contract-events",
        instant: String(terminal.published),
        act: "publication.cycle.settled",
        subject: assignmentId,
        data: {
            contract: CONTRACT,
            disposition: result.disposition,
            code,
            controllerSettlementDigest: recordDigest(settlement),
            terminalDigest: recordDigest(terminal),
            customerTerritoryMutation: result.disposition === "published",
        },
    });
    process.stdout.write(`${JSON.stringify(terminal, null, 2)}\n`);
}
//# sourceMappingURL=operate-issue.mjs.map