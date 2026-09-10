import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";

import {
  adPerformanceEvent,
  adPerformanceReadingAtRoot,
  advertisingCspFragment,
  advertisingPolicy,
  appendAdImpressionAtRoot,
  chooseUnit,
  foldAdPerformance,
} from "../dist/advertising/index.mjs";

describe("Koios advertising", () => {
  it("derives policy, CSP, unit rotation, and performance folds from plain data", () => {
    const policy = advertisingPolicy({
      adsense: { client: "ca-pub-example" },
      aAds: { units: ["one", "two"] },
    });
    assert.equal(policy.enabled, true);
    assert.equal(chooseUnit(policy.providers.aAds.units, "/posts/example:footer"), chooseUnit(policy.providers.aAds.units, "/posts/example:footer"));
    assert.deepEqual(advertisingCspFragment(policy)["frame-src"], [
      "https://googleads.g.doubleclick.net",
      "https://tpc.googlesyndication.com",
      "https://acceptable.a-ads.com",
    ]);

    const reading = foldAdPerformance([
      {
        provider: "adsense",
        path: "/posts/example",
        day: "2026-07-01",
        kind: "impression",
        at: "2026-07-01T12:00:00.000Z",
        section: "dispatch",
        tags: ["climate"],
        impressions: 2,
        clicks: 1,
        revenueMicros: 3000,
      },
    ]);
    assert.equal(reading.totals.rpmMicros, 1500000);
    assert.equal(reading.totals.cpcMicros, 3000);
    assert.equal(reading.byProvider.adsense.impressions, 2);
    assert.equal(reading.bySection.dispatch.revenueMicros, 3000);
    assert.equal(reading.byTag.climate.clicks, 1);
  });

  it("writes witnessed impressions and reads the public performance fold", async () => {
    const root = await mkdtemp(resolve(tmpdir(), "koios-advertising-"));
    try {
      const event = adPerformanceEvent({
        provider: "a-ads",
        path: "/posts/example",
        day: "2026-07-01",
      }, new Date("2026-07-01T12:00:00.000Z"));
      assert.ok(event);
      appendAdImpressionAtRoot(root, event);
      const reading = adPerformanceReadingAtRoot(root);
      assert.equal(reading.eventCount, 1);
      assert.equal(reading.byProvider["a-ads"].impressions, 1);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
