#!/usr/bin/env node
import { recoverEditorialDiagnostic } from "./researching/writing/editing/market-editorial.mts";

const slug = process.argv[2];
const exchangePath = process.argv[3];
if (slug === undefined || exchangePath === undefined) throw new TypeError("usage: editorial-recover <slug> <provider-exchange-path>");
process.stdout.write(`${JSON.stringify(await recoverEditorialDiagnostic({ slug, exchangePath }), null, 2)}\n`);
