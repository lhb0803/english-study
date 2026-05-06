"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import {
  ALPHABET,
  LETTER_EMOJI,
  LETTER_GRADIENT,
  LETTERS_WITH_STICKER,
} from "@/lib/letters";

export default function LetterGrid() {
  const collected = useStore((s) => s.letters);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const has = (l: string) => mounted && collected.includes(l);
  const count = mounted ? collected.length : 0;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="text-lg font-semibold">알파벳 스티커</h2>
        <span className="text-xs text-neutral-500">{count} / 26</span>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {ALPHABET.map((letter) => {
          const owned = has(letter);
          const hasRealSticker = owned && LETTERS_WITH_STICKER.has(letter);
          const gradient = LETTER_GRADIENT[letter] ?? "from-pink-200 to-rose-300";

          let bgClass: string;
          if (!owned) {
            bgClass = "bg-neutral-100 border border-dashed border-neutral-300";
          } else if (hasRealSticker) {
            bgClass = "bg-transparent";
          } else {
            bgClass = `bg-gradient-to-br ${gradient} shadow-sm`;
          }

          return (
            <div
              key={letter}
              className={`relative aspect-square rounded-2xl flex items-center justify-center transition ${bgClass}`}
            >
              {hasRealSticker ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/stickers/${letter}.png`}
                  alt={`Letter ${letter} sticker`}
                  className="w-full h-full object-contain"
                />
              ) : owned ? (
                <>
                  <span className="absolute -top-1 -right-1 text-sm drop-shadow">
                    {LETTER_EMOJI[letter]}
                  </span>
                  <span className="text-lg font-extrabold text-white drop-shadow-sm">
                    {letter}
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold text-neutral-300">
                  {letter}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-neutral-500">
        아티클을 완독할 때마다 알파벳 스티커가 한 개 도착해요.
      </p>
    </div>
  );
}
