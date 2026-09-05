#!/usr/bin/env node
import { reprojectLatestEditorialJudgment } from "./researching/writing/editing/liss-editorial.mjs";
const slug = process.argv[2];
if (slug === undefined || slug === "")
    throw new TypeError("usage: editorial-reproject <slug>");
process.stdout.write(`${JSON.stringify(reprojectLatestEditorialJudgment({ slug }), null, 2)}\n`);
//# sourceMappingURL=editorial-reproject.mjs.map