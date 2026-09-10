import { constants } from "node:fs";
import { lstat, mkdir, open, readFile } from "node:fs/promises";
import path from "node:path";

function requiredActivityId(jsonLd) {
  if (typeof jsonLd.id !== "string" || jsonLd.id.trim() === "") {
    throw new TypeError("retained inbox requires each verified ActivityPub activity to have a stable id");
  }
  return jsonLd.id;
}

async function assertPrivateDirectory(directory) {
  const metadata = await lstat(directory);
  if (!metadata.isDirectory() || metadata.isSymbolicLink() || (metadata.mode & 0o077) !== 0) {
    throw new TypeError("retained inbox directory must be one private non-symlink directory");
  }
}

async function assertPrivateRegularFile(filePath) {
  try {
    const metadata = await lstat(filePath);
    if (!metadata.isFile() || metadata.isSymbolicLink() || (metadata.mode & 0o077) !== 0) {
      throw new TypeError("retained inbox file must be one private non-symlink regular file");
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

export function createRetainedInbox(filePath) {
  if (typeof filePath !== "string" || filePath.trim() === "") {
    throw new TypeError("retained inbox path is required");
  }
  const resolved = path.resolve(filePath);
  const directory = path.dirname(resolved);
  let write = Promise.resolve();
  let retainedIds;

  async function prepareCustody() {
    await mkdir(directory, { recursive: true, mode: 0o700 });
    await assertPrivateDirectory(directory);
    await assertPrivateRegularFile(resolved);
  }

  async function items() {
    let source;
    try { source = await readFile(resolved, "utf8"); }
    catch (error) {
      if (error?.code === "ENOENT") return [];
      throw error;
    }
    return source.split("\n").filter(Boolean).map((line, index) => {
      try {
        const item = JSON.parse(line);
        requiredActivityId(item);
        return item;
      } catch (error) {
        throw new TypeError(`retained inbox record ${index + 1} is invalid: ${error.message}`);
      }
    });
  }

  async function loadRetainedIds() {
    if (retainedIds === undefined) retainedIds = new Set((await items()).map((item) => requiredActivityId(item)));
    return retainedIds;
  }

  return Object.freeze({
    async retain(arrival) {
      if (!arrival || typeof arrival !== "object" || !arrival.jsonLd || typeof arrival.jsonLd !== "object") {
        throw new TypeError("retained inbox requires one verified ActivityPub arrival");
      }
      const activityId = requiredActivityId(arrival.jsonLd);
      const pending = write.then(async () => {
        await prepareCustody();
        const known = await loadRetainedIds();
        if (known.has(activityId)) return false;
        const file = await open(resolved, constants.O_APPEND | constants.O_CREAT | constants.O_WRONLY | constants.O_NOFOLLOW, 0o600);
        try {
          const metadata = await file.stat();
          if (!metadata.isFile() || (metadata.mode & 0o077) !== 0) {
            throw new TypeError("retained inbox file must be one private regular file");
          }
          await file.writeFile(`${JSON.stringify(arrival.jsonLd)}\n`, "utf8");
          await file.sync();
          known.add(activityId);
          return true;
        }
        finally { await file.close(); }
      });
      // A transient custody failure must not permanently poison later retries.
      write = pending.catch(() => {});
      const retained = await pending;
      return Object.freeze({ retained, activityId });
    },
    async list({ cursor, limit }) {
      await write;
      const offset = cursor === undefined ? 0 : Number(cursor);
      if (!Number.isSafeInteger(offset) || offset < 0) throw new TypeError("retained inbox cursor is invalid");
      if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) throw new TypeError("retained inbox limit is invalid");
      const newestFirst = (await items()).reverse();
      const page = newestFirst.slice(offset, offset + limit);
      const nextOffset = offset + page.length;
      return Object.freeze({ items: page, totalItems: newestFirst.length, ...(nextOffset < newestFirst.length ? { nextCursor: String(nextOffset) } : {}) });
    },
  });
}
