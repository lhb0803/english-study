import fs from "node:fs";
import path from "node:path";
import type { DailyPicks, Article } from "./types";

const PICKS_DIR = path.join(process.cwd(), "public", "picks");
const LATEST = path.join(PICKS_DIR, "latest.json");

export function loadLatestPicks(): DailyPicks | null {
  if (!fs.existsSync(LATEST)) return null;
  const raw = fs.readFileSync(LATEST, "utf-8");
  return JSON.parse(raw) as DailyPicks;
}

export function findArticle(id: string): Article | null {
  const picks = loadLatestPicks();
  if (!picks) return null;
  return picks.articles.find((a) => a.id === id) ?? null;
}
