import type { RawItem } from "./fetch-rss";
import type { Article } from "../src/lib/types";
import { THEME_LABELS } from "../src/lib/types";

export function dummyProcess(items: RawItem[]): Article[] {
  return items.map((raw) => {
    const body = raw.content || raw.description || raw.title;
    const words = body.split(/\s+/).slice(0, 400).join(" ");
    return {
      id: raw.id,
      source: raw.source,
      sourceUrl: raw.link,
      title: raw.title,
      theme: raw.theme,
      themeLabel: THEME_LABELS[raw.theme] ?? raw.theme,
      summary: (raw.description || raw.title).slice(0, 180),
      difficulty: "B1" as const,
      estimatedMinutes: 4,
      learnerContent: `# ${raw.title}\n\n*Source: ${raw.source}*\n\n${words}\n\n---\n\n*이 콘텐츠는 더미 데이터입니다. 실제 배포 시에는 Claude API를 통해 학습자 친화적으로 재작성됩니다.*`,
      keyVocab: [],
      publishedAt: raw.publishedAt,
    };
  });
}
