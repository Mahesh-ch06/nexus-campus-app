
-- Enable RLS on campus_orders table if not already enabled
ALTER TABLE public.campus_orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow students to insert their own orders
CREATE POLICY "Students can create their own orders" ON public.campus_orders
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT id FROM public.users 
      WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Create policy to allow students to view their own orders
CREATE POLICY "Students can view their own orders" ON public.campus_orders
  FOR SELECT USING (
    student_id IN (
      SELECT id FROM public.users 
      WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Create policy to allow vendors to view orders for their products
CREATE POLICY "Vendors can view orders for their products" ON public.campus_orders
  FOR SELECT USING (
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Create policy to allow vendors to update orders for their products
CREATE POLICY "Vendors can update orders for their products" ON public.campus_orders
  FOR UPDATE USING (
    vendor_id IN (
      SELECT id FROM public.vendors 
      WHERE firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
