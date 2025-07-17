
-- This removes the admin-specific viewing policy that could cause recursion errors.
-- A broader policy that allows all authenticated users to view profiles (for features like leaderboards) already exists, so this is just a cleanup step.
DROP POLICY IF EXISTS "Admin users can view all user profiles" ON public.users;
