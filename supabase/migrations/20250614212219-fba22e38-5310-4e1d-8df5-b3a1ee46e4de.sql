
CREATE OR REPLACE FUNCTION public.get_user_rank(p_user_id uuid)
RETURNS TABLE(rank BIGINT)
LANGUAGE sql
STABLE
AS $function$
  SELECT rank
  FROM (
    SELECT 
      user_id, 
      RANK() OVER (ORDER BY activity_points DESC) as rank
    FROM public.engagement
  ) as ranked_users
  WHERE user_id = p_user_id;
$function$;
