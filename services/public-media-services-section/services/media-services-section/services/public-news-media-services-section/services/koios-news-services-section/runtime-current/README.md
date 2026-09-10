# Koios current runtime admission seam

This package is the current, dependency-light boundary between Koios and the
four provider contracts that survived retirement of the legacy content-farm
aggregate. It proves that the checked-in provider packages, contract entry
points, identities, and installed dependency roots agree before any production
authority is considered.

It is deliberately dry-run only. It does not import or invoke providers, read
credentials, use the network, write custody, publish, post ActivityPub
activities, schedule work, or deploy artifacts. A successful inspection means
the provider chassis is addressable; it does not mean a publication cycle has
run.

Run the complete local admission check with Node 22.18 or newer:

```sh
npm run check && npm test && npm run inspect
npm run plan
```

The production circuit must add separately admitted boundaries, in order:

1. accepted ActivityStreams service contracts and attenuated customer
   capabilities;
2. package-local writable custody for each provider and Koios itself;
3. source-discovery and acquisition authority;
4. Newswire inference-market, EIP-155 account, and WIT-transition authority;
5. independent editorial acceptance of the exact manuscript bytes;
6. publication-state admission and deterministic static artifact construction;
7. accepted ScheduleDelivery authority; and
8. ActivityPub and Cloudflare delivery with post-delivery witnesses.

`config/runtime.json` contains public contract topology only. Credentials,
environment names, commands, filesystem locations, and network endpoints are
rejected from this file so they cannot silently become editorial authority.
