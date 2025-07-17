
import { usePartnerAuth } from "@/hooks/usePartnerAuth";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface PartnerProtectedRouteProps {
  children: ReactNode;
}

const PartnerProtectedRoute = ({ children }: PartnerProtectedRouteProps) => {
  const { user, partner, loading } = usePartnerAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user || !partner) {
    return <Navigate to="/provider-login" replace />;
  }

  if (partner.status !== 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Account Pending Approval</h2>
          <p className="text-muted-foreground">Your partner account is awaiting approval.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default PartnerProtectedRoute;
