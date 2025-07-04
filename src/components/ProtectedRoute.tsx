
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { Navigate } from "react-router-dom";
import { ReactNode, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerified?: boolean;
  requireProfile?: boolean;
}

const ProtectedRoute = ({ 
  children, 
  requireEmailVerified = true,
  requireProfile = true 
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserProfile();
  const [isVerifying, setIsVerifying] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (authLoading || profileLoading) {
      return;
    }

    // If we've already run the check for this component instance, don't do it again
    if (hasChecked.current) {
      setIsVerifying(false);
      return;
    }

    // If user exists and needs verification, reload to get latest status
    if (user && requireEmailVerified && user.email_confirmed_at === null) {
      hasChecked.current = true;
      setIsVerifying(false);
    } else {
      hasChecked.current = true;
      setIsVerifying(false);
    }
  }, [user, authLoading, profileLoading, requireEmailVerified]);

  const loading = authLoading || profileLoading || isVerifying;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-blue"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireEmailVerified && user.email_confirmed_at === null) {
    toast.error("Please verify your email to access this page.");
    return <Navigate to="/login" replace />;
  }

  // If profile is required but doesn't exist, redirect to profile creation
  if (requireProfile && !profile) {
    console.log("No profile found, redirecting to profile creation");
    return <Navigate to="/create-profile" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
