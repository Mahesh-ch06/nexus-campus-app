import { supabase } from "@/integrations/supabase/client";
import { User } from "firebase/auth";

export interface AcademicInfo {
  id: string;
  user_id: string;
  current_semester: number | null;
  cgpa: number | null;
  subjects_enrolled: string[] | null;
  mentor_name: string | null;
  mentor_email: string | null;
}

export interface Engagement {
    id: string;
    user_id: string;
    activity_points: number;
    badges: any | null; // JSONB
    last_login: string | null;
    events_attended: string[] | null;
    feedback_count: number;
    created_at: string;
    updated_at: string;
}

export interface UserDocument {
    id: string;
    user_id: string;
    doc_type: string;
    doc_url: string;
    file_name: string;
    verified_by_admin: boolean;
}

export interface Preferences {
    id: string;
    user_id: string;
    language: string;
    theme: 'Light' | 'Dark' | 'System';
    notifications_enabled: boolean;
    widgets_enabled: any | null; // JSONB
}

export interface UserProfile {
  id: string;
  firebase_uid: string;
  full_name: string;
  hall_ticket: string;
  email: string;
  department: string;
  academic_year: string;
  phone_number: string;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
  profile_picture_url: string | null;
  is_active: boolean | null;

  academic_info: AcademicInfo | null;
  engagement: Engagement | null;
  documents: UserDocument[];
  preferences: Preferences | null;
}

export const checkHallTicketExists = async (hallTicket: string): Promise<boolean> => {
  try {
    console.log("Checking hall ticket via RPC:", hallTicket);
    const { data, error } = await supabase.rpc('check_hall_ticket_exists', { p_hall_ticket: hallTicket });

    if (error) {
      console.error("Error checking hall ticket via RPC:", error);
      // Default to false to allow registration attempt, the backend will have the final say.
      return false;
    }
    
    return data;
  } catch (error) {
    console.error("Exception checking hall ticket:", error);
    return false;
  }
};

export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    console.log("Checking email via RPC:", email);
    const { data, error } = await supabase.rpc('check_email_exists', { p_email: email });

    if (error) {
      console.error("Error checking email via RPC:", error);
      // Default to false to allow registration attempt, the backend will have the final say.
      return false;
    }
    
    return data;
  } catch (error) {
    console.error("Exception checking email:", error);
    return false;
  }
};

export const createUserProfile = async (
  firebaseUser: User,
  additionalData: {
    fullName: string;
    hallTicket: string;
    department: string;
    academicYear: string;
    phoneNumber: string;
  }
): Promise<UserProfile | null> => {
  try {
    console.log("Creating user profile for Firebase UID:", firebaseUser.uid);
    console.log("Firebase user email:", firebaseUser.email);
    console.log("Additional data:", additionalData);

    const insertData = {
      firebase_uid: firebaseUser.uid,
      full_name: additionalData.fullName,
      hall_ticket: additionalData.hallTicket,
      email: firebaseUser.email!,
      department: additionalData.department,
      academic_year: additionalData.academicYear,
      phone_number: additionalData.phoneNumber,
      email_verified: firebaseUser.emailVerified,
    };

    console.log("Inserting data:", insertData);

    // Insert the user profile using the permissive RLS policy
    const { data, error } = await supabase
      .from("users")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Error creating user profile:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      return null;
    }

    console.log("User profile created successfully:", data);

    // After creating the user profile, the database trigger will create related data.
    // We can now fetch the complete profile.
    const completeProfile = await getUserProfile(firebaseUser.uid);
    
    return completeProfile;
  } catch (error) {
    console.error("Error creating user profile:", error);
    return null;
  }
};

export const getUserProfile = async (firebaseUid: string): Promise<UserProfile | null> => {
  try {
    console.log("Fetching user profile for UID:", firebaseUid);
    
    const { data, error } = await supabase
      .from("users")
      .select(`
        *,
        academic_info(*),
        engagement(*),
        documents(*),
        preferences(*)
      `)
      .eq("firebase_uid", firebaseUid)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      console.log("No user profile found for UID:", firebaseUid);
      return null;
    }

    console.log("User profile fetched successfully:", data);
    return data as UserProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
};

export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(`
        id,
        firebase_uid,
        full_name,
        hall_ticket,
        email,
        department,
        academic_year,
        phone_number,
        email_verified,
        created_at,
        updated_at,
        profile_picture_url,
        is_active
      `)
      .order('full_name', { ascending: true });

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }
    
    return (data || []).map(user => ({
        ...user,
        academic_info: null,
        engagement: null,
        documents: [],
        preferences: null,
    })) as UserProfile[];

  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
};

export const updateUserProfile = async (
  firebaseUid: string,
  updates: {
    full_name?: string;
    phone_number?: string;
  }
): Promise<UserProfile | null> => {
  try {
    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("firebase_uid", firebaseUid);

    if (error) {
      console.error("Error updating user profile:", error);
      return null;
    }

    // After successful update, fetch the full profile to get all relations
    return await getUserProfile(firebaseUid);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return null;
  }
};
