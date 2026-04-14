export interface BadgeDef {
  id: string;
  label: string;
  description: string;
  icon: string;
}

export const MILESTONE_BADGES: BadgeDef[] = [
  { id: "first-read", label: "첫 완독", description: "첫 아티클을 끝까지 읽었어요", icon: "🎉" },
  { id: "5-reads", label: "꾸준한 독자", description: "5개 아티클 완독", icon: "📚" },
  { id: "10-reads", label: "독서가", description: "10개 아티클 완독", icon: "📖" },
  { id: "25-reads", label: "애독자", description: "25개 아티클 완독", icon: "🏅" },
  { id: "50-reads", label: "마스터", description: "50개 아티클 완독", icon: "🏆" },
  { id: "streak-3", label: "3일 연속", description: "3일 연속 학습", icon: "🔥" },
  { id: "streak-7", label: "일주일 연속", description: "7일 연속 학습", icon: "🔥" },
  { id: "streak-30", label: "한 달 연속", description: "30일 연속 학습", icon: "🌟" },
  { id: "theme-explorer", label: "다방면 탐험가", description: "서로 다른 5개 주제 완독", icon: "🧭" },
];

export function evaluateBadges(state: {
  completedCount: number;
  streakCount: number;
  distinctThemes: number;
}): string[] {
  const out: string[] = [];
  if (state.completedCount >= 1) out.push("first-read");
  if (state.completedCount >= 5) out.push("5-reads");
  if (state.completedCount >= 10) out.push("10-reads");
  if (state.completedCount >= 25) out.push("25-reads");
  if (state.completedCount >= 50) out.push("50-reads");
  if (state.streakCount >= 3) out.push("streak-3");
  if (state.streakCount >= 7) out.push("streak-7");
  if (state.streakCount >= 30) out.push("streak-30");
  if (state.distinctThemes >= 5) out.push("theme-explorer");
  return out;
}
