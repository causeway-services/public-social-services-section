#!/usr/bin/env node
import {
  acceptPreviewProbe,
  doctor,
  enqueuePendingRelease,
  executeObservedAuthorized,
  plan,
} from "../src/carrier.mjs";
const usage =
  "Usage: koios-news-cloudflare-release [doctor|plan|preview|release|probe|enqueue] --candidate DIR --binding FILE [--grant FILE --authority-keys FILE --now UTC --replay-root DIR --rollback FILE --preview-receipt FILE --production-baseline FILE --url HTTPS_URL --apply --receipt-out FILE]\n";
const args = process.argv.slice(2);
const phase = args[0]?.startsWith("-") || args.length === 0
  ? "plan"
  : args.shift();
if (args.includes("--help") || args.includes("-h")) {
  process.stdout.write(usage);
  process.exit(0);
}
const values = new Map();
let apply = false;
for (let i = 0; i < args.length; i += 1) {
  const flag = args[i];
  if (flag === "--apply") {
    apply = true;
    continue;
  }
  if (
    ![
      "--candidate",
      "--binding",
      "--grant",
      "--authority-keys",
      "--now",
      "--replay-root",
      "--rollback",
      "--preview-receipt",
      "--production-baseline",
      "--receipt-out",
      "--url",
    ].includes(flag)
  ) throw new Error(`unknown option: ${flag}`);
  const value = args[++i];
  if (!value || value.startsWith("--")) {
    throw new Error(`missing value for ${flag}`);
  }
  values.set(flag, value);
}
try {
  if (!values.has("--candidate") || !values.has("--binding")) {
    throw new Error(usage.trim());
  }
  if (phase === "doctor") {
    process.stdout.write(
      `${
        JSON.stringify(
          doctor({
            candidateDir: values.get("--candidate"),
            bindingPath: values.get("--binding"),
            productionBaselinePath: values.get("--production-baseline"),
          }),
          null,
          2,
        )
      }\n`,
    );
  } else if (phase === "enqueue") {
    if (!values.has("--production-baseline") || !values.has("--receipt-out")) throw new Error("enqueue requires --production-baseline and create-only --receipt-out");
    process.stdout.write(`${JSON.stringify(enqueuePendingRelease({ candidateDir: values.get("--candidate"), bindingPath: values.get("--binding"), productionBaselinePath: values.get("--production-baseline"), receiptOut: values.get("--receipt-out") }), null, 2)}\n`);
  } else if (phase === "probe") {
    if (!values.has("--url") || !values.has("--receipt-out")) {
      throw new Error("probe requires --url and create-only --receipt-out");
    }
    process.stdout.write(
      `${
        JSON.stringify(
          await acceptPreviewProbe({
            candidateDir: values.get("--candidate"),
            bindingPath: values.get("--binding"),
            url: values.get("--url"),
            receiptOut: values.get("--receipt-out"),
          }),
          null,
          2,
        )
      }\n`,
    );
  } else {
    const releasePlan = plan({
      phase,
      candidateDir: values.get("--candidate"),
      bindingPath: values.get("--binding"),
      grantPath: values.get("--grant"),
      authorityKeysPath: values.get("--authority-keys"),
      now: values.get("--now"),
      rollbackPath: values.get("--rollback"),
      previewReceiptPath: values.get("--preview-receipt"),
      productionBaselinePath: values.get("--production-baseline"),
    });
    if (phase === "plan") {
      process.stdout.write(`${JSON.stringify(releasePlan, null, 2)}\n`);
    } else if (!apply) {
      process.stdout.write(
        `${
          JSON.stringify(
            { ...releasePlan, disposition: "dry-run-refusal" },
            null,
            2,
          )
        }\n`,
      );
      process.exitCode = 2;
    } else {
      if (!values.has("--url")) throw new Error("applied preview or release requires an explicit observation --url");
      process.stdout.write(
        `${
          JSON.stringify(
            await executeObservedAuthorized({
              phase,
              plan: releasePlan,
              receiptOut: values.get("--receipt-out"),
              replayRoot: values.get("--replay-root"),
              url: values.get("--url"),
            }),
            null,
            2,
          )
        }\n`,
      );}
  }
} catch (error) {
  process.stderr.write(`koios-news-cloudflare-release: ${error.message}\n`);
  process.exitCode = 1;
}
