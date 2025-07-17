
-- Update the RLS policies to allow profile creation during registration
-- We need to temporarily allow inserts without authentication for the registration process

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- Create a more permissive insert policy that allows profile creation during registration
CREATE POLICY "Allow profile creation during registration"
ON public.users
FOR INSERT
WITH CHECK (true);

-- Keep the existing policies for SELECT and UPDATE
-- Users can still only view and update their own profiles once authenticated
