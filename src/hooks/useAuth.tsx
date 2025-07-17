/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session, AuthError } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  resetPassword: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("[Auth] Error getting session:", error);
        }
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("[Auth] Exception getting session:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error("[Auth] Sign in error:", error.message);
        return { error };
      }
      
      console.log("[Auth] Sign in successful:", data.user?.email);
      return { error: null };
    } catch (err: unknown) {
      console.error("[Auth] Sign in exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error. Please check your connection.";
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error("[Auth] Sign up error:", error.message);
        return { error };
      }
      
      return { error: null };
    } catch (err: unknown) {
      console.error("[Auth] Sign up exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error. Please check your connection.";
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const signOut = async () => {
    try {
      console.log("[Auth] Starting signout process");
      
      // Clear local state first
      setUser(null);
      setSession(null);
      setLoading(false);
      
      // Clear any session storage
      localStorage.removeItem('campusconnect_session');
      localStorage.removeItem('campusconnect_user');
      localStorage.removeItem('campusconnect_profile');
      
      // Then sign out from Supabase
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Auth] Supabase sign out error:", error);
        // Don't throw error, still consider it a successful logout locally
      }
      
      console.log("[Auth] Signout completed successfully");
      
    } catch (err: unknown) {
      console.error("[Auth] Sign out exception:", err);
      // Even if there's an error, clear local state
      setUser(null);
      setSession(null);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      
      if (error) {
        console.error("[Auth] Password reset error:", error.message);
        return { error };
      }
      
      return { error: null };
    } catch (err: unknown) {
      console.error("[Auth] Password reset exception:", err);
      const errorMessage = err instanceof Error ? err.message : "Network error. Please check your connection.";
      return { error: { message: errorMessage } as AuthError };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
