import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useUserProfile = () => {
  const { user, loading: authLoading, session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable function that doesn't change between renders
  const fetchProfile = useCallback(async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      console.log("[Profile] Fetching profile for user:", userId);
      
      // Add timeout to prevent infinite loading
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );
      
      const userProfile = await Promise.race([
        getUserProfile(userId),
        timeoutPromise
      ]) as UserProfile | null;
      
      if (userProfile) {
        console.log("[Profile] Profile loaded successfully:", userProfile.full_name);
        setProfile(userProfile);
      } else {
        console.log("[Profile] No profile found for user, profile needs to be created");
        setProfile(null);
      }
    } catch (err: any) {
      console.error("[Profile] Failed to fetch profile:", err);
      if (err.message === 'Profile fetch timeout') {
        setError("Profile loading timed out. Please refresh the page.");
      } else {
        setError("Failed to load profile");
      }
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - this function is stable

  // Single useEffect with minimal dependencies
  useEffect(() => {
    console.log("[Profile] Auth state changed - User:", !!user, "Auth Loading:", authLoading, "Session:", !!session);
    
    if (authLoading) {
      // Still loading auth, wait
      console.log("[Profile] Auth still loading, waiting...");
      return;
    }

    if (!user || !session) {
      // Not authenticated, clear everything
      console.log("[Profile] User not authenticated, clearing profile state");
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }

    // User is authenticated, fetch profile
    console.log("[Profile] User authenticated, fetching profile...");
    fetchProfile(user.id);
  }, [user?.id, authLoading, session?.access_token, fetchProfile]);

  const refetch = useCallback(() => {
    console.log("[Profile] Manual refetch requested");
    if (user?.id) {
      fetchProfile(user.id);
    }
  }, [user?.id, fetchProfile]);

  console.log(`[Profile] Current state - Profile: ${!!profile}, Loading: ${loading}, Error: ${error}`);

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch 
  };
};