
-- The get_current_user_id function should run with the permissions of the calling user (invoker), not the one who defined it.
-- This ensures it correctly uses the session's auth.uid() within RLS policies.
CREATE OR REPLACE FUNCTION public.get_current_user_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE
 SECURITY INVOKER
AS $function$
  SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text;
$function$;

-- This function and its dependent triggers were causing conflicts with our security policies.
-- We are removing them to allow the application's code to handle data creation correctly.
-- The CASCADE option will automatically remove any triggers that depend on this function.
DROP FUNCTION IF EXISTS public.create_user_related_data() CASCADE;
