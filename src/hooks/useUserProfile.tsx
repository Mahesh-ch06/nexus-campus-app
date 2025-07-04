
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
      setProfile(null);
      setLoading(false);
      setFetchAttempted(false);
      return;
    }

    // Prevent multiple simultaneous fetches
    if (fetchAttempted && loading) {
      console.log("Profile fetch already in progress, skipping...");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setFetchAttempted(true);
      console.log("Fetching profile for user:", user.id);
      
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        console.log("Profile loaded successfully");
      } else {
        console.log("No profile found for user, profile needs to be created");
        setProfile(null);
        // Don't set this as an error - just indicate no profile exists
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user, fetchAttempted, loading]);

  useEffect(() => {
    if (!authLoading && user && !fetchAttempted) {
      fetchProfile();
    } else if (!authLoading && !user) {
      // User is not authenticated, reset everything
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

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch 
  };
};
