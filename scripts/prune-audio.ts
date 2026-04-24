import { list, del } from "@vercel/blob";
import { loadAudioCache, saveAudioCache } from "./synthesize-audio";

const RETENTION_WEEKS = 12;
const RETENTION_MS = RETENTION_WEEKS * 7 * 24 * 60 * 60 * 1000;

export async function pruneOldAudio() {
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.warn("[audio-prune] BLOB_READ_WRITE_TOKEN missing — skipping");
    return;
  }

  const cutoff = Date.now() - RETENTION_MS;
  const cache = loadAudioCache();

  const { blobs } = await list({ prefix: "audio/", token: blobToken });
  const toDelete: string[] = [];
  for (const b of blobs) {
    const uploadedAt = new Date(b.uploadedAt).getTime();
    if (uploadedAt < cutoff) toDelete.push(b.url);
  }

  if (toDelete.length === 0) {
    console.log("[audio-prune] nothing to prune");
    return;
  }

  console.log(`[audio-prune] deleting ${toDelete.length} blobs older than ${RETENTION_WEEKS} weeks`);
  await del(toDelete, { token: blobToken });

  for (const [id, entry] of Object.entries(cache.entries)) {
    if (toDelete.includes(entry.url)) delete cache.entries[id];
  }
  saveAudioCache(cache);
}
