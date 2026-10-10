import launch from "../content/launches/ebook.json" with { type: "json" };

const unavailable = () => new TypeError("handbook-release-unavailable");

function release() {
  const fulfillment = launch?.build?.fulfillment;
  if (fulfillment?.bucket !== "shop-561-group-goods" || typeof fulfillment.manifestKey !== "string" || !Array.isArray(fulfillment.goods)) throw unavailable();
  const bundle = fulfillment.goods.find((key) => typeof key === "string" && key.endsWith(".zip"));
  if (!bundle) throw unavailable();
  return Object.freeze({ manifestKey: fulfillment.manifestKey, bundle });
}

function goods(env) {
  if (!env?.SHOP_GOODS || typeof env.SHOP_GOODS.get !== "function" || typeof env.SHOP_GOODS.head !== "function") throw unavailable();
  return env.SHOP_GOODS;
}

/**
 * Confirm the exact paid release exists before the x402 boundary asks for a
 * payment. The source manuscript and individual fulfillment files remain
 * private to their respective carriers; the buyer receives one bundle.
 */
export async function admitPaidHandbook(_query, env) {
  const { manifestKey, bundle } = release();
  const store = goods(env);
  const [manifest, artifact] = await Promise.all([store.head(manifestKey), store.head(bundle)]);
  if (!manifest || !artifact) throw unavailable();
  return Object.freeze({ manifestKey, bundle, byteLength: artifact.size });
}

/** Deliver the purchased EPUB-and-PDF release as one immutable ZIP response. */
export async function readPaidHandbook(_query, env) {
  const { bundle } = release();
  const object = await goods(env).get(bundle);
  if (!object?.body) throw unavailable();
  return new Response(object.body, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": 'attachment; filename="the-agent-operators-handbook-1.0.0.zip"',
      "content-length": String(object.size),
      "cache-control": "private, no-store",
    },
  });
}
