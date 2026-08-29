#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const metroplatRoot = resolve(siteRoot, "../metroplat.emsenn.net");
const targetRoot = resolve(process.argv[2] ?? resolve(siteRoot, ".deploy/koios.news"));

async function copyRequired(source, target) {
  if (!existsSync(source)) throw new Error(`required build input is missing: ${source}`);
  await cp(source, target, { recursive: true, force: true, dereference: true });
}

async function main() {
  await rm(targetRoot, { recursive: true, force: true });
  await mkdir(resolve(targetRoot, "node_modules/@emsenn"), { recursive: true });

  await copyRequired(resolve(siteRoot, "dist"), resolve(targetRoot, "dist"));
  await copyRequired(resolve(siteRoot, "content"), resolve(targetRoot, "content"));
  await copyRequired(resolve(metroplatRoot, "dist"), resolve(targetRoot, "node_modules/@emsenn/metroplat/dist"));

  const metroplatPackage = JSON.parse(await readFile(resolve(metroplatRoot, "package.json"), "utf8"));
  await writeFile(
    resolve(targetRoot, "node_modules/@emsenn/metroplat/package.json"),
    `${JSON.stringify({
      name: metroplatPackage.name,
      version: metroplatPackage.version,
      private: metroplatPackage.private,
      license: metroplatPackage.license,
      type: metroplatPackage.type,
      main: metroplatPackage.main,
      types: metroplatPackage.types,
      exports: metroplatPackage.exports,
    }, null, 2)}\n`,
    "utf8",
  );

  const sitePackage = JSON.parse(await readFile(resolve(siteRoot, "package.json"), "utf8"));
  await writeFile(
    resolve(targetRoot, "package.json"),
    `${JSON.stringify({
      name: sitePackage.name,
      version: sitePackage.version,
      private: true,
      type: "module",
      main: "./dist/server.mjs",
      scripts: { start: "node dist/server.mjs" },
      dependencies: { "@emsenn/metroplat": sitePackage.dependencies["@emsenn/metroplat"] },
    }, null, 2)}\n`,
    "utf8",
  );

  await writeFile(
    resolve(targetRoot, "README.deploy.txt"),
    [
      "Koios.News standalone Node artifact.",
      "Run with: PORT=8790 node dist/server.mjs",
      "Override the default witness-data root with koios.news.config.json, KOIOS_NEWS_DATA_ROOT, or --data-root.",
      "This directory intentionally includes @emsenn/metroplat under node_modules.",
      "",
    ].join("\n"),
    "utf8",
  );

  process.stdout.write(`${targetRoot}\n`);
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
