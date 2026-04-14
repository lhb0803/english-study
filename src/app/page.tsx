import { loadLatestPicks } from "@/lib/picks";
import ArticleCard from "@/components/ArticleCard";
import StreakBanner from "@/components/StreakBanner";

export default function HomePage() {
  const picks = loadLatestPicks();

  if (!picks || picks.articles.length === 0) {
    return (
      <div className="py-20 text-center text-neutral-500">
        <p>아직 추천 아티클이 준비되지 않았어요.</p>
        <p className="text-sm mt-2">
          <code className="px-2 py-0.5 bg-neutral-100 rounded">npm run picks:dummy</code>
          를 실행해보세요.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <StreakBanner />
      <div className="flex items-baseline justify-between pt-2">
        <h1 className="text-2xl font-bold tracking-tight">오늘의 추천</h1>
        <span className="text-xs text-neutral-500">{picks.batchLabel}</span>
      </div>
      <div className="space-y-3">
        {picks.articles.map((a) => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </div>
  );
}
