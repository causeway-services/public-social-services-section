#!/usr/bin/env node
import { probePublicActivityPub } from "../src/public-smoke.mjs";

try {
  const result = await probePublicActivityPub({ signal: AbortSignal.timeout(15_000) });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`Koios ActivityPub public smoke failed: ${error.message}\n`);
  process.exitCode = 1;
}
