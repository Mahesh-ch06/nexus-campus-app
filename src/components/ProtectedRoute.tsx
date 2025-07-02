
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ReactNode, useState, useEffect, useRef } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerified?: boolean;
}

const ProtectedRoute = ({ children, requireEmailVerified = true }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const hasChecked = useRef(false);

  useEffect(() => {
    if (authLoading) {
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
      // Email not verified - just continue with loader off
      setIsVerifying(false);
    } else {
      // No verification needed, or no user.
      hasChecked.current = true;
      setIsVerifying(false);
    }
  }, [user, authLoading, requireEmailVerified]);

  const loading = authLoading || isVerifying;

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

  return <>{children}</>;
};

export default ProtectedRoute;
