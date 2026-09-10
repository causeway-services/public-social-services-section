/**
 * accounting/institution - economic institution and ledger action readings.
 *
 * This is organizing's economic/accounting facade over social gluing. It keeps
 * the generic desk, clearing, netting, Minsky-regime, and ledger report actions
 * in organizing while provider rails remain downstream.
 */
import { action, classifyRegime, jsonResource, readFirstCohomologyOfSettlementFiltration, } from "@emsenn/relating";
import { adjudicate as organizingAdjudicate, crossArena, federate as organizingFederate, institute as organizingInstitute, } from "../organizing.mjs";
import loadLedger, {} from "./ledger.mjs";
import { accountsReport, balanceReport, balanceSheetReport, cashflowReport, checkReport, incomeStatementReport, printReport, registerReport, renderAccounts, renderBalance, renderBalanceSheet, renderCashflow, renderCheck, renderIncomeStatement, renderPrint, renderRegister, renderStats, statsReport, } from "./report.mjs";
import { debitNormalUtterance, induceLedgerTopology, } from "./topology/ledger.mjs";
export function instituteEconomicBody(boundary) {
    return organizingInstitute(boundary);
}
export function clearAndSettle(boundary) {
    return organizingAdjudicate(boundary);
}
export function net(constituents) {
    const ca = crossArena(constituents);
    return Object.freeze({ nettingCost: ca.federationOnly, contested: ca.contested });
}
export function federateVenues(covers) {
    return organizingFederate(covers);
}
export function minskyRegime(d) {
    const regime = regimeStringOf(d);
    const minsky = regime === "aperiodic" ? "ponzi" : regime === "transfinite-bounded" ? "speculative" : "hedge";
    return Object.freeze({ regime, minsky });
}
function regimeStringOf(d) {
    switch (classifyRegime(d).kind) {
        case "ordinal.closure.regime.finite":
            return "strict";
        case "ordinal.closure.regime.scott":
            return "scott-continuous";
        case "ordinal.closure.regime.transfinite":
            return "transfinite-bounded";
        default:
            return "aperiodic";
    }
}
export function deskFromLedger(led, identity) {
    const accounts = [...led.balances.keys()];
    const utterances = accounts.map((path) => debitNormalUtterance(path));
    const cohomologyRank = utterances.length === 0
        ? 0
        : readFirstCohomologyOfSettlementFiltration(induceLedgerTopology(utterances).settlement).generators.length;
    const name = identity.trim() !== "" ? identity.trim() : "desk";
    return Object.freeze({
        kind: "organizing.accounting.desk",
        identity: name,
        cohomologyRank,
        glued: cohomologyRank === 0,
    });
}
const DESK_ID = "organizing/accounting/desk";
const ADJUDICATION_ID = "organizing/adjudication";
const MINSKY_ID = "organizing/accounting/minsky";
const INSTITUTION_ID = "organizing/institution";
const FEDERATION_ID = "organizing/federation";
const ref = (id) => Object.freeze({ $ref: id });
const SEED_SCHEMA = Object.freeze({
    title: "SocialSeed",
    description: "an inter-agent membrane: newline-separated `agent|predicate` lines, or a JSON array of `[agent, predicate]` items.",
    type: ["string", "array"],
});
const BOUNDARY_SCHEMA = Object.freeze({
    title: "SocialBoundary",
    type: "object",
    description: "the institution's three social boundary faces; any face may be omitted.",
    properties: { socializing: SEED_SCHEMA, computing: SEED_SCHEMA, gaming: SEED_SCHEMA },
});
const ENTRIES_SCHEMA = Object.freeze({
    title: "JournalEntries",
    type: "array",
    description: "a journal: an array of parsed accounting Entry carriers loaded into the adjudicated record-state.",
});
function admitBoundary(input, verb) {
    if (input === null || typeof input !== "object" || Array.isArray(input)) {
        throw new TypeError(`${verb}: expected a { socializing?, computing?, gaming? } boundary object`);
    }
    const record = input;
    return {
        ...(record["socializing"] === undefined ? {} : { socializing: record["socializing"] }),
        ...(record["computing"] === undefined ? {} : { computing: record["computing"] }),
        ...(record["gaming"] === undefined ? {} : { gaming: record["gaming"] }),
    };
}
function admitConstituents(input, verb) {
    const raw = input !== null && typeof input === "object" && !Array.isArray(input)
        ? input["constituents"]
        : input;
    if (!Array.isArray(raw)) {
        throw new TypeError(`${verb}: expected { constituents: [{ name, utterances }...] } or an array`);
    }
    return raw.map((item, index) => {
        if (item === null || typeof item !== "object" || Array.isArray(item) || !Array.isArray(item["utterances"])) {
            throw new TypeError(`${verb}: constituents[${index}] must be a { name, utterances } object`);
        }
        const rec = item;
        return {
            name: typeof rec["name"] === "string" ? rec["name"] : `participant-${index}`,
            utterances: rec["utterances"],
        };
    });
}
function admitLedger(input, verb) {
    if (!Array.isArray(input)) {
        throw new TypeError(`${verb}: expected a JSON array of journal entries`);
    }
    return loadLedger(input);
}
function reportOpts(args) {
    const account = typeof args["account"] === "string" && args["account"].trim() !== "" ? args["account"].trim() : null;
    const depthRaw = args["depth"];
    const depth = typeof depthRaw === "number" ? depthRaw : typeof depthRaw === "string" && depthRaw.trim() !== "" ? Number(depthRaw) : null;
    const begin = typeof args["begin"] === "string" && args["begin"].trim() !== "" ? args["begin"].trim() : null;
    const end = typeof args["end"] === "string" && args["end"].trim() !== "" ? args["end"].trim() : null;
    return { account, depth, begin, end };
}
const stringResource = (value) => jsonResource(value);
const inputJson = (input, context) => jsonResource(input, context);
const argsJson = (args) => jsonResource(args, "action args");
export const institutionAction = action({
    verb: "institution",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Institute an economic body: glue a plurality of agents into one institution.",
    description: "Domain: a social boundary. Codomain: the organizing institution carrier read as an economic body.",
    domainSchema: BOUNDARY_SCHEMA,
    codomainSchema: ref(INSTITUTION_ID),
    run: (input) => jsonResource(instituteEconomicBody(admitBoundary(inputJson(input, "institution input"), "institution")), "institution"),
});
export const instituteAction = action({
    verb: "institute",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Institute the economic body over a social boundary.",
    description: "Legacy accounting/economic alias of organizing's canonical institute action.",
    domainSchema: BOUNDARY_SCHEMA,
    codomainSchema: ref(INSTITUTION_ID),
    run: (input) => jsonResource(instituteEconomicBody(admitBoundary(inputJson(input, "institute input"), "institute")), "institution"),
});
export const adjudicateAction = action({
    verb: "adjudicate",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Clear and settle a social boundary into one adjudicated record-state.",
    description: "Legacy accounting/economic alias of organizing's canonical adjudicate action.",
    domainSchema: BOUNDARY_SCHEMA,
    codomainSchema: ref(ADJUDICATION_ID),
    run: (input) => jsonResource(clearAndSettle(admitBoundary(inputJson(input, "adjudicate input"), "adjudicate")), "adjudication"),
});
export const clearAndSettleAction = action({
    verb: "clear-and-settle",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Clear and settle a social boundary into one adjudicated record-state.",
    description: "The financial clearing verb read as organizing adjudication.",
    domainSchema: BOUNDARY_SCHEMA,
    codomainSchema: ref(ADJUDICATION_ID),
    run: (input) => jsonResource(clearAndSettle(admitBoundary(inputJson(input, "clear-and-settle input"), "clear-and-settle")), "adjudication"),
});
export const netAction = action({
    verb: "net",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Multilaterally net participants and report the irreducible netting cost.",
    description: "Domain: `{ constituents: [{ name, utterances }...] }`. Codomain: `{ nettingCost, contested }`.",
    domainSchema: Object.freeze({
        title: "NettingRequest",
        type: "object",
        required: ["constituents"],
        properties: { constituents: { type: "array", items: { type: "object", required: ["utterances"], properties: { name: { type: "string" }, utterances: { type: "array" } } } } },
    }),
    codomainSchema: Object.freeze({ title: "NettingResult", type: "object", properties: { nettingCost: { type: "integer" }, contested: { type: "integer" } } }),
    run: (input) => jsonResource(net(admitConstituents(inputJson(input, "net input"), "net"))),
});
export const federateVenuesAction = action({
    verb: "federate-venues",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Federate economic venues by parallel-composing their social boundaries.",
    description: "Domain: `{ venues: [<social boundary>...] }`. Codomain: the organizing federation carrier.",
    domainSchema: Object.freeze({
        title: "VenueFederationRequest",
        type: "object",
        required: ["venues"],
        properties: { venues: { type: "array", items: BOUNDARY_SCHEMA } },
    }),
    codomainSchema: ref(FEDERATION_ID),
    run: (input) => {
        if (input === null || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input["venues"])) {
            throw new TypeError("federate-venues: expected a { venues: [...] } object");
        }
        const venues = input["venues"].map((cover, index) => admitBoundary(cover, `federate-venues: venues[${index}]`));
        return jsonResource(federateVenues(venues), "federation");
    },
});
export const federateAction = action({
    verb: "federate",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Federate venues/circuits, legacy accounting alias.",
    description: "Legacy accounting/economic alias. Organizing's canonical registry uses `federate`; this subpath also exposes the historical `{ venues }` wire.",
    domainSchema: Object.freeze({
        title: "FederationRequest",
        type: "object",
        required: ["venues"],
        properties: { venues: { type: "array", items: BOUNDARY_SCHEMA } },
    }),
    codomainSchema: ref(FEDERATION_ID),
    run: federateVenuesAction.run,
});
export const minskyRegimeAction = action({
    verb: "minsky-regime",
    inputFormat: "json",
    outputFormat: "json",
    summary: "Classify the leverage settling's Minsky posture.",
    description: "Domain: `{ scottContinuous, finiteBase, countableCofinality }`. Codomain: `{ regime, minsky }`.",
    domainSchema: Object.freeze({
        title: "ClosureRegimeData",
        type: "object",
        required: ["scottContinuous", "finiteBase", "countableCofinality"],
        properties: { scottContinuous: { type: "boolean" }, finiteBase: { type: "boolean" }, countableCofinality: { type: "boolean" } },
    }),
    codomainSchema: ref(MINSKY_ID),
    run: (input) => {
        if (input === null || typeof input !== "object" || Array.isArray(input)) {
            throw new TypeError("minsky-regime: expected { scottContinuous, finiteBase, countableCofinality }");
        }
        const r = input;
        const d = Object.freeze({
            kind: "settling.closureRegimeData",
            scottContinuous: r["scottContinuous"] === true,
            finiteBase: r["finiteBase"] === true,
            countableCofinality: r["countableCofinality"] === true,
        });
        return jsonResource(minskyRegime(d));
    },
});
export const ledgerLoadAction = action({
    verb: "ledger-load",
    inputFormat: "json",
    outputFormat: "json",
    options: ["identity"],
    summary: "Load a journal into the adjudicated accounting record-state and read its desk.",
    description: "Domain: a journal array. Codomain: organizing.accounting.desk.",
    domainSchema: ENTRIES_SCHEMA,
    codomainSchema: ref(DESK_ID),
    run: (input, args) => {
        const identity = typeof args["identity"] === "string" ? args["identity"] : "desk";
        return jsonResource(deskFromLedger(admitLedger(inputJson(input, "ledger-load input"), "ledger-load"), identity), "accounting-desk");
    },
});
export const balanceAction = action({
    verb: "balance",
    inputFormat: "json",
    outputFormat: "string",
    options: ["account", "depth", "end"],
    summary: "Balance report over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered balance report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input, args) => {
        const led = admitLedger(inputJson(input, "balance input"), "balance");
        return stringResource(renderBalance(balanceReport(led, reportOpts(argsJson(args))), led));
    },
});
export const balsheetAction = action({
    verb: "balsheet",
    inputFormat: "json",
    outputFormat: "string",
    options: ["end"],
    summary: "Balance-sheet report over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered balance-sheet report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input, args) => {
        const led = admitLedger(inputJson(input, "balsheet input"), "balsheet");
        return stringResource(renderBalanceSheet(balanceSheetReport(led, reportOpts(argsJson(args))), led));
    },
});
export const incomestmtAction = action({
    verb: "incomestmt",
    inputFormat: "json",
    outputFormat: "string",
    options: ["begin", "end"],
    summary: "Income-statement report over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered income-statement report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input, args) => {
        const led = admitLedger(inputJson(input, "incomestmt input"), "incomestmt");
        return stringResource(renderIncomeStatement(incomeStatementReport(led, reportOpts(argsJson(args))), led));
    },
});
export const cashflowAction = action({
    verb: "cashflow",
    inputFormat: "json",
    outputFormat: "string",
    options: ["begin", "end"],
    summary: "Cashflow report over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered cashflow report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input, args) => {
        const led = admitLedger(inputJson(input, "cashflow input"), "cashflow");
        return stringResource(renderCashflow(cashflowReport(led, reportOpts(argsJson(args))), led));
    },
});
export const registerAction = action({
    verb: "register",
    inputFormat: "json",
    outputFormat: "string",
    options: ["account", "begin", "end"],
    summary: "Register report over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered register report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input, args) => {
        const led = admitLedger(inputJson(input, "register input"), "register");
        return stringResource(renderRegister(registerReport(led, reportOpts(argsJson(args))), led));
    },
});
export const accountsAction = action({
    verb: "accounts",
    inputFormat: "json",
    outputFormat: "string",
    summary: "Accounts listing over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered accounts listing.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input) => {
        const led = admitLedger(inputJson(input, "accounts input"), "accounts");
        return stringResource(renderAccounts(accountsReport(led)));
    },
});
export const statsAction = action({
    verb: "stats",
    inputFormat: "json",
    outputFormat: "string",
    summary: "Statistics report over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered statistics report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input) => stringResource(renderStats(statsReport(admitLedger(inputJson(input, "stats input"), "stats")))),
});
export const checkAction = action({
    verb: "check",
    inputFormat: "json",
    outputFormat: "string",
    summary: "Integrity check over the adjudicated accounting record-state.",
    description: "Domain: a journal array. Codomain: rendered no-halt check report.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input) => stringResource(renderCheck(checkReport(admitLedger(inputJson(input, "check input"), "check")))),
});
export const printAction = action({
    verb: "print",
    inputFormat: "json",
    outputFormat: "string",
    options: ["format"],
    summary: "Print journal entries in a target accounting format.",
    description: "Domain: a journal array; --format selects beancount or hledger.",
    domainSchema: ENTRIES_SCHEMA,
    run: (input, args) => {
        if (!Array.isArray(input))
            throw new TypeError("print: expected a JSON array of journal entries");
        const format = typeof args["format"] === "string" ? args["format"] : undefined;
        return stringResource(renderPrint(printReport(input, format === undefined ? {} : { format })));
    },
});
export const settleLedgerAction = action({
    verb: "settle-ledger",
    inputFormat: "json",
    outputFormat: "string",
    summary: "Settle a transaction set into a ledger balance report.",
    description: "Domain: `{ transactions }`. Codomain: rendered balance report over the loaded record-state.",
    domainSchema: Object.freeze({
        title: "SettleRequest",
        type: "object",
        required: ["transactions"],
        properties: { transactions: { type: "array" } },
    }),
    run: (input) => {
        if (input === null || typeof input !== "object" || Array.isArray(input) || !Array.isArray(input["transactions"])) {
            throw new TypeError("settle-ledger: expected a { transactions: [...] } object");
        }
        const led = loadLedger(input["transactions"]);
        return stringResource(renderBalance(balanceReport(led, {}), led));
    },
});
export const legacyAccountingInstitutionActions = Object.freeze([
    institutionAction,
    instituteAction,
    adjudicateAction,
    clearAndSettleAction,
    netAction,
    federateAction,
    minskyRegimeAction,
    ledgerLoadAction,
    balanceAction,
    balsheetAction,
    incomestmtAction,
    cashflowAction,
    registerAction,
    accountsAction,
    statsAction,
    checkAction,
    printAction,
    settleLedgerAction,
]);
export const accountingInstitutionActions = Object.freeze([
    institutionAction,
    clearAndSettleAction,
    netAction,
    federateVenuesAction,
    minskyRegimeAction,
    ledgerLoadAction,
    balanceAction,
    balsheetAction,
    incomestmtAction,
    cashflowAction,
    registerAction,
    accountsAction,
    statsAction,
    checkAction,
    printAction,
    settleLedgerAction,
]);
//# sourceMappingURL=institution.mjs.map