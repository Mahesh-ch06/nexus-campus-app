
import { supabase } from "@/integrations/supabase/client";

export interface AuthResult {
  success: boolean;
  error?: string;
  token?: string;
}

export const staffAuth = {
  async authenticate(password: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.functions.invoke('staff-auth', {
        body: { password }
      });

      if (error) {
        console.error('Staff auth error:', error);
        return { success: false, error: 'Authentication failed' };
      }

      return data || { success: false, error: 'No response from server' };
    } catch (error) {
      console.error('Staff auth exception:', error);
      return { success: false, error: 'Network error' };
    }
  },

  isAuthenticated(): boolean {
    return !!sessionStorage.getItem('staff_session');
  },

  logout(): void {
    sessionStorage.removeItem('staff_session');
  }
};

export const userVerification = {
  async verify(password: string, userId: string): Promise<AuthResult> {
    try {
      const { data, error } = await supabase.functions.invoke('user-verification', {
        body: { password, userId }
      });

      if (error) {
        console.error('User verification error:', error);
        return { success: false, error: 'Verification failed' };
      }

      return data || { success: false, error: 'No response from server' };
    } catch (error) {
      console.error('User verification exception:', error);
      return { success: false, error: 'Network error' };
    }
  },

  isVerified(): boolean {
    return !!sessionStorage.getItem('user_verification_token');
  },

  clearVerification(): void {
    sessionStorage.removeItem('user_verification_token');
  }
};
