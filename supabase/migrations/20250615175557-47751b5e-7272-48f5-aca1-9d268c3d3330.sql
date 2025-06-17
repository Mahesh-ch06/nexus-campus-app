
-- This function creates related records for a new user in other tables.
-- It runs with the permissions of the user who defined it (SECURITY DEFINER)
-- to ensure it can create these records without RLS issues.
CREATE OR REPLACE FUNCTION public.create_user_related_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Create an academic_info record for the new user.
  INSERT INTO public.academic_info (user_id)
  VALUES (NEW.id);
  
  -- Create an engagement record.
  INSERT INTO public.engagement (user_id, last_login)
  VALUES (NEW.id, now());
  
  -- Create a preferences record.
  INSERT INTO public.preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger on the users table.
-- This trigger fires after a new user is inserted and calls the function
-- to set up their related data automatically.
-- We drop it first to ensure we don't have duplicates if it somehow still exists.
DROP TRIGGER IF EXISTS on_new_user_created ON public.users;
CREATE TRIGGER on_new_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_related_data();
