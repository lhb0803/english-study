"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { MILESTONE_BADGES } from "@/lib/badges";

export default function BadgeToast() {
  const lastAwarded = useStore((s) => s.lastAwarded);
  const clearLastAwarded = useStore((s) => s.clearLastAwarded);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastAwarded) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => clearLastAwarded(), 300);
    }, 3500);
    return () => clearTimeout(t);
  }, [lastAwarded, clearLastAwarded]);

  if (!lastAwarded) return null;
  const badge = MILESTONE_BADGES.find((b) => b.id === lastAwarded);
  const isGeneric = lastAwarded === "first-read-toast" || !badge;

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900 text-white shadow-lg">
        <span className="text-2xl">{isGeneric ? "✅" : badge.icon}</span>
        <div className="text-sm">
          <div className="font-semibold">
            {isGeneric ? "완독했어요!" : `${badge.label} 획득!`}
          </div>
          {!isGeneric && (
            <div className="text-xs text-neutral-300">{badge.description}</div>
          )}
        </div>
      </div>
    </div>
  );
}
