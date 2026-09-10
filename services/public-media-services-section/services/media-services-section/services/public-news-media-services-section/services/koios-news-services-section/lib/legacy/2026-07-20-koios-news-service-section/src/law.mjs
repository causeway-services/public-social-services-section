import { readFileSync } from "node:fs";
import { compileRmlLaw } from "@emsenn/rmn-semantic-conformance/law";

const compile = (name) => compileRmlLaw(readFileSync(new URL(`../content/contracts/${name}.rml`, import.meta.url), "utf8"));

export const ADMISSIBLE_RESEARCH_PACKET_LAW = compile("admissible-research-packet-service");
export const LICENSED_EDITORIAL_STATE_LAW = compile("licensed-editorial-state-service");
export const ADMISSIBLE_RESEARCH_PACKET_CONTRACT = ADMISSIBLE_RESEARCH_PACKET_LAW.id;
export const LICENSED_EDITORIAL_STATE_CONTRACT = LICENSED_EDITORIAL_STATE_LAW.id;
