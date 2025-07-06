
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: ReactNode;
  requireEmailVerified?: boolean;
}

const ProtectedRoute = ({ children, requireEmailVerified = true }: ProtectedRouteProps) => {
  const { user, loading, session } = useAuth();

  console.log("[ProtectedRoute] Auth state:", { user: !!user, loading, session: !!session });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-campus-blue mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!user || !session) {
    console.log("[ProtectedRoute] No user or session, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  if (requireEmailVerified && user.email_confirmed_at === null) {
    console.log("[ProtectedRoute] Email not verified");
    toast.error("Please verify your email to access this page.");
    return <Navigate to="/login" replace />;
  }

  console.log("[ProtectedRoute] User authenticated, rendering children");
  return <>{children}</>;
};

export default ProtectedRoute;
