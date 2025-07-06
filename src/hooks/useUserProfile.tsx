
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useUserProfile = () => {
  const { user, loading: authLoading, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user || !session) {
      console.log("[Profile] No user or session, clearing profile");
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("[Profile] Fetching profile for user:", user.id);
      
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        console.log("[Profile] Profile loaded successfully:", userProfile.full_name);
        setProfile(userProfile);
      } else {
        console.log("[Profile] No profile found for user, profile needs to be created");
        setProfile(null);
      }
    } catch (err) {
      console.error("[Profile] Failed to fetch profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, session]);

  useEffect(() => {
    console.log("[Profile] Auth state changed - User:", !!user, "Auth Loading:", authLoading, "Session:", !!session);
    
    if (!authLoading) {
      if (user && session) {
        fetchProfile();
      } else {
        // User is not authenticated, reset everything
        console.log("[Profile] User not authenticated, clearing profile state");
        setProfile(null);
        setLoading(false);
        setError(null);
      }
    }
  }, [user, authLoading, session, fetchProfile]);

  const refetch = useCallback(() => {
    console.log("[Profile] Manual refetch requested");
    fetchProfile();
  }, [fetchProfile]);

  console.log(`[Profile] Current state - Profile: ${!!profile}, Loading: ${loading}, Error: ${error}`);

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch 
  };
};
