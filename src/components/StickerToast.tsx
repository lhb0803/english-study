"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  LETTER_EMOJI,
  LETTER_GRADIENT,
  LETTERS_WITH_STICKER,
} from "@/lib/letters";

export default function StickerToast() {
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

  if (lastAwarded.startsWith("letter:")) {
    const letter = lastAwarded.slice(7);
    const hasRealSticker = LETTERS_WITH_STICKER.has(letter);
    const emoji = LETTER_EMOJI[letter] ?? "✨";
    const gradient = LETTER_GRADIENT[letter] ?? "from-pink-200 to-rose-300";

    return (
      <div
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition ${
          visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <div className="flex items-center gap-3 pl-2 pr-5 py-2 rounded-full bg-white shadow-lg border border-neutral-200">
          {hasRealSticker ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={`/stickers/${letter}.png`}
              alt={`Letter ${letter} sticker`}
              className="w-14 h-14 object-contain"
            />
          ) : (
            <div
              className={`relative w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center shadow-inner`}
            >
              <span className="absolute -top-1 -right-1 text-base">{emoji}</span>
              <span className="text-xl font-extrabold text-white drop-shadow-sm">
                {letter}
              </span>
            </div>
          )}
          <div className="text-sm">
            <div className="font-semibold text-neutral-900">새 스티커 획득!</div>
            <div className="text-xs text-neutral-500">알파벳 {letter}를 모았어요</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      }`}
    >
      <div className="flex items-center gap-3 px-5 py-3 rounded-full bg-neutral-900 text-white shadow-lg">
        <span className="text-2xl">✅</span>
        <div className="text-sm font-semibold">완독했어요!</div>
      </div>
    </div>
  );
}
