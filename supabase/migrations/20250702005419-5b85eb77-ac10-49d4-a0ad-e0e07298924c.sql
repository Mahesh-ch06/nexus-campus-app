-- Clean up existing conflicting RLS policies on users table
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.users;
DROP POLICY IF EXISTS "Allow authenticated inserts" ON public.users;
DROP POLICY IF EXISTS "Allow profile creation" ON public.users;
DROP POLICY IF EXISTS "Allow user registration" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow user to read their profile" ON public.users;
DROP POLICY IF EXISTS "Allow user to update their profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all user profiles" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view user profiles" ON public.users;

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow service role to do anything (for server-side operations)
CREATE POLICY "Service role can manage all users"
ON public.users
FOR ALL
TO service_role
WITH CHECK (true);

-- Allow authenticated users to insert their own profile where firebase_uid matches auth.uid()
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (firebase_uid = (auth.uid())::text);

-- Allow authenticated users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (firebase_uid = (auth.uid())::text);

-- Allow authenticated users to view all profiles (needed for leaderboard, etc.)
CREATE POLICY "Authenticated users can view all profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Allow authenticated users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (firebase_uid = (auth.uid())::text)
WITH CHECK (firebase_uid = (auth.uid())::text);

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;
GRANT UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;