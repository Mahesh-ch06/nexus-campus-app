
import { useState, useEffect, useCallback } from 'react';
import { useUserProfile } from './useUserProfile';

const VERIFICATION_KEY = 'user_verification_token';

export const usePasswordVerification = () => {
  const [isVerified, setIsVerified] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const { profile } = useUserProfile();

  useEffect(() => {
    // Check if user has a valid verification token
    const token = sessionStorage.getItem(VERIFICATION_KEY);
    setIsVerified(!!token);
  }, []);

  const generateExpectedPassword = (): string | null => {
    if (!profile) return null;
    
    // Extract first name from full_name (take the first word)
    const firstName = profile.full_name.trim().split(' ')[0].toLowerCase();
    
    // Get last 4 digits of hall ticket
    const hallTicket = profile.hall_ticket;
    const last4Digits = hallTicket.slice(-4);
    
    // Generate password: @{firstname}{last4digits}
    return `@${firstName}${last4Digits}`;
  };

  const verifyPassword = useCallback((token: string): boolean => {
    if (token) {
      setIsVerified(true);
      setShowPasswordDialog(false);
      return true;
    }
    return false;
  }, []);

  const requestVerification = () => {
    setShowPasswordDialog(true);
  };

  const clearVerification = () => {
    setIsVerified(false);
    sessionStorage.removeItem(VERIFICATION_KEY);
  };

  const getPasswordFormat = (): string => {
    if (!profile) return '@{yourname}{last4digits}';
    
    const firstName = profile.full_name.trim().split(' ')[0].toLowerCase();
    const last4Digits = profile.hall_ticket.slice(-4);
    
    return `@${firstName}${last4Digits}`;
  };

  return {
    isVerified,
    showPasswordDialog,
    setShowPasswordDialog,
    verifyPassword,
    requestVerification,
    clearVerification,
    getPasswordFormat,
    hasProfile: !!profile
  };
};
