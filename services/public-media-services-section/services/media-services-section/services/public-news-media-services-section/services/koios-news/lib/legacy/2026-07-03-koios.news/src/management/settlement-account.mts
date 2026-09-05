import { readFileSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SITE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const ACCOUNT_ROOT = join(SITE_ROOT, "content", "evm", "accounts");
const files = readdirSync(ACCOUNT_ROOT).filter((name) => /^eip155-[1-9][0-9]*\.json$/u.test(name)).sort();
if (files.length !== 1) throw new Error("koios.news must publish exactly one active settlement account binding");
const binding = JSON.parse(readFileSync(join(ACCOUNT_ROOT, files[0]!), "utf8")) as { enterprise?: { urn?: unknown }; account?: { caip10?: unknown } };
if (binding.enterprise?.urn !== "urn:ame:koios.news" || typeof binding.account?.caip10 !== "string" || !/^eip155:[1-9][0-9]*:0x[0-9a-f]{40}$/u.test(binding.account.caip10)) throw new Error("koios.news account binding is not its exact CAIP-10 identity");

export const SITE_ACCOUNT = Object.freeze({ actor: binding.enterprise.urn, caip10: binding.account.caip10 });
