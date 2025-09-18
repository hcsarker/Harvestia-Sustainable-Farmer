-- Course Lessons schema for Supabase
-- How to use:
-- 1) Open Supabase Dashboard → SQL Editor
-- 2) Paste all of this file and run
-- 3) Optionally set app.admin_emails so the Admin UI can write lessons

-- Table: public.course_lessons
create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  minutes integer not null default 5 check (minutes > 0),
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

-- Indexes for fast reads and ordering
create index if not exists course_lessons_course_id_idx
  on public.course_lessons(course_id);

create index if not exists course_lessons_course_order_idx
  on public.course_lessons(course_id, order_index);

-- Enable RLS
alter table public.course_lessons enable row level security;

-- Read policy: allow all authenticated users to read lessons
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'course_lessons'
      and policyname = 'Allow read lessons'
  ) then
    create policy "Allow read lessons"
      on public.course_lessons
      for select
      using (auth.role() = 'authenticated');
  end if;
end$$;

-- Write policy: restrict to admins (email-based)
-- Manage admins by setting: select set_config('app.admin_emails', 'admin@your.com,owner@your.com', true);
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'course_lessons'
      and policyname = 'Allow admin write lessons'
  ) then
    create policy "Allow admin write lessons"
      on public.course_lessons
      for all
      using (
        auth.role() = 'authenticated'
        and exists (
          select 1
          from auth.users u
          where u.id = auth.uid()
            and lower(u.email) = any(
              string_to_array(
                coalesce(current_setting('app.admin_emails', true), ''),
                ','
              )
            )
        )
      )
      with check (
        auth.role() = 'authenticated'
        and exists (
          select 1
          from auth.users u
          where u.id = auth.uid()
            and lower(u.email) = any(
              string_to_array(
                coalesce(current_setting('app.admin_emails', true), ''),
                ','
              )
            )
        )
      );
  end if;
end$$;

-- Optional: one-time session-level admin config (not persisted automatically)
-- select set_config('app.admin_emails', 'you@domain.com,other@domain.com', true);
