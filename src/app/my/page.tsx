"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Flame, BookOpen, Award, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";
import { THEME_COLORS } from "@/lib/types";
import BadgeGrid from "@/components/BadgeGrid";

export default function MyPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = useStore((s) => s.saved);
  const completed = useStore((s) => s.completed);
  const streak = useStore((s) => s.streakCount);
  const badges = useStore((s) => s.badges);
  const removeSaved = useStore((s) => s.removeSaved);

  if (!mounted) {
    return <div className="h-40 bg-neutral-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-8 pb-12">
      <section>
        <h1 className="text-2xl font-bold mb-4">마이 페이지</h1>
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Flame className="text-orange-500" size={18} />} label="연속" value={`${streak}일`} />
          <StatCard icon={<BookOpen className="text-sky-500" size={18} />} label="완독" value={`${completed.length}`} />
          <StatCard icon={<Award className="text-amber-500" size={18} />} label="뱃지" value={`${badges.length}`} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">뱃지</h2>
        <BadgeGrid />
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">저장한 아티클</h2>
        {saved.length === 0 ? (
          <p className="text-sm text-neutral-500">아직 저장한 아티클이 없어요.</p>
        ) : (
          <div className="space-y-2">
            {saved.map((s) => (
              <div
                key={s.id}
                className="p-4 rounded-2xl bg-white border border-neutral-200 flex items-start gap-3"
              >
                <Link href={`/article/${s.id}`} className="flex-1 min-w-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${THEME_COLORS[s.theme]}`}
                  >
                    {s.themeLabel}
                  </span>
                  <div className="mt-1 font-medium text-sm leading-snug line-clamp-2">
                    {s.title}
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{s.source}</div>
                </Link>
                <button
                  onClick={() => removeSaved(s.id)}
                  aria-label="저장 해제"
                  className="p-2 text-neutral-400 hover:text-red-500"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">완독한 아티클</h2>
        {completed.length === 0 ? (
          <p className="text-sm text-neutral-500">아직 완독한 아티클이 없어요. 첫 글을 끝까지 읽어보세요!</p>
        ) : (
          <ul className="space-y-2">
            {completed.map((c) => (
              <li key={c.id} className="p-3 rounded-xl bg-white border border-neutral-200 text-sm">
                <div className="font-medium line-clamp-1">{c.title}</div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {c.source} · {new Date(c.completedAt).toLocaleDateString("ko-KR")}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white border border-neutral-200">
      <div className="flex items-center gap-1.5 text-xs text-neutral-500">
        {icon}
        {label}
      </div>
      <div className="text-xl font-bold mt-1">{value}</div>
    </div>
  );
}
