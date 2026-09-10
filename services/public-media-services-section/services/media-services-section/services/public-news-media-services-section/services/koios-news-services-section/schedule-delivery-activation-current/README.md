# Koios ScheduleDelivery activation preflight

This separate package emits a valid current ScheduleDelivery solicitation. The
`koios-news-routine-operation` target declares its complete package-local
runtime file closure; ScheduleDelivery commits and read-only bind-mounts those
exact bytes for every invocation.

The caller supplies the live schedule deliberately. No default due time,
interval, delivery limit, credential, signature, or timer is invented.

```sh
node bin/koios-news-schedule-delivery-preflight.mjs solicitation \
  --first-due-at 2026-09-01T12:00:00.000Z \
  --interval-seconds 86400 \
  --max-deliveries null \
  --timeout-milliseconds 60000 \
  > /var/tmp/koios-scheduled-activity-delivery-solicitation.json
```

The artifact binds the actual provider law and the deployed customer target:
`/home/emsenn/services/koios-news-runtime`, operation
`koios-news-routine-operation`, contract `koios-news/routine-operation/v1`,
live mode, and the exact routine capability. Submit it only through the
provider's authenticated customer channel. A conforming provider offer must
include the target's `runtimeClosureDigest` in addition to its package and
selected-bin digests.

After the provider returns an offer, its current-law shape can be checked:

```sh
node bin/koios-news-schedule-delivery-preflight.mjs verify-offer \
  --solicitation /var/tmp/koios-scheduled-activity-delivery-solicitation.json \
  --offer /absolute/path/to/provider-offer.json
```

That command exits `2` by design. It cannot authenticate the provider's
witnessed emission or produce the customer-signed `Accept<ServiceContract>`;
it therefore cannot authorize activation.
