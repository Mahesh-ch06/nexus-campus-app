
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

/**
 * Checks if the current user has a specific permission.
 * @param permissionName The name of the permission to check (e.g., 'club_admin:manage_members').
 * @returns An object with `hasPermission` boolean and `isLoading` boolean.
 */
export const usePermission = (permissionName: string | null) => {
  const { profile, loading: profileLoading } = useUserProfile();
  const userId = profile?.id;

  const checkPermission = async () => {
    if (!userId || !permissionName) {
      return false;
    }
    
    const { data, error } = await supabase.rpc('user_has_permission', {
      p_user_id: userId,
      p_permission_name: permissionName,
    });

    if (error) {
      console.error(`Error checking permission '${permissionName}':`, error);
      return false;
    }
    
    return data;
  };

  const { data: hasPermission, isLoading, isError } = useQuery({
    queryKey: ['user_permission', userId, permissionName],
    queryFn: checkPermission,
    enabled: !profileLoading && !!userId && !!permissionName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { 
    hasPermission: hasPermission ?? false, 
    isLoading: profileLoading || (isLoading && !isError),
  };
};
