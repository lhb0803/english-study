export const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export const LETTER_EMOJI: Record<string, string> = {
  A: "🍎", B: "🐻", C: "🐱", D: "🦆", E: "🐘",
  F: "🦊", G: "🦒", H: "🐹", I: "🍦", J: "🤹",
  K: "🪁", L: "🦁", M: "🐭", N: "🪺", O: "🐙",
  P: "🐼", Q: "👑", R: "🐰", S: "🌟", T: "🐯",
  U: "🦄", V: "🎻", W: "🌊", X: "✨", Y: "🪀",
  Z: "🦓",
};

export const LETTER_GRADIENT: Record<string, string> = {
  A: "from-rose-200 to-pink-300",
  B: "from-amber-200 to-orange-300",
  C: "from-pink-200 to-rose-300",
  D: "from-sky-200 to-blue-300",
  E: "from-stone-200 to-stone-300",
  F: "from-orange-200 to-red-300",
  G: "from-yellow-200 to-amber-300",
  H: "from-amber-100 to-yellow-200",
  I: "from-indigo-100 to-violet-200",
  J: "from-fuchsia-200 to-pink-300",
  K: "from-cyan-200 to-sky-300",
  L: "from-yellow-200 to-orange-300",
  M: "from-stone-100 to-stone-200",
  N: "from-emerald-200 to-green-300",
  O: "from-violet-200 to-purple-300",
  P: "from-slate-200 to-zinc-300",
  Q: "from-amber-300 to-yellow-400",
  R: "from-pink-200 to-rose-300",
  S: "from-yellow-200 to-amber-300",
  T: "from-orange-300 to-amber-400",
  U: "from-purple-200 to-fuchsia-300",
  V: "from-rose-200 to-red-300",
  W: "from-blue-200 to-cyan-300",
  X: "from-violet-200 to-indigo-300",
  Y: "from-lime-200 to-green-300",
  Z: "from-neutral-200 to-stone-300",
};

export function pickRandomLetter(collected: string[]): string | null {
  const remaining = ALPHABET.filter((l) => !collected.includes(l));
  if (remaining.length === 0) return null;
  return remaining[Math.floor(Math.random() * remaining.length)];
}
