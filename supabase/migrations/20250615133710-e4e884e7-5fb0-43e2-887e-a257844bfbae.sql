
-- Revert the user creation policy to be more permissive to allow registration.
-- The previous policy was too strict and blocked new user sign-ups because
-- it requires a JWT secret configuration in Supabase that is not yet in place.

-- Drop the strict policy that was recently added
DROP POLICY IF EXISTS "Allow authenticated users to create their own profile" ON public.users;

-- Re-create the more permissive policy that allows the application to handle the insertion logic.
-- This policy relies on application-level checks for security during registration.
CREATE POLICY "Allow profile creation"
ON public.users
FOR INSERT
TO public
WITH CHECK (true);
