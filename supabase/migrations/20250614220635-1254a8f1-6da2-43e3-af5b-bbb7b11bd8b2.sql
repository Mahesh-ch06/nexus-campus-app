
-- Create store categories table
CREATE TABLE public.store_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create products table for campus store
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id),
  category_id UUID REFERENCES public.store_categories(id),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10,2) NOT NULL,
  discount_percentage INTEGER DEFAULT 0,
  quantity INTEGER DEFAULT 0,
  image_url TEXT,
  available_from TIME,
  available_until TIME,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create campus store orders table (separate from general orders)
CREATE TABLE public.campus_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.users(id),
  vendor_id UUID REFERENCES public.vendors(id),
  status TEXT NOT NULL DEFAULT 'placed' CHECK (status IN ('placed', 'accepted', 'ready', 'completed', 'cancelled')),
  total_price NUMERIC(10,2) NOT NULL,
  service_fee NUMERIC(10,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'cod' CHECK (payment_method IN ('cod', 'wallet', 'upi', 'card')),
  pickup_deadline TIMESTAMP WITH TIME ZONE,
  qr_code TEXT UNIQUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create order items table
CREATE TABLE public.campus_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.campus_orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  subtotal NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create promo offers table
CREATE TABLE public.promo_offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID REFERENCES public.vendors(id),
  product_id UUID REFERENCES public.products(id),
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat', 'combo')),
  discount_value NUMERIC(10,2) NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create pickup confirmations table
CREATE TABLE public.pickup_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.campus_orders(id),
  confirmed_by UUID REFERENCES public.vendors(id),
  confirmed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  qr_code TEXT NOT NULL,
  notes TEXT
);

-- Enable RLS on all tables
ALTER TABLE public.store_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campus_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_confirmations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for store_categories (public read)
CREATE POLICY "Everyone can view store categories" ON public.store_categories
  FOR SELECT TO authenticated USING (active = true);

-- RLS Policies for products
CREATE POLICY "Everyone can view active products" ON public.products
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Vendors can manage their products" ON public.products
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- RLS Policies for campus_orders
CREATE POLICY "Students can view their orders" ON public.campus_orders
  FOR SELECT USING (
    student_id IN (
      SELECT u.id FROM public.users u
      WHERE u.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Students can create orders" ON public.campus_orders
  FOR INSERT WITH CHECK (
    student_id IN (
      SELECT u.id FROM public.users u
      WHERE u.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Vendors can view their orders" ON public.campus_orders
  FOR SELECT USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Vendors can update their orders" ON public.campus_orders
  FOR UPDATE USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- RLS Policies for campus_order_items
CREATE POLICY "Students can view their order items" ON public.campus_order_items
  FOR SELECT USING (
    order_id IN (
      SELECT co.id FROM public.campus_orders co
      JOIN public.users u ON co.student_id = u.id
      WHERE u.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

CREATE POLICY "Vendors can view their order items" ON public.campus_order_items
  FOR SELECT USING (
    order_id IN (
      SELECT co.id FROM public.campus_orders co
      JOIN public.vendors v ON co.vendor_id = v.id
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- RLS Policies for promo_offers
CREATE POLICY "Everyone can view active promos" ON public.promo_offers
  FOR SELECT TO authenticated USING (is_active = true AND end_time > now());

CREATE POLICY "Vendors can manage their promos" ON public.promo_offers
  FOR ALL USING (
    vendor_id IN (
      SELECT v.id FROM public.vendors v
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- RLS Policies for pickup_confirmations
CREATE POLICY "Vendors can manage pickup confirmations" ON public.pickup_confirmations
  FOR ALL USING (
    confirmed_by IN (
      SELECT v.id FROM public.vendors v
      WHERE v.firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );

-- Insert default store categories
INSERT INTO public.store_categories (name, description, icon, display_order) VALUES
('Food & Beverages', 'Meals, snacks, and drinks from campus food stalls', '🍔', 1),
('Xerox & Printing', 'Document printing, photocopying, and binding services', '🖨️', 2),
('Stationery', 'Notebooks, pens, and academic supplies', '📝', 3),
('Essentials', 'Daily necessities and personal care items', '🛍️', 4),
('Electronics', 'Gadgets, accessories, and tech supplies', '💻', 5);

-- Create triggers for updated_at
CREATE TRIGGER update_store_categories_updated_at BEFORE UPDATE ON public.store_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campus_orders_updated_at BEFORE UPDATE ON public.campus_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
