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

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. In **SQL Editor**, run the schema in `supabase/schema.sql`.
3. In **Authentication → Providers**, enable Email.
4. In **Authentication → URL Configuration**, add:
   - Site URL: `http://localhost:3000`
   - Redirect URL: `http://localhost:3000/auth/callback`

### 3. Configure environment

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
