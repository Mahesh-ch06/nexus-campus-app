
-- Create club_roles table for storing different roles
CREATE TABLE public.club_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  club_id UUID REFERENCES public.clubs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('chair', 'vice_chair', 'core_member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(club_id, user_id, role)
);

-- Add auth_code column to clubs table for admin verification
ALTER TABLE public.clubs 
ADD COLUMN auth_code TEXT,
ADD COLUMN created_by UUID REFERENCES public.users(id);

-- Enable RLS on club_roles
ALTER TABLE public.club_roles ENABLE ROW LEVEL SECURITY;

-- RLS policies for club_roles
CREATE POLICY "Users can view club roles they are part of" 
  ON public.club_roles 
  FOR SELECT 
  USING (
    user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
    OR club_id IN (
      SELECT club_id FROM public.club_roles 
      WHERE user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
      AND role IN ('chair', 'vice_chair')
    )
  );

CREATE POLICY "Club chairs and vice chairs can manage roles" 
  ON public.club_roles 
  FOR ALL 
  USING (
    club_id IN (
      SELECT club_id FROM public.club_roles 
      WHERE user_id = (SELECT id FROM public.users WHERE firebase_uid = auth.uid()::text)
      AND role IN ('chair', 'vice_chair')
    )
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_club_roles_updated_at
  BEFORE UPDATE ON public.club_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
