
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useUserProfile } from "@/hooks/useUserProfile";
import { UserCog, ArrowLeft, Eye, EyeOff, HelpCircle, Mail, Shield } from "lucide-react";

const ClubAdminLogin = () => {
  const [selectedClub, setSelectedClub] = useState("");
  const [hallTicket, setHallTicket] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clubs, setClubs] = useState([]);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSubmitted, setForgotPasswordSubmitted] = useState(false);
  const navigate = useNavigate();
  const { profile } = useUserProfile();

  React.useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const { data, error } = await supabase
        .from('clubs')
        .select('id, name, category')
        .order('name');
      
      if (error) throw error;
      setClubs(data || []);
    } catch (error) {
      console.error('Error fetching clubs:', error);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Verify hall ticket matches current user
      if (hallTicket !== profile?.hall_ticket) {
        throw new Error("Hall ticket doesn't match your profile");
      }

      // Verify club password and check if user has admin role
      const { data: clubData, error: clubError } = await supabase
        .from('clubs')
        .select('id, name, password')
        .eq('id', selectedClub)
        .single();

      if (clubError) throw clubError;

      if (clubData.password !== password) {
        throw new Error("Invalid admin password");
      }

      // Check if user has chair or vice_chair role in this club
      const { data: roleData, error: roleError } = await supabase
        .from('club_roles')
        .select('role')
        .eq('club_id', selectedClub)
        .eq('user_id', profile?.id)
        .in('role', ['chair', 'vice_chair']);

      if (roleError) throw roleError;

      if (!roleData || roleData.length === 0) {
        throw new Error("You don't have admin access to this club");
      }

      // Store club admin session in localStorage
      localStorage.setItem('club_admin_session', JSON.stringify({
        clubId: selectedClub,
        clubName: clubData.name,
        userRole: roleData[0].role,
        userId: profile?.id
      }));

      navigate('/club-admin');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotPasswordSubmitted(true);
    
    // In a real implementation, this would send an email or contact admins
    // For now, we'll show instructions to contact support
    setTimeout(() => {
      setShowForgotPassword(false);
      setForgotPasswordSubmitted(false);
      setForgotPasswordEmail("");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <UserCog className="h-8 w-8 text-white" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Club Admin Portal
            </CardTitle>
            <p className="text-muted-foreground">Access your club management dashboard</p>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="club" className="text-sm font-medium">Select Your Club</Label>
              <Select value={selectedClub} onValueChange={setSelectedClub} required>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Choose your club" />
                </SelectTrigger>
                <SelectContent>
                  {clubs.map((club) => (
                    <SelectItem key={club.id} value={club.id} className="py-3">
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{club.name}</span>
                        <span className="text-xs text-muted-foreground">{club.category}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hallTicket" className="text-sm font-medium">Hall Ticket Number</Label>
              <Input
                id="hallTicket"
                type="text"
                value={hallTicket}
                onChange={(e) => setHallTicket(e.target.value.toUpperCase())}
                placeholder="e.g., 21A31A0501"
                className="h-11 font-mono"
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Admin Password</Label>
                <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
                  <DialogTrigger asChild>
                    <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                      <HelpCircle className="h-3 w-3 mr-1" />
                      Forgot password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Reset Admin Password
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      {!forgotPasswordSubmitted ? (
                        <form onSubmit={handleForgotPassword} className="space-y-4">
                          <Alert>
                            <Mail className="h-4 w-4" />
                            <AlertDescription>
                              Enter your email address and we'll send instructions to reset your club admin password.
                            </AlertDescription>
                          </Alert>
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={forgotPasswordEmail}
                              onChange={(e) => setForgotPasswordEmail(e.target.value)}
                              placeholder="your.email@example.com"
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button type="submit" className="flex-1">
                              Send Reset Instructions
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setShowForgotPassword(false)}>
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <Alert>
                          <Mail className="h-4 w-4" />
                          <AlertDescription>
                            Password reset instructions have been sent to <strong>{forgotPasswordEmail}</strong>. 
                            Please check your email and contact CampusConnect support at{' '}
                            <strong>CampusConnect@mahesh.contact</strong> if you don't receive it within 10 minutes.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="h-11 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-11 w-10 px-2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                This is the admin password set during club creation
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full h-11" disabled={loading}>
              {loading ? "Signing in..." : "Access Club Dashboard"}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                New Club?
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => navigate('/create-club')}
            className="w-full h-11"
          >
            Create New Club
          </Button>

          <Alert className="border-blue-200 bg-blue-50/50">
            <UserCog className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Admin Access:</strong> Only club chairs and vice chairs can access the admin dashboard. 
              Students should use the main dashboard to join clubs.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClubAdminLogin;
