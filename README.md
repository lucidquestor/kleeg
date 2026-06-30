# Kleeg

**From idea to finished work — in one AI workspace.**

Kleeg is a web-based AI workspace where you create projects, edit documents, chat with an assistant that understands project context, and route requests through OpenAI models.

## Phase 1 (current)

- Landing page
- Supabase auth (email + password)
- Project dashboard
- Project workspace with:
  - TipTap document editor
  - AI rewrite actions (improve, translate, summarize, email, etc.)
  - Project-aware chat assistant
  - Model modes: Auto, Fast, Best reasoning, Best writing

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS 4
- Supabase (auth, Postgres, RLS)
- OpenAI API (server-side only)
- TipTap editor

## Deploy to the web (recommended)

Everything runs in the cloud — no local server needed.

### Step 1 — Supabase (database + auth)

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run `supabase/schema.sql`.
3. Enable **Authentication → Providers → Email**.
4. Under **Authentication → URL Configuration**, set:
   - **Site URL:** your Vercel URL (e.g. `https://kleeg.vercel.app`)
   - **Redirect URLs:** `https://kleeg.vercel.app/auth/callback`
5. Copy from **Project Settings → API**:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Step 2 — Vercel (hosting)

1. Open [Import kleeg on Vercel](https://vercel.com/new/import?s=https://github.com/lucidquestor/kleeg).
2. Sign in with GitHub if prompted.
3. Keep defaults (Next.js, root directory empty).
4. Add these **Environment Variables** before deploying:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `OPENAI_API_KEY` | Your OpenAI API key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel URL (e.g. `https://kleeg.vercel.app`) |

5. Click **Deploy**. Vercel gives you a live URL in ~2 minutes.

### Step 3 — Finish Supabase redirect

After Vercel deploys, copy your real URL and update Supabase **URL Configuration** if the domain differs from what you entered in Step 1.

---

## Local development (optional)

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

## Scripts

- `npm run dev` — local development
- `npm run build` — production build
- `npm run start` — run production server locally
- `npm run lint` — ESLint

## Deploy (Vercel)

1. Push this repo to GitHub (`kleeg`).
2. Import the repo in Vercel.
3. Add the same environment variables from `.env.local`.
4. Set Supabase redirect URL to your production domain `/auth/callback`.

## Roadmap

- **Phase 2:** Audio upload, transcription, Yiddish support
- **Phase 3:** File uploads, templates, team accounts
- **Phase 4:** Business agent workflows
- **Phase 5:** Desktop app, coding tools

## Security

- OpenAI and Supabase service keys stay on the server.
- Row Level Security ensures users only access their own projects.
