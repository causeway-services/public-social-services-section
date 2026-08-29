#!/usr/bin/env node
import { join, resolve } from "node:path";
import { executeChannelPortfolioStatusMessage } from "@red-cup-engineering/a2a-channel-portfolio-status-service";
import { ACTOR, NODE_ROOT, formPortfolioStatus } from "./channel.mjs";
export function executeStatusMessage(message,options={}){const dataRoot=resolve(options.dataRoot??process.env.CHANNEL_DATA_ROOT??join(NODE_ROOT,"data")),reportedAt=options.reportedAt??process.env.PORTFOLIO_REPORTED_AT??new Date().toISOString();return executeChannelPortfolioStatusMessage({message,actor:ACTOR,formStatus:({civilDay})=>formPortfolioStatus({civilDay,dataRoot,reportedAt})});}
export async function main(){let input="";process.stdin.setEncoding("utf8");for await(const chunk of process.stdin)input+=chunk;process.stdout.write(`${JSON.stringify(await executeStatusMessage(JSON.parse(input)))}\n`);}
if(process.argv[1]&&resolve(process.argv[1])===resolve(new URL(import.meta.url).pathname))await main().catch(error=>{process.stderr.write(`${error.message}\n`);process.exitCode=2;});
