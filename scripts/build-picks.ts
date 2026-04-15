import fs from "node:fs";
import path from "node:path";
import feedsData from "../src/data/feeds.json" with { type: "json" };
import type { Theme, Article, DailyPicks } from "../src/lib/types";
import { fetchAllFeeds, filterRecent, balanceByTheme, type RawItem } from "./fetch-rss";
import { processWithClaude } from "./process-with-claude";
import { dummyProcess } from "./dummy-process";
import { loadCache, saveCache, getCached, putCached } from "./article-cache";

interface FeedConfig {
  name: string;
  url: string;
  theme: Theme;
}

const feeds = feedsData as FeedConfig[];

function batchLabel(date: Date): string {
  const day = date.getDay();
  if (day === 1) return "월요일 추천";
  if (day === 6) return "토요일 추천";
  return `${date.getMonth() + 1}월 ${date.getDate()}일 추천`;
}

function pickDiverse(candidates: Article[], count: number): Article[] {
  const sorted = [...candidates].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
  const chosen: Article[] = [];
  const usedThemes = new Set<string>();
  for (const art of sorted) {
    if (chosen.length >= count) break;
    if (usedThemes.has(art.theme)) continue;
    chosen.push(art);
    usedThemes.add(art.theme);
  }
  if (chosen.length < count) {
    for (const art of sorted) {
      if (chosen.length >= count) break;
      if (chosen.find((c) => c.id === art.id)) continue;
      chosen.push(art);
    }
  }
  return chosen;
}

async function main() {
  const mode = process.argv.includes("--dummy") || !process.env.ANTHROPIC_API_KEY ? "dummy" : "claude";
  console.log(`[build-picks] starting in ${mode} mode`);

  const raw = await fetchAllFeeds(feeds);
  console.log(`[build-picks] fetched ${raw.length} items from ${feeds.length} feeds`);

  let recent: RawItem[] = filterRecent(raw, 3);
  if (recent.length < 20) recent = filterRecent(raw, 7);
  console.log(`[build-picks] ${recent.length} recent items`);

  const balanced = balanceByTheme(recent, 2);
  const candidates = balanced.slice(0, 10);
  console.log(`[build-picks] ${candidates.length} candidates after balancing`);

  const cache = loadCache();
  const cachedHits: Article[] = [];
  const cacheMisses: RawItem[] = [];
  for (const c of candidates) {
    const hit = getCached(cache, c.id);
    if (hit) cachedHits.push(hit);
    else cacheMisses.push(c);
  }
  console.log(
    `[build-picks] cache: ${cachedHits.length} hits / ${cacheMisses.length} misses`,
  );

  const freshlyProcessed =
    cacheMisses.length === 0
      ? []
      : mode === "dummy"
        ? dummyProcess(cacheMisses)
        : await processWithClaude(cacheMisses);
  console.log(`[build-picks] ${freshlyProcessed.length} newly processed articles`);

  if (freshlyProcessed.length > 0 && mode === "claude") {
    putCached(cache, freshlyProcessed);
    saveCache(cache);
  }

  const processed: Article[] = [...cachedHits, ...freshlyProcessed];

  const eligible = processed.filter((a) => a.difficulty !== undefined);
  const chosen = pickDiverse(eligible, 5);
  console.log(`[build-picks] chose ${chosen.length} articles`);

  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const out: DailyPicks = {
    batchDate: dateStr,
    batchLabel: batchLabel(now),
    articles: chosen,
  };

  const picksDir = path.join(process.cwd(), "public", "picks");
  fs.mkdirSync(picksDir, { recursive: true });
  fs.writeFileSync(path.join(picksDir, "latest.json"), JSON.stringify(out, null, 2));
  fs.writeFileSync(path.join(picksDir, `${dateStr}.json`), JSON.stringify(out, null, 2));
  console.log(`[build-picks] wrote public/picks/latest.json and ${dateStr}.json`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
