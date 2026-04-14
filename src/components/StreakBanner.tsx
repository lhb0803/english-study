"use client";

import { Flame } from "lucide-react";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";

export default function StreakBanner() {
  const streak = useStore((s) => s.streakCount);
  const completed = useStore((s) => s.completed.length);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-20 rounded-2xl bg-neutral-100 animate-pulse" />;
  }

  return (
    <div className="rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 border border-amber-200 p-4 flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-2xl shadow-sm">
        <Flame className="text-orange-500" size={24} />
      </div>
      <div className="flex-1">
        <div className="text-sm text-neutral-600">연속 학습</div>
        <div className="text-lg font-semibold text-neutral-900">
          {streak > 0 ? `🔥 ${streak}일 연속 공부 중!` : "오늘 첫 학습을 시작해보세요"}
        </div>
      </div>
      <div className="text-right">
        <div className="text-xs text-neutral-500">완독</div>
        <div className="text-lg font-semibold text-neutral-900">{completed}</div>
      </div>
    </div>
  );
}
