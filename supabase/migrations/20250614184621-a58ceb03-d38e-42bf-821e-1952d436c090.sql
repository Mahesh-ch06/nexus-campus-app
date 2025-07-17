
-- First, let's fix the engagement table RLS issue
ALTER TABLE public.engagement ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for engagement table
CREATE POLICY "Users can manage their own engagement" 
  ON public.engagement 
  FOR ALL
  USING (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  )
  WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

-- Now let's recreate the club_memberships policies with a more robust approach
DROP POLICY IF EXISTS "Users can join clubs" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can view their own club memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can leave clubs" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.club_memberships;

-- Create a function to get current user ID (more reliable than inline queries)
CREATE OR REPLACE FUNCTION public.get_current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text;
$$;

-- Recreate club membership policies using the function
CREATE POLICY "Users can view their own club memberships" 
  ON public.club_memberships 
  FOR SELECT 
  USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can join clubs" 
  ON public.club_memberships 
  FOR INSERT 
  WITH CHECK (user_id = public.get_current_user_id());

CREATE POLICY "Users can leave clubs" 
  ON public.club_memberships 
  FOR DELETE 
  USING (user_id = public.get_current_user_id());

CREATE POLICY "Users can update their own memberships" 
  ON public.club_memberships 
  FOR UPDATE 
  USING (user_id = public.get_current_user_id());
