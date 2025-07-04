
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { UserProfile, getUserProfile } from '@/services/userService';

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching profile for user:", user.id);
      
      const userProfile = await getUserProfile(user.id);
      if (userProfile) {
        setProfile(userProfile);
        console.log("Profile loaded successfully");
      } else {
        console.log("No profile found for user, profile needs to be created");
        setProfile(null);
      }
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      setError("Failed to load profile");
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        fetchProfile();
      } else {
        // User is not authenticated, reset everything
        setProfile(null);
        setLoading(false);
        setError(null);
      }
    }
  }, [user, authLoading, fetchProfile]);

  const refetch = useCallback(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { 
    profile, 
    loading: loading || authLoading, 
    error,
    refetch 
  };
};
