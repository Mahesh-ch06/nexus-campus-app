-- Rename firebase_uid to supabase_uid in users table
ALTER TABLE public.users RENAME COLUMN firebase_uid TO supabase_uid;

-- Update RLS policies to use the new column name
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Recreate policies with the new column name
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (supabase_uid = (auth.uid())::text);

CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (supabase_uid = (auth.uid())::text);

CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (supabase_uid = (auth.uid())::text)
WITH CHECK (supabase_uid = (auth.uid())::text);