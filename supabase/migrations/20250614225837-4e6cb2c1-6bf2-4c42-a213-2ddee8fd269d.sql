
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can create their own vendor records" ON public.vendors;
DROP POLICY IF EXISTS "Users can view their own vendor records" ON public.vendors;
DROP POLICY IF EXISTS "Users can update their own vendor records" ON public.vendors;
DROP POLICY IF EXISTS "Users can delete their own vendor records" ON public.vendors;

-- Create updated policies that work with Firebase authentication
CREATE POLICY "Users can create their own vendor records" 
  ON public.vendors 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);

-- Policy to allow users to view their own vendor records
CREATE POLICY "Users can view their own vendor records" 
  ON public.vendors 
  FOR SELECT 
  TO authenticated
  USING (firebase_uid = auth.uid()::text);

-- Policy to allow users to update their own vendor records
CREATE POLICY "Users can update their own vendor records" 
  ON public.vendors 
  FOR UPDATE 
  TO authenticated
  USING (firebase_uid = auth.uid()::text);

-- Policy to allow users to delete their own vendor records
CREATE POLICY "Users can delete their own vendor records" 
  ON public.vendors 
  FOR DELETE 
  TO authenticated
  USING (firebase_uid = auth.uid()::text);
