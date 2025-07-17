
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { 
  getCurrentPoints, 
  getPointsHistory, 
  PointsTransaction 
} from '@/services/pointsService';

export const usePoints = () => {
  const { user } = useAuth();
  const [currentPoints, setCurrentPoints] = useState<number>(0);
  const [pointsHistory, setPointsHistory] = useState<PointsTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = useCallback(async () => {
    if (!user) {
      setCurrentPoints(0);
      setPointsHistory([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get current points
      const points = await getCurrentPoints(user.id);
      setCurrentPoints(points);

      // Get user's internal ID for history
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('supabase_uid', user.id)
        .single();

      if (userData) {
        const history = await getPointsHistory(userData.id);
        setPointsHistory(history);
      }
    } catch (err) {
      console.error('Failed to fetch points:', err);
      setError('Failed to load points data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchPoints();
  }, [user, fetchPoints]);

  return {
    currentPoints,
    pointsHistory,
    loading,
    error,
    refetch: fetchPoints
  };
};
