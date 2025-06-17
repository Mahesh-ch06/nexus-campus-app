
-- First, drop all existing policies on the users table to ensure a clean slate.
DROP POLICY IF EXISTS "Allow profile creation" ON public.users;
DROP POLICY IF EXISTS "Allow profile viewing" ON public.users;
DROP POLICY IF EXISTS "Allow profile updates" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can view all user profiles" ON public.users;


-- Ensure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- POLICY: Allow profile creation for authenticated users
-- Users can create their own profile entry after authenticating.
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid()::text = firebase_uid);

-- POLICY: Allow users to view their own profile
-- A user can always see their own data.
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid()::text = firebase_uid);

-- POLICY: Allow authenticated users to view all profiles
-- This is necessary for features like the leaderboard where user info is joined.
CREATE POLICY "Authenticated users can view all user profiles"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- POLICY: Allow users to update their own profile
-- A user can update their own profile information.
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid()::text = firebase_uid)
WITH CHECK (auth.uid()::text = firebase_uid);
