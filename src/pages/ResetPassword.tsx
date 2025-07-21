import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerRef, setTimerRef] = useState<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Listen for auth state changes to detect successful password updates
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change detected:', event, session?.user?.email);
      
      // If we see a PASSWORD_RECOVERY event and we're currently loading, show success
      if (event === 'PASSWORD_RECOVERY' && loading && !success) {
        console.log('Password recovery detected during loading - showing success');
        setSuccess(true);
        setLoading(false);
        setTimeRemaining(null);
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [loading, success]);

  useEffect(() => {
    const initializeReset = async () => {
      const url = window.location.href;
      console.log('Full reset URL:', url);

      // Method 1: Check for tokens in URL hash (standard Supabase format)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      let accessToken = hashParams.get('access_token');
      let refreshToken = hashParams.get('refresh_token');
      let type = hashParams.get('type');

      // Method 2: Check for tokens in query parameters (if email template uses query format)
      if (!accessToken) {
        const queryParams = new URLSearchParams(window.location.search);
        accessToken = queryParams.get('access_token');
        refreshToken = queryParams.get('refresh_token');
        type = queryParams.get('type');
      }

      // Method 3: Check if this is a Supabase auth callback URL
      if (!accessToken) {
        // Sometimes Supabase sends the tokens in the hash as a query string format
        const hashString = window.location.hash.substring(1);
        if (hashString.includes('access_token=')) {
          const hashAsQuery = new URLSearchParams(hashString);
          accessToken = hashAsQuery.get('access_token');
          refreshToken = hashAsQuery.get('refresh_token');
          type = hashAsQuery.get('type');
        }
      }

      console.log('Reset password tokens found:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type,
        accessTokenLength: accessToken?.length || 0,
        refreshTokenLength: refreshToken?.length || 0,
        accessTokenPreview: accessToken ? `${accessToken.substring(0, 20)}...` : 'None',
        fullAccessToken: accessToken, // Log full token for debugging
        hash: window.location.hash,
        search: window.location.search
      });

      // For password reset, we only need access_token and type=recovery
      // The access_token might be a recovery token (plain string) or JWT
      if (type === 'recovery' && accessToken) {
        try {
          console.log('Attempting to handle recovery token...');
          
          // Check if this is a JWT (3 parts) or a recovery token (plain string)
          const tokenParts = accessToken.split('.');
          const isJWT = tokenParts.length === 3;
          
          console.log('Token analysis:', {
            length: accessToken.length,
            isJWT: isJWT,
            tokenType: isJWT ? 'JWT' : 'Recovery Token',
            token: accessToken
          });

          // Check if link has expired (1 minute = 60 seconds)
          const linkTimeout = 1 * 60 * 1000; // 1 minute in milliseconds
          
          // Check if we already have a stored access time (to handle page refreshes)
          let linkAccessTime = sessionStorage.getItem('resetLinkAccessTime');
          let actualTokenTime = null;
          
          // For JWT tokens, we can extract the actual timestamp
          if (isJWT) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const tokenIat = payload.iat * 1000; // Convert to milliseconds
              actualTokenTime = tokenIat;
              
              console.log('Token timestamp check:', {
                tokenIat: new Date(tokenIat),
                tokenAge: Math.floor((Date.now() - tokenIat) / 1000) + ' seconds',
                hasStoredTime: !!linkAccessTime
              });
            } catch (decodeError) {
              console.log('Could not decode JWT timestamp');
            }
          }
          
          // Determine the reference time for expiration
          let referenceTime;
          if (linkAccessTime) {
            // Use stored time (handles page refresh)
            referenceTime = parseInt(linkAccessTime);
            console.log('Using stored access time from sessionStorage');
          } else if (actualTokenTime) {
            // Use JWT token timestamp for first visit
            referenceTime = actualTokenTime;
            sessionStorage.setItem('resetLinkAccessTime', actualTokenTime.toString());
            console.log('Using JWT token timestamp for first visit');
          } else {
            // Fallback to current time (for non-JWT tokens on first visit)
            referenceTime = Date.now();
            sessionStorage.setItem('resetLinkAccessTime', referenceTime.toString());
            console.log('Using current time as fallback');
          }
          
          // Check if link has expired
          const timeElapsed = Date.now() - referenceTime;
          if (timeElapsed > linkTimeout) {
            console.error('Reset link has expired');
            setValidSession(false);
            setError('This password reset link has expired. Reset links are valid for 1 minute only. Please request a new password reset.');
            return;
          }
          
          console.log('Link expiration status:', {
            referenceTime: new Date(referenceTime),
            timeElapsed: Math.floor(timeElapsed / 1000) + ' seconds',
            timeRemaining: Math.floor((linkTimeout - timeElapsed) / 1000) + ' seconds',
            isValid: timeElapsed <= linkTimeout
          });

          // Additional validation: Try to verify the token is actually valid with Supabase
          let tokenIsValid = false;
          
          if (isJWT) {
            // Handle JWT access token
            console.log('Processing JWT access token...');
            
            let sessionResult;
            if (refreshToken && refreshToken.trim()) {
              sessionResult = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            } else {
              sessionResult = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: '',
              });
            }

            const { data, error } = sessionResult;
            if (error) {
              console.error('JWT session error:', error);
              // Try to decode and validate manually
              try {
                const payload = JSON.parse(atob(tokenParts[1]));
                if (payload.aud === 'authenticated' && payload.user_id) {
                  console.log('JWT is valid, allowing password reset');
                  tokenIsValid = true;
                }
              } catch (decodeError) {
                console.error('JWT decode failed:', decodeError);
                tokenIsValid = false;
              }
            } else {
              console.log('JWT session set successfully:', data?.user?.email);
              tokenIsValid = true;
            }
          } else {
            // Handle recovery token (plain string) - validate with Supabase
            console.log('Processing recovery token (plain string)...');
            
            try {
              // Try to verify the recovery token with Supabase
              const { data, error } = await supabase.auth.verifyOtp({
                token_hash: accessToken,
                type: 'recovery'
              });
              
              if (error) {
                console.error('Recovery token verification failed:', error);
                tokenIsValid = false;
              } else {
                console.log('Recovery token verified successfully:', data?.user?.email);
                tokenIsValid = true;
              }
            } catch (verifyError) {
              console.error('Recovery token verification exception:', verifyError);
              tokenIsValid = false;
            }
          }
          
          // Final validation check
          if (tokenIsValid) {
            console.log('Token validation successful - allowing password reset');
            setValidSession(true);
          } else {
            console.error('Token validation failed');
            setValidSession(false);
            setError('This password reset link is invalid or has been used already. Please request a new password reset.');
          }
        } catch (err) {
          console.error('Exception processing token:', err);
          setValidSession(false);
          setError('An error occurred while processing the reset link. Please try again.');
        }
      } else {
        console.error('Invalid or missing reset parameters:', { 
          type, 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken,
          url: window.location.href
        });
        setValidSession(false);
        
        if (!type || type !== 'recovery') {
          setError('Invalid reset link type. Please request a new password reset from the login page.');
        } else if (!accessToken) {
          setError('Reset link is missing access token. Please request a new password reset.');
        } else {
          setError('Invalid reset link. Please request a new password reset.');
        }
      }
    };

    initializeReset();
  }, []);

  // Countdown timer effect
  useEffect(() => {
    if (validSession === true) {
      const linkTimeout = 1 * 60 * 1000; // 1 minute in milliseconds
      const resetLinkAccessTime = sessionStorage.getItem('resetLinkAccessTime');
      
      if (resetLinkAccessTime) {
        const referenceTime = parseInt(resetLinkAccessTime);
        
        // Set initial time remaining
        const initialTimeElapsed = Date.now() - referenceTime;
        const initialRemaining = Math.max(0, linkTimeout - initialTimeElapsed);
        setTimeRemaining(initialRemaining);
        
        // If already expired, don't start the timer
        if (initialRemaining <= 0) {
          console.log('Reset link already expired on page load');
          setValidSession(false);
          setError('This password reset link has expired. Reset links are valid for 1 minute only. Please request a new password reset.');
          return;
        }
        
        const timer = setInterval(() => {
          const timeElapsed = Date.now() - referenceTime;
          const remaining = Math.max(0, linkTimeout - timeElapsed);
          
          setTimeRemaining(remaining);
          
          if (remaining <= 0) {
            console.log('Reset link expired due to timeout');
            setValidSession(false);
            setError('This password reset link has expired. Reset links are valid for 1 minute only. Please request a new password reset.');
            clearInterval(timer);
          }
        }, 1000);
        
        setTimerRef(timer);
        
        return () => {
          clearInterval(timer);
          setTimerRef(null);
        };
      }
    }
  }, [validSession]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);

    // Stop the countdown timer during password update to prevent expiration conflicts
    if (timerRef) {
      clearInterval(timerRef);
      setTimerRef(null);
      console.log('Countdown timer stopped for password update');
    }

    try {
      // Check if the reset link has expired before attempting password update
      const resetLinkAccessTime = sessionStorage.getItem('resetLinkAccessTime');
      const linkTimeout = 1 * 60 * 1000; // 1 minute in milliseconds
      
      if (resetLinkAccessTime) {
        const accessTime = parseInt(resetLinkAccessTime);
        const timeElapsed = Date.now() - accessTime;
        
        if (timeElapsed > linkTimeout) {
          console.error('Reset link expired during password update');
          setError('This password reset link has expired. Reset links are valid for 1 minute only. Please request a new password reset.');
          setLoading(false);
          return;
        }
        
        console.log('Link expiration check:', {
          timeElapsed: Math.floor(timeElapsed / 1000) + ' seconds',
          timeRemaining: Math.floor((linkTimeout - timeElapsed) / 1000) + ' seconds',
          isValid: timeElapsed <= linkTimeout
        });
      }

      // Get the access token from the URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const queryParams = new URLSearchParams(window.location.search);
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || queryParams.get('refresh_token');

      console.log('Starting password update with token:', {
        hasToken: !!accessToken,
        tokenLength: accessToken?.length || 0,
        tokenType: accessToken?.includes('.') ? 'JWT' : 'Recovery Token'
      });

      let updateResult;
      
      if (accessToken) {
        // Check if this is a JWT or recovery token
        const isJWT = accessToken.includes('.') && accessToken.split('.').length === 3;
        
        if (isJWT) {
          // For JWT tokens, try to set session first
          console.log('Using JWT token for password update...');
          try {
            await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || '',
            });
            console.log('Session set, updating password...');
          } catch (sessionError) {
            console.log('Session setting failed, trying direct update...');
          }
        } else {
          // For recovery tokens, use verifyOtp first to exchange for a session
          console.log('Using recovery token, attempting to verify and update...');
          try {
            // Try to use the recovery token with verifyOtp
            const { data, error } = await supabase.auth.verifyOtp({
              token_hash: accessToken,
              type: 'recovery'
            });
            
            if (error) {
              console.error('Recovery token verification failed:', error);
              // Continue anyway, might still work with updateUser
            } else {
              console.log('Recovery token verified successfully:', data?.user?.email);
            }
          } catch (verifyError) {
            console.log('Recovery verification failed, trying direct update:', verifyError);
          }
        }
        
        // Now attempt to update the password
        updateResult = await supabase.auth.updateUser({
          password: password
        });
      } else {
        // Fallback to normal update if no token
        console.log('No token found, attempting normal password update...');
        updateResult = await supabase.auth.updateUser({
          password: password
        });
      }

      console.log('Password update result:', updateResult);
      const { error: updateError, data: updateData } = updateResult;
      
      console.log('Update response details:', {
        hasError: !!updateError,
        errorMessage: updateError?.message,
        hasData: !!updateData,
        userData: updateData?.user?.email
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message || "Failed to update password. Please try again.");
        toast({
          title: "Password Reset Failed",
          description: updateError.message || "Failed to update password. Please try again.",
          variant: "destructive",
        });
      } else {
        console.log('Password updated successfully!');
        // Show success immediately and clear any remaining timer
        setSuccess(true);
        setLoading(false);
        setTimeRemaining(null); // Hide countdown timer
        
        toast({
          title: "Password Updated",
          description: "Your password has been successfully updated.",
        });
        
        // Wait a moment before signing out to ensure the success state is visible
        setTimeout(async () => {
          try {
            await supabase.auth.signOut();
            console.log('User signed out after password reset');
          } catch (signOutError) {
            console.error('Error signing out:', signOutError);
          }
          
          // Redirect to login after sign out
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        }, 2000); // Show success message for 2 seconds
      }
      
      // Additional fallback: If we see auth state change but no success yet, force success
      setTimeout(() => {
        if (!success && !updateError && !loading) {
          console.log('Fallback: Detected successful auth state change, showing success');
          setSuccess(true);
          setTimeRemaining(null);
          toast({
            title: "Password Updated",
            description: "Your password has been successfully updated.",
          });
        }
      }, 1000);
    } catch (err) {
      console.error('Password reset exception:', err);
      const errorMessage = err instanceof Error ? err.message : "Network error. Please check your connection.";
      setError(errorMessage);
      setLoading(false);
      
      // Restart timer if password update failed and session is still valid
      if (validSession && !timerRef) {
        console.log('Restarting countdown timer after error');
        // This will trigger the useEffect to restart the timer
        setValidSession(true);
      }
      
      toast({
        title: "Password Reset Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  if (validSession === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-center min-h-screen">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (validSession === false) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" size="sm" asChild className="group">
              <Link to="/login" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Login
              </Link>
            </Button>
            <ThemeToggle />
          </div>

          <div className="flex items-center justify-center">
            <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-red-600">Invalid Reset Link</CardTitle>
                <CardDescription>
                  {error || "This password reset link is invalid or has expired."}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                  Please request a new password reset from the login page.
                </p>
                <Button asChild>
                  <Link to="/login">
                    Go to Login
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button variant="ghost" size="sm" asChild className="group">
            <Link to="/login" className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
              Back to Login
            </Link>
          </Button>
          <ThemeToggle />
        </div>

        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {success ? "Password Updated!" : "Set New Password"}
              </CardTitle>
              <CardDescription>
                {success 
                  ? "Your password has been successfully updated. You will be redirected to login."
                  : "Enter your new password below."
                }
              </CardDescription>
              {!success && timeRemaining !== null && (
                <div className="mt-2 text-xs text-orange-600 dark:text-orange-400">
                  ⏰ Link expires in: {Math.floor(timeRemaining / 60000)}:{String(Math.floor((timeRemaining % 60000) / 1000)).padStart(2, '0')}
                </div>
              )}
            </CardHeader>
            <CardContent>
              {success ? (
                <div className="flex flex-col items-center space-y-4 py-6">
                  <CheckCircle className="h-12 w-12 text-green-500" />
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold text-green-600">Password Updated Successfully!</h3>
                    <p className="text-sm text-muted-foreground">
                      Your password has been changed. You will be redirected to the login page.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Please use your new password to log in.
                    </p>
                  </div>
                  <Button onClick={() => navigate("/login")} className="w-full">
                    Go to Login Now
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium">
                      New Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-12"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirm New Password
                    </label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="h-12"
                      required
                      minLength={6}
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <Button type="submit" className="w-full h-12" disabled={loading || success}>
                    {loading ? "Updating Password..." : success ? "Password Updated!" : "Update Password"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;