"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Article, Theme } from "./types";
import { evaluateBadges } from "./badges";

interface CompletedRecord {
  id: string;
  theme: Theme;
  title: string;
  source: string;
  completedAt: string;
}

interface SavedRecord {
  id: string;
  theme: Theme;
  themeLabel: string;
  title: string;
  source: string;
  summary: string;
  savedAt: string;
}

interface StoreState {
  saved: SavedRecord[];
  completed: CompletedRecord[];
  lastReadDate: string | null;
  streakCount: number;
  badges: string[];
  lastAwarded: string | null;
  isSaved(id: string): boolean;
  isCompleted(id: string): boolean;
  toggleSave(article: Article): void;
  removeSaved(id: string): void;
  markCompleted(article: Article): void;
  clearLastAwarded(): void;
}

function todayStr() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isYesterday(prev: string, now: string) {
  const p = new Date(prev + "T00:00:00");
  const n = new Date(now + "T00:00:00");
  const diff = (n.getTime() - p.getTime()) / (1000 * 60 * 60 * 24);
  return diff === 1;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      saved: [],
      completed: [],
      lastReadDate: null,
      streakCount: 0,
      badges: [],
      lastAwarded: null,

      isSaved: (id) => get().saved.some((s) => s.id === id),
      isCompleted: (id) => get().completed.some((c) => c.id === id),

      toggleSave: (article) => {
        const { saved } = get();
        if (saved.some((s) => s.id === article.id)) {
          set({ saved: saved.filter((s) => s.id !== article.id) });
        } else {
          set({
            saved: [
              {
                id: article.id,
                theme: article.theme,
                themeLabel: article.themeLabel,
                title: article.title,
                source: article.source,
                summary: article.summary,
                savedAt: new Date().toISOString(),
              },
              ...saved,
            ],
          });
        }
      },

      removeSaved: (id) => set({ saved: get().saved.filter((s) => s.id !== id) }),

      markCompleted: (article) => {
        const state = get();
        if (state.completed.some((c) => c.id === article.id)) return;

        const today = todayStr();
        let streak = state.streakCount;
        if (state.lastReadDate === today) {
          // keep streak
        } else if (state.lastReadDate && isYesterday(state.lastReadDate, today)) {
          streak += 1;
        } else {
          streak = 1;
        }

        const completed = [
          {
            id: article.id,
            theme: article.theme,
            title: article.title,
            source: article.source,
            completedAt: new Date().toISOString(),
          },
          ...state.completed,
        ];
        const distinctThemes = new Set(completed.map((c) => c.theme)).size;
        const earned = evaluateBadges({
          completedCount: completed.length,
          streakCount: streak,
          distinctThemes,
        });
        const newly = earned.filter((b) => !state.badges.includes(b));

        set({
          completed,
          lastReadDate: today,
          streakCount: streak,
          badges: earned,
          lastAwarded: newly[0] ?? "first-read-toast",
        });
      },

      clearLastAwarded: () => set({ lastAwarded: null }),
    }),
    { name: "english-study-store" },
  ),
);
