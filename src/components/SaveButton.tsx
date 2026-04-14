"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useEffect, useState } from "react";
import type { Article } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function SaveButton({
  article,
  compact = false,
}: {
  article: Article;
  compact?: boolean;
}) {
  const toggleSave = useStore((s) => s.toggleSave);
  const isSaved = useStore((s) => s.saved.some((x) => x.id === article.id));
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const saved = mounted && isSaved;
  const Icon = saved ? BookmarkCheck : Bookmark;

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(article);
      }}
      aria-label={saved ? "저장 취소" : "저장"}
      className={
        compact
          ? `inline-flex items-center justify-center w-9 h-9 rounded-full border ${
              saved
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
            }`
          : `inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition ${
              saved
                ? "bg-neutral-900 text-white border-neutral-900"
                : "bg-white text-neutral-700 border-neutral-200 hover:border-neutral-400"
            }`
      }
    >
      <Icon size={16} />
      {!compact && <span>{saved ? "저장됨" : "저장"}</span>}
    </button>
  );
}
