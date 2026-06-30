-- Kleeg Phase 1 schema
-- Run in Supabase SQL Editor after creating a project.

create extension if not exists "pgcrypto";

-- Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists projects_user_id_idx on public.projects(user_id);

-- Project documents (editor content)
create table if not exists public.project_documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null default 'Untitled',
  content jsonb not null default '{}'::jsonb,
  plain_text text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists project_documents_project_id_idx
  on public.project_documents(project_id);

-- Chat messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  model text,
  created_at timestamptz not null default now()
);

create index if not exists chat_messages_project_id_idx
  on public.chat_messages(project_id);

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists projects_set_updated_at on public.projects;
create trigger projects_set_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

drop trigger if exists project_documents_set_updated_at on public.project_documents;
create trigger project_documents_set_updated_at
  before update on public.project_documents
  for each row execute function public.set_updated_at();

-- Row Level Security
alter table public.projects enable row level security;
alter table public.project_documents enable row level security;
alter table public.chat_messages enable row level security;

-- API role grants (required when "Automatically expose new tables" is off)
grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_documents to authenticated;
grant select, insert, update, delete on public.chat_messages to authenticated;

create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage documents in own projects"
  on public.project_documents for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

create policy "Users manage chat in own projects"
  on public.chat_messages for all
  using (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.projects p
      where p.id = project_id and p.user_id = auth.uid()
    )
  );

-- Auto-create a default document when a project is created
create or replace function public.create_default_document()
returns trigger as $$
begin
  insert into public.project_documents (project_id, title, content, plain_text)
  values (new.id, 'Main document', '{}'::jsonb, '');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists projects_create_default_document on public.projects;
create trigger projects_create_default_document
  after insert on public.projects
  for each row execute function public.create_default_document();
