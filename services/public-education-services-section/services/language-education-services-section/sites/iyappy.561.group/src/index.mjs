/** Cloudflare asset carrier. The page itself is built by scripts/build-site.mjs. */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/health") {
      return Response.json({ service: "iyappy", status: "ok" }, {
        headers: { "cache-control": "no-store" },
      });
    }
    return env.ASSETS.fetch(request);
  },
};
