import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { validateNarratedVideoInput } from '@red-cup-engineering/video-rendering-services-section';

const SECTION_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const VIDEO_DIRECTORY = path.join(SECTION_ROOT, 'content', 'videos', 'what-is-iaci');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(VIDEO_DIRECTORY, relativePath), 'utf8'));
}

test('what-is-iaci script.json validates against the pinned video-rendering engine contract', async () => {
  const script = await readJson('script.json');
  const normalized = validateNarratedVideoInput({
    title: script.title,
    segments: script.segments,
    channelPresentation: script.channelPresentation
  });
  assert.equal(normalized.title, script.title);
  assert.equal(normalized.segments.length, script.segments.length);
});

test('what-is-iaci script.json has 6-9 segments', async () => {
  const script = await readJson('script.json');
  assert.ok(script.segments.length >= 6 && script.segments.length <= 9, `expected 6-9 segments, got ${script.segments.length}`);
});

test('what-is-iaci script.json narration totals roughly 900-1200 words', async () => {
  const script = await readJson('script.json');
  const wordCount = script.segments.reduce((total, segment) => total + segment.narration.split(/\s+/).filter(Boolean).length, 0);
  assert.ok(wordCount >= 800 && wordCount <= 1300, `expected roughly 900-1200 narration words, got ${wordCount}`);
});

test('what-is-iaci script.json every segment has a heading, 2-4 lines, and narration', async () => {
  const script = await readJson('script.json');
  for (const [index, segment] of script.segments.entries()) {
    assert.ok(typeof segment.heading === 'string' && segment.heading.trim() !== '', `segments[${index}].heading missing`);
    assert.ok(Array.isArray(segment.lines) && segment.lines.length >= 2 && segment.lines.length <= 4, `segments[${index}].lines must have 2-4 entries`);
    assert.ok(typeof segment.narration === 'string' && segment.narration.trim() !== '', `segments[${index}].narration missing`);
  }
});

test('what-is-iaci script.json final segment names primary sources by author/year', async () => {
  const script = await readJson('script.json');
  const finalSegment = script.segments.at(-1);
  assert.match(finalSegment.narration, /\b(20\d{2})\b/, 'final segment narration should cite a publication year');
  assert.match(finalSegment.heading.toLowerCase() + finalSegment.narration.toLowerCase(), /choutka|national academies/, 'final segment should name a primary source');
});

test('what-is-iaci script.json uses a dark background, white text, 1280x720 presentation', async () => {
  const script = await readJson('script.json');
  assert.equal(script.channelPresentation.width, 1280);
  assert.equal(script.channelPresentation.height, 720);
  assert.equal(script.channelPresentation.backgroundColor, '0x202020');
  assert.equal(script.channelPresentation.foregroundColor, '&H00FFFFFF');
});

test('what-is-iaci metadata.json has title, description with source list and medical-advice disclaimer, and tags', async () => {
  const metadata = await readJson('metadata.json');
  assert.ok(typeof metadata.title === 'string' && metadata.title.trim() !== '');
  assert.match(metadata.description, /Educational material, not medical advice/);
  assert.match(metadata.description, /https?:\/\//, 'description should list source URLs');
  assert.ok(Array.isArray(metadata.tags) && metadata.tags.length > 0);
});
