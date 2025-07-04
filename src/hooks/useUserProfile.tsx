
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetchAttempted, setFetchAttempted] = useState(false);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      console.log("[Profile] No user, clearing profile state");
      setProfile(null);
      setLoading(false);
      setFetchAttempted(false);
      setError(null);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchAttempted && loading) {
      console.log("[Profile] Fetch already in progress, skipping...");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFetchAttempted(true);
      console.log("[Profile] Fetching profile for user:", user.id);
      
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        console.log("[Profile] Profile loaded successfully");
      } else {
        console.log("[Profile] No profile found for user, profile needs to be created");
        setProfile(null);
        // Don't set this as an error - just indicate no profile exists
      }
    } catch (err) {
      console.error("[Profile] Failed to fetch profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, fetchAttempted, loading]);

  useEffect(() => {
    // Wait for auth to finish loading before attempting to fetch profile
    if (authLoading) {
      console.log("[Profile] Waiting for auth to finish loading...");
      return;
    }

    if (user && !fetchAttempted) {
      console.log("[Profile] Auth completed, fetching profile...");
      fetchProfile();
    } else if (!user) {
      // User is not authenticated, reset everything
      console.log("[Profile] No authenticated user, resetting profile state");
      setProfile(null);
      setLoading(false);
      setError(null);
      setFetchAttempted(false);
    }
  }, [user, authLoading, fetchProfile, fetchAttempted]);

  const refetch = useCallback(() => {
    setFetchAttempted(false);
    fetchProfile();
  }, [fetchProfile]);

  // Overall loading state should consider both auth and profile loading
  const overallLoading = authLoading || loading;

  console.log(`[Profile] State - Auth Loading: ${authLoading}, Profile Loading: ${loading}, User: ${!!user}, Profile: ${!!profile}`);

  return { 
    profile, 
    loading: overallLoading, 
    error,
    refetch 
  };
};
