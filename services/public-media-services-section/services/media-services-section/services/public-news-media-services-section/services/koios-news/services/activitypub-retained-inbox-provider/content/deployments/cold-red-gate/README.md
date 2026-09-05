# Cold Red Gate deployment

These are the retained ActivityPub provider's deployment artifacts. They are
owned by this provider package, not by the tombstoned `sites/koios.news`
aggregate.

The unit creates the private `koios-news` state directory and binds SQLite to
`%S/koios-news/activitypub.sqlite`. That path is writable despite
`ProtectHome=read-only`; key and bearer-token files remain read-only private
inputs under the account home.

Copy the package to the selected `KOIOS_ACTIVITYPUB_SERVICE_ROOT`, create the
private environment file from `koios-activitypub.env.example`, then run
`install-and-verify.sh`. The script only installs a disabled unit; it never
starts or enables it.
