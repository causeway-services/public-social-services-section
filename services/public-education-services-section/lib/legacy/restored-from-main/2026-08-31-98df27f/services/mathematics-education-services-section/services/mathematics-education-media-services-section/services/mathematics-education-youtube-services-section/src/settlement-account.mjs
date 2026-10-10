export const SETTLEMENT_ACCOUNT_ENV = "MATHEMATICS_YOUTUBE_SETTLEMENT_ACCOUNT";

const CAIP_10 = /^eip155:[1-9][0-9]*:0x[a-f0-9]{40}$/u;

export function requireSettlementAccountId(value) {
  if (typeof value !== "string" || !CAIP_10.test(value)) {
    throw new TypeError("mathematics channel composition requires one explicit EIP-155 CAIP-10 settlementAccountId");
  }
  return value;
}


export function settlementAccountIdFromEnvironment(environment = process.env) {
  return requireSettlementAccountId(environment[SETTLEMENT_ACCOUNT_ENV]);
}
