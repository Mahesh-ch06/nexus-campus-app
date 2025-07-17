
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
    const { password, userId } = await req.json();
    
    if (!password || !userId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Password and userId required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user profile to generate expected password
    const { data: profile, error } = await supabase
      .from('users')
      .select('full_name, hall_ticket')
      .eq('supabase_uid', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to fetch user profile:', error);
      return new Response(
        JSON.stringify({ success: false, error: 'User not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate expected password server-side
    const firstName = profile.full_name.trim().split(' ')[0].toLowerCase();
    const last4Digits = profile.hall_ticket.slice(-4);
    const expectedPassword = `@${firstName}${last4Digits}`;

    const isValid = password === expectedPassword;
    
    if (isValid) {
      // Generate verification token
      const verificationToken = crypto.randomUUID();
      
      console.log('User verification successful for:', userId);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          verificationToken,
          message: 'Verification successful' 
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      console.log('User verification failed for:', userId);
      
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
    console.error('User verification error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
