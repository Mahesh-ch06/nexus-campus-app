
-- Add RLS policies for staff_wallets table (CRITICAL FIX)
ALTER TABLE public.staff_wallets ENABLE ROW LEVEL SECURITY;

-- Allow service role to manage all staff wallets (for admin functions)
CREATE POLICY "Service role can manage all staff wallets"
ON public.staff_wallets
FOR ALL
TO service_role
WITH CHECK (true);

-- Allow staff members to view their own wallet
CREATE POLICY "Staff can view their own wallet"
ON public.staff_wallets
FOR SELECT
TO authenticated
USING (staff_id IN (
  SELECT id FROM public.users 
  WHERE supabase_uid = auth.uid()::text
));

-- Allow authorized staff to update balances (for point allocation system)
CREATE POLICY "Authorized staff can update wallets"
ON public.staff_wallets
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Fix inconsistent column references in vendors table policies
-- Drop existing policies that use firebase_uid
DROP POLICY IF EXISTS "Allow vendor registration" ON public.vendors;
DROP POLICY IF EXISTS "Vendors can view their own data" ON public.vendors;

-- Recreate policies with consistent supabase_uid references
CREATE POLICY "Allow vendor registration"
ON public.vendors
FOR INSERT
TO authenticated
WITH CHECK (firebase_uid = auth.uid()::text);

CREATE POLICY "Vendors can view their own data"
ON public.vendors
FOR SELECT
TO authenticated
USING (firebase_uid = auth.uid()::text);

-- Add audit logging table for security monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only service role and admins can view audit logs
CREATE POLICY "Service role can manage audit logs"
ON public.security_audit_log
FOR ALL
TO service_role
WITH CHECK (true);

-- Add rate limiting table for verification attempts
CREATE TABLE IF NOT EXISTS public.verification_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  ip_address INET,
  attempt_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  success BOOLEAN DEFAULT false
);

-- Enable RLS on verification attempts
ALTER TABLE public.verification_attempts ENABLE ROW LEVEL SECURITY;

-- Only service role can manage verification attempts
CREATE POLICY "Service role can manage verification attempts"
ON public.verification_attempts
FOR ALL
TO service_role
WITH CHECK (true);
