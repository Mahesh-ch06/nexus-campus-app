import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { User, CheckCircle } from 'lucide-react';

interface AutoProfileSetupProps {
  children: React.ReactNode;
}

export const AutoProfileSetup = ({ children }: AutoProfileSetupProps) => {
  const { user, loading: authLoading, session } = useAuth();
  const { profile, loading: profileLoading, refetch } = useUserProfile();
  const [setupStage, setSetupStage] = useState<'checking' | 'ready' | 'needs_profile'>('checking');
  const [loadingMessage, setLoadingMessage] = useState('Checking authentication...');

  useEffect(() => {
    if (authLoading) {
      setLoadingMessage('Checking authentication...');
    } else if (profileLoading && user) {
      setLoadingMessage('Loading your profile...');
    }
  }, [authLoading, profileLoading, user]);

  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (user && session) {
        if (profile) {
          setSetupStage('ready');
        } else {
          setSetupStage('needs_profile');
        }
      } else {
        setSetupStage('ready'); // Not authenticated, show normal flow
      }
    }
  }, [user, session, profile, authLoading, profileLoading]);

  // Show loading while checking auth and profile
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {loadingMessage}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-sm text-muted-foreground">
                {authLoading ? 'Verifying your session...' : 'Fetching profile data...'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show setup completion for authenticated users with profiles
  if (setupStage === 'ready' && user && profile) {
    return (
      <div className="animate-fade-in">
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Welcome back, {profile.full_name}!</span>
          </div>
        </div>
        {children}
      </div>
    );
  }

  // For all other cases (not authenticated, needs profile, etc.), show children normally
  return <>{children}</>;
};