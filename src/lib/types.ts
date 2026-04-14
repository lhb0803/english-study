export type Theme =
  | "politics"
  | "business"
  | "tech"
  | "entertainment"
  | "music"
  | "film"
  | "culture"
  | "lifestyle"
  | "sports"
  | "science";

export type Difficulty = "A2" | "B1" | "B2";

export interface KeyVocab {
  word: string;
  meaning: string;
  example: string;
}

export interface Article {
  id: string;
  source: string;
  sourceUrl: string;
  title: string;
  theme: Theme;
  themeLabel: string;
  summary: string;
  difficulty: Difficulty;
  estimatedMinutes: number;
  learnerContent: string;
  keyVocab: KeyVocab[];
  publishedAt: string;
}

export interface DailyPicks {
  batchDate: string;
  batchLabel: string;
  articles: Article[];
}

export const THEME_LABELS: Record<Theme, string> = {
  politics: "시사",
  business: "경제",
  tech: "기술",
  entertainment: "엔터",
  music: "음악",
  film: "영화",
  culture: "문화",
  lifestyle: "라이프",
  sports: "스포츠",
  science: "과학",
};

export const THEME_COLORS: Record<Theme, string> = {
  politics: "bg-rose-100 text-rose-700 border-rose-200",
  business: "bg-amber-100 text-amber-700 border-amber-200",
  tech: "bg-sky-100 text-sky-700 border-sky-200",
  entertainment: "bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200",
  music: "bg-violet-100 text-violet-700 border-violet-200",
  film: "bg-indigo-100 text-indigo-700 border-indigo-200",
  culture: "bg-teal-100 text-teal-700 border-teal-200",
  lifestyle: "bg-emerald-100 text-emerald-700 border-emerald-200",
  sports: "bg-orange-100 text-orange-700 border-orange-200",
  science: "bg-cyan-100 text-cyan-700 border-cyan-200",
};
