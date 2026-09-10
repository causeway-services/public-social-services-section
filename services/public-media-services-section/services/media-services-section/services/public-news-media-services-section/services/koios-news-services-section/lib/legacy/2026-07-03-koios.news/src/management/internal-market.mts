import { appendKoiosAct, recordDigest, type JsonObject } from "./ledger.mjs";

export type InternalServiceTerms = Readonly<{
  contract: string;
  buyer: string;
  seller: string;
  commodity: Readonly<{ type: "ServiceCommodity"; id: string; quantity: number; unit: string }>;
  consideration: Readonly<{
    type: "InternalValueAgreement";
    amount: number;
    unit: string;
    dueOn: string;
    settlementProtocol: "bilateral-internal-market-receipt";
    monetaryClaim: false;
  }>;
}>;

/**
 * Settle a sale between two Koios micro-enterprises. Both entries are real on
 * their local accounts and eliminate only at the Koios consolidation boundary.
 */
export async function settleInternalServiceExchange(input: Readonly<{
  dataDir: string;
  orderId: string;
  assignmentId?: string;
  outcome: string;
  fulfillmentDigest: string;
  settledAt: string;
  terms: InternalServiceTerms;
}>): Promise<Readonly<JsonObject>> {
  const receiptCore = Object.freeze({
    type: "BilateralInternalMarketReceipt",
    contract: input.terms.contract,
    buyer: input.terms.buyer,
    seller: input.terms.seller,
    orderId: input.orderId,
    ...(input.assignmentId === undefined ? {} : { assignmentId: input.assignmentId }),
    commodity: input.terms.commodity,
    consideration: input.terms.consideration,
    fulfillmentDigest: input.fulfillmentDigest,
    outcome: input.outcome,
    settledAt: input.settledAt,
    payment: Object.freeze({ protocol: "bilateral-internal-value", monetaryClaim: false, x402Receipt: null }),
    consolidation: "eliminate-buyer-debit-against-seller-credit",
  });
  const receipt = Object.freeze({ id: `urn:${recordDigest(receiptCore)}`, ...receiptCore });
  const entry = (side: "buyer" | "seller", direction: "debit" | "credit", account: string, counterparty: string): JsonObject => {
    const body = Object.freeze({
      type: "InternalMarketBookEntry",
      side,
      direction,
      account,
      counterparty,
      receipt: receipt.id,
      amount: input.terms.consideration.amount,
      unit: input.terms.consideration.unit,
      recordedAt: input.settledAt,
      eliminatedOnKoiosConsolidation: true,
    });
    return Object.freeze({ id: `urn:${recordDigest(body)}`, ...body });
  };
  const buyerEntry = entry("buyer", "debit", input.terms.buyer, input.terms.seller);
  const sellerEntry = entry("seller", "credit", input.terms.seller, input.terms.buyer);
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "internal-market", instant: input.settledAt, act: "internal-service.receipt.settled", subject: String(receipt.id), data: receipt as JsonObject });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "internal-market", instant: input.settledAt, act: "internal-service.buyer.debited", subject: String(buyerEntry.id), data: buyerEntry });
  await appendKoiosAct({ dataRoot: input.dataDir, ledger: "internal-market", instant: input.settledAt, act: "internal-service.seller.credited", subject: String(sellerEntry.id), data: sellerEntry });
  return Object.freeze({ receipt, buyerEntry: buyerEntry.id, sellerEntry: sellerEntry.id });
}
