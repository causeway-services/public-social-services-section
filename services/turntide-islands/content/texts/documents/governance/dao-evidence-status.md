---
title: "Turntide Islands DAO Evidence Status"
date-created: 2026-08-29
status: active-evidence-boundary
machine-readable-registry: ../../../governance/dao-registry.json
---

# Turntide Islands DAO evidence status

Turntide Islands has an established DAO identity and a concrete historical
architecture. Administrator-authored March 2025 discussion described
`TTIDAO`, a treasury, a separate fee-contributing fund, recognition-weighted
governance, and a proposed Hive decision record. The current welcome model
describes polycentric participatory consensus.

What remains unresolved is not whether the DAO idea existed. It is which
public systems implemented it and whether they remain operational.

## Credential-safe EVM result

On 2026-08-29 a read-only investigation derived public EVM addresses from all
available local mnemonic-bearing wallet material without exposing secrets. It
checked standard account and address indices on Ethereum, Gnosis, Base,
Arbitrum, Optimism, and Polygon.

The only materially active derived account was ruled out as TTI evidence after
an exhaustive check of its Base history: 198 transaction receipts and metadata
for 96 contracts appearing in those logs contained no `TTIDAO`, Turntide,
Colony, or TTI treasury fee-routing match. Other derived candidates showed no
Ethereum or Gnosis transaction activity. The VPS runtime contained no EVM
wallet material.

This is a useful exclusion, not proof that the historical DAO never existed.
The relevant key may be absent, use a nonstandard derivation path, have been
rotated, live in another custody system, or refer to a non-EVM/Hive component.

## Current public claim boundary

TTI can accurately say:

- the community understands itself as a DAO using polycentric participatory
  consensus;
- its administrator historically described a `TTIDAO` token, treasury, and
  fee-contributing fund;
- Hive was proposed for immutable governance records;
- the public identifiers and current operating state of those systems are
  being recovered.

TTI cannot yet accurately publish a live token address, Colony, treasury
balance, fund balance, voting weight, on-chain proposal history, or revenue
flow.

## Next decisive evidence

Any one of the following would materially advance recovery:

- a historic treasury or fund address;
- a token deployment or transfer transaction;
- a Colony name, network, address, or creation transaction;
- a Hive account name;
- an old interface URL, screenshot, wallet export containing public labels, or
  governance receipt.

Verified identifiers belong in
`content/governance/dao-registry.json`. Credentials never do.

