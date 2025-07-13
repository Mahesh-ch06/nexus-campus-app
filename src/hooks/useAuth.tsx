
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
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
    console.log("[Auth] 🚀 Initializing Supabase AuthProvider...");
    
    let mounted = true;
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("[Auth] Auth state changed:", event, session?.user ? session.user.email : "No user");
        
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
        console.log("[Auth] Initial session:", session ? `User: ${session.user?.email}` : "No session");
        
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
      console.log("[Auth] Attempting sign in for:", email);
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
    } catch (err: any) {
      console.error("[Auth] Sign in exception:", err);
      return { error: { message: "Network error. Please check your connection." } };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      console.log("[Auth] Attempting sign up for:", email);
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
      
      console.log("[Auth] Sign up successful:", data.user?.email);
      return { error: null };
    } catch (err: any) {
      console.error("[Auth] Sign up exception:", err);
      return { error: { message: "Network error. Please check your connection." } };
    }
  };

  const signOut = async () => {
    try {
      console.log("[Auth] Attempting sign out");
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("[Auth] Sign out error:", error);
        throw error;
      }
      console.log("[Auth] Sign out successful");
    } catch (err: any) {
      console.error("[Auth] Sign out exception:", err);
      throw err;
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  console.log(`[Auth] Current state - User: ${!!user}, Loading: ${loading}, Session: ${!!session}`);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
