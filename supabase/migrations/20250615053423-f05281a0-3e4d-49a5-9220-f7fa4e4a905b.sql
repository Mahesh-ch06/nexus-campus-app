
-- TEMPORARY POLICY: Allow ANYONE (public, including unauthenticated users) to select products
-- This allows all frontend code, regardless of auth provider, to see products.
-- IMPORTANT: Remove or lock down for production security!

-- Enable RLS if not already enabled
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policy for public SELECT access (for debugging/fixing)
CREATE POLICY "Allow public access to all active products"
  ON public.products
  FOR SELECT
  TO public
  USING (is_active = true);

-- ❗️ Optionally, you may want to DROP the authenticated-only policy if present, to avoid confusion:
-- DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
