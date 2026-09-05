#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { exportReceipt, verifyReceipt } from "./editorial-admission-receipt.mjs";

const usage = "Usage: koios-news-editorial-admission-receipt <export|verify> --manuscript <file> --contract <file> --delivery <file> --ledger <jsonl> [--ledger-coordinate <ni>] [--receipt <file>]\n";
function args(argv) { const values = new Map(); for (let i = 3; i < argv.length; i += 2) { const key = argv[i], value = argv[i + 1]; if (!/^--[a-z-]+$/u.test(key) || value === undefined || values.has(key)) throw new TypeError("arguments must be unique flag/value pairs"); values.set(key, value); } return values; }
function required(values, name) { const value = values.get(name); if (!value) throw new TypeError(`${name} is required`); return value; }
function source(values, name) { return readFileSync(required(values, name), "utf8"); }
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    const operation = process.argv[2]; const values = args(process.argv);
    const allowed = new Set(operation === "export" ? ["--manuscript", "--contract", "--delivery", "--ledger", "--ledger-coordinate"] : operation === "verify" ? ["--receipt", "--manuscript", "--contract", "--delivery", "--ledger"] : []);
    for (const key of values.keys()) if (!allowed.has(key)) throw new TypeError(`unknown or inapplicable option: ${key}`);
    const common = { manuscriptSource: source(values, "--manuscript"), contractSource: source(values, "--contract"), deliverySource: source(values, "--delivery"), ledgerSource: source(values, "--ledger") };
    const result = operation === "export" ? exportReceipt({ ...common, ledgerCoordinate: required(values, "--ledger-coordinate") }) : operation === "verify" ? verifyReceipt({ ...common, receiptSource: source(values, "--receipt") }) : (() => { throw new TypeError("operation must be export or verify"); })();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) { process.stderr.write(`koios-news-editorial-admission-receipt: ${error.message}\n${usage}`); process.exitCode = 2; }
}
