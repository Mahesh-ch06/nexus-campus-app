
-- RBAC System Implementation: Final Cleanup
-- This script uses CASCADE on the column drop to resolve all dependencies.

-- Step 1: Drop the 'role' column and all dependent objects (like RLS policies).
-- The CASCADE option is crucial here to ensure a clean removal.
ALTER TABLE public.users DROP COLUMN IF EXISTS role CASCADE;

-- Step 2: Drop the obsolete function if it still exists.
-- It's likely removed by the cascade above, but this ensures it's gone.
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;

