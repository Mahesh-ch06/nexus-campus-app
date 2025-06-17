import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cleanupAuthState } from "@/utils/authCleanup";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { syncSupabaseSession } from "@/utils/syncSupabaseSession";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabaseSession: Session | null;
  signOut: () => Promise<void>;
  cleanupAndReload: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabaseSession: null,
  signOut: async () => {},
  cleanupAndReload: () => {},
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
  const [supabaseSession, setSupabaseSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const cleanupAndReload = () => {
    console.log('[Auth] Manual cleanup and reload triggered');
    cleanupAuthState();
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  useEffect(() => {
    console.log('[Auth] 🚀 Initializing AuthProvider...');
    setLoading(true);

    // Firebase is the source of truth for auth state.
    const unsubscribeFirebase = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log(`[Auth] 🔥 Firebase auth state changed. User: ${firebaseUser?.uid}`);
      setUser(firebaseUser);

      if (firebaseUser) {
        console.log('[Auth] 🔄 Syncing Firebase session to Supabase via Edge Function...');
        try {
          const token = await firebaseUser.getIdToken();
          const newSupabaseSession = await syncSupabaseSession(token);

          if (newSupabaseSession && newSupabaseSession.access_token && newSupabaseSession.refresh_token) {
            const { error } = await supabase.auth.setSession({
              access_token: newSupabaseSession.access_token,
              refresh_token: newSupabaseSession.refresh_token,
            });

            if (error) {
              console.error('[Auth] ❌ Error setting Supabase session from synced data:', error);
              setSupabaseSession(null);
            } else {
              // After setting session, we can get it to update our state.
              const { data: { session } } = await supabase.auth.getSession();
              setSupabaseSession(session);
              console.log('[Auth] ✅ Supabase session synced via Edge Function.');
            }
          } else {
            console.error('[Auth] ❌ Sync function did not return a valid session.');
            setSupabaseSession(null);
          }
        } catch (error) {
          console.error('[Auth] ❌ Error syncing with Supabase Edge Function:', error);
          await supabase.auth.signOut();
          setSupabaseSession(null);
        }
      } else {
        console.log('[Auth] 🚫 No Firebase user. Signing out of Supabase.');
        await supabase.auth.signOut();
        setSupabaseSession(null);
      }
      setLoading(false);
    });
    
    // Also listen to Supabase auth changes, e.g. for token refresh.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(`[Auth] Supabase auth state changed: ${event}`);
      if (session !== supabaseSession) {
        setSupabaseSession(session);
      }
    });

    return () => {
      console.log('[Auth] 🧹 Cleaning up auth listeners');
      unsubscribeFirebase();
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[Auth] 🚪 Starting sign out process...');
      
      const removedCount = cleanupAuthState();
      console.log('[Auth] 🧹 Cleaned up auth state, removed', removedCount, 'keys');
      
      await firebaseSignOut(auth);
      console.log('[Auth] ✅ Firebase sign out complete');
      // onAuthStateChanged will handle Supabase signout and clearing state.
      
    } catch (error) {
      console.error('[Auth] ❌ Error during sign out:', error);
    }
  };

  useEffect(() => {
    console.log('[Auth] 📊 Current auth state updated:', {
      hasUser: !!user,
      userEmail: user?.email,
      hasSupabaseSession: !!supabaseSession,
      hasAccessToken: !!supabaseSession?.access_token,
      loading,
      timestamp: new Date().toISOString()
    });
  }, [user, supabaseSession, loading]);

  const value = {
    user,
    loading,
    supabaseSession,
    signOut,
    cleanupAndReload,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
