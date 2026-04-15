import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink, Clock, ArrowLeft } from "lucide-react";
import { findArticle, loadLatestPicks } from "@/lib/picks";
import { renderSimpleMarkdown } from "@/lib/markdown";
import { THEME_COLORS } from "@/lib/types";
import SaveButton from "@/components/SaveButton";
import ReadProgress from "@/components/ReadProgress";
import BadgeToast from "@/components/BadgeToast";

export function generateStaticParams() {
  const picks = loadLatestPicks();
  return (picks?.articles ?? []).map((a) => ({ id: a.id }));
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const article = findArticle(id);
  if (!article) notFound();

  const html = renderSimpleMarkdown(article.learnerContent);

  return (
    <>
      <ReadProgress article={article} />
      <BadgeToast />
      <div className="pb-16">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 mb-4"
        >
          <ArrowLeft size={14} /> 목록으로
        </Link>

        <div className="flex items-center justify-between mb-4">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${THEME_COLORS[article.theme]}`}
          >
            {article.themeLabel}
          </span>
          <SaveButton article={article} />
        </div>

        <h1 className="text-2xl font-bold leading-tight mb-3">{article.title}</h1>

        <div className="flex items-center gap-3 text-xs text-neutral-500 mb-6">
          <span className="font-medium">{article.source}</span>
          <span>·</span>
          <span className="inline-flex items-center gap-1">
            <Clock size={12} />
            {article.estimatedMinutes}분
          </span>
          <span>·</span>
          <span className="uppercase font-semibold">{article.difficulty}</span>
        </div>

        <article
          className="article-body text-[15px] text-neutral-800 leading-7 space-y-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {article.keyVocab.length > 0 && (
          <section className="mt-10 p-5 rounded-2xl bg-white border border-neutral-200">
            <h2 className="text-base font-semibold mb-3">Key Vocabulary</h2>
            <ul className="space-y-3">
              {article.keyVocab.map((v, i) => (
                <li key={i} className="text-sm">
                  <div>
                    <span className="font-semibold">{v.word}</span>
                    <span className="text-neutral-500"> — {v.meaning}</span>
                  </div>
                  <div className="text-neutral-600 mt-0.5 italic">“{v.example}”</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {article.summary && article.summary.trim().length > 0 && (
          <section
            className={`${article.keyVocab.length > 0 ? "mt-6" : "mt-10"} p-5 rounded-2xl bg-white border border-neutral-200`}
          >
            <h2 className="text-base font-semibold mb-3">한 줄 요약</h2>
            <p className="text-sm text-neutral-700 leading-6 whitespace-pre-line">
              {article.summary}
            </p>
          </section>
        )}

        <div className="mt-8">
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-neutral-300 text-sm hover:border-neutral-500"
          >
            원문에서 더 읽기 <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </>
  );
}
