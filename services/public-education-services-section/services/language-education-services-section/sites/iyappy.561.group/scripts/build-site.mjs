import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, writeArtifacts } from '@red-cup-engineering/victor';
import config from '../victor.config.mjs';

const siteDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
const publicDirectory = join(siteDirectory, 'public');

export async function buildIYappySite() {
  await rm(publicDirectory, { recursive: true, force: true });
  await mkdir(publicDirectory, { recursive: true });
  const result = await build({ contentDir: join(siteDirectory, 'content'), ...config });
  if (!result.report.releasable) throw new Error(`VICTOR refused iYappy build: ${JSON.stringify(result.report.refusals)}`);
  await writeArtifacts(result.artifacts, publicDirectory);
  return publicDirectory;
}

if (import.meta.main) {
  await buildIYappySite();
}
