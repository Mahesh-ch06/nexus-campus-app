
-- Drop existing policies if they exist, to ensure a clean state
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;

-- Re-enable Row Level Security for the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.users
FOR INSERT
WITH CHECK (auth.uid()::text = firebase_uid);

-- Create policy that allows users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.users
FOR SELECT
USING (auth.uid()::text = firebase_uid);

-- Create policy that allows users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.users
FOR UPDATE
USING (auth.uid()::text = firebase_uid);
