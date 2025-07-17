import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { AuthError } from "@supabase/supabase-js";
import { signInPartner, getPartnerAuthErrorMessage, sendPartnerPasswordResetEmail } from "@/utils/partnerSupabaseAuth";
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";

export const ProviderLoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await signInPartner(email, password);
      toast.success("Signed in successfully!");
      navigate("/partner-dashboard");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      setError(errorMessage);
      console.error("Authentication error:", error);
      // Check if error has AuthError properties before passing to getPartnerAuthErrorMessage
      const supabaseErrorMessage = error && typeof error === 'object' && 'message' in error 
        ? getPartnerAuthErrorMessage(error as AuthError)
        : "An authentication error occurred";
      toast.error(supabaseErrorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (resetEmail: string) => {
    if (!resetEmail) {
      toast.error("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await sendPartnerPasswordResetEmail(resetEmail);
      toast.success("Password reset link sent! Please check your email.");
      setIsForgotPassOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to send reset email";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">Partner Portal</CardTitle>
              <CardDescription>Sign in to manage your services</CardDescription>
            </CardHeader>
            <CardContent className="p-8 pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Mail className="h-4 w-4" />
                    Business Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="manager@business.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Lock className="h-4 w-4" />
                      Password
                    </Label>
                    <Button
                      type="button"
                      variant="link"
                      onClick={() => setIsForgotPassOpen(true)}
                      className="text-sm text-green-600 dark:text-green-400 font-medium h-auto p-0 hover:underline"
                    >
                      Forgot password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 focus:border-green-500 pr-12"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-12 px-3 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {error && <p className="text-sm font-medium text-destructive">{error}</p>}

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center text-center pt-0 pb-8">
              <p className="text-gray-600 dark:text-gray-400">
                Not a partner yet?{" "}
                <Link to="/provider/register" className="text-green-600 dark:text-green-400 hover:underline font-semibold">
                  Register Here
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
      <ForgotPasswordDialog
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
        onPasswordReset={handleForgotPassword}
        isLoading={isLoading}
        defaultEmail={email}
      />
    </>
  );
};
