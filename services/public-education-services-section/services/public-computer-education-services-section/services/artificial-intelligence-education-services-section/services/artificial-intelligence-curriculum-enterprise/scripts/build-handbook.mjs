#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, renameSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const handbookRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const bookDirectory = join(handbookRoot, "content", "books", "the-agent-operators-handbook");
const edition = "1.0.0";
const slug = "the-agent-operators-handbook";
const title = "The Agent Operator's Handbook";
const subtitle = "A Field Guide to Dispatching, Steering, and Recovering Multiple AI Coding Agents at Once";
const author = "561 Group";

function sha256(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function hashValue(value) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function chapterPaths() {
  const chapters = readdirSync(bookDirectory)
    .filter((name) => /^\d{2}-.+\.md$/.test(name))
    .sort();
  const expected = Array.from({ length: 13 }, (_, index) => String(index).padStart(2, "0"));
  if (chapters.length !== expected.length || chapters.some((chapter, index) => !chapter.startsWith(expected[index] + "-"))) {
    throw new Error("The Handbook must contain ordered chapters 00 through 12.");
  }
  return chapters.map((chapter) => join(bookDirectory, chapter));
}

function outputDirectory(args) {
  const index = args.indexOf("--out");
  if (index === -1 || !args[index + 1] || index !== args.length - 2) {
    throw new Error("Usage: node scripts/build-handbook.mjs --out <new-output-directory>");
  }
  const output = resolve(args[index + 1]);
  if (existsSync(output)) throw new Error(`Refusing to replace existing output: ${output}`);
  return output;
}

function build(output) {
  mkdirSync(dirname(output), { recursive: true });
  const staging = mkdtempSync(join(dirname(output), ".handbook-build-"));
  const epub = join(staging, `${slug}.epub`);
  const pdf = join(staging, `${slug}.pdf`);
  const bundle = join(staging, `${slug}.zip`);
  const inputs = chapterPaths();
  const source = inputs.map((path) => ({ path: path.slice(handbookRoot.length + 1), sha256: sha256(path) }));
  const sourceDigest = hashValue(source);
  const metadata = ["--from=markdown", "--toc", "--metadata", `title=${title}`, "--metadata", `subtitle=${subtitle}`, "--metadata", `author=${author}`];

  execFileSync("pandoc", [...metadata, "--output", epub, ...inputs], { stdio: "inherit" });
  execFileSync("pandoc", [...metadata, "--pdf-engine=xelatex", "--output", pdf, ...inputs], { stdio: "inherit" });
  execFileSync("zip", ["-X", "-j", bundle, epub, pdf], { stdio: "inherit" });

  const artifacts = [
    { name: "EPUB", file: `${slug}.epub`, contentType: "application/epub+zip" },
    { name: "PDF", file: `${slug}.pdf`, contentType: "application/pdf" },
    { name: "EPUB + PDF bundle", file: `${slug}.zip`, contentType: "application/zip" }
  ].map((artifact) => {
    const artifactSha256 = sha256(join(staging, artifact.file));
    return {
      ...artifact,
      byteLength: statSync(join(staging, artifact.file)).size,
      sha256: artifactSha256,
      key: `${slug}/${edition}/${sourceDigest}/${artifactSha256}/${artifact.file}`
    };
  });
  const manifest = {
    type: "DigitalBookBuild",
    slug,
    edition,
    sourceDigest,
    title,
    subtitle,
    author,
    source,
    artifacts
  };
  writeFileSync(join(staging, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  renameSync(staging, output);
  return manifest;
}

try {
  console.log(JSON.stringify(build(outputDirectory(process.argv.slice(2))), null, 2));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
