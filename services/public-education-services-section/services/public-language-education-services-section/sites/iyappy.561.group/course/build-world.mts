import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileVault } from '@red-cup-engineering/education-platform-service/compile';
import { extractIyappyExercises } from './extract.mts';

const CORPUS_ROOT = join(fileURLToPath(new URL('.', import.meta.url)), 'corpus');

/** Compile iYappy's finite, source-bounded course through the shared platform compiler. */
export function buildIyappyWorld() {
  const { world } = compileVault(CORPUS_ROOT, { id: 'iyappy' }, { dialect: 'house' });
  return { ...world, exercises: world.rooms.flatMap(extractIyappyExercises) };
}
