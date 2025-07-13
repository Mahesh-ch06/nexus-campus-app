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
      console.log("[Profile] Skipping fetch - already fetching or same user ID");
      return;
    }

    fetchingRef.current = true;
    lastUserIdRef.current = userId;

    try {
      setLoading(true);
      setError(null);
      console.log("[Profile] Fetching profile for user:", userId);
      
      const userProfile = await getUserProfile(userId);
      
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
      fetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    console.log("[Profile] Auth state changed - User:", !!user, "Auth Loading:", authLoading, "Session:", !!session);
    
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
      console.log("[Profile] User authenticated, checking if fetch needed...");
      fetchProfile(user.id);
    } else if (!authLoading && !user) {
      // User is not authenticated, reset everything
      console.log("[Profile] User not authenticated, clearing profile state");
      setProfile(null);
      setLoading(false);
      setError(null);
    }
  }, [user?.id, authLoading, session?.access_token]); // Removed fetchProfile from dependencies

  const refetch = useCallback(() => {
    console.log("[Profile] Manual refetch requested");
    fetchingRef.current = false; // Reset fetch guard
    lastUserIdRef.current = null; // Reset user ID guard
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