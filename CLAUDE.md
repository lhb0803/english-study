# CLAUDE.md

Guidance for Claude Code (and other coding assistants) working in this repo.

## What this is

A web app that recommends 5 English articles twice a week (Mon & Sat, 06:00 KST) for Korean learners. Each article is rewritten by Claude into a learner-friendly ~600-word version with vocabulary aids. Users read in a detail page; scroll-to-end marks the article as completed and awards badges/streaks (gamification). No accounts — all user state lives in `localStorage`.

Live: https://english-study-one.vercel.app

## Stack

- **Next.js 15 (App Router) + TypeScript + Tailwind CSS v4**
- **zustand** (with `persist`) — saved/completed/streak/badges in `localStorage`
- **rss-parser** — RSS ingestion
- **@anthropic-ai/sdk** — Claude `claude-sonnet-4-6`, system prompt cached via `cache_control: { type: "ephemeral" }`
- **Vercel** hosting, **GitHub Actions** for the biweekly content job

## Pipeline (most important part)

```
GitHub Actions cron (Sun/Fri 21:00 UTC = Mon/Sat 06:00 KST)
  └─ npm run picks:build
       ├─ scripts/fetch-rss.ts         (20s hard per-feed timeout)
       ├─ scripts/article-cache.ts     (data/article-cache.json, 30-day TTL)
       ├─ scripts/process-with-claude.ts (batches of 2, cached system prompt)
       └─ scripts/build-picks.ts       (theme diversity → 5 picks)
  └─ stefanzweifel/git-auto-commit-action
       commits public/picks/latest.json, public/picks/<date>.json,
       data/article-cache.json
  └─ Vercel auto-redeploy on push
```

Pages (`/`, `/article/[id]`, `/my`) read `public/picks/latest.json` at build time — no runtime DB.

## Things that will bite you

1. **Always call `process.exit(0)` from `scripts/build-picks.ts`.** The Anthropic SDK keeps HTTPS sockets alive; without an explicit exit the Node process hangs indefinitely after work finishes (we lost one full Actions run to this).
2. **Cache writes are gated on `mode === "claude"`.** Running `npm run picks:dummy` must NOT pollute `data/article-cache.json` with placeholder content. Keep that guard in place.
3. **The article cache is the token saver.** Keys are `sha1(source|link)[:12]`. Each RSS candidate hits the cache first; only misses go to Claude. A rebuild minutes later should be mostly cache hits. Do not break the key format or the file shape — seed scripts read it too.
4. **Model name.** Use `claude-sonnet-4-6`. An earlier run used a stale ID and a request hung; the current configuration has a 120s timeout and 2 retries to keep failures loud and fast.
5. **Claude JSON output is fragile.** We ask for a raw JSON array (no code fences). Parse failures log `head`/`tail` of the response so you can diagnose. If you change the schema, update both `SYSTEM_PROMPT` in `scripts/process-with-claude.ts` and the `ClaudeResult` type.
6. **Tailwind v4 has no typography plugin by default.** Article body styles live in `src/app/globals.css` under `.article-body` — don't add `prose` classes.
7. **Client components need SSR guards.** Any component that reads zustand state must gate on a `mounted` flag or a `useEffect` to avoid hydration mismatches (see `StreakBanner`, `SaveButton`).
   - `article.summary` (Korean, 2-3 sentences from Claude) is rendered in two places: the home card (`ArticleCard`) and the bottom of the detail page (`src/app/article/[id]/page.tsx`, below Key Vocabulary). Keep both in mind when changing the field's length or format.
8. **Streak is day-based, not batch-based.** `markCompleted` uses local date; the batch cron is twice a week but users can still read saved/past articles on any day to keep their streak.
9. **Workflow secrets.** `ANTHROPIC_API_KEY` lives in GitHub repo Secrets (Actions scope). Vercel does not need it — all Claude work happens in CI, not at runtime.

## Local development

```bash
npm install
npm run picks:dummy     # RSS-only, no Claude (safe, won't touch cache)
npm run dev             # http://localhost:3000
```

To generate real picks locally, put `ANTHROPIC_API_KEY=...` in `.env.local` and run `npm run picks:build`.

## Key files

| Path | Purpose |
|---|---|
| `scripts/build-picks.ts` | Orchestrator; must call `process.exit(0)` |
| `scripts/process-with-claude.ts` | Claude call + JSON parsing |
| `scripts/article-cache.ts` | Dedup cache (30-day TTL) |
| `scripts/fetch-rss.ts` | RSS fetch with per-feed timeout |
| `src/data/feeds.json` | Edit here to add/remove sources |
| `src/lib/store.ts` | zustand store, streak/badge logic |
| `src/lib/badges.ts` | Milestone definitions |
| `.github/workflows/biweekly-picks.yml` | Cron + auto-commit |
