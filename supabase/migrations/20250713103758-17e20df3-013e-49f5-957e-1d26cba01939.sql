-- Fix the get_user_rank function to resolve ambiguous column reference
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id uuid)
RETURNS TABLE(rank bigint)
LANGUAGE plpgsql
AS $function$
BEGIN
  SET search_path = 'public';
  
  RETURN QUERY
  SELECT ranked_users.user_rank
  FROM (
    SELECT 
      user_id, 
      RANK() OVER (ORDER BY activity_points DESC) as user_rank
    FROM public.engagement
  ) as ranked_users
  WHERE ranked_users.user_id = p_user_id;
END;
$function$;