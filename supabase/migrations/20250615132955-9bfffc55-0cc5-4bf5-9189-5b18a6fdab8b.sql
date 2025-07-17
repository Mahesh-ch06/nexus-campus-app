
-- Update the RLS policy for user creation to be more secure.
-- This ensures only the authenticated user can create a profile for themselves.
DROP POLICY IF EXISTS "Allow profile creation" ON public.users;
CREATE POLICY "Allow authenticated users to create their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (firebase_uid = auth.uid()::text);

-- The existing `create_user_related_data` function uses `ON CONFLICT(user_id)`,
-- which requires a unique constraint on the `user_id` column in the related tables.
-- The following commands drop existing constraints before re-creating them to avoid errors.

ALTER TABLE public.academic_info DROP CONSTRAINT IF EXISTS academic_info_user_id_key;
ALTER TABLE public.academic_info ADD CONSTRAINT academic_info_user_id_key UNIQUE (user_id);

ALTER TABLE public.engagement DROP CONSTRAINT IF EXISTS engagement_user_id_key;
ALTER TABLE public.engagement ADD CONSTRAINT engagement_user_id_key UNIQUE (user_id);

ALTER TABLE public.preferences DROP CONSTRAINT IF EXISTS preferences_user_id_key;
ALTER TABLE public.preferences ADD CONSTRAINT preferences_user_id_key UNIQUE (user_id);

-- The trigger to automatically create related data for a new user is missing.
-- This command creates the trigger on the `users` table to run the existing function.
DROP TRIGGER IF EXISTS on_user_created_add_related_data ON public.users;
CREATE TRIGGER on_user_created_add_related_data
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_related_data();
