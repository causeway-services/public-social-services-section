# iYappy

The Cloudflare deployment carrier for <https://iyappy.561.group>, iYappy's
first public Lakȟótiyapi / Lakota presence.

`victor.config.mjs` is the site: it chooses VICTOR's explicit `home: false`
route ownership and the published iYappy education-course preset. The generic
education projector emits the course world, browser controller, and TUFTE
`early-mac` shell. `src/index.mjs` is the thin Worker carrier: it exposes
`/health` and delegates every other request to Cloudflare static assets.

`scripts/build-site.mjs` is the only producer of `public/`. That directory is
ignored because it is a disposable release artifact, never authored source.
The intentionally empty `content/` directory keeps VICTOR's ordinary article
tree out of this property; the course projector owns the homepage.

```sh
npm install
npm test
npm run deploy
```

The Worker binds only `iyappy.561.group`. Its fresh public checks are:

```sh
curl -fsS https://iyappy.561.group/
curl -fsS https://iyappy.561.group/health
curl -fsS https://iyappy.561.group/styles.e2e5ece2ae1e.css
```
