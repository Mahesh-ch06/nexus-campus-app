
-- Insert sample store categories
INSERT INTO public.store_categories (name, description, icon, display_order, active) VALUES
('🍕', 'Food & Beverages', '🍕', 1, true),
('📚', 'Stationery & Books', '📚', 2, true),
('👕', 'Clothing & Accessories', '👕', 3, true),
('🎮', 'Electronics & Gadgets', '🎮', 4, true);

-- Insert a sample vendor (approved status)
INSERT INTO public.vendors (firebase_uid, business_name, category, description, status, approved_at) VALUES
('sample_vendor_001', 'Campus Cafe', 'Food & Beverages', 'Fresh food and beverages for students', 'approved', now());

-- Get the vendor ID and category ID for products
-- Insert sample products with proper time casting
WITH vendor_info AS (
  SELECT id as vendor_id FROM public.vendors WHERE business_name = 'Campus Cafe' LIMIT 1
),
category_info AS (
  SELECT id as category_id FROM public.store_categories WHERE name = '🍕' LIMIT 1
)
INSERT INTO public.products (name, description, price, discount_percentage, quantity, vendor_id, category_id, is_active, available_from, available_until)
SELECT 
  'Chicken Burger',
  'Delicious grilled chicken burger with fresh vegetables',
  150.00,
  10,
  50,
  vendor_info.vendor_id,
  category_info.category_id,
  true,
  '08:00:00'::time,
  '22:00:00'::time
FROM vendor_info, category_info
UNION ALL
SELECT 
  'Veg Pizza',
  'Fresh vegetarian pizza with cheese and vegetables',
  200.00,
  15,
  30,
  vendor_info.vendor_id,
  category_info.category_id,
  true,
  '10:00:00'::time,
  '21:00:00'::time
FROM vendor_info, category_info
UNION ALL
SELECT 
  'Cold Coffee',
  'Refreshing cold coffee with ice cream',
  80.00,
  0,
  100,
  vendor_info.vendor_id,
  category_info.category_id,
  true,
  '06:00:00'::time,
  '23:00:00'::time
FROM vendor_info, category_info;
