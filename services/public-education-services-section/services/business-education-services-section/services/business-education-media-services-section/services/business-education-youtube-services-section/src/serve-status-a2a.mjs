#!/usr/bin/env node
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
import { serveContractedAgent } from "@red-cup-engineering/a2a-contracted-agent-service";
import { localA2aMembrane } from "./local-a2a-membrane.mjs";
const ROOT=resolve(import.meta.dirname,"..");
const activation=JSON.parse(readFileSync(resolve(ROOT,"content/config/portfolio-status-agent.json"),"utf8"));if(activation.signingKeyRuntime?.environment!=="AGENT_CARD_SIGNING_KEY"||!process.env.AGENT_CARD_SIGNING_KEY)throw new Error("AGENT_CARD_SIGNING_KEY must be injected from the declared signing-key runtime");process.env.AGENT_CARD_JWKS??=resolve(ROOT,activation.publicJwks);process.env.AGENT_CARD_SIGNING_KID??=activation.signingKid;process.env.AGENT_CARD_SIGNING_ALG??=activation.algorithm;
const stateRoot=resolve(process.env.EMSWEB_A2A_STATE_ROOT??resolve(ROOT,"data","a2a","portfolio-status"));
const providerName=process.env.EMSWEB_PROVIDER_NAME??"modern-business-portfolio-status";
const {taskSource,coordinationSource}=localA2aMembrane(stateRoot,providerName);
serveContractedAgent({port:activation.internalListener?.port,host:activation.internalListener?.host,baseUrl:activation.internalListener?.baseUrl,agentCard:resolve(ROOT,"content/agent-cards/portfolio-status.json"),executor:process.execPath,executorArgs:[resolve(ROOT,"src/a2a-status-executor.mjs")],taskSource,coordinationSource}).then(({server,baseUrl})=>{process.stdout.write(`${baseUrl}\n`);const stop=()=>server.close(()=>process.exit(0));process.once("SIGINT",stop);process.once("SIGTERM",stop);}).catch(error=>{process.stderr.write(`${error.stack??error.message}\n`);process.exitCode=1;});
