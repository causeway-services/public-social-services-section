// Education channels and their curricula, read from public education: each
// channel directory holds config.json (YouTube identity, schedule, video format,
// curriculum reference), history.json and production/episodes/<lesson>/.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { writeFileAtomic } from "@red-cup-engineering/computer-system-engine/filesystem";

export const PACKAGE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const EDUCATION_ROOT = process.env.YOUTUBE_EDUCATION_ROOT ?? PACKAGE_ROOT;

export function readJson(path, fallback) {
  if (!existsSync(path) && arguments.length > 1) return fallback;
  return JSON.parse(readFileSync(path, "utf8"));
}

/** Write text, or a value as indented JSON, atomically and owner-only. */
export function writeAtomic(path, value) {
  writeFileAtomic(path, typeof value === "string" ? value : `${JSON.stringify(value, null, 2)}\n`, { mode: 0o600 });
}

/** The first free publication slot after `now` on the channel's schedule, skipping occupied UTC days. */
export function nextSlot(schedule, now = new Date(), occupied = []) {
  if (!schedule?.days?.length || schedule.days.some((d) => !Number.isInteger(d) || d < 0 || d > 6) || !Number.isInteger(schedule.hourUtc) || schedule.hourUtc < 0 || schedule.hourUtc > 23) throw new Error("Invalid channel schedule");
  const date = new Date(now);
  date.setUTCHours(schedule.hourUtc, 0, 0, 0);
  const used = new Set(occupied.filter(Boolean).map((d) => new Date(d).toISOString().slice(0, 10)));
  for (let day = 0; day < 366; day += 1, date.setUTCDate(date.getUTCDate() + 1)) {
    if (date.getTime() > now.getTime() + 3_600_000 && schedule.days.includes(date.getUTCDay()) && !used.has(date.toISOString().slice(0, 10))) return date.toISOString();
  }
  throw new Error("No free publication slot within a year");
}

/** Every channel directory under the education tree (domains nest under services/). */
export function channelDirectories(root = EDUCATION_ROOT) {
  const channels = [];
  const visit = (domain) => {
    const dir = join(domain, "channels");
    if (existsSync(dir)) for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory() && existsSync(join(dir, entry.name, "config.json"))) channels.push(join(dir, entry.name));
    }
    const services = join(domain, "services");
    if (existsSync(services)) for (const entry of readdirSync(services, { withFileTypes: true })) if (entry.isDirectory()) visit(join(services, entry.name));
  };
  visit(root);
  const ids = channels.map((dir) => readJson(join(dir, "config.json")).id);
  if (new Set(ids).size !== ids.length) throw new Error("Duplicate education channel identifier");
  return channels.sort();
}

export function channelIds(root = EDUCATION_ROOT) {
  return channelDirectories(root).map((dir) => readJson(join(dir, "config.json")).id).sort();
}

export function containedPath(base, path) {
  const resolved = resolve(base, path), delta = relative(base, resolved);
  if (delta === ".." || delta.startsWith("../") || isAbsolute(delta)) throw new Error("Curriculum content must stay within its course directory");
  return resolved;
}

/** One channel with its course and lessons. */
export function loadChannel(id, root = EDUCATION_ROOT) {
  if (!/^[a-z0-9-]+$/u.test(id)) throw new Error("Invalid channel identifier");
  const directory = channelDirectories(root).find((dir) => readJson(join(dir, "config.json")).id === id);
  if (!directory) throw new Error(`Unknown education channel: ${id}`);
  const config = readJson(join(directory, "config.json"));
  if (!config.youtubeChannelId || !config.refreshTokenEnv || !["explainer", "cinematic"].includes(config.video?.format) || typeof config.curriculum !== "string") throw new Error(`Invalid channel configuration: ${id}`);
  const curriculumPath = containedPath(root, relative(root, resolve(directory, config.curriculum)));
  const { lessons, ...course } = readJson(curriculumPath);
  if (!Array.isArray(lessons) || lessons.some((l) => !/^[a-z0-9-]+$/u.test(l.id) || !l.title) || new Set(lessons.map((l) => l.id)).size !== lessons.length) throw new Error(`Invalid curriculum: ${curriculumPath}`);
  nextSlot(config.schedule);
  return { ...config, directory, curriculumPath, curriculumDirectory: dirname(curriculumPath), course, curriculum: lessons, editorial: { ...course, ...config.editorial } };
}

export function episodeDirectory(config, lessonId) {
  if (!/^[a-z0-9-]+$/u.test(lessonId)) throw new Error("Invalid lesson identifier");
  return join(config.directory, "production", "episodes", lessonId);
}

export function lessonReportPath(config, lesson) {
  return containedPath(config.curriculumDirectory, lesson.report || `lessons/${lesson.id}/report.md`);
}

/** Load KEY=value lines from every .env from this package up to the filesystem root, never overriding the environment. */
export function loadEnvironment() {
  for (let dir = PACKAGE_ROOT; ; dir = dirname(dir)) {
    const path = join(dir, ".env");
    if (existsSync(path)) {
      const values = parseEnv(readFileSync(path, "utf8"));
      for (const [key, value] of Object.entries(values)) if (!(key in process.env)) process.env[key] = value;
    }
    if (dirname(dir) === dir) break;
  }
}
