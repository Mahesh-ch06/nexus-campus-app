
-- First, let's drop the existing policies and recreate them with the correct logic
DROP POLICY IF EXISTS "Users can join clubs" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can view their own club memberships" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can leave clubs" ON public.club_memberships;
DROP POLICY IF EXISTS "Users can update their own memberships" ON public.club_memberships;

-- Now recreate the policies with the correct user ID mapping
-- Allow users to view their own memberships
CREATE POLICY "Users can view their own club memberships" 
  ON public.club_memberships 
  FOR SELECT 
  USING (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

-- Allow users to insert their own memberships (join clubs)
CREATE POLICY "Users can join clubs" 
  ON public.club_memberships 
  FOR INSERT 
  WITH CHECK (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

-- Allow users to delete their own memberships (leave clubs)
CREATE POLICY "Users can leave clubs" 
  ON public.club_memberships 
  FOR DELETE 
  USING (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );

-- Allow users to update their own membership roles (if needed)
CREATE POLICY "Users can update their own memberships" 
  ON public.club_memberships 
  FOR UPDATE 
  USING (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
  );
