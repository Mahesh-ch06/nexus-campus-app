
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface AuditLogEntry {
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
}

export const logSecurityEvent = async (entry: AuditLogEntry) => {
  try {
    // Get current user's internal ID
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('supabase_uid', user.id)
      .maybeSingle();

    if (!userData) return;

    // Log the security event
    await supabase
      .from('security_audit_log')
      .insert({
        user_id: userData.id,
        action: entry.action,
        resource_type: entry.resource_type,
        resource_id: entry.resource_id,
        details: entry.details as Json,
        ip_address: entry.ip_address,
        user_agent: entry.user_agent || navigator.userAgent,
      });

    console.log('Security event logged:', entry.action);
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
};

export const logVerificationAttempt = async (userId: string, success: boolean) => {
  try {
    await supabase
      .from('verification_attempts')
      .insert({
        user_id: userId,
        success,
      });
  } catch (error) {
    console.error('Failed to log verification attempt:', error);
  }
};

// Rate limiting check for verification attempts
export const checkVerificationRateLimit = async (userId: string): Promise<boolean> => {
  try {
    // Check attempts in the last 15 minutes
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    
    const { data, error } = await supabase
      .from('verification_attempts')
      .select('success')
      .eq('user_id', userId)
      .gte('attempt_time', fifteenMinutesAgo);

    if (error) throw error;

    // Allow max 5 failed attempts in 15 minutes
    const failedAttempts = data?.filter(attempt => !attempt.success).length || 0;
    return failedAttempts < 5;
  } catch (error) {
    console.error('Failed to check verification rate limit:', error);
    return true; // Allow on error to avoid blocking legitimate users
  }
};
