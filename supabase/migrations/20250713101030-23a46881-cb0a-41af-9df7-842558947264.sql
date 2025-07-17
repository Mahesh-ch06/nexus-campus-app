-- Improve the user profile creation trigger to handle race conditions better
-- and ensure atomic creation of all related records

-- First, drop the existing trigger and function if they exist
DROP TRIGGER IF EXISTS create_user_related_data_trigger ON public.users;
DROP FUNCTION IF EXISTS public.create_user_related_data();

-- Create an improved function to handle user profile creation
CREATE OR REPLACE FUNCTION public.create_user_related_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Create academic_info record with conflict resolution
  INSERT INTO public.academic_info (user_id, current_semester, cgpa)
  VALUES (NEW.id, 1, 0.0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create engagement record with default values
  INSERT INTO public.engagement (user_id, activity_points, last_login, feedback_count)
  VALUES (NEW.id, 0, now(), 0)
  ON CONFLICT (user_id) DO NOTHING;
  
  -- Create preferences record with default values
  INSERT INTO public.preferences (user_id, notifications_enabled, theme, language)
  VALUES (NEW.id, true, 'System', 'English')
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create the trigger on the users table
CREATE TRIGGER create_user_related_data_trigger
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_user_related_data();

-- Also create a trigger for the automatic role assignment that we had before
-- but make it more robust
CREATE OR REPLACE FUNCTION public.assign_default_role_on_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_student_role_id UUID;
BEGIN
  -- Find the UUID for the 'student' role
  SELECT id INTO v_student_role_id FROM public.roles WHERE name = 'student';

  -- If the role exists, insert a record into user_roles for the new user
  IF v_student_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, v_student_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create the role assignment trigger
DROP TRIGGER IF EXISTS assign_role_on_user_creation ON public.users;
CREATE TRIGGER assign_role_on_user_creation
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_default_role_on_signup();