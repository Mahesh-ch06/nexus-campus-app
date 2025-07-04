
import { supabase } from "@/integrations/supabase/client";

export interface UserProfile {
  id: string;
  supabase_uid: string;
  full_name: string;
  email: string;
  phone_number: string;
  department: string;
  academic_year: string;
  hall_ticket: string;
  profile_picture_url?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at?: string;
  updated_at?: string;
  // Add missing properties
  academic_info?: {
    cgpa?: number;
    current_semester?: number;
    subjects_enrolled?: string[];
  };
  engagement?: {
    activity_points?: number;
    events_attended?: string[];
    feedback_count?: number;
    badges?: string[];
  };
  preferences?: {
    theme?: string;
    language?: string;
    notifications_enabled?: boolean;
  };
}

export const getUserProfile = async (supabaseUid: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching user profile for UID:", supabaseUid);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('supabase_uid', supabaseUid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      console.log("No user profile found for UID:", supabaseUid);
      return null;
    }

    console.log("User profile found:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Unexpected error fetching user profile:", error);
    return null;
  }
};

export const createUserProfile = async (profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>): Promise<UserProfile | null> => {
  try {
    console.log("Creating user profile for Supabase UID:", profileData.supabase_uid);
    console.log("Profile data:", profileData);

    // First check if user already exists
    const existingUser = await getUserProfile(profileData.supabase_uid);
    if (existingUser) {
      console.log("User profile already exists, returning existing profile");
      return existingUser;
    }

    // Check for duplicate hall ticket
    console.log("Checking hall ticket via RPC:", profileData.hall_ticket);
    const { data: hallTicketExists, error: hallTicketError } = await supabase
      .rpc('check_hall_ticket_exists', { p_hall_ticket: profileData.hall_ticket });

    if (hallTicketError) {
      console.error("Error checking hall ticket:", hallTicketError);
      throw new Error("Failed to validate hall ticket");
    }

    if (hallTicketExists) {
      console.error("Hall ticket already exists:", profileData.hall_ticket);
      throw new Error("Hall ticket is already registered");
    }

    // Check for duplicate email
    const { data: emailExists, error: emailError } = await supabase
      .rpc('check_email_exists', { p_email: profileData.email });

    if (emailError) {
      console.error("Error checking email:", emailError);
      throw new Error("Failed to validate email");
    }

    if (emailExists) {
      console.error("Email already exists:", profileData.email);
      throw new Error("Email is already registered");
    }

    // Create the user profile
    const { data, error } = await supabase
      .from('users')
      .insert([profileData])
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      throw error;
    }

    console.log("User profile created successfully:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Error in createUserProfile:", error);
    throw error;
  }
};

export const updateUserProfile = async (id: string, updates: Partial<UserProfile>): Promise<UserProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }

    return data as UserProfile;
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    throw error;
  }
};

export const checkHallTicketExists = async (hallTicket: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_hall_ticket_exists', { p_hall_ticket: hallTicket });

    if (error) {
      console.error("Error checking hall ticket:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error in checkHallTicketExists:", error);
    return false;
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .rpc('check_email_exists', { p_email: email });

    if (error) {
      console.error("Error checking email:", error);
      return false;
    }

    return data || false;
  } catch (error) {
    console.error("Error in checkEmailExists:", error);
    return false;
  }
};

// Add the missing getAllUsers function
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return data as UserProfile[];
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    return [];
  }
};
