#!/usr/bin/env node
import { judgeManuscriptUnderContract } from "./researching/writing/editing/market-editorial.mjs";

const slug = process.argv[2];
if (slug === undefined || slug === "") throw new TypeError("usage: editorial-judge <slug>");
process.stdout.write(`${JSON.stringify(await judgeManuscriptUnderContract({ slug }), null, 2)}\n`);
