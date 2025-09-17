-- Create public avatars bucket if it does not exist
insert into storage.buckets (id, name, "public")
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Policies for avatars bucket
-- Public read for all objects in avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read for avatars'
  ) then
    create policy "Public read for avatars"
      on storage.objects
      for select
      using (bucket_id = 'avatars');
  end if;
end $$;

-- Allow authenticated users to upload to avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own avatars'
  ) then
    create policy "Users can upload their own avatars"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'avatars');
  end if;
end $$;

-- Allow users to update only their own objects in avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their own avatars'
  ) then
    create policy "Users can update their own avatars"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'avatars' and owner = auth.uid())
      with check (bucket_id = 'avatars' and owner = auth.uid());
  end if;
end $$;

-- Allow users to delete only their own objects in avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own avatars'
  ) then
    create policy "Users can delete their own avatars"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'avatars' and owner = auth.uid());
  end if;
end $$;
