
-- Creates a secure function to check if a hall ticket already exists.
-- This helps prevent duplicate profiles and runs with elevated privileges 
-- to bypass row-level security issues safely.
CREATE OR REPLACE FUNCTION public.check_hall_ticket_exists(p_hall_ticket text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.users WHERE hall_ticket = p_hall_ticket);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Creates a secure function to check if an email already exists.
-- This is used during registration to ensure emails are unique.
CREATE OR REPLACE FUNCTION public.check_email_exists(p_email text)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (SELECT 1 FROM public.users WHERE email = p_email);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
