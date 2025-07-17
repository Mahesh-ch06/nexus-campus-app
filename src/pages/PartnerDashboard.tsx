
import React from 'react';
import { usePartnerAuth } from '@/hooks/usePartnerAuth';
import { PartnerDashboard } from '@/components/partner/PartnerDashboard';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, Package } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import PartnerProtectedRoute from '@/components/partner/PartnerProtectedRoute';

const PartnerDashboardPage = () => {
  const { user, partner, signOut } = usePartnerAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      window.location.href = '/provider-login';
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  if (!user || !partner) {
    return <Navigate to="/provider-login" replace />;
  }

  return (
    <PartnerProtectedRoute>
      <div className="min-h-screen bg-background flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center">
            <div className="mr-auto flex items-center gap-3">
               <a className="flex items-center space-x-2" href="/partner-dashboard">
                <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg flex items-center justify-center">
                  <Package className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-lg">
                  {partner.business_name}
                </span>
              </a>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <PartnerDashboard />
        </main>
      </div>
    </PartnerProtectedRoute>
  );
};

export default PartnerDashboardPage;
