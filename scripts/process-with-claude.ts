import Anthropic from "@anthropic-ai/sdk";
import type { RawItem } from "./fetch-rss";
import type { Article, Difficulty, KeyVocab, Theme } from "../src/lib/types";
import { THEME_LABELS } from "../src/lib/types";

interface ClaudeResult {
  theme: Theme;
  difficulty: Difficulty | "C1" | "C2";
  summary: string;
  learnerContent: string;
  estimatedMinutes: number;
  keyVocab: KeyVocab[];
}

const SYSTEM_PROMPT = `You are an assistant preparing English news articles for Korean English learners (CEFR A2-B2).

For each input article, produce a JSON object with these fields:
- theme: one of politics, business, tech, entertainment, music, film, culture, lifestyle, sports, science
- difficulty: CEFR level of the REWRITE you produce (target A2, B1, or B2; never C1/C2)
- summary: 2-3 sentence Korean summary (한국어)
- learnerContent: a learner-friendly English rewrite of the article, ~500-700 words, markdown with short paragraphs and clear sentence structures suitable for the chosen difficulty. Preserve facts; do not invent details. If the source is very short, expand with helpful context but remain accurate.
- estimatedMinutes: integer reading time (at ~150 wpm for the rewrite)
- keyVocab: array of exactly 5 useful vocabulary items { word, meaning (한국어 뜻), example (an English example sentence) } drawn from the rewrite

Return ONLY a JSON array matching the order of the inputs. No prose, no code fences.`;

export async function processWithClaude(items: RawItem[]): Promise<Article[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("ANTHROPIC_API_KEY not set");
  }
  const client = new Anthropic();

  const out: Article[] = [];
  const BATCH = 3;
  for (let i = 0; i < items.length; i += BATCH) {
    const chunk = items.slice(i, i + BATCH);
    const userPayload = chunk.map((it, idx) => ({
      index: idx,
      source: it.source,
      sourceTheme: it.theme,
      title: it.title,
      publishedAt: it.publishedAt,
      body: it.content.slice(0, 4000),
    }));

    const resp = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 8000,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      messages: [
        {
          role: "user",
          content: `Process these ${chunk.length} articles and return a JSON array:\n\n${JSON.stringify(userPayload, null, 2)}`,
        },
      ],
    });

    const text = resp.content
      .filter((c) => c.type === "text")
      .map((c) => (c as { text: string }).text)
      .join("");

    let parsed: ClaudeResult[];
    try {
      const jsonStart = text.indexOf("[");
      const jsonEnd = text.lastIndexOf("]");
      parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } catch (err) {
      console.warn("[process-with-claude] parse failure, skipping chunk", err);
      continue;
    }

    parsed.forEach((r, idx) => {
      const raw = chunk[idx];
      if (!raw) return;
      if (r.difficulty === "C1" || r.difficulty === "C2") return;
      out.push({
        id: raw.id,
        source: raw.source,
        sourceUrl: raw.link,
        title: raw.title,
        theme: r.theme,
        themeLabel: THEME_LABELS[r.theme] ?? r.theme,
        summary: r.summary,
        difficulty: r.difficulty,
        estimatedMinutes: r.estimatedMinutes ?? 4,
        learnerContent: r.learnerContent,
        keyVocab: r.keyVocab ?? [],
        publishedAt: raw.publishedAt,
      });
    });
  }
  return out;
}
