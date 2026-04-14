"use client";

import { MILESTONE_BADGES } from "@/lib/badges";
import { useStore } from "@/lib/store";
import { useEffect, useState } from "react";

export default function BadgeGrid() {
  const earned = useStore((s) => s.badges);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="grid grid-cols-3 gap-3">
      {MILESTONE_BADGES.map((b) => {
        const has = mounted && earned.includes(b.id);
        return (
          <div
            key={b.id}
            className={`p-3 rounded-2xl border text-center transition ${
              has
                ? "bg-white border-neutral-300 shadow-sm"
                : "bg-neutral-50 border-neutral-200 opacity-40"
            }`}
          >
            <div className="text-2xl mb-1">{b.icon}</div>
            <div className="text-xs font-semibold text-neutral-800">{b.label}</div>
            <div className="text-[10px] text-neutral-500 leading-tight mt-0.5">
              {b.description}
            </div>
          </div>
        );
      })}
    </div>
  );
}
