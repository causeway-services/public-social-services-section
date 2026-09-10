import { recordDigest, type JsonObject } from "./ledger.mjs";
import { settleInternalServiceExchange, type InternalServiceTerms } from "./internal-market.mjs";

export const INTERNAL_PUBLICATION_CUSTOMER = "urn:ame:koios.news";
export const INTERNAL_PUBLICATION_PROVIDER = "urn:micro-enterprise:koios.news:publication-operations";
export const INTERNAL_PUBLICATION_CONTRACT = "koios.news/publication-cycle/v1";

const PUBLICATION_TERMS: InternalServiceTerms = Object.freeze({
  contract: INTERNAL_PUBLICATION_CONTRACT,
  buyer: INTERNAL_PUBLICATION_CUSTOMER,
  seller: INTERNAL_PUBLICATION_PROVIDER,
  commodity: Object.freeze({ type: "ServiceCommodity", id: "urn:commodity:koios.news:publication-cycle", quantity: 1, unit: "settled-publication-cycle" }),
  consideration: Object.freeze({ type: "InternalValueAgreement", amount: 1, unit: "publication-cycle-service-credit", dueOn: "typed-terminal-settlement", settlementProtocol: "bilateral-internal-market-receipt", monetaryClaim: false }),
});

/**
 * The purchase account carried by one execution of Koios's standing internal
 * service. Koios really buys this commodity from its own publication-operations
 * micro-enterprise. That internal trade is eliminated only when Koios's books
 * are consolidated; it is not outside revenue.
 */
export function internalServiceAccount(input: Readonly<{
  pulseId: string;
  assignmentId?: string;
}>): Readonly<JsonObject> {
  const account = Object.freeze({
    type: "RendanheyiInternalServiceAccount",
    contract: INTERNAL_PUBLICATION_CONTRACT,
    customer: INTERNAL_PUBLICATION_CUSTOMER,
    provider: INTERNAL_PUBLICATION_PROVIDER,
    service: "operate one publication pulse against Koios's reader and outside-revenue outcomes",
    commodity: PUBLICATION_TERMS.commodity,
    consideration: PUBLICATION_TERMS.consideration,
    pulseId: input.pulseId,
    ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
    externalValueAccount: Object.freeze({
      marketMicroEnterprise: INTERNAL_PUBLICATION_CUSTOMER,
      endUsers: "readers who choose Koios reporting",
      revenueCounterparties: Object.freeze(["advertisers", "outside buyers of Koios publication products"]),
      payoutBasis: "share of externally evidenced value-added after attributable provider and resource costs",
      status: "unproven-until-reader-and-external-revenue-receipts-settle",
    }),
    internalCustomerIsPurchaser: true,
    internalProviderIsSeller: true,
    consolidationRule: "the buyer debit and seller credit are both real internal books and eliminate one-for-one in Koios-wide profit; neither is external revenue",
    transportIsNotCustomer: true,
  }) as JsonObject;
  return Object.freeze({ ...account, accountDigest: recordDigest(account) });
}

/** Settle both sides of one Koios-internal exchange without claiming cash. */
export async function settleInternalPublicationExchange(input: Readonly<{
  dataDir: string;
  pulseId: string;
  assignmentId: string;
  disposition: string;
  fulfillmentDigest: string;
  settledAt: string;
}>): Promise<Readonly<JsonObject>> {
  return await settleInternalServiceExchange({
    dataDir: input.dataDir,
    orderId: input.pulseId,
    assignmentId: input.assignmentId,
    outcome: input.disposition,
    fulfillmentDigest: input.fulfillmentDigest,
    settledAt: input.settledAt,
    terms: PUBLICATION_TERMS,
  });
}
