import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import textToSpeech from "@google-cloud/text-to-speech";
import { put } from "@vercel/blob";
import type { Article } from "../src/lib/types";

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "audio-cache.json");

const VOICE = { languageCode: "en-US", name: "en-US-Neural2-F" };
const SPEAKING_RATE = 0.95;
const MAX_CHARS_PER_REQUEST = 4500;

interface AudioCacheEntry {
  url: string;
  createdAt: string;
  contentHash: string;
  blobKey: string;
}

interface AudioCacheFile {
  version: 1;
  updatedAt: string;
  entries: Record<string, AudioCacheEntry>;
}

function emptyCache(): AudioCacheFile {
  return { version: 1, updatedAt: new Date().toISOString(), entries: {} };
}

export function loadAudioCache(): AudioCacheFile {
  if (!fs.existsSync(CACHE_FILE)) return emptyCache();
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as AudioCacheFile;
    if (parsed.version !== 1 || !parsed.entries) return emptyCache();
    return parsed;
  } catch {
    return emptyCache();
  }
}

export function saveAudioCache(cache: AudioCacheFile) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  cache.updatedAt = new Date().toISOString();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

function stripMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)(.*?)\1/g, "$2")
    .replace(/(\*|_)(.*?)\1/g, "$2")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/\n{2,}/g, "\n\n")
    .trim();
}

function chunkText(text: string, limit: number): string[] {
  if (text.length <= limit) return [text];
  const chunks: string[] = [];
  const paragraphs = text.split(/\n\n+/);
  let buf = "";
  for (const p of paragraphs) {
    if ((buf + "\n\n" + p).length > limit && buf.length > 0) {
      chunks.push(buf);
      buf = p;
    } else {
      buf = buf ? buf + "\n\n" + p : p;
    }
    while (buf.length > limit) {
      chunks.push(buf.slice(0, limit));
      buf = buf.slice(limit);
    }
  }
  if (buf) chunks.push(buf);
  return chunks;
}

function hashContent(text: string): string {
  return crypto.createHash("sha1").update(text).digest("hex").slice(0, 12);
}

async function synthesizeChunk(
  client: InstanceType<typeof textToSpeech.TextToSpeechClient>,
  text: string,
): Promise<Buffer> {
  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: VOICE,
    audioConfig: { audioEncoding: "MP3", speakingRate: SPEAKING_RATE },
  });
  if (!response.audioContent) throw new Error("empty audioContent from TTS");
  return Buffer.from(response.audioContent as Uint8Array);
}

function makeClient() {
  const keyJson = process.env.GCP_TTS_KEY;
  if (!keyJson) throw new Error("GCP_TTS_KEY env var missing");
  const credentials = JSON.parse(keyJson);
  return new textToSpeech.TextToSpeechClient({ credentials });
}

export async function synthesizeArticles(articles: Article[]): Promise<Article[]> {
  if (articles.length === 0) return articles;
  const blobToken = process.env.BLOB_READ_WRITE_TOKEN;
  if (!blobToken) {
    console.warn("[audio] BLOB_READ_WRITE_TOKEN missing — skipping TTS");
    return articles;
  }
  if (!process.env.GCP_TTS_KEY) {
    console.warn("[audio] GCP_TTS_KEY missing — skipping TTS");
    return articles;
  }

  const cache = loadAudioCache();
  let client: InstanceType<typeof textToSpeech.TextToSpeechClient>;
  try {
    client = makeClient();
  } catch (err) {
    console.warn("[audio] failed to init TTS client:", (err as Error).message);
    return articles;
  }
  const out: Article[] = [];

  for (const article of articles) {
    const text = stripMarkdown(article.learnerContent);
    const contentHash = hashContent(text);
    const existing = cache.entries[article.id];
    if (existing && existing.contentHash === contentHash) {
      console.log(`[audio] cache hit: ${article.id}`);
      out.push({ ...article, audioUrl: existing.url });
      continue;
    }

    try {
      const chunks = chunkText(text, MAX_CHARS_PER_REQUEST);
      console.log(`[audio] synthesizing ${article.id} (${text.length} chars, ${chunks.length} chunks)`);
      const buffers: Buffer[] = [];
      for (const chunk of chunks) {
        buffers.push(await synthesizeChunk(client, chunk));
      }
      const mp3 = Buffer.concat(buffers);
      const blobKey = `audio/${article.id}.mp3`;
      const blob = await put(blobKey, mp3, {
        access: "public",
        contentType: "audio/mpeg",
        token: blobToken,
        allowOverwrite: true,
      });
      cache.entries[article.id] = {
        url: blob.url,
        createdAt: new Date().toISOString(),
        contentHash,
        blobKey,
      };
      console.log(`[audio] uploaded ${article.id} → ${blob.url}`);
      out.push({ ...article, audioUrl: blob.url });
    } catch (err) {
      console.warn(`[audio] failed for ${article.id}:`, (err as Error).message);
      out.push(article);
    }
  }

  saveAudioCache(cache);
  return out;
}
