#!/usr/bin/env node
import { reprojectLatestEditorialJudgment } from "./researching/writing/editing/market-editorial.mts";

const slug = process.argv[2];
if (slug === undefined || slug === "") throw new TypeError("usage: editorial-reproject <slug>");
process.stdout.write(`${JSON.stringify(await reprojectLatestEditorialJudgment({ slug }), null, 2)}\n`);
