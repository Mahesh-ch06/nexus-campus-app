import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useUserProfile = () => {
  const { user, loading: authLoading, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use ref to track if we're currently fetching to prevent duplicate calls
  const fetchingRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    // Prevent duplicate calls
    if (fetchingRef.current || lastUserIdRef.current === userId) {
      return;
    }

    fetchingRef.current = true;
    lastUserIdRef.current = userId;

    try {
      setLoading(true);
      setError(null);
      
      const userProfile = await getUserProfile(userId);
      
      if (userProfile) {
        setProfile(userProfile);
      } else {
        setProfile(null);
      }
    } catch (err) {
      console.error("[Profile] Failed to fetch profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Reset refs when user changes or logs out
    if (!user) {
      fetchingRef.current = false;
      lastUserIdRef.current = null;
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }
    
    // Only proceed if auth is not loading and we have a user
    if (!authLoading && user && session) {
      fetchProfile(user.id);
    } else if (!authLoading && !user) {
      // User is not authenticated, reset everything
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, authLoading, session?.access_token, fetchProfile, session, user]);

  const refetch = useCallback(() => {
    fetchingRef.current = false; // Reset fetch guard
    lastUserIdRef.current = null; // Reset user ID guard
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch 
  };
};