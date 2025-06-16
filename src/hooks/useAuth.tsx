
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, onAuthStateChanged, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { cleanupAuthState } from "@/utils/authCleanup";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  supabaseSession: any | null;
  signOut: () => Promise<void>;
  cleanupAndReload: () => void;
  forceSessionSync: () => Promise<void>;
  isSessionSyncing: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  supabaseSession: null,
  signOut: async () => {},
  cleanupAndReload: () => {},
  forceSessionSync: async () => {},
  isSessionSyncing: false,
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
  const [supabaseSession, setSupabaseSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSessionSyncing, setIsSessionSyncing] = useState(false);

  const cleanupAndReload = () => {
    console.log('[Auth] Manual cleanup and reload triggered');
    cleanupAuthState();
    setTimeout(() => {
      window.location.href = '/login';
    }, 500);
  };

  const createSupabaseSession = (firebaseUser: User): any => {
    console.log('[Auth] 🔑 Creating simplified session...');
    
    // Create a simplified session object without problematic JWT tokens
    const session = {
      access_token: `firebase_${firebaseUser.uid}`, // Simple token identifier
      refresh_token: `firebase_${firebaseUser.uid}_refresh`,
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        email_verified: firebaseUser.emailVerified,
        phone: firebaseUser.phoneNumber,
        created_at: firebaseUser.metadata.creationTime,
        updated_at: firebaseUser.metadata.lastSignInTime,
        user_metadata: {
          full_name: firebaseUser.displayName,
          avatar_url: firebaseUser.photoURL,
        },
        app_metadata: {
          provider: "firebase",
          providers: ["firebase"]
        }
      }
    };

    console.log('[Auth] ✅ Created simplified session:', {
      hasUser: !!session.user,
      userId: session.user.id,
      userEmail: session.user.email,
      hasAccessToken: !!session.access_token
    });

    return session;
  };

  const forceSessionSync = async () => {
    if (isSessionSyncing) {
      console.log('[Auth] ⏳ Session sync already in progress, skipping...');
      return;
    }

    console.log('[Auth] 🔄 Force session sync triggered');
    setIsSessionSyncing(true);
    
    try {
      if (user) {
        console.log('[Auth] 🔄 Creating new simplified session...');
        const session = createSupabaseSession(user);
        
        console.log('[Auth] ✅ Setting new session in state');
        setSupabaseSession(session);
      } else {
        console.log('[Auth] ⚠️ Cannot force sync - no Firebase user available');
      }
    } catch (error) {
      console.error('[Auth] ❌ Force session sync failed:', error);
    } finally {
      setIsSessionSyncing(false);
    }
  };

  useEffect(() => {
    console.log('[Auth] 🚀 Setting up auth state listener...');
    
    // Listen to Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('[Auth] 🔥 Firebase auth state changed:', {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        emailVerified: firebaseUser?.emailVerified,
        timestamp: new Date().toISOString()
      });
      
      setUser(firebaseUser);
      setLoading(false);

      if (firebaseUser) {
        try {
          console.log('[Auth] 🔄 Creating simplified session...');
          const session = createSupabaseSession(firebaseUser);
          
          if (session && session.user && session.access_token) {
            console.log('[Auth] ✅ Valid session created, setting in state');
            setSupabaseSession(session);
          } else {
            console.error('[Auth] ❌ Invalid session created');
            setSupabaseSession(null);
          }
          
        } catch (error) {
          console.error('[Auth] ❌ Failed to create simplified session:', error);
          setSupabaseSession(null);
        }
      } else {
        console.log('[Auth] 🚫 No Firebase user, clearing session');
        setSupabaseSession(null);
      }
    });

    return () => {
      console.log('[Auth] 🧹 Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('[Auth] 🚪 Starting sign out process...');
      
      // Clean up auth state first
      const removedCount = cleanupAuthState();
      console.log('[Auth] 🧹 Cleaned up auth state, removed', removedCount, 'keys');
      
      // Sign out from Firebase
      await firebaseSignOut(auth);
      console.log('[Auth] ✅ Firebase sign out complete');
      
      // Clear session
      setSupabaseSession(null);
      console.log('[Auth] 🧹 Cleared session state');
      
    } catch (error) {
      console.error('[Auth] ❌ Error during sign out:', error);
    }
  };

  // Log current auth state every time it changes
  useEffect(() => {
    console.log('[Auth] 📊 Current auth state updated:', {
      hasUser: !!user,
      userEmail: user?.email,
      userUid: user?.uid,
      hasSupabaseSession: !!supabaseSession,
      supabaseUserId: supabaseSession?.user?.id,
      supabaseUserEmail: supabaseSession?.user?.email,
      hasAccessToken: !!supabaseSession?.access_token,
      loading,
      isSessionSyncing,
      timestamp: new Date().toISOString()
    });
  }, [user, supabaseSession, loading, isSessionSyncing]);

  const value = {
    user,
    loading,
    supabaseSession,
    signOut,
    cleanupAndReload,
    forceSessionSync,
    isSessionSyncing,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
