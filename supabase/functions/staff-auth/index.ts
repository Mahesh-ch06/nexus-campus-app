
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { password } = await req.json();
    
    if (!password) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get staff password from Supabase secrets
    const staffPassword = Deno.env.get('STAFF_PASSWORD');
    
    if (!staffPassword) {
      console.error('STAFF_PASSWORD not configured in secrets');
      return new Response(
        JSON.stringify({ success: false, error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Verify password
    const isValid = password === staffPassword;
    
    if (isValid) {
      // Generate a secure session token (simple implementation)
      const sessionToken = crypto.randomUUID();
      
      // Log successful authentication
      console.log('Staff authentication successful');
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          sessionToken,
          message: 'Authentication successful' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // Log failed attempt
      console.log('Staff authentication failed - invalid password');
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid password' 
        }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    console.error('Staff auth error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
