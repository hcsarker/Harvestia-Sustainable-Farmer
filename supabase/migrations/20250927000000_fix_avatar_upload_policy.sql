-- Fix avatar upload policy to include user ownership check
DO $$
BEGIN
  -- Drop existing policy if it exists
  IF EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'storage' 
    AND tablename = 'objects' 
    AND policyname = 'Users can upload their own avatars'
  ) THEN
    DROP POLICY "Users can upload their own avatars" ON storage.objects;
  END IF;

  -- Create new policy with proper user ownership check
  CREATE POLICY "Users can upload their own avatars"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars' 
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
END $$;