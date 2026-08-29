# Turntide Steward Inference Procurement Service

Turntide steward inference as a bounded market capability, with its own
supplier admissions, customer-service admissions, and consideration policy
resources — independent of the aggregate settlement and the Discord
application. Procures one answer from an admitted inference supplier for one
prompt, under a priced consideration policy, and returns the steward's
answer alongside its procurement record.

## Install

```sh
npm install
```

Reads resolve through the per-project `.npmrc` (private scopes routed to
Google Artifact Registry's virtual repo).

## Verify

```sh
npm test
```

Runs `node --check` over `src/*.mjs` and `test/*.test.mjs`, then
`node --test test/*.test.mjs`, then `npm pack --dry-run`.

## Exports

- `procureStewardAnswer(prompt, ...)` — procures an inference-provider
  answer for a prompt under the consideration policy.
- `stewardInferenceMarket(...)` / `marketSupplier(provider, signal)` — market
  and supplier admission helpers.
- `stewardAnswerFromProcurement(procurement)` — projects a procurement record
  to its steward-facing answer.
- `TTI_ACTOR` — `urn:ame:turntide-islands`.
- `SUPPLIER_ADMISSIONS`, `SUPPLIER_ADMISSION_GRAPH`,
  `CUSTOMER_SERVICE_ADMISSIONS`, `CUSTOMER_SERVICE_ADMISSION_GRAPH`,
  `CONSIDERATION_POLICY`, `SOVEREIGN_BINDING` — content and graph paths under
  this package's own `content/` directory.

Depends on `@red-cup-engineering/a2a-rmn-task-client-service` and
`@red-cup-engineering/inference-work-lot-service`.
