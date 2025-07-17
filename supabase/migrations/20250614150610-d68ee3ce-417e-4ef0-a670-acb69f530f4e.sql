
-- Add missing columns to existing tables to match the interface requirements

-- Update engagement table to ensure all required columns exist
ALTER TABLE public.engagement 
ADD COLUMN IF NOT EXISTS activity_points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS badges JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS events_attended TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS feedback_count INTEGER DEFAULT 0;

-- Update preferences table to use proper theme enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'theme_type') THEN
        CREATE TYPE theme_type AS ENUM ('Light', 'Dark', 'System');
    END IF;
END $$;

-- Add theme column with proper enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'preferences' AND column_name = 'theme' AND data_type = 'USER-DEFINED') THEN
        ALTER TABLE public.preferences DROP COLUMN IF EXISTS theme;
        ALTER TABLE public.preferences ADD COLUMN theme theme_type DEFAULT 'System';
    END IF;
END $$;

-- Create trigger to automatically create related data when user profile is created
CREATE OR REPLACE FUNCTION public.create_user_related_data()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.academic_info(user_id) VALUES (NEW.id);
  INSERT INTO public.engagement(user_id, last_login) VALUES (NEW.id, now());
  INSERT INTO public.preferences(user_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
  AFTER INSERT ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.create_user_related_data();
