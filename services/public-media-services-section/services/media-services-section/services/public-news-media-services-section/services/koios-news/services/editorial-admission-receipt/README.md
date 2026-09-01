# Koios editorial admission receipt

This package exports and verifies a portable, read-only **local custody proof**
for an existing `independent-editorial-assessment` acceptance.  It binds the
exact manuscript bytes, the accepted service contract, the selected tool and
selection digest, and one semantic-record-journal entry plus its source-file
digest.

It deliberately does not create an admission, alter a journal, sign anything,
or grant publication authority.  No authenticated editorial issuer key is in
the surviving evidence.  A successful verification therefore proves that the
supplied local files agree; it does **not** prove an independently authenticated
issuer or authorize `routine-publication-current`.

```sh
koios-news-editorial-admission-receipt export \
  --manuscript draft.md --contract contract.json --delivery delivery.json \
  --ledger data/logs/2026/08/29/semantic-record-content.jsonl \
  --ledger-coordinate 'ni:///sha-256;...' > receipt.json

koios-news-editorial-admission-receipt verify \
  --receipt receipt.json --manuscript draft.md --contract contract.json \
  --delivery delivery.json --ledger data/logs/2026/08/29/semantic-record-content.jsonl
```

The exporter refuses anything other than a completed
`submit_editorial_acceptance` delivery with an exact matching contract demand
and provider-exchange journal coordinate.  It never supplies missing values.
