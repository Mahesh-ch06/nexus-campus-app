import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, sendPasswordResetEmail, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import ThemeToggle from "@/components/ThemeToggle";
import { cleanupAuthState } from "@/utils/authCleanup";
import { useTheme } from 'next-themes';
import { ForgotPasswordDialog } from "@/components/auth/ForgotPasswordDialog";
import LoginInfoPanel from "@/components/auth/LoginInfoPanel";
import LoginForm from "@/components/auth/LoginForm";
import { supabase } from "@/integrations/supabase/client";
import { getUserProfile } from "@/services/userService";

const Login = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [isForgotPassOpen, setIsForgotPassOpen] = useState(false);

  useEffect(() => {
    // Redirect if already logged in, verified, and auth state is no longer loading.
    if (!loading && user && user.emailVerified) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    try {
      // Clean up any existing auth state before login
      cleanupAuthState();
      
      const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
      
      if (!userCredential.user.emailVerified) {
        toast.error("Your email is not verified. Please check your inbox or spam folder.");
        await sendEmailVerification(userCredential.user);
        toast.info("A new verification email has been sent.");
        await auth.signOut(); // Sign out to prevent stuck state
        setIsLoading(false);
        return;
      }
      
      // The dashboard will handle prompting for profile creation if needed.
      toast.success("Login successful!");
      navigate("/dashboard");
      
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email. Please register first.");
      } else if (error.code === 'auth/wrong-password') {
        toast.error("Incorrect password. Please try again.");
      } else if (error.code === 'auth/invalid-email') {
        toast.error("Invalid email address.");
      } else {
        toast.error("Login failed. Please check your credentials.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    if (!email) {
      toast.error("Please enter your email address.");
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent! Check your inbox.");
      setIsForgotPassOpen(false);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      if (error.code === 'auth/user-not-found') {
        toast.error("No account found with this email.");
      } else {
        toast.error("Failed to send reset email. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // Clean up any existing auth state before Google login
      cleanupAuthState();
      
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      
      // The dashboard will handle prompting for profile creation if needed.
      toast.success("Google sign-in successful!");
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
        <div className="w-10 h-10 border-4 border-blue-500/20 dark:border-blue-400/20 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="group">
            <Link to="/" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Home
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
          <LoginInfoPanel />
          <LoginForm 
            handleSubmit={handleSubmit}
            formData={formData}
            setFormData={setFormData}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            isLoading={isLoading}
            handleGoogleSignIn={handleGoogleSignIn}
            setIsForgotPassOpen={setIsForgotPassOpen}
          />
        </div>
      </div>
      <ForgotPasswordDialog 
        isOpen={isForgotPassOpen}
        onClose={() => setIsForgotPassOpen(false)}
        onPasswordReset={handleForgotPassword}
        isLoading={isLoading}
        defaultEmail={formData.email}
      />
    </div>
  );
};

export default Login;
