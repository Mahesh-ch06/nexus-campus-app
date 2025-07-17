
-- First, let's enable RLS on club_memberships if it's not already enabled
ALTER TABLE public.club_memberships ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can join clubs" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can view their own club memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can leave clubs" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.club_memberships;

-- Let's use a simpler approach that directly maps the Firebase UID
-- Create policies that directly use the Firebase UID mapping
CREATE POLICY "Users can view their own club memberships" 
  ON public.club_memberships 
  FOR SELECT 
  USING (
    user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

CREATE POLICY "Users can join clubs" 
  ON public.club_memberships 
  FOR INSERT 
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

CREATE POLICY "Users can leave clubs" 
  ON public.club_memberships 
  FOR DELETE 
  USING (
    user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

CREATE POLICY "Users can update their own memberships" 
  ON public.club_memberships 
  FOR UPDATE 
  USING (
    user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

-- Also let's make sure engagement table has proper RLS
ALTER TABLE public.engagement ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own engagement" ON public.engagement;

CREATE POLICY "Users can manage their own engagement" 
  ON public.engagement 
  FOR ALL
  USING (
    user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  )
  WITH CHECK (
    user_id IN (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );
