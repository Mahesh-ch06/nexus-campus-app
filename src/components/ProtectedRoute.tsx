
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
    console.log("[ProtectedRoute] State check - Auth Loading:", authLoading, "Profile Loading:", profileLoading, "User:", !!user, "Profile:", !!profile);
    
    if (authLoading || (user && profileLoading && requireProfile)) {
      console.log("[ProtectedRoute] Still loading, waiting...");
      return;
    }

    // If we've already run the check for this component instance, don't do it again
    if (hasChecked.current) {
      setIsVerifying(false);
      return;
    }

    // Auth is complete, run verification checks
    if (user && requireEmailVerified && user.email_confirmed_at === null) {
      console.log("[ProtectedRoute] Email not verified");
      hasChecked.current = true;
      setIsVerifying(false);
    } else {
      console.log("[ProtectedRoute] Verification complete");
      hasChecked.current = true;
      setIsVerifying(false);
    }
  }, [user, authLoading, profileLoading, requireEmailVerified, requireProfile, profile]);

  const loading = authLoading || (user && profileLoading && requireProfile) || isVerifying;

  console.log("[ProtectedRoute] Final loading state:", loading);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-blue"></div>
      </div>
    );
  }

  if (!user) {
    console.log("[ProtectedRoute] No user, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requireEmailVerified && user.email_confirmed_at === null) {
    console.log("[ProtectedRoute] Email not verified, redirecting to login");
    toast.error("Please verify your email to access this page.");
    return <Navigate to="/login" replace />;
  }

  // If profile is required but doesn't exist, redirect to profile creation
  if (requireProfile && !profile) {
    console.log("[ProtectedRoute] No profile found, redirecting to profile creation");
    return <Navigate to="/create-profile" replace />;
  }

  console.log("[ProtectedRoute] All checks passed, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
