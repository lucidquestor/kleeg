-- Kleeg feature expansion — run in Supabase SQL Editor after schema.sql

-- User language / AI preferences
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_lang text not null default 'yi' check (default_lang in ('en', 'yi', 'he')),
  yiddish_script text not null default 'hebrew' check (yiddish_script in ('hebrew', 'latin')),
  no_nekudos boolean not null default true,
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

create policy "Users manage own preferences"
  on public.user_preferences for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, update, delete on public.user_preferences to authenticated;

-- Project background context (briefs, pasted notes, uploaded text)
alter table public.projects
  add column if not exists context_text text not null default '';
