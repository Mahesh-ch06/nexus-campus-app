
-- First, let's add some sample vendors
INSERT INTO public.vendors (id, firebase_uid, business_name, category, description, status, approved_at)
VALUES 
  ('550e8400-e29b-41d4-a716-446655440001', 'vendor1_firebase_uid', 'Campus Cafe', 'Food & Beverages', 'Fresh food and beverages for students', 'approved', now()),
  ('550e8400-e29b-41d4-a716-446655440002', 'vendor2_firebase_uid', 'Quick Print Shop', 'Xerox & Printing', 'Fast printing and document services', 'approved', now()),
  ('550e8400-e29b-41d4-a716-446655440003', 'vendor3_firebase_uid', 'Campus Stationery', 'Stationery', 'Academic supplies and stationery items', 'approved', now());

-- Add sample products for the Campus Store
INSERT INTO public.products (id, vendor_id, category_id, name, description, price, discount_percentage, quantity, image_url, available_from, available_until, is_active)
VALUES 
  -- Food items
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM store_categories WHERE name = 'Food & Beverages' LIMIT 1), 'Chicken Sandwich', 'Fresh grilled chicken sandwich with vegetables', 120.00, 10, 25, null, '08:00', '20:00', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM store_categories WHERE name = 'Food & Beverages' LIMIT 1), 'Coffee', 'Hot freshly brewed coffee', 40.00, 0, 50, null, '07:00', '22:00', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440001', (SELECT id FROM store_categories WHERE name = 'Food & Beverages' LIMIT 1), 'Veg Burger', 'Delicious vegetarian burger with fresh ingredients', 80.00, 15, 30, null, '10:00', '21:00', true),
  
  -- Printing services
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM store_categories WHERE name = 'Xerox & Printing' LIMIT 1), 'A4 Printout (B&W)', 'Black and white A4 size printout', 2.00, 0, 1000, null, '09:00', '18:00', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM store_categories WHERE name = 'Xerox & Printing' LIMIT 1), 'A4 Printout (Color)', 'Color A4 size printout', 8.00, 0, 500, null, '09:00', '18:00', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440002', (SELECT id FROM store_categories WHERE name = 'Xerox & Printing' LIMIT 1), 'Spiral Binding', 'Spiral binding service for documents', 25.00, 0, 100, null, '09:00', '17:00', true),
  
  -- Stationery items
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM store_categories WHERE name = 'Stationery' LIMIT 1), 'A4 Notebook', 'High quality A4 size notebook - 200 pages', 150.00, 5, 40, null, '09:00', '19:00', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM store_categories WHERE name = 'Stationery' LIMIT 1), 'Blue Pen Pack', 'Pack of 5 blue ballpoint pens', 50.00, 0, 60, null, '09:00', '19:00', true),
  (gen_random_uuid(), '550e8400-e29b-41d4-a716-446655440003', (SELECT id FROM store_categories WHERE name = 'Stationery' LIMIT 1), 'Highlighter Set', 'Set of 4 colored highlighters', 80.00, 20, 35, null, '09:00', '19:00', true);
