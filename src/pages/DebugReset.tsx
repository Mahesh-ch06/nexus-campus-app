import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const DebugReset = () => {
  const [searchParams] = useSearchParams();
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Get all URL parameters
    const hash = window.location.hash;
    const search = window.location.search;
    const fullUrl = window.location.href;
    
    // Parse hash parameters
    const hashParams = new URLSearchParams(hash.substring(1));
    const hashData: any = {};
    hashParams.forEach((value, key) => {
      hashData[key] = value;
    });
    
    // Parse query parameters
    const queryParams = new URLSearchParams(search);
    const queryData: any = {};
    queryParams.forEach((value, key) => {
      queryData[key] = value;
    });

    setDebugInfo({
      fullUrl,
      hash,
      search,
      hashParams: hashData,
      queryParams: queryData,
      hasAccessToken: !!(hashData.access_token || queryData.access_token),
      hasRefreshToken: !!(hashData.refresh_token || queryData.refresh_token),
      type: hashData.type || queryData.type,
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-blue-950 dark:to-purple-950">
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Password Reset Debug</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Full URL:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs overflow-x-auto">
                    {debugInfo.fullUrl}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Hash Fragment:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                    {debugInfo.hash || 'None'}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Query String:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                    {debugInfo.search || 'None'}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Hash Parameters:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                    {JSON.stringify(debugInfo.hashParams, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Query Parameters:</h3>
                  <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-xs">
                    {JSON.stringify(debugInfo.queryParams, null, 2)}
                  </pre>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Analysis:</h3>
                  <div className="space-y-2 text-sm">
                    <div>Has Access Token: <span className={debugInfo.hasAccessToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.hasAccessToken ? 'Yes' : 'No'}</span></div>
                    <div>Has Refresh Token: <span className={debugInfo.hasRefreshToken ? 'text-green-600' : 'text-red-600'}>{debugInfo.hasRefreshToken ? 'Yes' : 'No'}</span></div>
                    <div>Type: <span className={debugInfo.type === 'recovery' ? 'text-green-600' : 'text-red-600'}>{debugInfo.type || 'None'}</span></div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button asChild className="w-full">
                    <Link to="/reset-password">Go to Reset Password Page</Link>
                  </Button>
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/login">Back to Login</Link>
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      const testUrl = `${window.location.origin}/debug-reset#access_token=test_token&refresh_token=test_refresh&type=recovery`;
                      window.location.href = testUrl;
                    }}
                    className="w-full"
                  >
                    Test with Sample Hash Tokens
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => {
                      const testUrl = `${window.location.origin}/debug-reset?access_token=test_token&refresh_token=test_refresh&type=recovery`;
                      window.location.href = testUrl;
                    }}
                    className="w-full"
                  >
                    Test with Sample Query Tokens
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DebugReset;
