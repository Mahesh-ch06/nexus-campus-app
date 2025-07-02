// Polyfills and Standard Library
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function errorResponse(message: string, status = 401, extra?: Record<string, unknown>) {
  const body = { error: message, ...extra };
  console.error(`[sync-firebase-auth] Error:`, message, extra || "");
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { firebaseIdToken } = await req.json();

    if (!firebaseIdToken) {
      return errorResponse("Missing firebaseIdToken in body", 400);
    }

    console.log(`[sync-firebase-auth] Processing token for verification...`);

    // Build Firebase service account from individual secrets
    const serviceAccount = {
      type: "service_account",
      project_id: Deno.env.get("project_id"),
      private_key_id: Deno.env.get("private_key_id"),
      private_key: Deno.env.get("private_key")?.replace(/\\n/g, '\n'),
      client_email: Deno.env.get("client_email"),
      client_id: Deno.env.get("client_id"),
      auth_uri: Deno.env.get("auth_uri") || "https://accounts.google.com/o/oauth2/auth",
      token_uri: Deno.env.get("token_uri") || "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: Deno.env.get("auth_provider_x509_cert_url") || "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: Deno.env.get("client_x509_cert_url"),
      universe_domain: Deno.env.get("universe_domain") || "googleapis.com"
    };

    // Validate required fields
    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
      console.error(`[sync-firebase-auth] Missing required Firebase service account secrets`);
      console.error(`[sync-firebase-auth] project_id: ${serviceAccount.project_id ? 'present' : 'missing'}`);
      console.error(`[sync-firebase-auth] private_key: ${serviceAccount.private_key ? 'present' : 'missing'}`);
      console.error(`[sync-firebase-auth] client_email: ${serviceAccount.client_email ? 'present' : 'missing'}`);
      return errorResponse("Firebase service account configuration incomplete", 500);
    }

    console.log(`[sync-firebase-auth] Using project_id: ${serviceAccount.project_id}`);

    // Dynamically import the Firebase Admin SDK
    const { initializeApp, cert, getApps } = await import("npm:firebase-admin/app");
    const { getAuth } = await import("npm:firebase-admin/auth");

    // Initialize Firebase Admin SDK
    if (getApps().length === 0) {
      initializeApp({ credential: cert(serviceAccount) });
      console.log(`[sync-firebase-auth] Firebase Admin SDK initialized`);
    }

    // Verify the Firebase ID token
    const auth = getAuth();
    let decoded;
    try {
      console.log(`[sync-firebase-auth] Attempting to verify token for project: ${serviceAccount.project_id}`);
      console.log(`[sync-firebase-auth] Token starts with: ${firebaseIdToken.substring(0, 20)}...`);
      decoded = await auth.verifyIdToken(firebaseIdToken, true);
      console.log(`[sync-firebase-auth] Token verified for user: ${decoded.uid}`);
    } catch (e) {
      console.error(`[sync-firebase-auth] Token verification failed:`, e);
      console.error(`[sync-firebase-auth] Error details:`, {
        name: e.name,
        message: e.message,
        code: e.code,
        stack: e.stack
      });
      return errorResponse("Invalid Firebase ID token", 401, { firebaseError: e.message, errorCode: e.code });
    }

    // Generate a Supabase session (using service key)
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!supabaseUrl || !supabaseServiceKey) {
      return errorResponse("Missing Supabase configuration", 500);
    }

    const signInBody = {
      email: decoded.email,
      password: decoded.uid + "___fallback_pw",
    };

    console.log(`[sync-firebase-auth] Attempting Supabase sign-in for: ${decoded.email}`);

    // Try sign in first
    let sessionRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: {
        apikey: supabaseServiceKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signInBody),
    });

    if (!sessionRes.ok) {
      console.log(`[sync-firebase-auth] User not found, creating new Supabase user`);
      // If user not found, create a Supabase user
      const userRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: decoded.email,
          password: signInBody.password,
          email_confirm: true,
        }),
      });

      if (!userRes.ok) {
        const err = await userRes.json();
        console.error(`[sync-firebase-auth] Failed to create Supabase user:`, err);
        return errorResponse(
          "Failed to create Supabase user: " + (err?.msg ?? JSON.stringify(err)),
          500, { userCreateError: err }
        );
      }

      console.log(`[sync-firebase-auth] Supabase user created successfully`);

      // Try sign in again
      sessionRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: supabaseServiceKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signInBody),
      });
      if (!sessionRes.ok) {
        const err = await sessionRes.json();
        console.error(`[sync-firebase-auth] Failed to sign in after user creation:`, err);
        return errorResponse(
          "Failed to sign in to Supabase after user creation: " + (err?.msg ?? JSON.stringify(err)),
          500, { signInError: err }
        );
      }
    }

    const session = await sessionRes.json();
    console.log(`[sync-firebase-auth] Supabase session created successfully`);

    return new Response(JSON.stringify({ session }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(`[sync-firebase-auth] Unknown error:`, e);
    return errorResponse("Unknown error: " + (e?.message || e), 500, { raw: String(e) });
  }
});