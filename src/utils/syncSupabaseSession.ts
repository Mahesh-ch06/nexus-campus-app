
export const syncSupabaseSession = async (firebaseIdToken: string) => {
  console.log('[SyncSupabaseSession] 🚀 Starting sync with token length:', firebaseIdToken?.length);
  
  const endpoint = "https://rqhgakhmtbimsroydtnj.functions.supabase.co/sync-firebase-auth";
  
  try {
    console.log('[SyncSupabaseSession] 🌐 Making request to:', endpoint);
    
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": `Bearer ${firebaseIdToken}`
      },
      body: JSON.stringify({}),
    });

    console.log('[SyncSupabaseSession] 📡 Response status:', res.status);
    console.log('[SyncSupabaseSession] 📡 Response headers:', Object.fromEntries(res.headers.entries()));

    if (!res.ok) {
      let errorDetails;
      try {
        errorDetails = await res.json();
        console.error('[SyncSupabaseSession] ❌ Error response body:', errorDetails);
      } catch (parseError) {
        console.error('[SyncSupabaseSession] ❌ Could not parse error response:', parseError);
        const errorText = await res.text();
        console.error('[SyncSupabaseSession] ❌ Raw error response:', errorText);
        errorDetails = { error: `HTTP ${res.status}: ${errorText}` };
      }
      
      throw new Error(errorDetails?.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    const responseData = await res.json();
    console.log('[SyncSupabaseSession] ✅ Success response:', {
      hasSession: !!responseData.session,
      hasUser: !!responseData.session?.user,
      userId: responseData.session?.user?.id,
      hasAccessToken: !!responseData.session?.access_token,
      accessTokenLength: responseData.session?.access_token?.length
    });

    return responseData.session;
    
  } catch (error: any) {
    console.error('[SyncSupabaseSession] ❌ Network or parsing error:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};
