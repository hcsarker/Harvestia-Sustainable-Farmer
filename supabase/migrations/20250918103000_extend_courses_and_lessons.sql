-- Extend courses with richer metadata
-- Extend courses with additional metadata
ALTER TABLE public.courses ADD COLUMN cover_image text;
ALTER TABLE public.courses ADD COLUMN tags text[] DEFAULT '{}'::text[];
ALTER TABLE public.courses ADD COLUMN track text;
ALTER TABLE public.courses ADD COLUMN certificate_template text;

-- Create course_lessons table
create table if not exists public.course_lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  minutes integer not null default 10 check (minutes > 0 and minutes <= 240),
  order_index integer not null default 0,
  created_at timestamp with time zone default now()
);

create index if not exists idx_course_lessons_course on public.course_lessons(course_id);
create index if not exists idx_course_lessons_order on public.course_lessons(course_id, order_index);

-- RLS
alter table public.course_lessons enable row level security;

do $$ begin
  create policy course_lessons_read
    on public.course_lessons for select
    using (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy course_lessons_write
    on public.course_lessons for insert to authenticated
    with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy course_lessons_update
    on public.course_lessons for update to authenticated
    using (true)
    with check (true);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy course_lessons_delete
    on public.course_lessons for delete to authenticated
    using (true);
exception when duplicate_object then null; end $$;
