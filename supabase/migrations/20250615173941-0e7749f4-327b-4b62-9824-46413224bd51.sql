
-- This policy allows all signed-in users to view engagement data, which is needed for the leaderboard to work.
CREATE POLICY "Allow authenticated read access to all engagement records"
ON public.engagement
FOR SELECT
TO authenticated
USING (true);

-- This policy allows users to create their own engagement record.
-- This will fix the problem for existing users who are missing one.
CREATE POLICY "Users can insert their own engagement record"
ON public.engagement
FOR INSERT
TO authenticated
WITH CHECK (user_id = public.get_current_user_id());

-- This policy allows users to update their own engagement record.
CREATE POLICY "Users can update their own engagement record"
ON public.engagement
FOR UPDATE
TO authenticated
USING (user_id = public.get_current_user_id());

-- This trigger will automatically create an engagement record for any new user that signs up.
CREATE TRIGGER on_new_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_related_data();
