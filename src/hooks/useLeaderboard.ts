
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from './useUserProfile';

export interface LeaderboardUser {
  rank: number;
  user_id: string;
  full_name: string | null;
  department: string | null;
  profile_picture_url: string | null;
  activity_points: number;
  is_current_user: boolean;
}

const fetchLeaderboardData = async (currentUserId: string | undefined): Promise<LeaderboardUser[]> => {
  const { data, error } = await supabase
    .from('engagement')
    .select(`
      activity_points,
      user:users!inner (
        id,
        full_name,
        department,
        profile_picture_url
      )
    `)
    .order('activity_points', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    throw new Error('Could not fetch leaderboard data');
  }
  
  if (!data) return [];

  return data
    .map((entry, index) => ({
      rank: index + 1,
      user_id: entry.user.id,
      full_name: entry.user.full_name,
      department: entry.user.department,
      profile_picture_url: entry.user.profile_picture_url,
      activity_points: entry.activity_points || 0,
      is_current_user: entry.user.id === currentUserId
    }));
};

const fetchUserRank = async (userId: string | undefined): Promise<number | null> => {
    if (!userId) return null;

    const { data, error } = await supabase.rpc('get_user_rank', { p_user_id: userId });

    if (error) {
        console.error('Error fetching user rank:', error);
        return null;
    }

    return data?.[0]?.rank ?? null;
}

export const useLeaderboard = () => {
    const { profile } = useUserProfile();
    const userId = profile?.id;

    const { data: leaderboard, isLoading: isLoadingLeaderboard, error: leaderboardError } = useQuery({
        queryKey: ['leaderboard', userId],
        queryFn: () => fetchLeaderboardData(userId),
        enabled: !!userId,
    });

    const { data: currentUserRank, isLoading: isLoadingRank, error: rankError } = useQuery({
        queryKey: ['userRank', userId],
        queryFn: () => fetchUserRank(userId),
        enabled: !!userId,
    });

    const currentUserData = leaderboard?.find(u => u.is_current_user);

    return {
        leaderboard: leaderboard || [],
        currentUserData,
        currentUserRank,
        isLoading: isLoadingLeaderboard || isLoadingRank,
        error: leaderboardError || rankError,
    };
};
