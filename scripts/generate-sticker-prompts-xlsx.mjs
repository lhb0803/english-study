import * as XLSX from "xlsx";
import { writeFileSync } from "node:fs";

const COLORS = {
  A: "warm rose pink with cherry blush",
  B: "honey amber and orange",
  C: "bubblegum pink",
  D: "sky blue with periwinkle",
  E: "warm sand beige",
  F: "tangerine orange and coral red",
  G: "mellow yellow and golden amber",
  H: "pale buttercream and lemon",
  I: "lavender and soft violet",
  J: "fuchsia pink and magenta",
  K: "mint cyan and sky",
  L: "sunny yellow and orange",
  M: "cream and dove gray",
  N: "mint green and sage",
  O: "lilac purple",
  P: "cool slate gray",
  Q: "royal gold and amber",
  R: "dusty rose pink",
  S: "sunshine yellow",
  T: "deep tangerine and amber",
  U: "soft purple and fuchsia",
  V: "cherry red and rose",
  W: "ocean blue and cyan",
  X: "violet indigo",
  Y: "spring lime green",
  Z: "warm taupe gray",
};

function buildPrompt(letter, color) {
  return `A cute plush 3D collectible sticker of a fluffy monster character whose body forms the capital letter "${letter}". The character has soft fuzzy fur texture, oversized glossy round black eyes with bright highlights, tiny pointed plush ears, rosy cheeks, and a small friendly grin with two tiny visible teeth. Chubby kawaii proportions, vinyl plush toy aesthetic, ugly-cute charm.

Color palette: ${color}, with gentle pastel gradient and soft glossy highlights. Soft studio lighting, subtle drop shadow underneath.

Composition: centered, square 1:1, die-cut sticker style on a pure white background, thin clean white outline around the character.

The capital letter "${letter}" must be clearly readable as the silhouette of the character's body. No other text, no logos, no humans, no realistic photography, no background scenery.

Style keywords: kawaii, plush, vinyl figure, designer toy, soft pastel, sticker, blind box collectible.`;
}

const rows = Object.entries(COLORS).map(([letter, color], i) => ({
  NUM: i + 1,
  LETTER: letter,
  COLOR: color,
  PROMPT: buildPrompt(letter, color),
}));

const ws = XLSX.utils.json_to_sheet(rows, {
  header: ["NUM", "LETTER", "COLOR", "PROMPT"],
});

ws["!cols"] = [
  { wch: 6 },
  { wch: 8 },
  { wch: 38 },
  { wch: 100 },
];

for (let r = 1; r <= rows.length; r++) {
  const cellAddr = XLSX.utils.encode_cell({ c: 3, r });
  if (ws[cellAddr]) {
    ws[cellAddr].s = { alignment: { wrapText: true, vertical: "top" } };
  }
}

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, "stickers");

const out = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
const path = new URL("../sticker-prompts.xlsx", import.meta.url);
writeFileSync(path, out);
console.log(`Wrote ${path.pathname} (${rows.length} rows)`);
