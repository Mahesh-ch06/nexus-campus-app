
import { supabase } from "@/integrations/supabase/client";
import { AuthError } from "@supabase/supabase-js";

export interface PartnerProfile {
  id: string;
  firebase_uid: string;
  business_name: string;
  category: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export const signUpPartner = async (email: string, password: string, metadata: { businessName: string, category: string, description: string }) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                business_name: metadata.businessName,
                category: metadata.category,
                description: metadata.description,
            },
            emailRedirectTo: `${window.location.origin}/provider-login`,
        },
    });

    if (error) {
        throw error;
    }

    return data;
};

export const signInPartner = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    throw error;
  }

  return data;
};

export const getPartnerAuthErrorMessage = (error: AuthError): string => {
  switch (error.message) {
    case "Invalid login credentials":
      return "Invalid email or password. Please double-check your credentials.";
    case "Email not confirmed":
      return "Please confirm your email address before logging in.";
    default:
      return "An unexpected error occurred during sign-in. Please try again.";
  }
};

export const sendPartnerPasswordResetEmail = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/provider-login`,
  });

  if (error) {
    if (error.message.includes("For security purposes, you can only request this once every")) {
      throw new Error("Password reset email already sent. Please wait a minute before trying again.");
    }
    if (error.message.includes("User not found")) {
      throw new Error("No partner account found with this email address.");
    }
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email. Please try again later.");
  }
};
