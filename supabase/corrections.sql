-- Kleeg: AI correction logging for future model training
-- Run in Supabase SQL Editor if you already deployed Phase 1.

create table if not exists public.ai_corrections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  document_id uuid references public.project_documents(id) on delete set null,
  action text not null,
  source_text text not null,
  ai_output text not null,
  corrected_text text not null,
  language text,
  created_at timestamptz not null default now()
);

create index if not exists ai_corrections_user_id_idx on public.ai_corrections(user_id);
create index if not exists ai_corrections_project_id_idx on public.ai_corrections(project_id);
create index if not exists ai_corrections_action_idx on public.ai_corrections(action);

alter table public.ai_corrections enable row level security;

grant select, insert on public.ai_corrections to authenticated;

drop policy if exists "Users insert own corrections" on public.ai_corrections;
create policy "Users insert own corrections"
  on public.ai_corrections for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users read own corrections" on public.ai_corrections;
create policy "Users read own corrections"
  on public.ai_corrections for select
  using (auth.uid() = user_id);
