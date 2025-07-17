
-- Add join_password column to clubs table
ALTER TABLE public.clubs 
ADD COLUMN join_password TEXT;

-- Add a comment to clarify the difference between the two password fields
COMMENT ON COLUMN public.clubs.password IS 'Admin password for club management access';
COMMENT ON COLUMN public.clubs.join_password IS 'Password for students to join the club';
