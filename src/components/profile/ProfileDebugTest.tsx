import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserProfile } from '@/services/userService';
import { useAuth } from '@/hooks/useAuth';

export const ProfileDebugTest = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testProfileFetch = async () => {
    if (!user) {
      setTestResult('No user authenticated');
      return;
    }

    setLoading(true);
    setTestResult('Testing profile fetch...');

    try {
      console.log('Direct test: Fetching profile for user:', user.id);
      const profile = await getUserProfile(user.id);
      
      if (profile) {
        setTestResult(`SUCCESS: Profile loaded for ${profile.full_name} (${profile.email})`);
      } else {
        setTestResult('FAILED: No profile found');
      }
    } catch (error) {
      console.error('Direct test error:', error);
      setTestResult(`ERROR: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Profile Debug Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testProfileFetch} disabled={loading || !user}>
          {loading ? 'Testing...' : 'Test Profile Fetch'}
        </Button>
        {testResult && (
          <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded text-sm">
            {testResult}
          </div>
        )}
      </CardContent>
    </Card>
  );
};