import { recordDigest } from "./ledger.mjs";
export const INTERNAL_PUBLICATION_CUSTOMER = "urn:ame:koios.news";
export const INTERNAL_PUBLICATION_PROVIDER = "urn:micro-enterprise:koios.news:publication-operations";
export const INTERNAL_PUBLICATION_CONTRACT = "koios.news/publication-cycle/v1";
/**
 * The account carried by one execution of Koios's standing internal service.
 * Clockkeeper may transport the order, but reader choice and outside receipts
 * are the only things allowed to settle user value.
 */
export function internalServiceAccount(input) {
    const account = Object.freeze({
        type: "RendanheyiInternalServiceAccount",
        contract: INTERNAL_PUBLICATION_CONTRACT,
        customer: INTERNAL_PUBLICATION_CUSTOMER,
        provider: INTERNAL_PUBLICATION_PROVIDER,
        service: "operate one publication pulse against Koios's reader and outside-revenue outcomes",
        pulseId: input.pulseId,
        ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
        externalValueAccount: Object.freeze({
            marketMicroEnterprise: INTERNAL_PUBLICATION_CUSTOMER,
            endUsers: "readers who choose Koios reporting",
            revenueCounterparties: Object.freeze(["advertisers", "outside buyers of Koios publication products"]),
            payoutBasis: "share of externally evidenced value-added after attributable provider and resource costs",
            status: "unproven-until-reader-and-external-revenue-receipts-settle",
        }),
        internalCustomerIsNotPayer: true,
        transportIsNotCustomer: true,
    });
    return Object.freeze({ ...account, accountDigest: recordDigest(account) });
}
//# sourceMappingURL=internal-publication-service.mjs.map