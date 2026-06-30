-- Kleeg fix: permission denied for table projects
-- Run this in Supabase → SQL Editor if project creation fails.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on public.projects to authenticated;
grant select, insert, update, delete on public.project_documents to authenticated;
grant select, insert, update, delete on public.chat_messages to authenticated;

-- Ensure RLS policies exist (safe to re-run)
alter table public.projects enable row level security;
alter table public.project_documents enable row level security;
alter table public.chat_messages enable row level security;

drop policy if exists "Users manage own projects" on public.projects;
create policy "Users manage own projects"
  on public.projects for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage documents in own projects" on public.project_documents;
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

drop policy if exists "Users manage chat in own projects" on public.chat_messages;
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
