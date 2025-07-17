
-- Ensure all required store categories exist
INSERT INTO public.store_categories (name, description, icon, display_order, active)
VALUES
  ('Food & Beverages', 'Meals, snacks, and drinks from campus food stalls', '🍔', 1, true),
  ('Xerox & Printing', 'Document printing, photocopying, and binding services', '🖨️', 2, true),
  ('Stationery', 'Notebooks, pens, and academic supplies', '📝', 3, true),
  ('Essentials', 'Daily necessities and personal care items', '🛍️', 4, true),
  ('Electronics', 'Gadgets, accessories, and tech supplies', '💻', 5, true)
ON CONFLICT DO NOTHING;

-- Add fresh sample vendor, guaranteed "approved"
INSERT INTO public.vendors (firebase_uid, business_name, category, description, status, approved_at)
VALUES
  -- use a predictable UID so we match later!
  ('partner_test_uid_001', 'Test Cafe', 'Food & Beverages', 'Robust test vendor for debugging', 'approved', now())
ON CONFLICT DO NOTHING;

-- Get the category and vendor IDs
-- Insert robust products for the test vendor in Food & Beverages category
WITH vendor AS (
  SELECT id AS vendor_id FROM public.vendors WHERE firebase_uid = 'partner_test_uid_001' LIMIT 1
),
category AS (
  SELECT id AS category_id FROM public.store_categories WHERE name = 'Food & Beverages' LIMIT 1
)
INSERT INTO public.products (vendor_id, category_id, name, description, price, discount_percentage, quantity, image_url, is_active)
SELECT
  vendor.vendor_id,
  category.category_id,
  'Debug Burger',
  'Tasty burger for debug testing. Shown if everything is connected!',
  99.00,
  5,
  88,
  NULL,
  TRUE
FROM vendor, category;

-- Make sure RLS policies for products allow:
-- All authenticated users: SELECT * WHERE is_active=true
DROP POLICY IF EXISTS "Everyone can view active products" ON public.products;
CREATE POLICY "Everyone can view active products"
  ON public.products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Allow partners to fully manage products they own
DROP POLICY IF EXISTS "Vendors can manage their products" ON public.products;
CREATE POLICY "Vendors can manage their products"
  ON public.products
  FOR ALL
  USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
