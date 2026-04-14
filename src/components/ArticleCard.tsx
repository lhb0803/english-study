import Link from "next/link";
import { Clock } from "lucide-react";
import type { Article } from "@/lib/types";
import { THEME_COLORS } from "@/lib/types";
import SaveButton from "./SaveButton";

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="block p-5 rounded-2xl bg-white border border-neutral-200 hover:border-neutral-400 hover:shadow-sm transition"
    >
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${THEME_COLORS[article.theme]}`}
        >
          {article.themeLabel}
        </span>
        <SaveButton article={article} compact />
      </div>
      <h2 className="text-lg font-semibold leading-snug mb-2 text-neutral-900">
        {article.title}
      </h2>
      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3 mb-3">
        {article.summary}
      </p>
      <div className="flex items-center gap-3 text-xs text-neutral-500">
        <span>{article.source}</span>
        <span>·</span>
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />
          {article.estimatedMinutes}분
        </span>
        <span>·</span>
        <span className="uppercase font-semibold tracking-wider">{article.difficulty}</span>
      </div>
    </Link>
  );
}
