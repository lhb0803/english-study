import Parser from "rss-parser";
import crypto from "node:crypto";
import type { Theme } from "../src/lib/types";

interface FeedConfig {
  name: string;
  url: string;
  theme: Theme;
}

export interface RawItem {
  id: string;
  source: string;
  theme: Theme;
  title: string;
  link: string;
  publishedAt: string;
  description: string;
  content: string;
}

const parser = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "english-study-app/1.0" },
  customFields: {
    item: [
      ["content:encoded", "contentEncoded"],
      ["description", "description"],
    ],
  },
});

function hashId(source: string, link: string) {
  return crypto.createHash("sha1").update(source + "|" + link).digest("hex").slice(0, 12);
}

function stripHtml(s: string | undefined): string {
  if (!s) return "";
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function fetchAllFeeds(feeds: FeedConfig[]): Promise<RawItem[]> {
  const results = await Promise.allSettled(
    feeds.map(async (feed) => {
      const t0 = Date.now();
      const parsed = await parser.parseURL(feed.url);
      console.log(`[rss] ${feed.name}: ${parsed.items?.length ?? 0} items in ${Date.now() - t0}ms`);
      return (parsed.items ?? []).map<RawItem>((item) => {
        const link = item.link ?? "";
        const publishedAt = item.isoDate ?? item.pubDate ?? new Date().toISOString();
        const content = stripHtml(
          (item as { contentEncoded?: string }).contentEncoded ??
            item.content ??
            item.contentSnippet ??
            "",
        );
        const description = stripHtml(item.contentSnippet ?? item.summary ?? "");
        return {
          id: hashId(feed.name, link),
          source: feed.name,
          theme: feed.theme,
          title: item.title ?? "(untitled)",
          link,
          publishedAt,
          description,
          content: content || description,
        };
      });
    }),
  );

  const items: RawItem[] = [];
  results.forEach((r, i) => {
    if (r.status === "fulfilled") {
      items.push(...r.value);
    } else {
      console.warn(`[rss] FAIL ${feeds[i].name}: ${r.reason}`);
    }
  });
  return items;
}

export function filterRecent(items: RawItem[], days: number): RawItem[] {
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return items.filter((it) => {
    const t = new Date(it.publishedAt).getTime();
    return !Number.isNaN(t) && t >= cutoff;
  });
}

export function balanceByTheme(items: RawItem[], perTheme: number): RawItem[] {
  const byTheme = new Map<string, RawItem[]>();
  for (const it of items) {
    const arr = byTheme.get(it.theme) ?? [];
    arr.push(it);
    byTheme.set(it.theme, arr);
  }
  const out: RawItem[] = [];
  for (const [, arr] of byTheme) {
    arr.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
    out.push(...arr.slice(0, perTheme));
  }
  return out;
}
