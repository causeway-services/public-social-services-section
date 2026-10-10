#!/usr/bin/env node
/**
 * Renders one health-education-video-services-section video from its
 * content/videos/<slug>/script.json through the pinned offline
 * video-rendering engine. Tries Cloudflare Workers AI text-to-speech for
 * narration first (per segment); falls back to the engine's own flite
 * synthesis when Workers AI credentials are absent or the call fails, and
 * reports which route was used.
 */
import { readFile, writeFile, mkdir, stat } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderNarratedVideo } from '@red-cup-engineering/video-rendering-services-section';

const SECTION_ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const CLOUDFLARE_TTS_MODEL = '@cf/deepgram/aura-1';

function usage() {
  return 'usage: render-video.mjs --slug SLUG [--work-directory DIR]';
}

function options(argumentsList) {
  const result = {};
  for (let index = 0; index < argumentsList.length; index += 2) {
    const name = argumentsList[index];
    const value = argumentsList[index + 1];
    if (!['--slug', '--work-directory'].includes(name) || !value || result[name]) throw new TypeError(usage());
    result[name] = value;
  }
  if (!result['--slug']) throw new TypeError(usage());
  return result;
}

/**
 * Calls one Cloudflare Workers AI text-to-speech run for a single segment.
 * The REST endpoint returns either a JSON envelope ({success, result:
 * {audio: base64}}) or a raw audio body depending on model/account
 * configuration, so both shapes are handled.
 * @param {string} text
 * @param {{accountId:string, apiToken:string, model:string, fetchImpl?:typeof fetch}} opts
 * @returns {Promise<Buffer>} wav-encoded audio bytes
 * @throws {Error} on a non-ok response, a failure envelope, or an empty result
 */
async function synthesizeSegmentCloudflare(text, { accountId, apiToken, model, fetchImpl = fetch }) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { authorization: `Bearer ${apiToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ text, encoding: 'linear16', container: 'wav' })
  });
  if (!res.ok) {
    const bodyText = await res.text().catch(() => '');
    throw new Error(`cloudflare workers ai tts request failed: HTTP ${res.status} ${bodyText.slice(0, 300)}`);
  }
  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.includes('application/json')) {
    const body = await res.json();
    if (body.success === false) throw new Error(`cloudflare workers ai tts returned failure: ${JSON.stringify(body.errors ?? body)}`);
    const audioBase64 = body.result?.audio;
    if (!audioBase64) throw new Error('cloudflare workers ai tts JSON response carried no result.audio');
    return Buffer.from(audioBase64, 'base64');
  }
  const bytes = Buffer.from(await res.arrayBuffer());
  if (bytes.byteLength === 0) throw new Error('cloudflare workers ai tts returned an empty audio body');
  return bytes;
}

/**
 * Attempts Cloudflare Workers AI narration for every segment. All-or-nothing:
 * any segment failure discards the whole batch so the render never mixes
 * Workers AI audio with flite audio.
 * @param {Array<{narration:string}>} segments
 * @param {string} audioDirectory
 * @returns {Promise<string[]>} absolute .wav paths, one per segment
 * @throws {Error} when credentials are unset or any segment call fails
 */
async function synthesizeAllSegmentsCloudflare(segments, audioDirectory) {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.API_KEY_CLOUDFLARE_WORKERS_AI ?? process.env.CLOUDFLARE_API_TOKEN;
  if (!accountId || !apiToken) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID / API_KEY_CLOUDFLARE_WORKERS_AI (or CLOUDFLARE_API_TOKEN) not set in process.env');
  }
  await mkdir(audioDirectory, { recursive: true });
  const paths = [];
  for (const [index, segment] of segments.entries()) {
    const audioBytes = await synthesizeSegmentCloudflare(segment.narration, { accountId, apiToken, model: CLOUDFLARE_TTS_MODEL });
    const audioPath = path.join(audioDirectory, `segment-${String(index).padStart(3, '0')}-cloudflare-tts.wav`);
    await writeFile(audioPath, audioBytes);
    paths.push(audioPath);
  }
  return paths;
}

function execute({ program, args }) {
  return new Promise((resolve, reject) => {
    // stdout is captured (not inherited) because the engine's ffprobe
    // duration-probe step and our own duration probe below both read
    // their result from result.stdout.
    const child = spawn(program, args, { stdio: ['ignore', 'pipe', 'inherit'], shell: false });
    let stdout = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.once('error', reject);
    child.once('close', (code) => resolve({ code, stdout }));
  });
}

async function probeDurationSeconds(filePath) {
  const result = await execute({
    program: 'ffprobe',
    args: ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', filePath]
  });
  if (result.code !== 0) throw new Error(`ffprobe failed with code ${result.code}`);
  const durationSeconds = Number.parseFloat(result.stdout ?? '');
  if (!Number.isFinite(durationSeconds)) throw new Error(`ffprobe returned a non-finite duration: ${JSON.stringify(result.stdout)}`);
  return durationSeconds;
}

async function main() {
  const parsed = options(process.argv.slice(2));
  const slug = parsed['--slug'];
  const videoDirectory = path.join(SECTION_ROOT, 'content', 'videos', slug);
  const workDirectory = parsed['--work-directory'] ?? path.join(SECTION_ROOT, 'dist', slug);
  const script = JSON.parse(await readFile(path.join(videoDirectory, 'script.json'), 'utf8'));

  let narrationAudio;
  let ttsRoute;
  let ttsFallbackReason = null;
  try {
    narrationAudio = await synthesizeAllSegmentsCloudflare(script.segments, path.join(workDirectory, 'tts'));
    ttsRoute = 'cloudflare-workers-ai';
  } catch (error) {
    ttsRoute = 'flite-fallback';
    ttsFallbackReason = error.message;
    narrationAudio = undefined;
  }

  const input = {
    title: script.title,
    segments: script.segments.map(({ heading, lines, narration }) => ({ heading, lines, narration })),
    channelPresentation: script.channelPresentation,
    ...(narrationAudio ? { narrationAudio } : {})
  };

  const result = await renderNarratedVideo({ input, workDirectory, execute });
  const durationSeconds = await probeDurationSeconds(result.artifactPath);
  const { size: byteLength } = await stat(result.artifactPath);

  const summary = {
    slug,
    artifactPath: result.artifactPath,
    artifactDigest: result.artifactDigest,
    durationSeconds,
    byteLength,
    ttsRoute,
    ttsFallbackReason,
    planDigest: result.plan.planDigest,
    provenanceDigest: result.provenance.provenanceDigest
  };
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
}

try {
  await main();
} catch (error) {
  process.stderr.write(`${error.message}\n`);
  process.exitCode = 1;
}
