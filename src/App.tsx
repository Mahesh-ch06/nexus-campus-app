import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { PartnerAuthProvider } from "@/hooks/usePartnerAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import DebugReset from "./pages/DebugReset";
import Dashboard from "./pages/Dashboard";
import PartnerDashboard from "./pages/PartnerDashboard";
import AdminLogin from "./pages/AdminLogin";
import ProviderLogin from "./pages/ProviderLogin";
import ProviderRegister from "./pages/ProviderRegister";
import ClubAdminLogin from "./pages/ClubAdminLogin";
import CreateClub from "./pages/CreateClub";
import ClubAdmin from "./pages/ClubAdmin";
import NotFound from "./pages/NotFound";
import { CampusStorePage } from "./components/store/CampusStorePage";
import StaffPointsPortal from "./pages/StaffPointsPortal";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <PartnerAuthProvider>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/debug-reset" element={<DebugReset />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  <Route path="/provider-login" element={<ProviderLogin />} />
                  <Route path="/provider/login" element={<ProviderLogin />} />
                  <Route path="/provider-register" element={<ProviderRegister />} />
                  <Route path="/provider/register" element={<ProviderRegister />} />
                  <Route path="/club-admin-login" element={<ClubAdminLogin />} />
                  <Route path="/create-club" element={<CreateClub />} />
                  <Route path="/club-admin" element={<ClubAdmin />} />
                  <Route path="/partner-dashboard" element={<PartnerDashboard />} />
                  <Route path="/staff-portal" element={<StaffPointsPortal />} />
                  <Route
                    path="/campus-store"
                    element={
                      <ProtectedRoute>
                        <CampusStorePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </PartnerAuthProvider>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
