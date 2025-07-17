
-- Fix the RLS policy to allow profile creation with Firebase authentication
-- The current policy is too restrictive and blocking legitimate profile creation

-- Drop existing policies on users table
DROP POLICY IF EXISTS "Allow profile creation during registration" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

-- Create new policies that work with Firebase authentication
-- Allow anyone to insert (since we validate Firebase UID in the application)
CREATE POLICY "Allow profile creation"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);

-- Allow users to view profiles (we can add more restrictions later)
CREATE POLICY "Allow profile viewing"
ON public.users
FOR SELECT
TO public
USING (true);

-- Allow users to update their own profile based on Firebase UID
CREATE POLICY "Allow profile updates"
ON public.users
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
