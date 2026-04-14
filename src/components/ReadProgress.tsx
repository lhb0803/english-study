"use client";

import { useEffect, useRef, useState } from "react";
import type { Article } from "@/lib/types";
import { useStore } from "@/lib/store";

export default function ReadProgress({ article }: { article: Article }) {
  const [progress, setProgress] = useState(0);
  const markCompleted = useStore((s) => s.markCompleted);
  const alreadyCompleted = useStore((s) => s.completed.some((c) => c.id === article.id));
  const didFire = useRef(false);

  useEffect(() => {
    function onScroll() {
      const doc = document.documentElement;
      const scrollTop = window.scrollY;
      const height = doc.scrollHeight - window.innerHeight;
      const p = height > 0 ? Math.min(1, scrollTop / height) : 1;
      setProgress(p);
      if (!didFire.current && p >= 0.95) {
        didFire.current = true;
        markCompleted(article);
      }
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [article, markCompleted]);

  return (
    <div
      className="fixed top-14 left-0 right-0 h-1 bg-neutral-100 z-30"
      aria-hidden
    >
      <div
        className={`h-full transition-[width] duration-150 ${
          alreadyCompleted ? "bg-emerald-500" : "bg-neutral-900"
        }`}
        style={{ width: `${Math.round(progress * 100)}%` }}
      />
    </div>
  );
}
