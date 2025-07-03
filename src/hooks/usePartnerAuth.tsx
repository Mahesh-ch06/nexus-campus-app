
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { PartnerProfile } from "@/utils/partnerSupabaseAuth";

interface PartnerAuthContextType {
  user: User | null;
  session: Session | null;
  partner: PartnerProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const PartnerAuthContext = createContext<PartnerAuthContextType>({
  user: null,
  session: null,
  partner: null,
  loading: true,
  signOut: async () => {},
});

export const usePartnerAuth = () => {
  const context = useContext(PartnerAuthContext);
  if (!context) {
    throw new Error("usePartnerAuth must be used within a PartnerAuthProvider");
  }
  return context;
};

interface PartnerAuthProviderProps {
  children: ReactNode;
}

export const PartnerAuthProvider = ({ children }: PartnerAuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [partner, setPartner] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchPartnerProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Partner auth state changed:", event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchPartnerProfile(session.user.id);
        } else {
          setPartner(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchPartnerProfile = async (userId: string) => {
    try {
      // Use consistent column name for authentication
      const { data: vendor, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('firebase_uid', userId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching partner profile:", error);
        setPartner(null);
      } else if (vendor) {
        setPartner(vendor as PartnerProfile);
      } else {
        console.log("No partner profile found for user:", userId);
        setPartner(null);
      }
    } catch (error) {
      console.error("Error fetching partner profile:", error);
      setPartner(null);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    session,
    partner,
    loading,
    signOut,
  };

  return (
    <PartnerAuthContext.Provider value={value}>
      {children}
    </PartnerAuthContext.Provider>
  );
};
