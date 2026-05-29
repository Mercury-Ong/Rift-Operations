-- Run this in Supabase SQL Editor

create table if not exists public.team_datasets (
  id text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.team_datasets enable row level security;

-- Public read so team can view data without auth
drop policy if exists "team_datasets_select_public" on public.team_datasets;
create policy "team_datasets_select_public"
on public.team_datasets
for select
to anon, authenticated
using (true);

-- Team-wide write access for shared browser sessions (anon + authenticated)
drop policy if exists "team_datasets_insert_auth" on public.team_datasets;
drop policy if exists "team_datasets_update_auth" on public.team_datasets;
drop policy if exists "team_datasets_delete_auth" on public.team_datasets;
drop policy if exists "team_datasets_insert_team" on public.team_datasets;
drop policy if exists "team_datasets_update_team" on public.team_datasets;
drop policy if exists "team_datasets_delete_team" on public.team_datasets;

create policy "team_datasets_insert_team"
on public.team_datasets
for insert
to anon, authenticated
with check (true);

create policy "team_datasets_update_team"
on public.team_datasets
for update
to anon, authenticated
using (true)
with check (true);

create policy "team_datasets_delete_team"
on public.team_datasets
for delete
to anon, authenticated
using (true);

-- Ensure realtime broadcasts row changes for this table
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin
      alter publication supabase_realtime add table public.team_datasets;
    exception
      when duplicate_object then null;
    end;
  end if;
end $$;

-- Seed one default row
insert into public.team_datasets (id, payload)
values ('main', '{}'::jsonb)
on conflict (id) do nothing;
