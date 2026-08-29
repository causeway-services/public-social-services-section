# turntide-islands.561.group

The public Turntide Islands site. It is a static VICTOR catalog: published
claims are small, source-bound cells, and the build emits the accessible site,
feeds, search, release manifest, and offline artifacts.

## Commands

```sh
npm install
npm run check
npm run build
npm run deploy
```

`@red-cup-engineering/victor` is intentionally a registry dependency. It must
be published to the configured private registry before the first install; this
site never reaches into the engineering workspace for the application.

The public-source basis is the parent Turntide Islands settlement's
`content/documents/` record layer. Runtime data, provider admissions, and
credentials are deliberately outside this site.

`npm run deploy` publishes the verified `dist/` release as Cloudflare static
assets and binds the `turntide-islands.561.group` custom hostname.
