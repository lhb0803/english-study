import fs from "node:fs";
import path from "node:path";
import type { Article } from "../src/lib/types";

const CACHE_DIR = path.join(process.cwd(), "data");
const CACHE_FILE = path.join(CACHE_DIR, "article-cache.json");

const TTL_DAYS = 30;

interface CacheFile {
  version: 1;
  updatedAt: string;
  articles: Record<string, Article>;
}

function empty(): CacheFile {
  return { version: 1, updatedAt: new Date().toISOString(), articles: {} };
}

export function loadCache(): CacheFile {
  if (!fs.existsSync(CACHE_FILE)) return empty();
  try {
    const raw = fs.readFileSync(CACHE_FILE, "utf-8");
    const parsed = JSON.parse(raw) as CacheFile;
    if (parsed.version !== 1 || !parsed.articles) return empty();
    return parsed;
  } catch {
    return empty();
  }
}

export function saveCache(cache: CacheFile) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const pruned = pruneExpired(cache);
  pruned.updatedAt = new Date().toISOString();
  fs.writeFileSync(CACHE_FILE, JSON.stringify(pruned, null, 2));
}

function pruneExpired(cache: CacheFile): CacheFile {
  const cutoff = Date.now() - TTL_DAYS * 24 * 60 * 60 * 1000;
  const kept: Record<string, Article> = {};
  let dropped = 0;
  for (const [id, art] of Object.entries(cache.articles)) {
    const t = new Date(art.publishedAt).getTime();
    if (Number.isNaN(t) || t >= cutoff) {
      kept[id] = art;
    } else {
      dropped++;
    }
  }
  if (dropped > 0) console.log(`[cache] pruned ${dropped} expired entries`);
  return { ...cache, articles: kept };
}

export function getCached(cache: CacheFile, id: string): Article | undefined {
  return cache.articles[id];
}

export function putCached(cache: CacheFile, articles: Article[]) {
  for (const a of articles) cache.articles[a.id] = a;
}
